<!--
  ContentItemRenderer — 按 ContentItem.type 分派渲染单个消息块（对齐 Semi
  aiChatDialogue 的 renderDialogueContentItem 机制）。
  支持类型：
    - message（OutputMessage / InputMessage）：内部 output_text/input_text → MarkdownRender，
      input_image → img，input_file → 文件卡，refusal → 拒绝块。
    - reasoning：可折叠的思考块（summary + content）。
    - function_call / custom_call / *tool_call*：工具调用块（名称 + 参数）。
    - audio：音频占位块。
    - 兜底：未知类型渲染类型标签 + JSON（可被 renderDialogueContentItem 覆盖）。
  renderDialogueContentItem[type] 命中则用自定义渲染（Snippet），否则走内置。
  全 token，类名前缀 cd-。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import {
    contentItemType,
    toolCallView,
    escapeHtmlInMarkdown,
    type ContentItem,
    type ToolCallView,
    type DialogueStep as DialogueStepType,
  } from '@chenzy-design/core';
  import { IconWrench } from '@chenzy-design/icons';
  import { useLocale } from '../locale-provider/index.js';
  import { MarkdownRender } from '../markdown-render/index.js';
  import DialogueStep from './DialogueStep.svelte';
  import DialogueCode from './DialogueCode.svelte';
  import DialogueReasoning from './DialogueReasoning.svelte';
  import DialogueAnnotation, { type AnnotationItem } from './DialogueAnnotation.svelte';
  import DialogueFile from './DialogueFile.svelte';

  interface Props {
    /** 待渲染的 ContentItem。 */
    item: ContentItem;
    /** 透传 MarkdownRender props。 */
    markdownRenderProps?: Record<string, unknown> | undefined;
    /** 按类型覆盖渲染（对齐 Semi renderDialogueContentItem）。 */
    renderMap?: Record<string, Snippet<[ContentItem]>> | undefined;
    /** 附件文件点击回调。 */
    onFileClick?: ((file: unknown) => void) | undefined;
    /** 图片点击回调。 */
    onImageClick?: ((image: unknown) => void) | undefined;
    /** 是否转义 HTML 标签（对齐 Semi escapeHtml，仅对 user 角色生效）。 */
    escapeHtml?: boolean;
    /** 当前消息是否为用户消息（决定 escapeHtml 是否生效）。 */
    isUser?: boolean;
    /** annotation 点击回调（对齐 Semi onAnnotationClick，回传整组 annotation）。 */
    onAnnotationClick?: ((annotations: unknown) => void) | undefined;
    /** 是否展示文件卡上的引用入口（对齐 Semi showReference，仅 user 消息生效）。 */
    showReference?: boolean;
    /** 禁用文件点击跳转（对齐 Semi disabledFileItemClick）。 */
    disabledFileItemClick?: boolean;
    /** 文件卡引用入口点击回调（对齐 Semi onReferenceClick）。 */
    onReferenceClick?: ((ref: { name?: string; url?: string }) => void) | undefined;
  }

  let {
    item,
    markdownRenderProps,
    renderMap,
    onFileClick,
    onImageClick,
    escapeHtml = true,
    isUser = false,
    onAnnotationClick,
    showReference = false,
    disabledFileItemClick = false,
    onReferenceClick,
  }: Props = $props();

  const loc = useLocale();
  const type = $derived(contentItemType(item));
  const custom = $derived(renderMap?.[type]);

  /**
   * 注入对话专属的代码块渲染（对齐 Semi：aiChatDialogue 用自己的 code.tsx 覆盖
   * markdownRender 的 code 组件，带语言标签栏 + 复制按钮）。
   * 挂 `code` 键（对齐 Semi components['code'] = Code）。
   * 放在展开之前，调用方仍可用 markdownRenderProps.components 覆盖掉它。
   */
  const mdProps = $derived({
    ...markdownRenderProps,
    components: {
      code: DialogueCode,
      ...((markdownRenderProps?.components as Record<string, unknown>) ?? {}),
    },
  });

  /** 取步骤块的 steps 数组（对齐 Semi DialogueStepWidget 的 props.steps）。 */
  function stepsOf(it: ContentItem): DialogueStepType[] {
    const s = (it as { steps?: unknown }).steps;
    return Array.isArray(s) ? (s as DialogueStepType[]) : [];
  }

  // OutputMessage / InputMessage 的内层 content 数组（output_text / input_* / refusal）。
  const innerParts = $derived(
    Array.isArray((item as { content?: unknown }).content)
      ? ((item as { content: Record<string, unknown>[] }).content ?? [])
      : [],
  );

  // 多于一张图时走「图片列表」排布（对齐 Semi dialogueContent.tsx:233 的 isImageList）。
  const isImageList = $derived(
    innerParts.filter((p) => p?.type === 'input_image' || p?.type === 'image').length > 1,
  );

  /** 本张图是否为「最后一张」：其后没有内容，或紧跟着的是文件（对齐 Semi:261）。 */
  function isLastImage(idx: number): boolean {
    const nextType = innerParts[idx + 1]?.type;
    return idx === innerParts.length - 1 || nextType === 'input_file' || nextType === 'file';
  }

  // 工具调用块折叠态 + 归一视图（core toolCallView：name/status/arguments/output/callId/serverLabel）。
  let toolOpen = $state(false);
  const toolView = $derived<ToolCallView>(toolCallView(item));

  function partText(part: Record<string, unknown>): string {
    const text = typeof part.text === 'string' ? part.text : '';
    // 对齐 Semi：仅 user 角色的消息做 HTML 转义，助手输出的 markdown 原样渲染。
    return escapeHtml && isUser ? escapeHtmlInMarkdown(text) : text;
  }

  /**
   * 取该文本块的可展示 annotation（对齐 Semi dialogueContent.tsx:243）：
   * 过滤掉 file_citation / container_file_citation 两类。
   */
  function partAnnotations(part: Record<string, unknown>): Record<string, unknown>[] {
    const list = Array.isArray(part.annotations) ? (part.annotations as Record<string, unknown>[]) : [];
    return list.filter((a) => a.type !== 'file_citation' && a.type !== 'container_file_citation');
  }

  /**
   * 把 annotation 归一成 DialogueAnnotation 需要的 { logo, title, url } 形态。
   * url_citation 形态优先（OpenAI Response 的标注放在这一层）。
   */
  function annotationItems(part: Record<string, unknown>): AnnotationItem[] {
    return partAnnotations(part).map((a) => {
      const cite = (a.url_citation ?? a) as Record<string, unknown>;
      const url = typeof cite.url === 'string' ? cite.url : undefined;
      const title = typeof cite.title === 'string' ? cite.title : (url ?? '');
      // logo 取站点 favicon（Semi demo 由数据直接给 logo，这里从 url 推导一个兜底）。
      const logo = typeof cite.logo === 'string' ? cite.logo : undefined;
      return { title, ...(url !== undefined ? { url } : {}), ...(logo !== undefined ? { logo } : {}) };
    });
  }
</script>

{#if custom}
  <!-- 自定义渲染要保留 Semi 的包裹层（dialogueContent.tsx:196 的 -content-custom-renderer）：
       右对齐时靠这个类做 margin-left:auto，裸渲染 snippet 会让该规则匹配不到。 -->
  <div class="cd-ai-chat-dialogue-content-custom-renderer">
    {@render custom(item)}
  </div>
{:else if type === 'message'}
  <div class="cd-ai-chat-dialogue-content-item cd-ai-chat-dialogue-content-message">
    {#each innerParts as part, i (i)}
      {#if part.type === 'output_text' || part.type === 'input_text' || part.type === 'text'}
        <!--
          引用标注：拆到 DialogueAnnotation.svelte（同 Semi widgets/contentItem/annotation.tsx）。
          注意这是**一条折叠摘要**（logo 头像组 + 「N 篇资料」+ chevron），不是逐条列表——
          本库原来是一个 annotation 渲染一个 li，与 Semi 完全不是一种形态。
        -->
        {#if partAnnotations(part).length > 0}
          <DialogueAnnotation
            annotation={annotationItems(part)}
            onClick={() => onAnnotationClick?.(partAnnotations(part))}
          />
        {/if}
        <MarkdownRender raw={partText(part)} {...mdProps} />
      {:else if part.type === 'refusal'}
        <div class="cd-ai-chat-dialogue-content-refusal">{part.refusal}</div>
      {:else if part.type === 'input_image' || part.type === 'image'}
        <button
          type="button"
          class="cd-ai-chat-dialogue-content-img-btn"
          onclick={() => onImageClick?.(part)}
        >
          <!-- -img-list（同条消息多于一张图）与 -img-last（最后一张 / 下一项是文件）
               两个修饰类对齐 Semi ImageAttachment，本库原来只有基础的 -img。 -->
          <img
            class="cd-ai-chat-dialogue-content-img"
            class:cd-ai-chat-dialogue-content-img-list={isImageList}
            class:cd-ai-chat-dialogue-content-img-last={isLastImage(i)}
            src={(part.image_url as string) ?? (part.url as string)}
            alt=""
          />
        </button>
      {:else if part.type === 'input_file' || part.type === 'file'}
        <!-- 文件卡拆到 DialogueFile.svelte（同 Semi dialogueContent.tsx 的 FileAttachment）。
             本库原来只有一个裸 button + 文件名一行，缺图标底框/类型大小/引用入口。 -->
        <DialogueFile
          file={part}
          isLastFile={i === innerParts.length - 1}
          {isUser}
          {showReference}
          {disabledFileItemClick}
          {onFileClick}
          {onReferenceClick}
        />
      {/if}
    {/each}
  </div>
{:else if type === 'reasoning'}
  <!-- 思考块拆到 DialogueReasoning.svelte（同 Semi widgets/contentItem/reasoning.tsx）。 -->
  <DialogueReasoning
    status={(item as { status?: string }).status}
    summary={(item as { summary?: { text?: string }[] }).summary}
    content={(item as { content?: { text?: string }[] }).content}
    markdownRenderProps={mdProps}
  />
{:else if type === 'function_call' || type === 'custom_call' || type.endsWith('_call')}
  <!-- 工具调用块逐条对齐 Semi ToolCallWidget（dialogueContent.tsx:137-143）：
       一个扁平 div + IconWrench + `name  arguments` 两段文本，Semi 的 scss 里
       连 &-tool-call 的样式都没有。
       本库原来自造了一整套「状态图标 + 可折叠头部 + 参数/输入/输出分节 + call_id +
       MCP server」的结构化面板，共 10 个 Semi 不存在的类名（-header/-body/-section/
       -args/-label/-status/-server/-id/-running/-failed），已按 Semi 收敛。 -->
  <div class="cd-ai-chat-dialogue-content-tool-call">
    <IconWrench />
    {toolView.name ?? ''}  {toolView.arguments ?? ''}
  </div>
{:else if type === 'steps'}
  <!-- 步骤块（对齐 Semi MESSAGE_ITEM_TYPE.STEPS）：拆到 DialogueStep.svelte，同 Semi
       把它单独放在 widgets/contentItem/dialogueStep.tsx。 -->
  <DialogueStep steps={stepsOf(item)} />
{:else if type === 'audio'}
  <div class="cd-ai-chat-dialogue-content-item cd-ai-chat-dialogue-content-audio">
    {loc().t('AIChatDialogue.audio')}
  </div>
{:else}
  <!-- 兜底：未知类型，渲染类型标签（可被 renderDialogueContentItem 覆盖）。 -->
  <div class="cd-ai-chat-dialogue-content-item cd-ai-chat-dialogue-content-unknown">
    <span class="cd-ai-chat-dialogue-content-unknown-type">{type}</span>
  </div>
{/if}

<style>
  .cd-ai-chat-dialogue-content-item {
    margin-block: var(--cd-spacing-extra-tight);
  }

  .cd-ai-chat-dialogue-content-refusal {
    color: var(--cd-color-danger);
  }

  /* 引用标注的样式已随组件拆分迁到 DialogueAnnotation.svelte
     （原来这几条是给「一排药丸徽标」写的，Semi 是一条带头像组的折叠摘要，形态不同）。 */

  .cd-ai-chat-dialogue-content-img-btn {
    appearance: none;
    border: none;
    background: none;
    padding: 0;
    cursor: pointer;
  }

  /* 逐条对齐 Semi &-content-img：固定宽高 + object-fit:cover（本库原来是
     max-width/height 240px 的自造值，且 -img-list / -img-last 两个修饰类
     的 token 早就建好了却没人消费）。 */
  .cd-ai-chat-dialogue-content-img {
    margin-top: var(--cd-ai-chat-dialogue-img-margin-top);
    border-radius: var(--cd-radius-ai-chat-dialogue-img);
    width: var(--cd-width-ai-chat-dialogue-img);
    height: var(--cd-height-ai-chat-dialogue-img);
    object-fit: cover;
  }

  /* 多图时改用列表尺寸（128×128）并留右间距。 */
  .cd-ai-chat-dialogue-content-img-list {
    margin-right: var(--cd-ai-chat-dialogue-img-list-margin-right);
    width: var(--cd-width-ai-chat-dialogue-img-list);
    height: var(--cd-height-ai-chat-dialogue-img-list);
  }

  /* 最后一张（或下一项是文件）不留右间距。 */
  .cd-ai-chat-dialogue-content-img-last {
    margin-right: 0;
  }

  /* 文件卡的样式已随组件拆分迁到 DialogueFile.svelte
     （原来这一条是给「裸 button + 文件名」写的，Semi 是带类型底色图标框 + 两行信息的卡片）。 */

  /* reasoning 的样式已随组件拆分迁到 DialogueReasoning.svelte
     （原来这两条是本库自造的「无边框按钮 + 左竖线」，与 Semi 的
     -wrapper 外框 + 三段 header 完全不是一套，已按 Semi 重写）。 */

  /* 逐条对齐 Semi &-content-tool-call：一个 fit-content 的水平 flex 药丸。
     本库原来是「1px 边框 + overflow:hidden 的卡片」，且用的是通用色值 ——
     而这几条 token 早就按 $*-aiChatDialogue_tool_call-* 建好、无人消费。 */
  .cd-ai-chat-dialogue-content-tool-call {
    display: flex;
    align-items: center;
    justify-content: center;
    width: fit-content;
    color: var(--cd-ai-chat-dialogue-tool-call-text);
    background-color: var(--cd-ai-chat-dialogue-tool-call-bg);
    padding: var(--cd-ai-chat-dialogue-tool-call-padding-y)
      var(--cd-ai-chat-dialogue-tool-call-padding-x);
    border-radius: var(--cd-ai-chat-dialogue-tool-call);
    column-gap: var(--cd-ai-chat-dialogue-tool-call-column-gap);
    margin-top: var(--cd-ai-chat-dialogue-tool-call-margin-top);
  }














  .cd-ai-chat-dialogue-content-unknown {
    color: var(--cd-color-text-3);
  }
</style>
