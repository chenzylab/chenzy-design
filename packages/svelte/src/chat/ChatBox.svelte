<!--
  ChatBox — 单条 Chat 消息组合器（严格对齐 Semi chat/chatBox/index.tsx）。
  组合子组件：ChatBoxAvatar / ChatBoxTitle / ChatBoxContent / ChatBoxAction（各自对齐 Semi 同名文件）。
  DOM：.cd-chat-chatBox(-right) > avatar + .cd-chat-chatBox-wrap(title / content / action)。
  divider 消息渲染分割线（renderDivider 可覆盖）；renderFullChatBox 整块覆盖（提供拆分节点）。
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
  import ChatBoxAvatar from './ChatBoxAvatar.svelte';
  import ChatBoxTitle from './ChatBoxTitle.svelte';
  import ChatBoxContent from './ChatBoxContent.svelte';
  import ChatBoxAction from './ChatBoxAction.svelte';
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

  // 供 action 复制用的纯文本（与 content 内部归一一致）。
  const contentText = $derived.by(() => {
    const content = message.content;
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) {
      return content
        .filter((c): c is Content => c.type === 'text' && typeof c.text === 'string')
        .map((c) => c.text)
        .join('\n\n');
    }
    return '';
  });
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
  <ChatBoxAvatar {message} {role} {title} {renderChatBoxAvatar} />
{/snippet}
{#snippet titleNode()}
  <ChatBoxTitle {message} {role} {title} {renderChatBoxTitle} />
{/snippet}
{#snippet contentNode()}
  <ChatBoxContent
    {message}
    {role}
    {isUser}
    {isLoading}
    {isError}
    {showBubble}
    {markdownRenderProps}
    {renderChatBoxContent}
  />
{/snippet}
{#snippet actionNode()}
  <ChatBoxAction
    {message}
    {lastChat}
    {contentText}
    {onMessageCopy}
    {onMessageDelete}
    {onMessageReset}
    {onMessageGoodFeedback}
    {onMessageBadFeedback}
    {renderChatBoxAction}
  />
{/snippet}

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

  .cd-chat-chatBox-wrap {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    position: relative;
    row-gap: var(--cd-chat-chatBox-wrap);
    max-width: calc(100% - var(--cd-chat-chatBox-columnGap) - var(--cd-chat-chatBox-avatar-width));
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
