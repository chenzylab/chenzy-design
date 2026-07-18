<!--
  ChatBoxContent — 消息内容（严格对齐 Semi chat/chatBox/chatBoxContent.tsx）。
  string / Content[] 归一：文本走 MarkdownRender（代码块用 ChatCode 覆盖，深色 topSlot），
  图片/文件附件直渲。loading 三点 flashing 动画；user/error/bubble class 对齐 Semi。
  renderChatBoxContent 可覆盖（提供 defaultContent 供包裹）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { MESSAGE_STATUS, type Message, type Metadata, type Content } from '@chenzy-design/core';
  import { IconBriefStroked } from '@chenzy-design/icons';
  import { MarkdownRender } from '../markdown-render/index.js';
  import ChatCode from './ChatCode.svelte';
  import type { RenderContentProps } from './types.js';

  interface Props {
    message: Message;
    role?: Metadata | undefined;
    isUser: boolean;
    isLoading: boolean;
    isError: boolean;
    showBubble: boolean;
    markdownRenderProps?: Record<string, unknown> | undefined;
    renderChatBoxContent?: Snippet<[RenderContentProps]> | undefined;
  }

  let {
    message,
    role,
    isUser,
    isLoading,
    isError,
    showBubble,
    markdownRenderProps,
    renderChatBoxContent,
  }: Props = $props();

  const contentText = $derived(resolveText(message.content));
  const contentAttachments = $derived(resolveAttachments(message.content));

  function resolveText(content: Message['content']): string {
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) {
      return content
        .filter((c): c is Content => c.type === 'text' && typeof c.text === 'string')
        .map((c) => c.text)
        .join('\n\n');
    }
    return '';
  }

  function resolveAttachments(content: Message['content']): Content[] {
    if (Array.isArray(content)) {
      return content.filter((c) => c.type === 'image_url' || c.type === 'file_url');
    }
    return [];
  }
</script>

{#if renderChatBoxContent}
  {@render renderChatBoxContent({
    message,
    role,
    defaultContent,
    className: 'cd-chat-chatBox-content',
  })}
{:else}
  {@render defaultContent()}
{/if}

{#snippet defaultContent()}
  <!-- user/error 背景仅在气泡态加（对齐 Semi wrapCls：-content-user=(bubble&&isUser)||userBubble、
       -content-error=error&&(bubble||userBubble)）；noBubble 时无背景色。 -->
  <div
    class="cd-chat-chatBox-content"
    class:cd-chat-chatBox-content-bubble={showBubble}
    class:cd-chat-chatBox-content-user={showBubble && isUser}
    class:cd-chat-chatBox-content-error={showBubble && isError}
  >
    {#if isLoading}
      <!-- 三点 flashing 动画（对齐 Semi -content-loading-item） -->
      <div class="cd-chat-chatBox-content-loading">
        <div class="cd-chat-chatBox-content-loading-item"></div>
      </div>
    {:else}
      {#if contentText}
        <!-- 代码块用 chat 专属 ChatCode 覆盖（深色 topSlot + 语言标签 + 复制，对齐 Semi）。 -->
        <MarkdownRender
          raw={contentText}
          format="md"
          components={{ pre: ChatCode }}
          {...markdownRenderProps}
        />
      {/if}
      {#each contentAttachments as att, i (i)}
        {#if att.type === 'image_url'}
          <img class="cd-chat-attachment-img" src={att.image_url?.url} alt="" />
        {:else}
          <a
            class="cd-chat-attachment-file"
            href={att.file_url?.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconBriefStroked class="cd-chat-attachment-file-icon" />
            <div class="cd-chat-attachment-file-info">
              <span class="cd-chat-attachment-file-title">{att.file_url?.name}</span>
            </div>
          </a>
        {/if}
      {/each}
    {/if}
  </div>
{/snippet}

<style>
  /* —— 内容（对齐 Semi -content-bubble/-user/-error） —— */
  .cd-chat-chatBox-content {
    overflow-wrap: anywhere;
  }
  .cd-chat-chatBox-content-bubble {
    padding: var(--cd-chat-chatBox-content-paddingY) var(--cd-chat-chatBox-content-paddingX);
    border-radius: var(--cd-chat-chatBox-content-radius);
    background-color: var(--cd-chat-chatBox-content-bg);
    max-width: 100%;
    box-sizing: border-box;
  }
  .cd-chat-chatBox-content :global(.cd-typography) {
    color: var(--cd-chat-chatBox-content-text);
  }
  .cd-chat-chatBox-content-user {
    background: var(--cd-chat-chatBox-content-user-bg);
    color: var(--cd-chat-chatBox-content-user-text);
  }
  .cd-chat-chatBox-content-user :global(.cd-typography),
  .cd-chat-chatBox-content-user :global(.cd-typography code) {
    color: var(--cd-chat-chatBox-content-user-text);
  }
  .cd-chat-chatBox-content-error {
    background: var(--cd-chat-chatBox-content-error-bg);
  }
  .cd-chat-chatBox-content-error :global(.cd-typography) {
    color: var(--cd-chat-chatBox-content-error-text);
  }

  /* —— loading 三点 flashing 动画（对齐 Semi -content-loading-item + keyframes） —— */
  .cd-chat-chatBox-content-loading {
    display: flex;
    align-items: baseline;
  }
  .cd-chat-chatBox-content-loading-item {
    border-radius: 50%;
    height: var(--cd-chat-chatBox-loading-width);
    width: var(--cd-chat-chatBox-loading-width);
    background-color: var(--cd-chat-chatBox-loading-bg);
    margin: var(--cd-chat-chatBox-loading-item-marginY) var(--cd-chat-chatBox-loading-item-marginX);
    overflow: visible;
    position: relative;
    animation: cd-chat-loading-flashing 0.8s infinite alternate;
    animation-delay: -0.2s;
    animation-timing-function: ease;
  }
  .cd-chat-chatBox-content-loading-item::before,
  .cd-chat-chatBox-content-loading-item::after {
    content: '';
    border-radius: 50%;
    height: var(--cd-chat-chatBox-loading-width);
    width: var(--cd-chat-chatBox-loading-width);
    background-color: var(--cd-chat-chatBox-loading-bg);
    position: absolute;
    top: 0;
    animation: cd-chat-loading-flashing 0.8s infinite alternate;
    animation-timing-function: ease;
  }
  .cd-chat-chatBox-content-loading-item::before {
    left: calc(-1 * var(--cd-chat-chatBox-loading-item-gap));
    animation-delay: -0.4s;
  }
  .cd-chat-chatBox-content-loading-item::after {
    left: var(--cd-chat-chatBox-loading-item-gap);
    animation-delay: 0s;
  }

  @keyframes cd-chat-loading-flashing {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.1;
    }
    100% {
      opacity: 1;
    }
  }

  /* —— 附件（对齐 Semi -attachment-img/-file） —— */
  .cd-chat-attachment-img {
    border-radius: var(--cd-chat-attachment-img-radius);
    vertical-align: top;
    margin-top: var(--cd-chat-chatBox-content-attachment-marginY);
    margin-bottom: var(--cd-chat-chatBox-content-attachment-marginY);
    margin-right: var(--cd-chat-chatBox-content-attachment-marginRight);
    object-fit: cover;
    max-width: 240px;
    max-height: 240px;
  }
  .cd-chat-attachment-file {
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    height: var(--cd-chat-attachment-file-width);
    column-gap: var(--cd-chat-attachment-file-columnGap);
    padding: var(--cd-chat-attachment-file-padding);
    border-radius: var(--cd-chat-attachment-file-radius);
    background: var(--cd-chat-chatBox-other-attachment-file-bg);
    text-decoration: none;
    margin-top: var(--cd-chat-chatBox-content-attachment-marginY);
    margin-bottom: var(--cd-chat-chatBox-content-attachment-marginY);
    margin-right: var(--cd-chat-chatBox-content-attachment-marginRight);
  }
  .cd-chat-chatBox-content-user .cd-chat-attachment-file {
    background: var(--cd-chat-chatBox-user-attachment-file-bg);
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
</style>
