<!--
  ChatBox — 单条 Chat 消息（严格对齐 Semi chat/chatBox）。
  DOM 对齐 Semi：.cd-chat-chatBox(-right) > Avatar(.cd-chat-chatBox-avatar) + .cd-chat-chatBox-wrap
    (.cd-chat-chatBox-title / .cd-chat-chatBox-content(-user/-error/-loading/-bubble) / .cd-chat-chatBox-action)。
  头像用本库 Avatar 组件；操作按钮用本库 Button(borderless) + 具名图标（对齐 Semi，非手写 svg）：
    copy=IconCopyStroked、like=like?IconLikeThumb:IconThumbUpStroked、
    dislike=dislike?IconLikeThumb(flip):IconThumbUpStroked(flip)、reset=IconRedoStroked、delete=IconDeleteStroked。
  loading 三点 flashing 动画（对齐 Semi -content-loading-item）。内容走 MarkdownRender（代码块→CodeHighlight）。
  divider 消息渲染分割线（走 renderDivider 可覆盖）；自定义渲染 snippet 全保留。
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
  import {
    IconCopyStroked,
    IconLikeThumb,
    IconThumbUpStroked,
    IconRedoStroked,
    IconDeleteStroked,
    IconBriefStroked,
  } from '@chenzy-design/icons';
  import { useLocale } from '../locale-provider/index.js';
  import { MarkdownRender } from '../markdown-render/index.js';
  import Avatar from '../avatar/Avatar.svelte';
  import Button from '../button/Button.svelte';
  import type {
    RenderAvatarProps,
    RenderTitleProps,
    RenderContentProps,
    RenderActionProps,
    RenderFullChatBoxProps,
  } from './types.js';

  interface Props {
    message: Message;
    role?: Metadata | undefined;
    align?: ChatAlign;
    mode?: ChatMode;
    lastChat?: boolean;
    markdownRenderProps?: Record<string, unknown> | undefined;
    onMessageCopy?: ((message: Message) => void) | undefined;
    onMessageDelete?: ((message: Message) => void) | undefined;
    onMessageReset?: ((message: Message) => void) | undefined;
    onMessageGoodFeedback?: ((message: Message) => void) | undefined;
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

  // 气泡显隐：bubble→全部；noBubble→无；userBubble→仅 user。
  const showBubble = $derived(
    mode === CHAT_MODE.BUBBLE || (mode === CHAT_MODE.USER_BUBBLE && isUser),
  );
  // 右侧布局：user + leftRight（对齐 Semi chatBox-right）。
  const isRight = $derived(isUser && align === CHAT_ALIGN.LEFT_RIGHT);

  const title = $derived(role?.name ?? message.name ?? message.role ?? '');

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
      // 剪贴板不可用时静默；仍派发回调交由使用方兜底。
    }
    onMessageCopy?.(message);
  }
</script>

{#if isDivider}
  {#if renderDivider}
    {@render renderDivider(message)}
  {:else}
    <div class="cd-chat-divider" role="separator">
      {loc().t('Chat.clearContext')}
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
  <div class="cd-chat-chatBox" class:cd-chat-chatBox-right={isRight}>
    {@render avatarNode()}
    <div class="cd-chat-chatBox-wrap">
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
  {@const avatarSrc = typeof role?.avatar === 'string' ? role.avatar : ''}
  {@const avatarStyle =
    role?.color && typeof role.avatar !== 'string' ? `background:${role.color};` : ''}
  <Avatar class="cd-chat-chatBox-avatar" size="extra-small" src={avatarSrc} alt={title} style={avatarStyle}>
    {(title || '?').slice(0, 1).toUpperCase()}
  </Avatar>
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
    class:cd-chat-chatBox-content-bubble={showBubble}
    class:cd-chat-chatBox-content-user={isUser}
    class:cd-chat-chatBox-content-error={isError}
  >
    {#if isLoading}
      <!-- 三点 flashing 动画（对齐 Semi -content-loading-item） -->
      <div class="cd-chat-chatBox-content-loading">
        <div class="cd-chat-chatBox-content-loading-item"></div>
      </div>
    {:else}
      {#if contentText}
        <MarkdownRender raw={contentText} format="md" {...markdownRenderProps} />
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
  <Button
    class="cd-chat-chatBox-action-btn"
    theme="borderless"
    type="tertiary"
    size="small"
    onclick={handleCopy}
    ariaLabel={loc().t('Chat.copy')}
    title={loc().t('Chat.copy')}
    icon={copyIcon}
  />
{/snippet}
{#snippet copyIcon()}<IconCopyStroked />{/snippet}

{#snippet actionReset()}
  <Button
    class="cd-chat-chatBox-action-btn"
    theme="borderless"
    type="tertiary"
    size="small"
    onclick={() => onMessageReset?.(message)}
    ariaLabel={loc().t('Chat.reset')}
    title={loc().t('Chat.reset')}
    icon={resetIcon}
  />
{/snippet}
{#snippet resetIcon()}<IconRedoStroked />{/snippet}

{#snippet actionLike()}
  <Button
    class={`cd-chat-chatBox-action-btn${message.like ? ' cd-chat-chatBox-action-btn-active' : ''}`}
    theme="borderless"
    type="tertiary"
    size="small"
    aria-pressed={Boolean(message.like)}
    onclick={() => onMessageGoodFeedback?.(message)}
    ariaLabel={loc().t('Chat.like')}
    title={loc().t('Chat.like')}
    icon={likeIcon}
  />
{/snippet}
{#snippet likeIcon()}
  {#if message.like}<IconLikeThumb />{:else}<IconThumbUpStroked />{/if}
{/snippet}

{#snippet actionDislike()}
  <Button
    class={`cd-chat-chatBox-action-btn${message.dislike ? ' cd-chat-chatBox-action-btn-active' : ''}`}
    theme="borderless"
    type="tertiary"
    size="small"
    aria-pressed={Boolean(message.dislike)}
    onclick={() => onMessageBadFeedback?.(message)}
    ariaLabel={loc().t('Chat.dislike')}
    title={loc().t('Chat.dislike')}
    icon={dislikeIcon}
  />
{/snippet}
{#snippet dislikeIcon()}
  <!-- 点踩 = 点赞图标 scaleY(-1) 翻转（对齐 Semi -action-icon-flip） -->
  <span class="cd-chat-chatBox-action-icon-flip">
    {#if message.dislike}<IconLikeThumb />{:else}<IconThumbUpStroked />{/if}
  </span>
{/snippet}

{#snippet actionDelete()}
  <Button
    class="cd-chat-chatBox-action-btn"
    theme="borderless"
    type="tertiary"
    size="small"
    onclick={() => onMessageDelete?.(message)}
    ariaLabel={loc().t('Chat.delete')}
    title={loc().t('Chat.delete')}
    icon={deleteIcon}
  />
{/snippet}
{#snippet deleteIcon()}<IconDeleteStroked />{/snippet}

<style>
  /* —— chatBox 容器（对齐 Semi .semi-chat-chatBox） —— */
  .cd-chat-chatBox {
    display: flex;
    flex-direction: row;
    margin-top: var(--cd-chat-chatBox-marginY);
    margin-bottom: var(--cd-chat-chatBox-marginY);
    column-gap: var(--cd-chat-chatBox-columnGap);
  }

  .cd-chat-chatBox:hover :global(.cd-chat-chatBox-action) {
    visibility: visible;
  }

  .cd-chat-chatBox-right {
    flex-direction: row-reverse;
  }
  .cd-chat-chatBox-right .cd-chat-chatBox-wrap {
    align-items: flex-end;
  }

  .cd-chat-chatBox :global(.cd-chat-chatBox-avatar) {
    flex-shrink: 0;
  }

  .cd-chat-chatBox-title {
    line-height: var(--cd-chat-chatBox-title-line-height);
    font-size: var(--cd-chat-chatBox-title-font-size);
    color: var(--cd-chat-chatBox-title);
    font-weight: var(--cd-chat-chatBox-title-font-weight);
    text-overflow: ellipsis;
  }

  .cd-chat-chatBox-wrap {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    position: relative;
    row-gap: var(--cd-chat-chatBox-wrap);
    max-width: calc(100% - var(--cd-chat-chatBox-columnGap) - var(--cd-chat-chatBox-avatar-width));
  }

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

  /* —— 操作区（对齐 Semi -action，默认隐藏 hover 显示） —— */
  .cd-chat-chatBox-action {
    visibility: hidden;
    display: flex;
    align-items: center;
    position: relative;
    column-gap: var(--cd-chat-chatBox-action-columnGap);
    margin-left: var(--cd-chat-chatBox-action-marginX);
    margin-right: var(--cd-chat-chatBox-action-marginX);
  }
  .cd-chat-chatBox-action :global(.cd-chat-chatBox-action-btn) {
    color: var(--cd-chat-chatBox-action-icon);
  }
  .cd-chat-chatBox-action :global(.cd-chat-chatBox-action-btn:hover) {
    color: var(--cd-chat-chatBox-action-icon-hover);
    background-color: var(--cd-chat-chatBox-action-bg-hover);
  }
  .cd-chat-chatBox-action :global(.cd-chat-chatBox-action-btn-active) {
    color: var(--cd-color-primary);
  }
  .cd-chat-chatBox-action-icon-flip {
    display: inline-flex;
    transform: scaleY(-1);
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

  /* —— divider（对齐 Semi -divider） —— */
  .cd-chat-divider {
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: var(--cd-chat-divider);
    font-size: var(--cd-chat-divider-font-size);
    font-weight: var(--cd-chat-divider-font-weight);
    margin-top: var(--cd-chat-divider-marginY);
    margin-bottom: var(--cd-chat-divider-marginY);
  }
</style>
