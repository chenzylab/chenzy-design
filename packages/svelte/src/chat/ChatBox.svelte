<!--
  ChatBox — 单条 Chat 消息组合器（严格对齐 Semi chat/chatBox/index.tsx）。
  组合子组件：ChatBoxAvatar / ChatBoxTitle / ChatBoxContent / ChatBoxAction（各自对齐 Semi 同名文件）。
  DOM：.cd-chat-chatBox(-right) > avatar + .cd-chat-chatBox-wrap(title / content / action)。
  divider 消息渲染分割线（renderDivider 可覆盖）；renderFullChatBox 整块覆盖（提供拆分节点）。
-->
<script lang="ts">
  import type { Component, Snippet } from 'svelte';
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
  import Divider from '../divider/Divider.svelte';
  import type { ToastHookApi } from '../toast/index.js';
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
    /** 上一条消息（对齐 Semi previousMessage，用于计算 continueSend：连续同角色折叠 title）。 */
    previousMessage?: Message | undefined;
    role?: Metadata | undefined;
    align?: ChatAlign;
    mode?: ChatMode;
    /** 局部 Toast 实例（对齐 Semi chatContent.tsx Toast.useToast() 一路透传）。 */
    toast?: ToastHookApi | undefined;
    lastChat?: boolean;
    markdownRenderProps?: Record<string, unknown> | undefined;
    /** 自定义 markdown 组件覆盖（对齐 Semi customMarkDownComponents）。 */
    customMarkDownComponents?: Record<string, Component<any> | string> | undefined;
    /** 是否转义用户消息中的 HTML 标签（对齐 Semi escapeHtml）。 */
    escapeHtml?: boolean;
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
    previousMessage,
    role,
    align = CHAT_ALIGN.LEFT_RIGHT,
    mode = CHAT_MODE.BUBBLE,
    toast,
    lastChat = false,
    markdownRenderProps,
    customMarkDownComponents,
    escapeHtml = true,
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
  // 连续同角色消息（对齐 Semi continueSend）：title 不重复渲染；
  // avatar 挂 -avatar-hidden class 做 visibility:hidden（对齐 Semi chat.scss:142-144，
  // 保留布局占位、仅视觉隐藏，非 display:none）。
  const continueSend = $derived(message.role === previousMessage?.role);

  const title = $derived(role?.name ?? '');

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
    <Divider class="cd-chat-divider">{loc().t('Chat.clearContext')}</Divider>
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
      {#if !continueSend}{@render titleNode()}{/if}
      {@render contentNode()}
      {@render actionNode()}
    </div>
  </div>
{/if}

{#snippet avatarNode()}
  <ChatBoxAvatar {message} {role} {title} {continueSend} {renderChatBoxAvatar} />
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
    {customMarkDownComponents}
    {escapeHtml}
    {renderChatBoxContent}
  />
{/snippet}
{#snippet actionNode()}
  <ChatBoxAction
    {message}
    {toast}
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

  /* -hidden 态（loading/incomplete 消息）即使 hover 也不显示操作区（对齐 Semi
     `:hover { .action:not(.-hidden) { visible } }`：内容未生成完整时不该出现复制/删除等操作）。 */
  .cd-chat-chatBox:hover :global(.cd-chat-chatBox-action:not(.cd-chat-chatBox-action-hidden)) {
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
  /* 连续同角色消息头像占位不可见（对齐 Semi chat.scss:142-144 &-avatar-hidden）。 */
  .cd-chat-chatBox :global(.cd-chat-chatBox-avatar-hidden) {
    visibility: hidden;
  }

  .cd-chat-chatBox-wrap {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    position: relative;
    row-gap: var(--cd-chat-chatBox-wrap);
    max-width: calc(100% - var(--cd-chat-chatBox-columnGap) - var(--cd-chat-chatBox-avatar-width));
  }

  /* —— divider（对齐 Semi -divider：叠加在 Divider 组件自身布局之上的文字/间距覆盖，
       不再自建 flex 布局——真正的分割线两侧横线由 Divider 组件负责） —— */
  :global(.cd-chat-divider) {
    color: var(--cd-chat-divider);
    font-size: var(--cd-chat-divider-font-size);
    font-weight: var(--cd-chat-divider-font-weight);
    margin-top: var(--cd-chat-divider-marginY);
    margin-bottom: var(--cd-chat-divider-marginY);
  }
</style>
