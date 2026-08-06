<!--
  ChatBoxContent — 消息内容（严格对齐 Semi chat/chatBox/chatBoxContent.tsx）。
  string / Content[] 归一：文本走 MarkdownRender（代码块用 ChatCode 覆盖，深色 topSlot），
  图片/文件附件直渲。loading 三点 flashing 动画；user/error/bubble class 对齐 Semi。
  renderChatBoxContent 可覆盖（提供 defaultContent 供包裹）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import {
    MESSAGE_STATUS,
    escapeHtmlInMarkdown,
    type Message,
    type Metadata,
    type Content,
  } from '@chenzy-design/core';
  import { MarkdownRender } from '../markdown-render/index.js';
  import ChatCode from './ChatCode.svelte';
  import FileAttachment from './FileAttachment.svelte';
  import ImageAttachment from './ImageAttachment.svelte';
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
    /** 是否转义用户消息中的 HTML 标签（对齐 Semi escapeHtml，仅作用于 user 角色）。 */
    escapeHtml?: boolean;
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
    escapeHtml = true,
  }: Props = $props();

  // 对齐 Semi chatBoxContent：仅 user 角色的消息做转义，助手输出的 markdown 原样渲染。
  const shouldEscapeHtml = $derived(escapeHtml && isUser);
  const contentText = $derived(
    shouldEscapeHtml ? escapeHtmlInMarkdown(resolveText(message.content)) : resolveText(message.content),
  );
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
          <ImageAttachment src={att.image_url?.url ?? ''} />
        {:else}
          <FileAttachment
            url={att.file_url?.url}
            name={att.file_url?.name}
            size={att.file_url?.size}
            type={att.file_url?.name?.split('.').pop() ?? att.file_url?.type?.split('/').pop()}
          />
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

  /* —— 附件（对齐 Semi chatBoxContent 场景覆盖：marginY/marginRight + 非默认背景色） ——
       基础结构/圆角/内边距/文字色由 FileAttachment/ImageAttachment 组件自身承担，
       此处仅覆盖消息正文场景专属的外边距与背景色（Semi chat.scss:239-250）。 */
  .cd-chat-chatBox-content :global(.cd-chat-attachment-img),
  .cd-chat-chatBox-content :global(.cd-chat-attachment-file) {
    margin-top: var(--cd-chat-chatBox-content-attachment-marginY);
    margin-bottom: var(--cd-chat-chatBox-content-attachment-marginY);
    margin-right: var(--cd-chat-chatBox-content-attachment-marginRight);
  }
  .cd-chat-chatBox-content :global(.cd-chat-attachment-file) {
    background: var(--cd-chat-chatBox-other-attachment-file-bg);
  }
  .cd-chat-chatBox-content-user :global(.cd-chat-attachment-file) {
    background: var(--cd-chat-chatBox-user-attachment-file-bg);
  }
</style>
