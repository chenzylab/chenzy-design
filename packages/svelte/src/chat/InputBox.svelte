<!--
  InputBox — Chat 输入区（严格对齐 Semi chat/inputBox）。
  DOM 对齐 Semi：.cd-chat-inputBox > .cd-chat-inputBox-inner
    ( -clearButton(Button) + .cd-chat-inputBox-container( -upload(Upload>-uploadButton Button)
      + .cd-chat-inputBox-inputArea( TextArea.-textarea ) + -sendButton(Button) ) )。
  按钮用本库 Button + 具名图标（对齐 Semi）：clear=IconDeleteStroked、upload=IconChainStroked、
  send=IconArrowUp(旋转 45deg)。textarea 用本库 TextArea（autosize）。
  - sendHotKey 走 core.shouldSendOnEnter。enableUpload 三态由父级归一透传。
  - disableSend 对齐 Semi getDisableSend + canSend。拖拽上传整容器遮罩（dropArea）。
  自定义整块渲染走 renderInputArea snippet。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { shouldSendOnEnter, type SendHotKey } from '@chenzy-design/core';
  import { IconDeleteStroked, IconChainStroked, IconArrowUp } from '@chenzy-design/icons';
  import { useLocale } from '../locale-provider/index.js';
  import { Upload } from '../upload/index.js';
  import Button from '../button/Button.svelte';
  import TextArea from '../textarea/TextArea.svelte';
  import Tooltip from '../tooltip/Tooltip.svelte';
  import type { UploadFileItem } from '../upload/types.js';
  import type { RenderInputAreaProps } from './types.js';

  interface Props {
    sendHotKey?: SendHotKey;
    placeholder?: string | undefined;
    showClearContext?: boolean;
    disableSend?: boolean;
    canSend?: boolean | undefined;
    clickUpload?: boolean;
    pasteUpload?: boolean;
    dragUpload?: boolean;
    uploadProps?: Record<string, unknown> | undefined;
    /** 上传按钮 Tooltip 提示（对齐 Semi uploadTipProps）。 */
    uploadTipProps?: Record<string, unknown> | undefined;
    onSend?: ((content: string, attachment: UploadFileItem[]) => void) | undefined;
    onClearContext?: (() => void) | undefined;
    onInputChange?: ((props: { value: string; attachment: UploadFileItem[] }) => void) | undefined;
    renderInputArea?: Snippet<[RenderInputAreaProps]> | undefined;
    class?: string;
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
    uploadTipProps,
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
  let dragActive = $state(false);
  let uploadApi = $state<{ addFiles: (files: File[]) => void } | undefined>();

  // disableSend：显式 canSend 优先；否则按 Semi 推断（disableSend / 无文本无附件 / 附件有未 success）。
  const inferredDisableSend = $derived(
    disableSend ||
      (content.length === 0 && attachment.length === 0) ||
      attachment.some((item) => item.status !== 'success'),
  );
  const computedDisableSend = $derived(canSend === undefined ? inferredDisableSend : !canSend);

  function emitInputChange(): void {
    onInputChange?.({ value: content, attachment });
  }

  function handleInput(value: string): void {
    content = value;
    emitInputChange();
  }

  function handleAttachmentChange({ fileList }: { fileList: UploadFileItem[]; currentFile: UploadFileItem }): void {
    attachment = [...fileList];
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
  <Button
    class="cd-chat-inputBox-clearButton"
    theme="borderless"
    type="primary"
    onclick={handleClear}
    ariaLabel={loc().t('Chat.clear')}
    title={loc().t('Chat.clear')}
    icon={clearIcon}
  />
{/snippet}
{#snippet clearIcon()}<IconDeleteStroked />{/snippet}

{#snippet uploadCore()}
  <!-- clickUpload 关但 dragUpload 开时仍挂载 Upload 接住 drop 文件，仅 CSS 隐藏点击触发器。 -->
  <div class="cd-chat-inputBox-upload" class:cd-chat-inputBox-upload-hidden={!clickUpload}>
    <!-- listType=none：只保留图标触发按钮，不渲染 Upload 自带文件列表（附件由 chat 内容区/输入区自行展示，对齐 Semi）。 -->
    <Upload
      bind:this={uploadApi}
      listType="none"
      multiple
      addOnPasting={pasteUpload}
      {...uploadProps}
      onChange={handleAttachmentChange}
    >
      <!-- Upload 的 .cd-upload-add 已是 role=button 触发器；children 只放非 interactive 图标 span
           （对齐 Semi uploadButton 的 IconChainStroked size=extra-large；不嵌 Button 避免 nested-interactive）。 -->
      <span class="cd-chat-inputBox-uploadButton" aria-label={loc().t('Chat.upload')}>
        <IconChainStroked size="extra-large" />
      </span>
    </Upload>
  </div>
{/snippet}

{#snippet uploadNode()}
  <!-- 有 uploadTipProps 时用 Tooltip 包裹上传触发器（对齐 Semi uploadTipProps ? <Tooltip>...）。 -->
  {#if uploadTipProps}
    <Tooltip {...uploadTipProps}>
      {@render uploadCore()}
    </Tooltip>
  {:else}
    {@render uploadCore()}
  {/if}
{/snippet}
{#snippet inputNode()}
  <div class="cd-chat-inputBox-inputArea">
    <!-- rows=1 确保初始单行（对齐 Semi textAutoSize minRows:1/maxRows:5；本库 autosize 初始高度取 rows）。 -->
    <TextArea
      class="cd-chat-inputBox-textarea"
      value={content}
      placeholder={placeholderText}
      rows={1}
      autosize={{ minRows: 1, maxRows: 5 }}
      onInput={handleInput}
      onKeyDown={handleKeydown}
    />
  </div>
{/snippet}

{#snippet sendNode()}
  <!-- 发送按钮对齐 Semi：theme=solid type=primary（实心蓝色，非 borderless）。 -->
  <Button
    class="cd-chat-inputBox-sendButton"
    theme="solid"
    type="primary"
    disabled={computedDisableSend}
    onclick={doSend}
    ariaLabel={loc().t('Chat.send')}
    title={loc().t('Chat.send')}
    icon={sendIcon}
  />
{/snippet}
{#snippet sendIcon()}<span class="cd-chat-inputBox-sendButton-icon"><IconArrowUp size="large" /></span>{/snippet}

{#snippet defaultNode()}
  <div
    class="cd-chat-inputBox {className}"
    class:cd-chat-inputBox-drag-active={dragActive}
    {style}
    role="group"
    ondragenter={handleDragEnter}
    ondragover={handleDragOver}
    ondragleave={handleDragLeave}
    ondrop={handleDrop}
  >
    {#if dragUpload && dragActive}
      <div class="cd-chat-dropArea" aria-hidden="true">
        <span class="cd-chat-dropArea-text">{loc().t('Chat.upload')}</span>
      </div>
    {/if}
    <div class="cd-chat-inputBox-inner">
      {#if showClearContext}{@render clearContextNode()}{/if}
      <div class="cd-chat-inputBox-container">
        {#if clickUpload || dragUpload}{@render uploadNode()}{/if}
        {@render inputNode()}
        {@render sendNode()}
      </div>
    </div>
  </div>
{/snippet}

<style>
  /* —— inputBox（对齐 Semi .semi-chat-inputBox paddingX/Y） —— */
  .cd-chat-inputBox {
    position: relative;
    padding-left: var(--cd-chat-inputBox-paddingX);
    padding-right: var(--cd-chat-inputBox-paddingX);
    padding-top: var(--cd-chat-inputBox-paddingTop);
    padding-bottom: var(--cd-chat-inputBox-paddingBottom);
  }

  .cd-chat-inputBox-inner {
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    column-gap: var(--cd-chat-inputBox-inner-columnGap);
  }

  /* —— 容器（对齐 Semi -container：border + radius + padding） —— */
  .cd-chat-inputBox-container {
    display: flex;
    flex-direction: row;
    flex-grow: 1;
    border-radius: var(--cd-chat-inputBox-container-radius);
    padding: var(--cd-chat-inputBox-container-padding);
    border: var(--cd-chat-inputBox-container-border-width) solid
      var(--cd-chat-inputBox-container-border);
    align-items: flex-end;
  }

  .cd-chat-inputBox-inputArea {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
  }

  /* textarea 无边框透明（对齐 Semi -textarea） */
  .cd-chat-inputBox-inputArea :global(.cd-chat-inputBox-textarea),
  .cd-chat-inputBox-inputArea :global(.cd-input-textarea-wrapper) {
    flex-grow: 1;
  }
  .cd-chat-inputBox-inputArea :global(.cd-input-textarea-wrapper),
  .cd-chat-inputBox-inputArea :global(.cd-input-textarea-wrapper:hover),
  .cd-chat-inputBox-inputArea :global(.cd-input-textarea-wrapper:focus-within) {
    border: none;
    background-color: transparent;
  }

  /* —— clearButton（对齐 Semi -clearButton：圆形 48px + 大图标） —— */
  .cd-chat-inputBox :global(.cd-chat-inputBox-clearButton) {
    border-radius: 50%;
    width: var(--cd-chat-inputBottom-clearButton-width);
    height: var(--cd-chat-inputBottom-clearButton-width);
    margin-top: var(--cd-chat-inputBox-marginY);
    margin-bottom: var(--cd-chat-inputBox-marginY);
    color: var(--cd-chat-inputBottom-clearButton-icon);
  }
  .cd-chat-inputBox :global(.cd-chat-inputBox-clearButton .cd-icon) {
    font-size: var(--cd-chat-inputBottom-clearButton-icon-font-size);
  }

  /* —— uploadButton（对齐 Semi -uploadButton：32x32 图标 span，模拟 borderless 视觉） —— */
  .cd-chat-inputBox-upload :global(.cd-upload-file-list) {
    display: none;
  }
  .cd-chat-inputBox-uploadButton {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--cd-chat-inputBottom-uploadButton-width);
    height: var(--cd-chat-inputBottom-uploadButton-width);
    color: var(--cd-chat-inputBottom-uploadButton-icon);
    cursor: pointer;
  }
  .cd-chat-inputBox-upload-hidden {
    display: none;
  }

  /* —— sendButton（对齐 Semi -sendButton：Button solid primary 32x32，图标 large 旋转 45deg）。
       disabled 态用 Button solid 自带的浅灰 bg + 半透明字（Semi 实测 bg fill-2 / color text 35%），不覆盖。 —— */
  .cd-chat-inputBox :global(.cd-chat-inputBox-sendButton) {
    width: var(--cd-chat-inputBottom-sendButton-width);
    height: var(--cd-chat-inputBottom-sendButton-width);
  }
  .cd-chat-inputBox-sendButton-icon {
    display: inline-flex;
    transform: rotate(45deg);
  }

  /* —— dropArea 拖拽遮罩（对齐 Semi -dropArea） —— */
  .cd-chat-dropArea {
    position: absolute;
    inset: 0;
    background: var(--cd-chat-dropArea-bg);
    z-index: var(--cd-chat-dropArea-z);
    border: var(--cd-chat-dropArea-border-width) dotted var(--cd-chat-dropArea-border);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--cd-chat-dropArea-radius);
    pointer-events: none;
  }
  .cd-chat-dropArea-text {
    font-size: var(--cd-chat-dropArea-text-font-size);
  }
</style>
