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
  import { useLocale } from '../locale-provider/index.js';
  import { MarkdownRender } from '../markdown-render/index.js';
  import DialogueStep from './DialogueStep.svelte';
  import DialogueCode from './DialogueCode.svelte';

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
  }: Props = $props();

  const loc = useLocale();
  const type = $derived(contentItemType(item));
  const custom = $derived(renderMap?.[type]);

  /**
   * 注入对话专属的代码块渲染（对齐 Semi：aiChatDialogue 用自己的 code.tsx 覆盖
   * markdownRender 的 code 组件，带语言标签栏 + 复制按钮）。
   * 挂 `pre` 键的原因见 DialogueCode.svelte 顶部说明。
   * 放在展开之前，调用方仍可用 markdownRenderProps.components 覆盖掉它。
   */
  const mdProps = $derived({
    ...markdownRenderProps,
    components: {
      pre: DialogueCode,
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

  // reasoning 折叠态。
  let reasoningOpen = $state(false);
  const reasoningText = $derived(resolveReasoningText(item));
  function resolveReasoningText(it: ContentItem): string {
    const r = it as { summary?: { text?: string }[]; content?: { text?: string }[] };
    const parts = [...(r.summary ?? []), ...(r.content ?? [])];
    return parts
      .map((p) => p.text)
      .filter((t): t is string => typeof t === 'string')
      .join('\n\n');
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

  /** annotation 的展示名与链接（url_citation 形态优先）。 */
  function annotationView(a: Record<string, unknown>): { title: string; url?: string } {
    const cite = (a.url_citation ?? a) as Record<string, unknown>;
    const title = typeof cite.title === 'string' ? cite.title : (typeof cite.url === 'string' ? cite.url : '');
    const url = typeof cite.url === 'string' ? cite.url : undefined;
    return url !== undefined ? { title, url } : { title };
  }
</script>

{#if custom}
  {@render custom(item)}
{:else if type === 'message'}
  <div class="cd-ai-chat-dialogue-content-item cd-ai-chat-dialogue-content-message">
    {#each innerParts as part, i (i)}
      {#if part.type === 'output_text' || part.type === 'input_text' || part.type === 'text'}
        <!-- 引用标注（对齐 Semi AnnotationWidget）：渲染在正文之前，点击回传整组 annotation。 -->
        {#if partAnnotations(part).length > 0}
          <ul class="cd-ai-chat-dialogue-annotation-wrapper">
            {#each partAnnotations(part) as anno, ai (ai)}
              {@const view = annotationView(anno)}
              <li>
                <button
                  type="button"
                  class="cd-ai-chat-dialogue-annotation"
                  title={view.url ?? view.title}
                  onclick={() => onAnnotationClick?.(partAnnotations(part))}
                >
                  <span class="cd-ai-chat-dialogue-annotation-content-logo">{ai + 1}</span>
                  <span class="cd-ai-chat-dialogue-annotation-content">{view.title}</span>
                </button>
              </li>
            {/each}
          </ul>
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
          <img
            class="cd-ai-chat-dialogue-content-img"
            src={(part.image_url as string) ?? (part.url as string)}
            alt=""
          />
        </button>
      {:else if part.type === 'input_file' || part.type === 'file'}
        <button type="button" class="cd-ai-chat-dialogue-content-file" onclick={() => onFileClick?.(part)}>
          <span class="cd-ai-chat-dialogue-content-file-title"
            >{(part.filename as string) ?? loc().t('AIChatDialogue.file')}</span
          >
        </button>
      {/if}
    {/each}
  </div>
{:else if type === 'reasoning'}
  <div class="cd-ai-chat-dialogue-content-item cd-ai-chat-dialogue-reasoning">
    <button
      type="button"
      class="cd-ai-chat-dialogue-reasoning-header"
      aria-expanded={reasoningOpen}
      onclick={() => (reasoningOpen = !reasoningOpen)}
    >
      {loc().t('AIChatDialogue.reasoning')}
    </button>
    {#if reasoningOpen}
      <div class="cd-ai-chat-dialogue-reasoning-content">
        <MarkdownRender raw={reasoningText} {...mdProps} />
      </div>
    {/if}
  </div>
{:else if type === 'function_call' || type === 'custom_call' || type.endsWith('_call')}
  <!-- 完整工具调用块：状态图标 + 折叠展开（参数/输出格式化 + call_id + MCP server）。 -->
  <div
    class="cd-ai-chat-dialogue-content-item cd-ai-chat-dialogue-content-tool-call"
    class:cd-ai-chat-dialogue-content-tool-call-running={toolView.status === 'in_progress'}
    class:cd-ai-chat-dialogue-content-tool-call-failed={toolView.status === 'failed'}
  >
    <button
      type="button"
      class="cd-ai-chat-dialogue-content-tool-call-header"
      aria-expanded={toolOpen}
      onclick={() => (toolOpen = !toolOpen)}
    >
      <span class="cd-ai-chat-dialogue-content-tool-call-status" aria-hidden="true">
        {#if toolView.status === 'in_progress'}⟳{:else if toolView.status === 'failed'}✗{:else}✓{/if}
      </span>
      <span class="cd-ai-chat-dialogue-content-tool-call-name">{toolView.name || loc().t('AIChatDialogue.toolCall')}</span>
      {#if toolView.serverLabel}
        <span class="cd-ai-chat-dialogue-content-tool-call-server">{toolView.serverLabel}</span>
      {/if}
    </button>
    {#if toolOpen}
      <div class="cd-ai-chat-dialogue-content-tool-call-body">
        {#if toolView.arguments}
          <div class="cd-ai-chat-dialogue-content-tool-call-section">
            <span class="cd-ai-chat-dialogue-content-tool-call-label">{loc().t('AIChatDialogue.toolArguments')}</span>
            <pre class="cd-ai-chat-dialogue-content-tool-call-args">{toolView.arguments}</pre>
          </div>
        {/if}
        {#if toolView.input}
          <div class="cd-ai-chat-dialogue-content-tool-call-section">
            <span class="cd-ai-chat-dialogue-content-tool-call-label">{loc().t('AIChatDialogue.toolInput')}</span>
            <pre class="cd-ai-chat-dialogue-content-tool-call-args">{toolView.input}</pre>
          </div>
        {/if}
        {#if toolView.output}
          <div class="cd-ai-chat-dialogue-content-tool-call-section">
            <span class="cd-ai-chat-dialogue-content-tool-call-label">{loc().t('AIChatDialogue.toolOutput')}</span>
            <pre class="cd-ai-chat-dialogue-content-tool-call-args">{toolView.output}</pre>
          </div>
        {/if}
        {#if toolView.callId}
          <div class="cd-ai-chat-dialogue-content-tool-call-id">{toolView.callId}</div>
        {/if}
      </div>
    {/if}
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

  /* 引用标注（对齐 Semi AnnotationWidget）：正文上方一排可点击的来源徽标。 */
  .cd-ai-chat-dialogue-annotation-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: var(--cd-spacing-extra-tight);
    margin: 0 0 var(--cd-spacing-tight);
    padding: 0;
    list-style: none;
  }
  .cd-ai-chat-dialogue-annotation {
    display: inline-flex;
    align-items: center;
    gap: var(--cd-spacing-extra-tight);
    max-inline-size: 200px;
    padding: 2px var(--cd-spacing-tight);
    border: 1px solid var(--cd-ai-chat-dialogue-annotation-border);
    border-radius: var(--cd-border-radius-full);
    background: transparent;
    color: var(--cd-ai-chat-dialogue-annotation-text);
    font-size: var(--cd-font-size-small);
    line-height: var(--cd-line-height-small);
    cursor: pointer;
  }
  .cd-ai-chat-dialogue-annotation:hover {
    background: var(--cd-ai-chat-dialogue-annotation-bg-hover);
  }
  .cd-ai-chat-dialogue-annotation-content {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .cd-ai-chat-dialogue-content-img-btn {
    appearance: none;
    border: none;
    background: none;
    padding: 0;
    cursor: pointer;
  }

  .cd-ai-chat-dialogue-content-img {
    max-width: 240px;
    max-height: 240px;
    border-radius: var(--cd-border-radius-medium);
  }

  .cd-ai-chat-dialogue-content-file {
    display: inline-flex;
    align-items: center;
    gap: var(--cd-spacing-extra-tight);
    padding: var(--cd-spacing-extra-tight) var(--cd-spacing-tight);
    border: 1px solid var(--cd-color-border);
    border-radius: var(--cd-border-radius-medium);
    background: var(--cd-color-fill-0);
    cursor: pointer;
    color: var(--cd-color-text-0);
  }

  .cd-ai-chat-dialogue-reasoning-header {
    appearance: none;
    border: none;
    background: none;
    padding: 0;
    cursor: pointer;
    color: var(--cd-color-text-2);
    font: inherit;
  }

  .cd-ai-chat-dialogue-reasoning-content {
    margin-top: var(--cd-spacing-extra-tight);
    padding-left: var(--cd-spacing-tight);
    border-left: 2px solid var(--cd-color-border);
    color: var(--cd-color-text-1);
  }

  .cd-ai-chat-dialogue-content-tool-call {
    border: 1px solid var(--cd-color-border);
    border-radius: var(--cd-border-radius-medium);
    background: var(--cd-color-fill-0);
    overflow: hidden;
  }

  .cd-ai-chat-dialogue-content-tool-call-header {
    display: flex;
    align-items: center;
    gap: var(--cd-spacing-extra-tight);
    width: 100%;
    padding: var(--cd-spacing-tight);
    appearance: none;
    border: none;
    background: transparent;
    cursor: pointer;
    text-align: left;
    color: inherit;
    font: inherit;
  }

  .cd-ai-chat-dialogue-content-tool-call-header:hover {
    background: var(--cd-color-fill-1);
  }

  .cd-ai-chat-dialogue-content-tool-call-header:focus-visible {
    outline: 2px solid var(--cd-color-primary);
    outline-offset: -2px;
  }

  .cd-ai-chat-dialogue-content-tool-call-status {
    color: var(--cd-color-text-2);
  }

  .cd-ai-chat-dialogue-content-tool-call-running .cd-ai-chat-dialogue-content-tool-call-status {
    color: var(--cd-color-primary);
  }

  .cd-ai-chat-dialogue-content-tool-call-failed .cd-ai-chat-dialogue-content-tool-call-status {
    color: var(--cd-color-danger);
  }

  .cd-ai-chat-dialogue-content-tool-call-name {
    font-weight: var(--cd-font-weight-bold);
    color: var(--cd-color-text-0);
  }

  .cd-ai-chat-dialogue-content-tool-call-server {
    padding: 0 var(--cd-spacing-extra-tight);
    border-radius: var(--cd-border-radius-small);
    background: var(--cd-color-fill-2);
    color: var(--cd-color-text-2);
    font-size: var(--cd-font-size-secondary, var(--cd-font-size-regular));
  }

  .cd-ai-chat-dialogue-content-tool-call-body {
    padding: 0 var(--cd-spacing-tight) var(--cd-spacing-tight);
  }

  .cd-ai-chat-dialogue-content-tool-call-section {
    margin-top: var(--cd-spacing-extra-tight);
  }

  .cd-ai-chat-dialogue-content-tool-call-label {
    display: block;
    color: var(--cd-color-text-2);
    font-size: var(--cd-font-size-secondary, var(--cd-font-size-regular));
  }

  .cd-ai-chat-dialogue-content-tool-call-args {
    margin: var(--cd-spacing-extra-tight) 0 0;
    padding: var(--cd-spacing-extra-tight);
    border-radius: var(--cd-border-radius-small);
    background: var(--cd-color-fill-1);
    white-space: pre-wrap;
    word-break: break-all;
    color: var(--cd-color-text-1);
    font-size: var(--cd-font-size-secondary, var(--cd-font-size-regular));
  }

  .cd-ai-chat-dialogue-content-tool-call-id {
    margin-top: var(--cd-spacing-extra-tight);
    color: var(--cd-color-text-3);
    font-size: var(--cd-font-size-secondary, var(--cd-font-size-regular));
  }

  .cd-ai-chat-dialogue-content-unknown {
    color: var(--cd-color-text-3);
  }
</style>
