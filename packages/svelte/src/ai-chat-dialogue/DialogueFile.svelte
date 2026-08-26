<!--
  DialogueFile — 消息里的文件附件卡（1:1 对齐 Semi widgets/dialogueContent.tsx 的 FileAttachment）。

  本库原来只有一个裸 button + 文件名一行；Semi 是：
  <a href target=_blank> 图标底框（按类型上色）+ -file-info（标题 + 「类型 大小」）
  + （user 消息且 showReference 时）右侧引用按钮 </a>

  图标分类顺序照搬 Semi renderFileIcon 的 if-else：document → image → pdf → excel
  → code → video → default；image 类不用图标而是把 file_url 当背景图。
-->
<script lang="ts">
  import { dialogueFileIconType, dialogueFileRealType } from '@chenzy-design/core';
  import {
    IconWord,
    IconPdf,
    IconExcel,
    IconCode,
    IconVideo,
    IconFile,
    IconSendMsgStroked,
  } from '@chenzy-design/icons';

  interface Props {
    /** 文件块原始数据（input_file / file 形态）。 */
    file: Record<string, unknown>;
    /** 是否本组最后一个文件（对齐 Semi isLastFile，去掉右外距）。 */
    isLastFile?: boolean;
    /** 当前消息是否 user 角色（决定是否出引用按钮 + 标题是否截断）。 */
    isUser?: boolean;
    /** 是否展示引用入口（对齐 Semi showReference）。 */
    showReference?: boolean;
    /** 禁用点击跳转（对齐 Semi disabledFileItemClick：仍触发回调但阻止默认跳转）。 */
    disabledFileItemClick?: boolean;
    onFileClick?: ((file: unknown) => void) | undefined;
    onReferenceClick?: ((ref: { name?: string; url?: string }) => void) | undefined;
  }

  let {
    file,
    isLastFile = false,
    isUser = false,
    showReference = false,
    disabledFileItemClick = false,
    onFileClick,
    onReferenceClick,
  }: Props = $props();

  const filename = $derived(typeof file.filename === 'string' ? file.filename : undefined);
  const fileUrl = $derived(typeof file.file_url === 'string' ? file.file_url : undefined);
  const size = $derived(file.size);

  const realType = $derived(
    dialogueFileRealType({
      ...(filename !== undefined ? { filename } : {}),
      ...(typeof file.fileInstance === 'object' && file.fileInstance !== null
        ? { fileInstance: file.fileInstance as { type?: string } }
        : {}),
    }),
  );
  const iconType = $derived(dialogueFileIconType(realType));

  // 标题截断：仅 user 消息且展示引用入口时（对齐 Semi -file-title-ellipsis 的条件）。
  const titleEllipsis = $derived(isUser && showReference);

  function handleFileClick(e: MouseEvent): void {
    onFileClick?.(file);
    // 对齐 Semi：先回调再按需阻止跳转。
    if (disabledFileItemClick) e.preventDefault();
  }

  function handleReferenceClick(e: MouseEvent): void {
    onReferenceClick?.({
      ...(filename !== undefined ? { name: filename } : {}),
      ...(fileUrl !== undefined ? { url: fileUrl } : {}),
    });
    // 对齐 Semi：引用点击不触发外层 <a> 的跳转。
    e.preventDefault();
    e.stopPropagation();
  }
</script>

<a
  class="cd-ai-chat-dialogue-content-file"
  class:cd-ai-chat-dialogue-content-file-last={isLastFile}
  href={fileUrl}
  target="_blank"
  rel="noreferrer"
  onclick={handleFileClick}
>
  <span
    class="cd-ai-chat-dialogue-content-file-icon-wrapper cd-ai-chat-dialogue-content-file-icon-{iconType}"
  >
    {#if iconType === 'image'}
      <!-- 对齐 Semi：图片类不画图标，直接把 file_url 当背景图铺满。 -->
      <span
        class="cd-ai-chat-dialogue-content-file-icon"
        style={fileUrl ? `background-image: url(${fileUrl})` : undefined}
      ></span>
    {:else if iconType === 'word'}
      <IconWord size="extra-large" class="cd-ai-chat-dialogue-content-file-icon" />
    {:else if iconType === 'pdf'}
      <IconPdf size="extra-large" class="cd-ai-chat-dialogue-content-file-icon" />
    {:else if iconType === 'excel'}
      <IconExcel size="extra-large" class="cd-ai-chat-dialogue-content-file-icon" />
    {:else if iconType === 'code'}
      <IconCode size="extra-large" class="cd-ai-chat-dialogue-content-file-icon" />
    {:else if iconType === 'video'}
      <IconVideo size="extra-large" class="cd-ai-chat-dialogue-content-file-icon" />
    {:else}
      <IconFile size="extra-large" class="cd-ai-chat-dialogue-content-file-icon" />
    {/if}
  </span>

  <span class="cd-ai-chat-dialogue-content-file-info">
    <span
      class="cd-ai-chat-dialogue-content-file-title"
      class:cd-ai-chat-dialogue-content-file-title-ellipsis={titleEllipsis}>{filename ?? ''}</span
    >
    <span class="cd-ai-chat-dialogue-content-file-metadata">
      <span class="cd-ai-chat-dialogue-content-file-type">{realType ?? ''}</span>
      {size ?? ''}
    </span>
  </span>

  {#if isUser && showReference}
    <!-- 引用入口：Semi 是 div + role=button + tabIndex，本库用原生 button 语义等价。 -->
    <button
      type="button"
      class="cd-ai-chat-dialogue-content-icon-reference"
      onclick={handleReferenceClick}
    >
      <IconSendMsgStroked />
    </button>
  {/if}
</a>

<style>
  /* 逐条对齐 Semi aiChatDialogue.scss &-content-file 及其子块。 */
  .cd-ai-chat-dialogue-content-file {
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    /* Semi &-content-file 没有显式 box-sizing（跟 &-bubble 那条特意写 border-box
       不同），靠默认 content-box 让 height:36px 只是内容区高度、padding 往外扩，
       实际视觉总高 36+8*2=52px（图标框本身就是 36×36，刚好撑满内容区）。docs 站
       app.css 有全局 `*{box-sizing:border-box}` reset，若组件不显式声明会被继承，
       把 height 变成含 padding 的总高度，内容区被压缩到 20px，图标被撑破/裁切——
       真机实测在 docs 站复现，正是「文件展示背景高度太低」的根因。宿主页面用类似
       全局 reset 的场景很常见，不能假设宿主没有，故显式声明兜底。 */
    box-sizing: content-box;
    height: var(--cd-height-ai-chat-dialogue-file);
    width: var(--cd-width-ai-chat-dialogue-file);
    column-gap: var(--cd-ai-chat-dialogue-file-column-gap);
    padding: var(--cd-ai-chat-dialogue-file-padding-y) var(--cd-ai-chat-dialogue-file-padding-x);
    margin-top: var(--cd-ai-chat-dialogue-file-margin-top);
    margin-right: var(--cd-ai-chat-dialogue-file-margin-right);
    border-radius: var(--cd-radius-ai-chat-dialogue-file);
    background: var(--cd-ai-chat-dialogue-file-bg);
    text-decoration: none;
    vertical-align: top;
    flex-shrink: 0;
    cursor: pointer;
    color: var(--cd-ai-chat-dialogue-file-title-text);
  }

  .cd-ai-chat-dialogue-content-file-last {
    margin-right: 0;
  }

  .cd-ai-chat-dialogue-content-file-icon-wrapper {
    width: var(--cd-width-ai-chat-dialogue-file-icon-wrapper);
    height: var(--cd-height-ai-chat-dialogue-file-icon-wrapper);
    border-radius: var(--cd-ai-chat-dialogue-icon-wrapper);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .cd-ai-chat-dialogue-content-file-icon-wrapper :global(.cd-ai-chat-dialogue-content-file-icon) {
    color: var(--cd-ai-chat-dialogue-icon-text);
  }

  /* 按类型上色（对齐 Semi &-file-icon-{word,pdf,excel,code,video,default}）。 */
  .cd-ai-chat-dialogue-content-file-icon-code {
    background-color: var(--cd-ai-chat-dialogue-code-icon-bg);
  }
  .cd-ai-chat-dialogue-content-file-icon-word {
    background-color: var(--cd-ai-chat-dialogue-word-icon-bg);
  }
  .cd-ai-chat-dialogue-content-file-icon-pdf {
    background-color: var(--cd-ai-chat-dialogue-pdf-icon-bg);
  }
  .cd-ai-chat-dialogue-content-file-icon-excel {
    background-color: var(--cd-ai-chat-dialogue-excel-icon-bg);
  }
  .cd-ai-chat-dialogue-content-file-icon-video {
    background-color: var(--cd-ai-chat-dialogue-video-icon-bg);
  }
  .cd-ai-chat-dialogue-content-file-icon-default {
    background-color: var(--cd-ai-chat-dialogue-default-icon-bg);
  }

  /* image 类：图标位铺满背景图（Semi &-file-icon-image 内的 &-file-icon）。 */
  .cd-ai-chat-dialogue-content-file-icon-image .cd-ai-chat-dialogue-content-file-icon {
    background-size: cover;
    background-position: center;
    width: var(--cd-width-ai-chat-dialogue-file-icon-wrapper);
    height: var(--cd-height-ai-chat-dialogue-file-icon-wrapper);
  }

  .cd-ai-chat-dialogue-content-file-info {
    display: flex;
    flex-direction: column;
    text-align: left;
    flex-shrink: 1;
  }

  .cd-ai-chat-dialogue-content-file-title {
    font-size: var(--cd-ai-chat-dialogue-file-title-font-size);
    color: var(--cd-ai-chat-dialogue-file-title-text);
    max-width: var(--cd-ai-chat-dialogue-file-title-max);
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .cd-ai-chat-dialogue-content-file-metadata {
    font-size: var(--cd-ai-chat-dialogue-file-metadata-font-size);
    color: var(--cd-ai-chat-dialogue-file-metadata-text);
  }

  .cd-ai-chat-dialogue-content-file-type {
    text-transform: uppercase;
  }

  .cd-ai-chat-dialogue-content-icon-reference {
    display: flex;

    /* button 复位（Semi 那边是 div + role=button）。 */
    background: transparent;
    border: none;
    padding: 0;
    color: inherit;
    cursor: pointer;
  }
</style>
