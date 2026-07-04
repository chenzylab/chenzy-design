<!--
  ChatBox — 单条 Chat 消息（对齐 Semi chat/chatBox）。
  头像 / 标题（角色名）/ 内容（MarkdownRender）/ 操作区（复制/删除/重生成/赞/踩）/ status 样式。
  - divider 消息单独渲染分割线（clearContext 追加），走 renderDivider snippet 可覆盖。
  - 内容：string → MarkdownRender raw；Content[] → 文本片段走 MarkdownRender，图片/文件片段直渲。
  - 操作回调对齐 core（toggleLike/toggleDislike/deleteMessageFrom/resetLastMessage 由父级 Chat 承担 chats 变换）。
  自定义渲染：renderChatBoxAvatar/Title/Content/Action + renderFullChatBox 整块覆盖。
  全 token，类名前缀 cd-。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import {
    CHAT_ROLE,
    CHAT_ALIGN,
    CHAT_MODE,
    MESSAGE_STATUS,
    type Message,
    type Metadata,
    type Content,
    type ChatAlign,
    type ChatMode,
  } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';
  import { MarkdownRender } from '../markdown-render/index.js';
  import type {
    RenderAvatarProps,
    RenderTitleProps,
    RenderContentProps,
    RenderActionProps,
    RenderFullChatBoxProps,
  } from './types.js';

  interface Props {
    /** 当前消息。 */
    message: Message;
    /** 该角色的元数据（名称/头像/色）。 */
    role?: Metadata | undefined;
    /** 布局对齐。 */
    align?: ChatAlign;
    /** 气泡模式。 */
    mode?: ChatMode;
    /** 是否为消息流最后一条（决定 reset 是否可用）。 */
    lastChat?: boolean;
    /** 透传 MarkdownRender props。 */
    markdownRenderProps?: Record<string, unknown> | undefined;
    /** 复制回调。 */
    onMessageCopy?: ((message: Message) => void) | undefined;
    /** 删除回调。 */
    onMessageDelete?: ((message: Message) => void) | undefined;
    /** 重生成回调。 */
    onMessageReset?: ((message: Message) => void) | undefined;
    /** 赞回调。 */
    onMessageGoodFeedback?: ((message: Message) => void) | undefined;
    /** 踩回调。 */
    onMessageBadFeedback?: ((message: Message) => void) | undefined;
    renderChatBoxAvatar?: Snippet<[RenderAvatarProps]> | undefined;
    renderChatBoxTitle?: Snippet<[RenderTitleProps]> | undefined;
    renderChatBoxContent?: Snippet<[RenderContentProps]> | undefined;
    renderChatBoxAction?: Snippet<[RenderActionProps]> | undefined;
    renderFullChatBox?: Snippet<[RenderFullChatBoxProps]> | undefined;
    renderDivider?: Snippet<[Message]> | undefined;
  }

  let {
    message,
    role,
    align = CHAT_ALIGN.LEFT_RIGHT,
    mode = CHAT_MODE.BUBBLE,
    lastChat = false,
    markdownRenderProps,
    onMessageCopy,
    onMessageDelete,
    onMessageReset,
    onMessageGoodFeedback,
    onMessageBadFeedback,
    renderChatBoxAvatar,
    renderChatBoxTitle,
    renderChatBoxContent,
    renderChatBoxAction,
    renderFullChatBox,
    renderDivider,
  }: Props = $props();

  const loc = useLocale();

  const isDivider = $derived(message.role === CHAT_ROLE.DIVIDER);
  const isUser = $derived(message.role === CHAT_ROLE.USER);
  const isLoading = $derived(message.status === MESSAGE_STATUS.LOADING);
  const isError = $derived(message.status === MESSAGE_STATUS.ERROR);

  // 气泡显隐：bubble→全部气泡；noBubble→均无气泡；userBubble→仅 user 气泡。
  const showBubble = $derived(
    mode === CHAT_MODE.BUBBLE || (mode === CHAT_MODE.USER_BUBBLE && isUser),
  );

  const title = $derived(role?.name ?? message.name ?? message.role ?? '');

  // string / Content[] 归一：文本片段拼一段 markdown，附件分流渲染。
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

  async function handleCopy(): Promise<void> {
    try {
      await navigator.clipboard?.writeText(contentText);
    } catch {
      // 剪贴板不可用时静默（如非安全上下文）；仍派发回调交由使用方兜底。
    }
    onMessageCopy?.(message);
  }
</script>

{#if isDivider}
  {#if renderDivider}
    {@render renderDivider(message)}
  {:else}
    <div class="cd-chat-divider" role="separator">
      <span class="cd-chat-divider-text">{loc().t('Chat.clearContext')}</span>
    </div>
  {/if}
{:else if renderFullChatBox}
  {@render renderFullChatBox({
    message,
    role,
    className: 'cd-chat-chatBox',
    defaultNodes: { avatar: avatarNode, title: titleNode, content: contentNode, action: actionNode },
  })}
{:else}
  <div
    class="cd-chat-chatBox"
    class:cd-chat-chatBox--user={isUser}
    class:cd-chat-chatBox--leftAlign={align === CHAT_ALIGN.LEFT_ALIGN}
    class:cd-chat-chatBox--error={isError}
  >
    {@render avatarNode()}
    <div class="cd-chat-chatBox-body">
      {@render titleNode()}
      {@render contentNode()}
      {@render actionNode()}
    </div>
  </div>
{/if}

{#snippet avatarNode()}
  {#if renderChatBoxAvatar}
    {@render renderChatBoxAvatar({ message, role, defaultAvatar })}
  {:else}
    {@render defaultAvatar()}
  {/if}
{/snippet}

{#snippet defaultAvatar()}
  <div
    class="cd-chat-chatBox-avatar"
    style={role?.color ? `background:${role.color};` : undefined}
  >
    {#if typeof role?.avatar === 'string'}
      <img src={role.avatar} alt={title} />
    {:else}
      <span class="cd-chat-chatBox-avatar-fallback" aria-hidden="true">
        {(title || '?').slice(0, 1).toUpperCase()}
      </span>
    {/if}
  </div>
{/snippet}

{#snippet titleNode()}
  {#if renderChatBoxTitle}
    {@render renderChatBoxTitle({ message, role, defaultTitle })}
  {:else}
    {@render defaultTitle()}
  {/if}
{/snippet}

{#snippet defaultTitle()}
  {#if title}
    <div class="cd-chat-chatBox-title">{title}</div>
  {/if}
{/snippet}

{#snippet contentNode()}
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
{/snippet}

{#snippet defaultContent()}
  <div
    class="cd-chat-chatBox-content"
    class:cd-chat-chatBox-content--bubble={showBubble}
  >
    {#if isLoading}
      <span class="cd-chat-chatBox-loading">{loc().t('Chat.loading')}</span>
    {:else if isError}
      <span class="cd-chat-chatBox-error">{loc().t('Chat.error')}</span>
    {:else}
      {#if contentText}
        <MarkdownRender raw={contentText} format="md" {...markdownRenderProps} />
      {/if}
      {#each contentAttachments as att, i (i)}
        {#if att.type === 'image_url'}
          <img
            class="cd-chat-attachment cd-chat-attachment--image"
            src={att.image_url?.url}
            alt=""
          />
        {:else}
          <a
            class="cd-chat-attachment cd-chat-attachment--file"
            href={att.file_url?.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {att.file_url?.name}
          </a>
        {/if}
      {/each}
    {/if}
  </div>
{/snippet}

{#snippet actionNode()}
  {#if renderChatBoxAction}
    {@render renderChatBoxAction({
      message,
      className: 'cd-chat-chatBox-action',
      defaultActions,
      defaultActionsObj: {
        copy: actionCopy,
        like: actionLike,
        dislike: actionDislike,
        reset: actionReset,
        delete: actionDelete,
      },
    })}
  {:else}
    {@render defaultActions()}
  {/if}
{/snippet}

{#snippet defaultActions()}
  <div class="cd-chat-chatBox-action">
    {@render actionCopy()}
    {#if lastChat}
      {@render actionReset()}
    {/if}
    {@render actionLike()}
    {@render actionDislike()}
    {@render actionDelete()}
  </div>
{/snippet}

{#snippet actionCopy()}
  <button
    type="button"
    class="cd-chat-chatBox-action-btn"
    onclick={handleCopy}
    title={loc().t('Chat.copy')}
    aria-label={loc().t('Chat.copy')}
  >
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
      <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" stroke-width="1.6" />
      <path
        d="M5 15V5a2 2 0 0 1 2-2h10"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
      />
    </svg>
  </button>
{/snippet}

{#snippet actionReset()}
  <button
    type="button"
    class="cd-chat-chatBox-action-btn"
    onclick={() => onMessageReset?.(message)}
    title={loc().t('Chat.reset')}
    aria-label={loc().t('Chat.reset')}
  >
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
      <path
        d="M3 12a9 9 0 1 0 3-6.7L3 8m0 0V3m0 5h5"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </button>
{/snippet}

{#snippet actionLike()}
  <button
    type="button"
    class="cd-chat-chatBox-action-btn"
    class:cd-chat-chatBox-action-btn--active={message.like}
    aria-pressed={Boolean(message.like)}
    onclick={() => onMessageGoodFeedback?.(message)}
    title={loc().t('Chat.like')}
    aria-label={loc().t('Chat.like')}
  >
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
      <path
        d="M7 10v10H4V10h3Zm0 0 5-7a2 2 0 0 1 2 2v3h4a2 2 0 0 1 2 2.3l-1 6A2 2 0 0 1 18 20H7"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linejoin="round"
      />
    </svg>
  </button>
{/snippet}

{#snippet actionDislike()}
  <button
    type="button"
    class="cd-chat-chatBox-action-btn"
    class:cd-chat-chatBox-action-btn--active={message.dislike}
    aria-pressed={Boolean(message.dislike)}
    onclick={() => onMessageBadFeedback?.(message)}
    title={loc().t('Chat.dislike')}
    aria-label={loc().t('Chat.dislike')}
  >
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
      <path
        d="M17 14V4h3v10h-3Zm0 0-5 7a2 2 0 0 1-2-2v-3H6a2 2 0 0 1-2-2.3l1-6A2 2 0 0 1 6 4h11"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linejoin="round"
      />
    </svg>
  </button>
{/snippet}

{#snippet actionDelete()}
  <button
    type="button"
    class="cd-chat-chatBox-action-btn"
    onclick={() => onMessageDelete?.(message)}
    title={loc().t('Chat.delete')}
    aria-label={loc().t('Chat.delete')}
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

<style>
  .cd-chat-chatBox {
    display: flex;
    gap: var(--cd-spacing-tight);
    align-items: flex-start;
  }

  .cd-chat-chatBox--user {
    flex-direction: row-reverse;
  }

  .cd-chat-chatBox--user.cd-chat-chatBox--leftAlign {
    flex-direction: row;
  }

  .cd-chat-chatBox-body {
    display: flex;
    flex-direction: column;
    gap: var(--cd-spacing-extra-tight);
    min-width: 0;
    max-width: 100%;
  }

  .cd-chat-chatBox-avatar {
    flex: 0 0 auto;
    width: var(--cd-chat-avatar-size);
    height: var(--cd-chat-avatar-size);
    border-radius: var(--cd-chat-avatar-radius);
    background: var(--cd-chat-avatar-bg);
    overflow: hidden;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--cd-color-text-1);
    font-size: var(--cd-font-size-small);
  }

  .cd-chat-chatBox-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .cd-chat-chatBox-title {
    color: var(--cd-chat-title-color);
    font-size: var(--cd-chat-title-font-size);
  }

  .cd-chat-chatBox-content {
    color: var(--cd-color-text-0);
    line-height: 1.6;
    overflow-wrap: anywhere;
  }

  .cd-chat-chatBox-content--bubble {
    padding: var(--cd-chat-bubble-padding-y) var(--cd-chat-bubble-padding-x);
    border-radius: var(--cd-chat-bubble-radius);
    background: var(--cd-chat-bubble-assistant-bg);
    color: var(--cd-chat-bubble-assistant-color);
  }

  .cd-chat-chatBox--user .cd-chat-chatBox-content--bubble {
    background: var(--cd-chat-bubble-user-bg);
    color: var(--cd-chat-bubble-user-color);
  }

  .cd-chat-chatBox-error {
    color: var(--cd-chat-status-error-color);
  }

  .cd-chat-chatBox-loading {
    color: var(--cd-color-text-2);
  }

  .cd-chat-attachment--image {
    max-width: 240px;
    max-height: 240px;
    border-radius: var(--cd-border-radius-small);
    display: block;
    margin-top: var(--cd-spacing-extra-tight);
  }

  .cd-chat-attachment--file {
    display: inline-block;
    margin-top: var(--cd-spacing-extra-tight);
    color: var(--cd-color-primary);
    text-decoration: none;
  }

  .cd-chat-attachment--file:hover {
    text-decoration: underline;
  }

  .cd-chat-chatBox-action {
    display: flex;
    gap: var(--cd-spacing-extra-tight);
  }

  .cd-chat-chatBox-action-btn {
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

  .cd-chat-chatBox-action-btn:hover {
    color: var(--cd-chat-action-icon-hover);
  }

  .cd-chat-chatBox-action-btn--active {
    color: var(--cd-chat-action-icon-active);
  }

  .cd-chat-chatBox-action-btn:focus-visible {
    outline: 2px solid var(--cd-color-primary);
    outline-offset: 2px;
  }

  .cd-chat-divider {
    display: flex;
    align-items: center;
    text-align: center;
    color: var(--cd-chat-divider-color);
    font-size: var(--cd-font-size-small);
    gap: var(--cd-spacing-tight);
  }

  .cd-chat-divider::before,
  .cd-chat-divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--cd-chat-divider);
  }
</style>
