<!--
  ChatBoxAction — 消息操作区（严格对齐 Semi chat/chatBox/chatBoxAction.tsx）。
  Button(borderless) + 具名图标：copy=IconCopyStroked、reset=IconRedoStroked、delete=IconDeleteStroked、
  like=like?IconLikeThumb:IconThumbUpStroked、dislike=同 like 但 scaleY(-1) 翻转（对齐 Semi -action-icon-flip）。
  renderChatBoxAction 可覆盖（提供 defaultActions + 拆分节点 defaultActionsObj）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { Message } from '@chenzy-design/core';
  import {
    IconCopyStroked,
    IconLikeThumb,
    IconThumbUpStroked,
    IconRedoStroked,
    IconDeleteStroked,
  } from '@chenzy-design/icons';
  import { useLocale } from '../locale-provider/index.js';
  import Button from '../button/Button.svelte';
  import type { RenderActionProps } from './types.js';

  interface Props {
    message: Message;
    lastChat: boolean;
    contentText: string;
    onMessageCopy?: ((message: Message) => void) | undefined;
    onMessageDelete?: ((message: Message) => void) | undefined;
    onMessageReset?: ((message: Message) => void) | undefined;
    onMessageGoodFeedback?: ((message: Message) => void) | undefined;
    onMessageBadFeedback?: ((message: Message) => void) | undefined;
    renderChatBoxAction?: Snippet<[RenderActionProps]> | undefined;
  }

  let {
    message,
    lastChat,
    contentText,
    onMessageCopy,
    onMessageDelete,
    onMessageReset,
    onMessageGoodFeedback,
    onMessageBadFeedback,
    renderChatBoxAction,
  }: Props = $props();

  const loc = useLocale();

  async function handleCopy(): Promise<void> {
    try {
      await navigator.clipboard?.writeText(contentText);
    } catch {
      // 剪贴板不可用时静默；仍派发回调交由使用方兜底。
    }
    onMessageCopy?.(message);
  }
</script>

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
</style>
