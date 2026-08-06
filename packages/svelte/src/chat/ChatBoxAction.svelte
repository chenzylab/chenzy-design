<!--
  ChatBoxAction — 消息操作区（严格对齐 Semi chat/chatBox/chatBoxAction.tsx）。
  Button(borderless) + 具名图标：copy=IconCopyStroked、reset=IconRedoStroked、delete=IconDeleteStroked、
  like=like?IconLikeThumb:IconThumbUpStroked、dislike=同 like 但 scaleY(-1) 翻转（对齐 Semi -action-icon-flip）。
  renderChatBoxAction 可覆盖（提供 defaultActions + 拆分节点 defaultActionsObj）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { CHAT_ROLE, MESSAGE_STATUS, type Message } from '@chenzy-design/core';
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
  import type { ToastHookApi } from '../toast/index.js';
  import type { RenderActionProps } from './types.js';

  interface Props {
    message: Message;
    /** 局部 Toast 实例（对齐 Semi copyToClipboardAndToast）。 */
    toast?: ToastHookApi | undefined;
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
    toast,
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

  // 对齐 Semi copyToClipboardAndToast：同步发起复制 + 立即弹 toast，不等待写入结果
  // （Semi 用同步的 copy-text-to-clipboard，不 await、不判断成功与否）。此前用
  // `await navigator.clipboard.writeText` 会在剪贴板权限受限/挂起的场景下卡住，
  // 导致 toast 与 onMessageCopy 永远执行不到；不等待可确保用户始终能看到反馈。
  function handleCopy(): void {
    void navigator.clipboard?.writeText(contentText).catch(() => {
      // 剪贴板不可用时静默；toast/onMessageCopy 仍照常触发（对齐 Semi 不判断结果）。
    });
    toast?.success({ content: loc().t('Chat.copySuccess') });
    onMessageCopy?.(message);
  }

  // 删除二次确认（对齐 Semi chatBoxActionFoundation showDeletePopup/hideDeletePopup）：
  // deleteVisible 控制 Popconfirm 显隐；showAction 在确认气泡展开期间强制操作区常驻可见
  // （鼠标为点确认/取消移出 chatBox 时，纯 CSS :hover 会让操作区连带气泡一起消失）。
  // hideDeletePopup 关闭气泡后延迟 150ms 再收起操作区，避免 visible 直接联动致操作区闪动。
  let deleteVisible = $state(false);
  let showAction = $state(false);

  // 最后一条 assistant 消息（有 reset 按钮）在非 loading/incomplete 状态下操作区常驻可见，
  // 无需 hover（对齐 Semi chatBoxAction.tsx：wrapCls 的 `-show` = showReset && finished || showAction，
  // showReset = lastChat && role === assistant；finished = status 不是 loading/incomplete）。
  const showReset = $derived(lastChat && message.role === CHAT_ROLE.ASSISTANT);
  const finished = $derived(
    message.status !== MESSAGE_STATUS.LOADING && message.status !== MESSAGE_STATUS.INCOMPLETE,
  );
  const alwaysShow = $derived((showReset && finished) || showAction);
  // complete 才显示复制；赞踩仅非 user 角色且 complete 才显示；delete 恒显示
  // （对齐 Semi render()：`complete && copyNode`、`showFeedback && like/dislikeNode`，
  // showFeedback = role !== user && complete）。
  const complete = $derived(message.status === MESSAGE_STATUS.COMPLETE || message.status === undefined);
  const showFeedback = $derived(message.role !== CHAT_ROLE.USER && complete);

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
    className: `cd-chat-chatBox-action${alwaysShow ? ' cd-chat-chatBox-action-show' : ''}${!finished ? ' cd-chat-chatBox-action-hidden' : ''}`,
    defaultActions,
    defaultActionsObj: {
      copyNode: complete ? actionCopy : undefined,
      likeNode: showFeedback ? actionLike : undefined,
      dislikeNode: showFeedback ? actionDislike : undefined,
      resetNode: showReset ? actionReset : undefined,
      deleteNode: actionDelete,
    },
  })}
{:else}
  {@render defaultActions()}
{/if}

{#snippet defaultActions()}
  <div
    class="cd-chat-chatBox-action"
    class:cd-chat-chatBox-action-show={alwaysShow}
    class:cd-chat-chatBox-action-hidden={!finished}
  >
    <!-- 节点顺序与显隐条件对齐 Semi render()：complete&&copy / showFeedback&&like,dislike /
         showReset&&reset / delete 恒显示。showFeedback = role!==user && complete。 -->
    {#if complete}{@render actionCopy()}{/if}
    {#if showFeedback}
      {@render actionLike()}
      {@render actionDislike()}
    {/if}
    {#if showReset}
      {@render actionReset()}
    {/if}
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
    class="cd-chat-chatBox-action-btn"
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
    class="cd-chat-chatBox-action-btn"
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
  /* —— 操作区（对齐 Semi -action，默认隐藏 hover 显示） ——
     以下几条核心规则用 :global()：renderChatBoxAction 自定义渲染分支会把 className
     字符串传给消费方组件自己渲染的 DOM 节点（如 10-custom-action.svelte 的
     <span class={className}>），该节点不在本组件模板内，不会被 Svelte 自动打上
     scoped hash class；不加 :global() 这些规则将永远选不中它，-show/-hidden 状态
     在自定义渲染场景下全部失效（曾出现：所有消息操作区无差别常驻显示）。 */
  :global(.cd-chat-chatBox-action) {
    visibility: hidden;
    display: flex;
    align-items: center;
    position: relative;
    column-gap: var(--cd-chat-chatBox-action-columnGap);
    margin-left: var(--cd-chat-chatBox-action-marginX);
    margin-right: var(--cd-chat-chatBox-action-marginX);
  }
  /* 图标色对齐 Semi chat_chatBox_action_icon(-hover)；hover/active 背景不覆盖，
     沿用 Button borderless 自身的面性背景（对齐 Semi：chat_chatBox_action-bg-hover
     虽定义为 transparent，但 Semi 实际视觉背景来自 .semi-button-borderless:hover
     的 fill-0/fill-1，chat 层从未 override 掉它）。 */
  :global(.cd-chat-chatBox-action .cd-chat-chatBox-action-btn) {
    color: var(--cd-chat-chatBox-action-icon);
  }
  :global(.cd-chat-chatBox-action .cd-chat-chatBox-action-btn:hover) {
    color: var(--cd-chat-chatBox-action-icon-hover);
  }
  .cd-chat-chatBox-action-icon-flip {
    display: inline-flex;
    transform: scaleY(-1);
  }
  /* 删除二次确认展开期间强制操作区常驻可见（对齐 Semi -action-show），
     覆盖默认 visibility:hidden，鼠标移出 chatBox 去点确认/取消按钮时操作区不消失。
     最后一条 assistant 消息（finished 态）同样恒 -show（对齐 Semi showReset && finished）。 */
  :global(.cd-chat-chatBox-action.cd-chat-chatBox-action-show) {
    visibility: visible;
  }
  /* -hidden 优先级最高（对齐 Semi `&.-hidden, &:hover.-hidden { hidden }`）：loading/incomplete
     消息即使命中 -show 或 hover 也不显示操作区，覆盖上面两条 visible 规则。 */
  :global(.cd-chat-chatBox-action.cd-chat-chatBox-action-hidden),
  :global(.cd-chat-chatBox-action.cd-chat-chatBox-action-hidden.cd-chat-chatBox-action-show) {
    visibility: hidden;
  }
  .cd-chat-chatBox-action-delete-wrap {
    display: inline-flex;
  }

  /* —— RTL（对齐 Semi chat/rtl.scss）：重做图标水平翻转（箭头指向随书写方向） —— */
  :global(.cd-rtl) :global(.cd-chat-chatBox-action-icon-redo) {
    transform: scaleX(-1);
  }
</style>
