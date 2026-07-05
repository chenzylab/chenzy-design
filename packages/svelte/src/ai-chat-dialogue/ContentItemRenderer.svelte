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
    type ContentItem,
    type ToolCallView,
  } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';
  import { MarkdownRender } from '../markdown-render/index.js';

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
  }

  let { item, markdownRenderProps, renderMap, onFileClick, onImageClick }: Props = $props();

  const loc = useLocale();
  const type = $derived(contentItemType(item));
  const custom = $derived(renderMap?.[type]);

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
    return typeof part.text === 'string' ? part.text : '';
  }
</script>

{#if custom}
  {@render custom(item)}
{:else if type === 'message'}
  <div class="cd-ai-dialogue-block cd-ai-dialogue-block--message">
    {#each innerParts as part, i (i)}
      {#if part.type === 'output_text' || part.type === 'input_text' || part.type === 'text'}
        <MarkdownRender raw={partText(part)} {...markdownRenderProps} />
      {:else if part.type === 'refusal'}
        <div class="cd-ai-dialogue-refusal">{part.refusal}</div>
      {:else if part.type === 'input_image' || part.type === 'image'}
        <button
          type="button"
          class="cd-ai-dialogue-image-btn"
          onclick={() => onImageClick?.(part)}
        >
          <img
            class="cd-ai-dialogue-image"
            src={(part.image_url as string) ?? (part.url as string)}
            alt=""
          />
        </button>
      {:else if part.type === 'input_file' || part.type === 'file'}
        <button type="button" class="cd-ai-dialogue-file" onclick={() => onFileClick?.(part)}>
          <span class="cd-ai-dialogue-file-name"
            >{(part.filename as string) ?? loc().t('AIChatDialogue.file')}</span
          >
        </button>
      {/if}
    {/each}
  </div>
{:else if type === 'reasoning'}
  <div class="cd-ai-dialogue-block cd-ai-dialogue-block--reasoning">
    <button
      type="button"
      class="cd-ai-dialogue-reasoning-toggle"
      aria-expanded={reasoningOpen}
      onclick={() => (reasoningOpen = !reasoningOpen)}
    >
      {loc().t('AIChatDialogue.reasoning')}
    </button>
    {#if reasoningOpen}
      <div class="cd-ai-dialogue-reasoning-body">
        <MarkdownRender raw={reasoningText} {...markdownRenderProps} />
      </div>
    {/if}
  </div>
{:else if type === 'function_call' || type === 'custom_call' || type.endsWith('_call')}
  <!-- 完整工具调用块：状态图标 + 折叠展开（参数/输出格式化 + call_id + MCP server）。 -->
  <div
    class="cd-ai-dialogue-block cd-ai-dialogue-block--tool"
    class:cd-ai-dialogue-tool--running={toolView.status === 'in_progress'}
    class:cd-ai-dialogue-tool--failed={toolView.status === 'failed'}
  >
    <button
      type="button"
      class="cd-ai-dialogue-tool-header"
      aria-expanded={toolOpen}
      onclick={() => (toolOpen = !toolOpen)}
    >
      <span class="cd-ai-dialogue-tool-status" aria-hidden="true">
        {#if toolView.status === 'in_progress'}⟳{:else if toolView.status === 'failed'}✗{:else}✓{/if}
      </span>
      <span class="cd-ai-dialogue-tool-name">{toolView.name || loc().t('AIChatDialogue.toolCall')}</span>
      {#if toolView.serverLabel}
        <span class="cd-ai-dialogue-tool-server">{toolView.serverLabel}</span>
      {/if}
    </button>
    {#if toolOpen}
      <div class="cd-ai-dialogue-tool-body">
        {#if toolView.arguments}
          <div class="cd-ai-dialogue-tool-section">
            <span class="cd-ai-dialogue-tool-label">{loc().t('AIChatDialogue.toolArguments')}</span>
            <pre class="cd-ai-dialogue-tool-args">{toolView.arguments}</pre>
          </div>
        {/if}
        {#if toolView.input}
          <div class="cd-ai-dialogue-tool-section">
            <span class="cd-ai-dialogue-tool-label">{loc().t('AIChatDialogue.toolInput')}</span>
            <pre class="cd-ai-dialogue-tool-args">{toolView.input}</pre>
          </div>
        {/if}
        {#if toolView.output}
          <div class="cd-ai-dialogue-tool-section">
            <span class="cd-ai-dialogue-tool-label">{loc().t('AIChatDialogue.toolOutput')}</span>
            <pre class="cd-ai-dialogue-tool-args">{toolView.output}</pre>
          </div>
        {/if}
        {#if toolView.callId}
          <div class="cd-ai-dialogue-tool-callid">{toolView.callId}</div>
        {/if}
      </div>
    {/if}
  </div>
{:else if type === 'audio'}
  <div class="cd-ai-dialogue-block cd-ai-dialogue-block--audio">
    {loc().t('AIChatDialogue.audio')}
  </div>
{:else}
  <!-- 兜底：未知类型，渲染类型标签（可被 renderDialogueContentItem 覆盖）。 -->
  <div class="cd-ai-dialogue-block cd-ai-dialogue-block--unknown">
    <span class="cd-ai-dialogue-unknown-type">{type}</span>
  </div>
{/if}

<style>
  .cd-ai-dialogue-block {
    margin-block: var(--cd-spacing-extra-tight);
  }

  .cd-ai-dialogue-refusal {
    color: var(--cd-color-danger);
  }

  .cd-ai-dialogue-image-btn {
    appearance: none;
    border: none;
    background: none;
    padding: 0;
    cursor: pointer;
  }

  .cd-ai-dialogue-image {
    max-width: 240px;
    max-height: 240px;
    border-radius: var(--cd-border-radius-medium);
  }

  .cd-ai-dialogue-file {
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

  .cd-ai-dialogue-reasoning-toggle {
    appearance: none;
    border: none;
    background: none;
    padding: 0;
    cursor: pointer;
    color: var(--cd-color-text-2);
    font: inherit;
  }

  .cd-ai-dialogue-reasoning-body {
    margin-top: var(--cd-spacing-extra-tight);
    padding-left: var(--cd-spacing-tight);
    border-left: 2px solid var(--cd-color-border);
    color: var(--cd-color-text-1);
  }

  .cd-ai-dialogue-block--tool {
    border: 1px solid var(--cd-color-border);
    border-radius: var(--cd-border-radius-medium);
    background: var(--cd-color-fill-0);
    overflow: hidden;
  }

  .cd-ai-dialogue-tool-header {
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

  .cd-ai-dialogue-tool-header:hover {
    background: var(--cd-color-fill-1);
  }

  .cd-ai-dialogue-tool-header:focus-visible {
    outline: 2px solid var(--cd-color-primary);
    outline-offset: -2px;
  }

  .cd-ai-dialogue-tool-status {
    color: var(--cd-color-text-2);
  }

  .cd-ai-dialogue-tool--running .cd-ai-dialogue-tool-status {
    color: var(--cd-color-primary);
  }

  .cd-ai-dialogue-tool--failed .cd-ai-dialogue-tool-status {
    color: var(--cd-color-danger);
  }

  .cd-ai-dialogue-tool-name {
    font-weight: var(--cd-font-weight-bold);
    color: var(--cd-color-text-0);
  }

  .cd-ai-dialogue-tool-server {
    padding: 0 var(--cd-spacing-extra-tight);
    border-radius: var(--cd-border-radius-small);
    background: var(--cd-color-fill-2);
    color: var(--cd-color-text-2);
    font-size: var(--cd-font-size-secondary, var(--cd-font-size-regular));
  }

  .cd-ai-dialogue-tool-body {
    padding: 0 var(--cd-spacing-tight) var(--cd-spacing-tight);
  }

  .cd-ai-dialogue-tool-section {
    margin-top: var(--cd-spacing-extra-tight);
  }

  .cd-ai-dialogue-tool-label {
    display: block;
    color: var(--cd-color-text-2);
    font-size: var(--cd-font-size-secondary, var(--cd-font-size-regular));
  }

  .cd-ai-dialogue-tool-args {
    margin: var(--cd-spacing-extra-tight) 0 0;
    padding: var(--cd-spacing-extra-tight);
    border-radius: var(--cd-border-radius-small);
    background: var(--cd-color-fill-1);
    white-space: pre-wrap;
    word-break: break-all;
    color: var(--cd-color-text-1);
    font-size: var(--cd-font-size-secondary, var(--cd-font-size-regular));
  }

  .cd-ai-dialogue-tool-callid {
    margin-top: var(--cd-spacing-extra-tight);
    color: var(--cd-color-text-3);
    font-size: var(--cd-font-size-secondary, var(--cd-font-size-regular));
  }

  .cd-ai-dialogue-block--unknown {
    color: var(--cd-color-text-3);
  }
</style>
