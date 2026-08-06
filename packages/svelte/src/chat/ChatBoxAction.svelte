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
  import Popconfirm from '../popconfirm/Popconfirm.svelte';
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

  // 删除二次确认（对齐 Semi chatBoxActionFoundation showDeletePopup/hideDeletePopup）：
  // deleteVisible 控制 Popconfirm 显隐；showAction 在确认气泡展开期间强制操作区常驻可见
  // （鼠标为点确认/取消移出 chatBox 时，纯 CSS :hover 会让操作区连带气泡一起消失）。
  // hideDeletePopup 关闭气泡后延迟 150ms 再收起操作区，避免 visible 直接联动致操作区闪动。
  let deleteVisible = $state(false);
  let showAction = $state(false);

  function showDeletePopup(): void {
    deleteVisible = true;
    showAction = true;
  }

  function hideDeletePopup(): void {
    deleteVisible = false;
    setTimeout(() => {
      showAction = false;
    }, 150);
  }

  function confirmDelete(): void {
    onMessageDelete?.(message);
    hideDeletePopup();
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
  <div class="cd-chat-chatBox-action" class:cd-chat-chatBox-action-show={showAction}>
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
    aria-label={loc().t('Chat.copy')}
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
    aria-label={loc().t('Chat.reset')}
    title={loc().t('Chat.reset')}
    icon={resetIcon}
  />
{/snippet}
<!-- 类名对齐 Semi `-chatBox-action-icon-redo`：RTL 下该图标要水平翻转，
     需要一个可选中的钩子（Semi 亦然）。 -->
{#snippet resetIcon()}<IconRedoStroked class="cd-chat-chatBox-action-icon-redo" />{/snippet}

{#snippet actionLike()}
  <Button
    class={`cd-chat-chatBox-action-btn${message.like ? ' cd-chat-chatBox-action-btn-active' : ''}`}
    theme="borderless"
    type="tertiary"
    size="small"
    aria-pressed={Boolean(message.like)}
    onclick={() => onMessageGoodFeedback?.(message)}
    aria-label={loc().t('Chat.like')}
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
    aria-label={loc().t('Chat.dislike')}
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
  <Popconfirm
    trigger="custom"
    visible={deleteVisible}
    title={loc().t('Chat.deleteConfirm')}
    position="top"
    onConfirm={confirmDelete}
    onCancel={hideDeletePopup}
  >
    <span class="cd-chat-chatBox-action-delete-wrap">
      <Button
        class="cd-chat-chatBox-action-btn"
        theme="borderless"
        type="tertiary"
        size="small"
        onclick={showDeletePopup}
        aria-label={loc().t('Chat.delete')}
        title={loc().t('Chat.delete')}
        icon={deleteIcon}
      />
    </span>
  </Popconfirm>
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
  /* 删除二次确认展开期间强制操作区常驻可见（对齐 Semi -action-show），
     覆盖默认 visibility:hidden，鼠标移出 chatBox 去点确认/取消按钮时操作区不消失。 */
  .cd-chat-chatBox-action.cd-chat-chatBox-action-show {
    visibility: visible;
  }
  .cd-chat-chatBox-action-delete-wrap {
    display: inline-flex;
  }

  /* —— RTL（对齐 Semi chat/rtl.scss）：重做图标水平翻转（箭头指向随书写方向） —— */
  :global(.cd-rtl) :global(.cd-chat-chatBox-action-icon-redo) {
    transform: scaleX(-1);
  }
</style>
