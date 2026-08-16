<!--
  Attachment — 已选附件预览区（严格对齐 Semi chat/attachment.tsx 默认导出）。
  InputBox 已选待发送附件列表：按图片/文件分流渲染缩略图或文件卡片，
  叠加清除按钮（hover 显示）+ 上传中进度圈 + 上传失败图标。
-->
<script lang="ts">
  import { isImageAttachment } from '@chenzy-design/core';
  import { IconAlertCircle, IconClear } from '@chenzy-design/icons';
  import { Progress } from '../progress/index.js';
  import type { UploadFileItem } from '../upload/types.js';
  import FileAttachment from './FileAttachment.svelte';
  import ImageAttachment from './ImageAttachment.svelte';

  interface Props {
    attachment: UploadFileItem[];
    onClear?: ((item: UploadFileItem) => void) | undefined;
    showClear?: boolean;
    class?: string;
  }

  let { attachment, onClear, showClear = true, class: className = '' }: Props = $props();

  function suffixOf(name: string): string {
    return name.split('.').pop() ?? '';
  }

  function realTypeOf(item: UploadFileItem): string {
    const suffix = suffixOf(item.name ?? '');
    return suffix || (item.fileInstance?.type.split('/').pop() ?? '');
  }

  function isImg(item: UploadFileItem): boolean {
    return isImageAttachment(
      item.fileInstance ? { name: item.name, fileInstance: item.fileInstance } : { name: item.name },
    );
  }

  function showProcess(item: UploadFileItem): boolean {
    return !(item.percent === 100 || item.percent === undefined) && item.status === 'uploading';
  }

  function isFail(item: UploadFileItem): boolean {
    return item.status === 'uploadFail' || item.status === 'validateFail';
  }
</script>

<div class="cd-chat-attachment {className}">
  {#each attachment as item (item.uid)}
    <div class="cd-chat-attachment-item">
      {#if isImg(item)}
        <ImageAttachment src={item.url ?? ''} />
      {:else}
        <FileAttachment url={item.url} name={item.name} size={item.size} type={realTypeOf(item)} />
      {/if}
      {#if showClear}
        <IconClear
          size="large"
          class="cd-chat-inputBox-attachment-clear"
          onclick={() => onClear?.(item)}
        />
      {/if}
      {#if showProcess(item)}
        <Progress
          percent={item.percent ?? 0}
          type="circle"
          size="small"
          width={30}
          class="cd-chat-attachment-process"
          aria-label="upload progress"
        />
      {/if}
      {#if isFail(item)}
        <IconAlertCircle class="cd-chat-attachment-fail" />
      {/if}
    </div>
  {/each}
</div>

<style>
  .cd-chat-attachment {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    column-gap: var(--cd-chat-attachment-columnGap);
    row-gap: var(--cd-chat-attachment-rowGap);
    margin-left: var(--cd-chat-attachment-marginX);
    margin-right: var(--cd-chat-attachment-marginX);
  }

  .cd-chat-attachment-item {
    position: relative;
  }
  .cd-chat-attachment-item :global(.cd-chat-inputBox-attachment-clear) {
    visibility: hidden;
  }
  .cd-chat-attachment-item:hover :global(.cd-chat-inputBox-attachment-clear) {
    visibility: visible;
  }

  .cd-chat-attachment-item :global(.cd-chat-inputBox-attachment-clear) {
    position: absolute;
    top: calc(-1 * var(--cd-chat-attachment-clear-top));
    right: calc(-1 * var(--cd-chat-attachment-clear-right));
    color: var(--cd-chat-attachment-clear-icon);
    cursor: pointer;
  }

  .cd-chat-attachment-item :global(.cd-chat-attachment-process),
  .cd-chat-attachment-item :global(.cd-chat-attachment-fail) {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .cd-chat-attachment-item :global(.cd-chat-attachment-fail) {
    color: var(--cd-chat-attachment-fail);
  }
</style>
