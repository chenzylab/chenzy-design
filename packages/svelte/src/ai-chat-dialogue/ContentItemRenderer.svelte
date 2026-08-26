<!--
  ContentItemRenderer — 按 ContentItem.type 分派渲染单个消息块（对齐 Semi
  aiChatDialogue 的 renderDialogueContentItem 机制）。
  支持类型：
    - message（OutputMessage / InputMessage）：内部 output_text/input_text → MarkdownRender，
      input_image → img，input_file → 文件卡，refusal → 拒绝块。
    - reasoning：可折叠的思考块（summary + content）。
    - function_call / custom_tool_call / mcp_call（对齐 Semi TOOL_CALL_TYPES）：工具调用块
      （名称 + 参数）；type.endsWith('_call') 兜底覆盖三者之外未来可能出现的其它调用类型。
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
    type AIDialogueReference,
    type AIDialogueMessage,
  } from '@chenzy-design/core';
  import { IconWrench, IconSendMsgStroked } from '@chenzy-design/icons';
  import { useLocale } from '../locale-provider/index.js';
  import { MarkdownRender } from '../markdown-render/index.js';
  import { Image } from '../image/index.js';
  import DialogueStep from './DialogueStep.svelte';
  import DialogueCode from './DialogueCode.svelte';
  import DialogueReasoning from './DialogueReasoning.svelte';
  import DialogueAnnotation, { type AnnotationItem } from './DialogueAnnotation.svelte';
  import DialogueFile from './DialogueFile.svelte';
  import type { DialogueContentItemRendererMap } from './content-item-render-map.js';

  interface Props {
    /** 待渲染的 ContentItem。 */
    item: ContentItem;
    /** 该 item 所属的完整消息（对齐 Semi dialogueContent.tsx:195 `renderer(item, message)`：
     * 自定义渲染器第二个参数，常见用法是按 message.role 分支渲染，如 Semi「自定义渲染
     * 消息内容」demo 的 input_text 渲染器）。 */
    message: AIDialogueMessage;
    /** 透传 MarkdownRender props。 */
    markdownRenderProps?: Record<string, unknown> | undefined;
    /** 按类型覆盖渲染（对齐 Semi renderDialogueContentItem）。 */
    renderMap?: DialogueContentItemRendererMap | undefined;
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
    /**
     * 引用入口点击回调（对齐 Semi onReferenceClick）：文件卡引用入口回传
     * `{ name, url }`，文本块悬浮引用图标回传 `{ type: 'text', content }`（对齐 Semi
     * renderMarkdown 里 `role===USER && showReference` 渲染的 icon-reference 按钮，
     * onClick 回传 `{ type: 'text', content: text }`）——Semi 两处复用同一个回调，
     * 载荷形状不同，故用宽松的 AIDialogueReference 类型统一接收。
     * 本库原来只有 DialogueFile 文件卡才有引用入口，文本块完全没有——文档 API 表
     * showReference 说明本身就写了"文字或者文件消息"，说明这本来就该有。
     */
    onReferenceClick?: ((ref: AIDialogueReference) => void) | undefined;
    /**
     * steps 块 action 图标渲染（对应 Semi Step.action.icon 是 ReactNode 可直接塞节点；
     * Svelte 没有「数据即节点」，DialogueStepAction.icon 类型是 unknown，靠这层间接渲染）。
     */
    renderActionIcon?: Snippet<[{ icon: unknown }]> | undefined;
    /**
     * 文本块气泡样式类（对齐 Semi dialogueContent.tsx renderMarkdown 里的 wrapCls：
     * 每个 output_text/input_text/refusal 文本块各自包一层，而不是整条消息共用一个外层
     * 气泡容器——真机验证到 semi.design 官网 DOM，一条消息若有 reasoning+两段文本+
     * 工具调用，会看到两个独立的 .content.content-bubble，中间块完全没有气泡背景）。
     * 由 DialogueBox.svelte 算好传入。
     */
    textWrapCls?: string;
  }

  let {
    item,
    message,
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
    renderActionIcon,
    textWrapCls = '',
  }: Props = $props();

  const loc = useLocale();
  const type = $derived(contentItemType(item));

  // 对齐 Semi TOOL_CALL_TYPES（constants.ts:84-88）：仅这三种工具调用类型支持二级映射。
  const TOOL_CALL_TYPES = ['function_call', 'custom_tool_call', 'mcp_call'];

  /**
   * 解析某个类型/条目对应的渲染器（对齐 Semi dialogueContent.tsx:171-199 customRenderer）：
   * 一级命中若是对象（二级映射）且类型属于工具调用，按 name 精确匹配子渲染器；
   * 否则若一级本身是渲染器（Snippet）直接用；都不满足则不覆盖，走内置渲染。
   * `default` 键走独立的 defaultContentText/defaultRenderer 判断（DialogueBox.svelte），
   * 不经过这里的一级 type 匹配。
   * Semi 这个函数不只用于外层 item.type（dialogueContent.tsx:379），renderMessage 内部
   * 每个 message 子块（input_text/output_text/input_image 等）也各自调用它一次
   * （dialogueContent.tsx:236 `customRenderer(i?.type, index, i)`）——renderDialogueContentItem
   * 同时能覆盖外层 ContentItem 类型和 message 内部子块类型，是两次独立的匹配机会。
   * 本库原来只有外层匹配，内层完全没接，input_text/output_text 等子块类型传了
   * renderDialogueContentItem 也不会生效。
   */
  function resolveCustomRenderer(
    entryType: string,
    entryLike: Record<string, unknown>,
  ): Snippet<[ContentItem, AIDialogueMessage]> | undefined {
    const entry = renderMap?.[entryType];
    if (entry === undefined) return undefined;
    if (TOOL_CALL_TYPES.includes(entryType) && typeof entry === 'object') {
      const name = entryLike.name as string | undefined;
      const nested = name ? (entry as Record<string, unknown>)[name] : undefined;
      return typeof nested === 'function' ? (nested as Snippet<[ContentItem, AIDialogueMessage]>) : undefined;
    }
    return typeof entry === 'function' ? (entry as Snippet<[ContentItem, AIDialogueMessage]>) : undefined;
  }

  const custom = $derived(resolveCustomRenderer(type, item as Record<string, unknown>));

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
    {@render custom(item, message)}
  </div>
{:else if type === 'message'}
  <div class="cd-ai-chat-dialogue-content-item cd-ai-chat-dialogue-content-message">
    {#each innerParts as part, i (i)}
      {@const partCustom = resolveCustomRenderer(
        (part.type as string) ?? '',
        part as Record<string, unknown>,
      )}
      {#if partCustom}
        <!-- message 内部子块类型（input_text/output_text/input_image 等）也能被
             renderDialogueContentItem 覆盖，对齐 Semi dialogueContent.tsx:236。 -->
        <div class="cd-ai-chat-dialogue-content-custom-renderer">
          {@render partCustom(part, message)}
        </div>
      {:else if part.type === 'output_text' || part.type === 'input_text' || part.type === 'text'}
        <!--
          引用标注：拆到 DialogueAnnotation.svelte（同 Semi widgets/contentItem/annotation.tsx）。
          注意这是**一条折叠摘要**（logo 头像组 + 「N 篇资料」+ chevron），不是逐条列表——
          本库原来是一个 annotation 渲染一个 li，与 Semi 完全不是一种形态。
        -->
        {#if partAnnotations(part).length > 0}
          <!-- maxCount=15 对齐 Semi dialogueContent.tsx:250（内置引用标注展示场景的
               硬编码值，注释里 Semi 自己也写了 todo: 需要支持动态配置）。本库
               DialogueAnnotation 组件自身默认值 3，但那是给用户自定义调用场景的，
               这里是内置场景，须显式传值对齐——原来没传，会走组件默认值 3。 -->
          <DialogueAnnotation
            annotation={annotationItems(part)}
            maxCount={15}
            onClick={() => onAnnotationClick?.(partAnnotations(part))}
          />
          <!-- 顶层 AIChatDialogue.onAnnotationClick（interface.ts:24/69）签名是
               (annotation?) => void，无事件参数——内置渲染路径（dialogueContent.tsx:251
               `onClick={() => onAnnotationClick(filteredAnnotation)}`）本身就不转发事件，
               跟 DialogueAnnotation 组件自己的 onClick(e, annotation) 是两个独立契约，
               这里用箭头函数吞掉新增的 e 参数，维持顶层 prop 签名不变。 -->
        {/if}
        <!-- 对齐 Semi renderMarkdown：每个文本块各自包一层气泡样式类（wrapCls），
             不是外层容器统一包裹——真机验证到 semi.design 官网 DOM，多文本块消息里
             每段文本各自独立一个气泡外观。user 消息 + showReference 时右侧悬浮一个
             可点击引用图标（对齐 Semi icon-reference，onClick 回传
             { type: 'text', content: text }）；本库原来完全没有这个能力，只有文件卡
             才有引用入口，文档 API 表 showReference 说明本身写的是"文字或者文件消息"。 -->
        {#if partText(part)}
          <div class={textWrapCls}>
            <MarkdownRender raw={partText(part)} {...mdProps} />
            {#if isUser && showReference}
              <button
                type="button"
                class="cd-ai-chat-dialogue-content-icon-reference"
                onclick={() => onReferenceClick?.({ type: 'text', content: partText(part) })}
              >
                <IconSendMsgStroked />
              </button>
            {/if}
          </div>
        {/if}
      {:else if part.type === 'refusal'}
        <!-- 对齐 Semi：refusal 走跟 output_text/input_text 相同的 renderMarkdown 路径
             （markdown 解析 + HTML 转义 + 引用图标），本库原来只是纯文本 div，
             丢了这几个能力。 -->
        {#if typeof part.refusal === 'string' && part.refusal}
          <div class={textWrapCls}>
            <MarkdownRender raw={escapeHtml && isUser ? escapeHtmlInMarkdown(part.refusal) : part.refusal} {...mdProps} />
            {#if isUser && showReference}
              <button
                type="button"
                class="cd-ai-chat-dialogue-content-icon-reference"
                onclick={() => onReferenceClick?.({ type: 'text', content: part.refusal as string })}
              >
                <IconSendMsgStroked />
              </button>
            {/if}
          </div>
        {/if}
      {:else if part.type === 'input_image' || part.type === 'image'}
        <!-- 对齐 Semi ImageAttachment：用 Image 组件（本库 image/ 下已有，自带点击
             放大预览），不是裸 <img>——Semi 的 onClick 是叠加在 Image 内置预览能力
             之上的额外回调，不是唯一交互；本库原来手搓 <img>+<button>，onclick 只转
             发外部回调，图片本身完全没有点击预览能力，是漏接现成组件导致的真实缺口。
             -img-list（同条消息多于一张图）与 -img-last（最后一张/下一项是文件）
             两个修饰类对齐 Semi ImageAttachment。 -->
        <Image
          class="cd-ai-chat-dialogue-content-img {isImageList ? 'cd-ai-chat-dialogue-content-img-list' : ''} {isLastImage(i) ? 'cd-ai-chat-dialogue-content-img-last' : ''}"
          src={(part.image_url as string) ?? (part.url as string)}
          alt=""
          onClick={() => onImageClick?.(part)}
        />
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
{:else if type === 'function_call' || type === 'custom_tool_call' || type.endsWith('_call')}
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
  <!-- 步骤块（Semi MESSAGE_ITEM_TYPE.STEPS 常量存在但 dialogueContent.tsx 内置渲染分发
       从未消费它——Semi 官方 demo 展示分步能力走的是自定义类型 type:'plan' +
       renderDialogueContentItem 接 AIChatDialogue.Step，不是内置 'steps' type）。
       本库明确决定两条路径并存：renderMap 命中时走上面的 custom 分支（用户可以像
       Semi 官方 demo 那样用别的类型名 + renderDialogueContentItem 自己接 DialogueStep，
       组件已公开导出供此用途）；renderMap 未命中且 type==='steps' 时走这里的内置渲染，
       让消费方不接线也能直接用——比 Semi 更完整，不是要收敛掉的自造超集。 -->
  <DialogueStep steps={stepsOf(item)} {renderActionIcon} />
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

  /* 引用标注的样式已随组件拆分迁到 DialogueAnnotation.svelte
     （原来这几条是给「一排药丸徽标」写的，Semi 是一条带头像组的折叠摘要，形态不同）。 */

  /* 悬浮引用图标（对齐 Semi aiChatDialogue.scss:219-221,266-274）：默认隐藏，
     文本块外层容器（挂 content-user 类）hover 时才 display:flex。本库原来完全
     没有这个能力，token 早就建好了却没人消费（padding/text 颜色）。 */
  .cd-ai-chat-dialogue-content-icon-reference {
    display: none;
    appearance: none;
    border: none;
    background: none;
    flex-shrink: 0;
    margin-left: auto;
  }

  :global(.cd-ai-chat-dialogue-content-user):hover .cd-ai-chat-dialogue-content-icon-reference {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--cd-ai-chat-dialogue-icon-reference-padding-y)
      var(--cd-ai-chat-dialogue-icon-reference-padding-x);
    cursor: pointer;
    color: var(--cd-ai-chat-dialogue-icon-reference-text);
  }

  /* 逐条对齐 Semi &-content-img：外层（margin-top/border-radius）与内部真正的 <img>
     （width/height/object-fit:cover）是分两层写的，不是混在一条规则里（Semi scss
     `&-img { margin-top; border-radius; img { width; height; object-fit } }`）。
     本库原来手搓裸 <img>+<button>，没有点击放大预览能力，也把这些属性混写在一条
     规则里；现在改用本库已有的 Image 组件（自带预览），它的 class prop 挂在最外层
     .cd-image 容器上（跟 Semi Image 组件同构：className→outerCls），真正的 <img>
     是内部 .cd-image-img，都是跨组件必须 :global()。 */
  :global(.cd-ai-chat-dialogue-content-img) {
    margin-top: var(--cd-ai-chat-dialogue-img-margin-top);
    border-radius: var(--cd-radius-ai-chat-dialogue-img);
  }

  :global(.cd-ai-chat-dialogue-content-img img) {
    width: var(--cd-width-ai-chat-dialogue-img);
    height: var(--cd-height-ai-chat-dialogue-img);
    object-fit: cover;
  }

  /* 多图时改用列表尺寸（128×128）并留右间距。 */
  :global(.cd-ai-chat-dialogue-content-img-list) {
    margin-right: var(--cd-ai-chat-dialogue-img-list-margin-right);
  }

  :global(.cd-ai-chat-dialogue-content-img-list img) {
    width: var(--cd-width-ai-chat-dialogue-img-list);
    height: var(--cd-height-ai-chat-dialogue-img-list);
  }

  /* 最后一张（或下一项是文件）不留右间距。 */
  :global(.cd-ai-chat-dialogue-content-img-last) {
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
