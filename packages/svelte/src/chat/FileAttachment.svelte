<!--
  FileAttachment — 文件类附件卡片（严格对齐 Semi chat/attachment.tsx 的 FileAttachment）。
  同时被 InputBox 已选附件预览与 ChatBoxContent 消息正文附件复用（对齐 Semi 两处共享同一实现）。
-->
<script lang="ts">
  import { IconBriefStroked } from '@chenzy-design/icons';

  interface Props {
    url?: string | undefined;
    name?: string | undefined;
    size?: string | number | undefined;
    type?: string | undefined;
  }

  let { url, name, size, type }: Props = $props();
</script>

<a href={url} target="_blank" rel="noreferrer" class="cd-chat-attachment-file">
  <IconBriefStroked size="extra-large" class="cd-chat-attachment-file-icon" />
  <div class="cd-chat-attachment-file-info">
    <span class="cd-chat-attachment-file-title">{name}</span>
    <span class="cd-chat-attachment-file-metadata">
      <span class="cd-chat-attachment-file-type">{type}</span>{type ? ' · ' : ''}{size}
    </span>
  </div>
</a>

<style>
  .cd-chat-attachment-file {
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    height: var(--cd-chat-attachment-file-width);
    column-gap: var(--cd-chat-attachment-file-columnGap);
    padding: var(--cd-chat-attachment-file-padding);
    border-radius: var(--cd-chat-attachment-file-radius);
    background: var(--cd-chat-attachment-file-bg);
    text-decoration: none;
  }
  .cd-chat-attachment-file :global(.cd-chat-attachment-file-icon) {
    color: var(--cd-chat-attachment-file-icon);
  }
  .cd-chat-attachment-file-info {
    display: flex;
    flex-direction: column;
  }
  .cd-chat-attachment-file-title {
    font-size: var(--cd-chat-attachment-file-title-font-size);
    color: var(--cd-chat-attachment-file-title);
    max-width: var(--cd-chat-attachment-file-title-width);
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
  .cd-chat-attachment-file-metadata {
    font-size: var(--cd-chat-attachment-file-metadata-font-size);
    color: var(--cd-chat-attachment-file-metadata-text);
  }
  .cd-chat-attachment-file-type {
    text-transform: uppercase;
  }
</style>
