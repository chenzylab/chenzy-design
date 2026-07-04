<!--
  InputBox — Chat 输入区（对齐 Semi chat/inputBox + InputBoxFoundation）。
  textarea 文本 + Upload 附件 + 发送按钮（可选 clearContext）。
  - sendHotKey 走 core.shouldSendOnEnter（enter / shift+enter）。
  - enableUpload 的 clickUpload/pasteUpload 三态由父级用 core.resolveEnableUpload 归一后透传。
  - disableSend 对齐 Semi getDisableSend：无文本且无附件 / 附件有未 success / 显式 disableSend。
  自定义整块渲染走 renderInputArea snippet（对齐 Semi renderInputArea render prop）。
  全 token，类名前缀 cd-。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { shouldSendOnEnter, type SendHotKey } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';
  import { Upload } from '../upload/index.js';
  import type { UploadFileItem } from '../upload/types.js';
  import type { RenderInputAreaProps } from './types.js';

  interface Props {
    /** 发送快捷键（enter 默认；shift+enter）。 */
    sendHotKey?: SendHotKey;
    /** 占位文本（缺省走 locale Chat.placeholder）。 */
    placeholder?: string | undefined;
    /** 是否展示清除上下文按钮。 */
    showClearContext?: boolean;
    /** 显式禁止发送（如生成中）。 */
    disableSend?: boolean;
    /**
     * 是否可以发送（对齐 Semi canSend）。未设置（undefined）时按内容 / 附件推断；
     * 显式设置时以此为准（覆盖内部推断）。
     */
    canSend?: boolean | undefined;
    /** 是否允许点击上传（三态之一）。 */
    clickUpload?: boolean;
    /** 是否允许粘贴上传（三态之一）。 */
    pasteUpload?: boolean;
    /** 是否允许拖拽上传（三态之一，整容器拖拽遮罩）。 */
    dragUpload?: boolean;
    /** 透传给内部 Upload 的 props。 */
    uploadProps?: Record<string, unknown> | undefined;
    /** 发送回调（content, attachment）。 */
    onSend?: ((content: string, attachment: UploadFileItem[]) => void) | undefined;
    /** 清除上下文回调。 */
    onClearContext?: (() => void) | undefined;
    /** 输入变化回调（{ value, attachment }）。 */
    onInputChange?: ((props: { value: string; attachment: UploadFileItem[] }) => void) | undefined;
    /** 自定义整块输入区渲染。 */
    renderInputArea?: Snippet<[RenderInputAreaProps]> | undefined;
    /** 附加类名。 */
    class?: string;
    /** 内联样式。 */
    style?: string;
  }

  let {
    sendHotKey = 'enter',
    placeholder,
    showClearContext = false,
    disableSend = false,
    canSend,
    clickUpload = true,
    pasteUpload = true,
    dragUpload = true,
    uploadProps,
    onSend,
    onClearContext,
    onInputChange,
    renderInputArea,
    class: className = '',
    style,
  }: Props = $props();

  const loc = useLocale();

  let content = $state('');
  let attachment = $state<UploadFileItem[]>([]);
  // 拖拽上传遮罩可见性（对齐 Semi uploadAreaVisible / dragStatus）。
  let dragActive = $state(false);
  // 内部持有 Upload 实例，drop 时把文件喂给它（复用 Upload 的校验/上传管线）。
  let uploadApi = $state<{ addFiles: (files: File[]) => void } | undefined>();

  // 对齐 Semi getDisableSend + canSend：
  // - 显式 canSend 优先（true 恒可发、false 恒禁发）；
  // - 否则按 Semi 推断：显式 disableSend / 无文本且无附件 / 附件有未 success。
  const inferredDisableSend = $derived(
    disableSend ||
      (content.length === 0 && attachment.length === 0) ||
      attachment.some((item) => item.status !== 'success'),
  );
  const computedDisableSend = $derived(
    canSend === undefined ? inferredDisableSend : !canSend,
  );

  function emitInputChange(): void {
    onInputChange?.({ value: content, attachment });
  }

  function handleInput(e: Event): void {
    content = (e.currentTarget as HTMLTextAreaElement).value;
    emitInputChange();
  }

  function handleAttachmentChange(list: UploadFileItem[]): void {
    attachment = [...list];
    emitInputChange();
  }

  function doSend(): void {
    if (computedDisableSend) return;
    const sendContent = content;
    const sendAttachment = attachment;
    content = '';
    attachment = [];
    onSend?.(sendContent, sendAttachment);
  }

  function handleKeydown(e: KeyboardEvent): void {
    if (e.key !== 'Enter' || e.isComposing) return;
    if (!shouldSendOnEnter(sendHotKey, e.shiftKey)) return;
    e.preventDefault();
    doSend();
  }

  function handleClear(): void {
    onClearContext?.();
  }

  // —— 拖拽上传（对齐 Semi handleContainerDragOver/Drop/DragLeave）——
  let dragDepth = 0;
  function handleDragEnter(e: DragEvent): void {
    if (!dragUpload) return;
    if (!e.dataTransfer?.types?.includes('Files')) return;
    e.preventDefault();
    dragDepth += 1;
    dragActive = true;
  }
  function handleDragOver(e: DragEvent): void {
    if (!dragUpload) return;
    if (!e.dataTransfer?.types?.includes('Files')) return;
    e.preventDefault();
  }
  function handleDragLeave(e: DragEvent): void {
    if (!dragUpload) return;
    e.preventDefault();
    dragDepth = Math.max(0, dragDepth - 1);
    if (dragDepth === 0) dragActive = false;
  }
  function handleDrop(e: DragEvent): void {
    if (!dragUpload) return;
    e.preventDefault();
    dragDepth = 0;
    dragActive = false;
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) uploadApi?.addFiles(Array.from(files));
  }

  const placeholderText = $derived(placeholder ?? loc().t('Chat.placeholder'));
</script>

{#if renderInputArea}
  {@render renderInputArea({
    onSend: (c?: string, a?: UploadFileItem[]) => onSend?.(c ?? '', a ?? []),
    onClear: onClearContext,
    defaultNode,
    detailProps: {
      clearContextNode: showClearContext ? clearContextNode : undefined,
      uploadNode: clickUpload || dragUpload ? uploadNode : undefined,
      inputNode,
      sendNode,
    },
  })}
{:else}
  {@render defaultNode()}
{/if}

{#snippet clearContextNode()}
  <button
    type="button"
    class="cd-chat-inputBox-clear"
    onclick={handleClear}
    title={loc().t('Chat.clear')}
    aria-label={loc().t('Chat.clear')}
  >
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
      <path
        d="M3 6h18M8 6V4h8v2m-9 0v14a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V6"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </button>
{/snippet}

{#snippet uploadNode()}
  <!-- clickUpload 关但 dragUpload 开时，仍挂载 Upload 实例以接住 drop 文件，
       仅用 CSS 隐藏点击触发器（保留 addFiles 管线）。 -->
  <div class="cd-chat-inputBox-upload" class:cd-chat-inputBox-upload--hidden={!clickUpload}>
    <Upload
      bind:this={uploadApi}
      listType="picture-card"
      multiple
      addOnPasting={pasteUpload}
      {...uploadProps}
      onChange={handleAttachmentChange}
    >
      <!-- Upload 已把 children 包进自身 <button>（可访问名走 Upload.trigger），
           这里只放图标 span，避免嵌套 interactive（nested-interactive）。 -->
      <span class="cd-chat-inputBox-upload-trigger" aria-label={loc().t('Chat.upload')}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
          <path
            d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M12 3v13m0-13-4 4m4-4 4 4"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
    </Upload>
  </div>
{/snippet}

{#snippet inputNode()}
  <textarea
    class="cd-chat-inputBox-textarea"
    value={content}
    placeholder={placeholderText}
    rows="1"
    oninput={handleInput}
    onkeydown={handleKeydown}
  ></textarea>
{/snippet}

{#snippet sendNode()}
  <button
    type="button"
    class="cd-chat-inputBox-send"
    disabled={computedDisableSend}
    onclick={doSend}
    title={loc().t('Chat.send')}
    aria-label={loc().t('Chat.send')}
  >
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
      <path
        d="M4 12 20 4l-4 16-4-7-8-1Z"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </button>
{/snippet}

{#snippet defaultNode()}
  <div
    class="cd-chat-inputBox {className}"
    class:cd-chat-inputBox--drag-active={dragActive}
    {style}
    role="group"
    ondragenter={handleDragEnter}
    ondragover={handleDragOver}
    ondragleave={handleDragLeave}
    ondrop={handleDrop}
  >
    {#if dragUpload && dragActive}
      <div class="cd-chat-inputBox-dropmask" aria-hidden="true">
        {loc().t('Chat.upload')}
      </div>
    {/if}
    {#if showClearContext}{@render clearContextNode()}{/if}
    {#if clickUpload || dragUpload}{@render uploadNode()}{/if}
    {@render inputNode()}
    {@render sendNode()}
  </div>
{/snippet}

<style>
  .cd-chat-inputBox {
    position: relative;
    display: flex;
    align-items: flex-end;
    gap: var(--cd-spacing-tight);
    padding: var(--cd-spacing-tight);
    background: var(--cd-chat-input-bg);
    border: 1px solid var(--cd-chat-input-border);
    border-radius: var(--cd-chat-input-radius);
    transition: border-color var(--cd-chat-motion-duration) ease;
  }

  .cd-chat-inputBox:focus-within {
    border-color: var(--cd-chat-input-border-focus);
  }

  /* 拖拽上传：整容器高亮 + 覆盖遮罩（对齐 Semi uploadAreaVisible）。 */
  .cd-chat-inputBox--drag-active {
    border-color: var(--cd-chat-input-border-focus);
  }

  .cd-chat-inputBox-dropmask {
    position: absolute;
    inset: 0;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--cd-chat-input-bg);
    border: 1px dashed var(--cd-color-primary);
    border-radius: var(--cd-chat-input-radius);
    color: var(--cd-color-primary);
    font-size: var(--cd-font-size-regular);
    pointer-events: none;
  }

  .cd-chat-inputBox-upload--hidden {
    display: none;
  }

  .cd-chat-inputBox-textarea {
    flex: 1 1 auto;
    min-width: 0;
    resize: none;
    border: none;
    outline: none;
    background: transparent;
    color: var(--cd-chat-input-color);
    font: inherit;
    line-height: 1.5;
    max-height: 160px;
    padding: var(--cd-spacing-extra-tight) 0;
  }

  .cd-chat-inputBox-textarea::placeholder {
    color: var(--cd-color-text-2);
  }

  .cd-chat-inputBox-clear,
  .cd-chat-inputBox-upload-trigger,
  .cd-chat-inputBox-send {
    appearance: none;
    border: none;
    background: transparent;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: var(--cd-spacing-extra-tight);
    border-radius: var(--cd-border-radius-small);
    color: var(--cd-chat-action-icon);
    transition: color var(--cd-chat-motion-duration) ease;
  }

  .cd-chat-inputBox-clear:hover,
  .cd-chat-inputBox-upload-trigger:hover {
    color: var(--cd-chat-action-icon-hover);
  }

  .cd-chat-inputBox-send {
    color: var(--cd-color-primary);
  }

  .cd-chat-inputBox-send:disabled {
    color: var(--cd-color-text-3, var(--cd-color-text-2));
    cursor: not-allowed;
  }

  .cd-chat-inputBox-clear:focus-visible,
  .cd-chat-inputBox-upload-trigger:focus-visible,
  .cd-chat-inputBox-send:focus-visible {
    outline: 2px solid var(--cd-color-primary);
    outline-offset: 2px;
  }

  .cd-chat-inputBox-upload {
    display: inline-flex;
  }
</style>
