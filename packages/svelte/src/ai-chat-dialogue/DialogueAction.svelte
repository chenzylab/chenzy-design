<!--
  DialogueAction — 消息操作区（1:1 对齐 Semi widgets/dialogueAction.tsx）。

  本库原来是一排**裸 emoji 按钮**（👍👎🗑✎↻⇪），Semi 是一排复用 Button 的具名图标，
  且删除走 Dropdown「更多」+ 确认 Modal、复制会写剪贴板并弹 Toast。

  逐条对齐 Semi 的显隐规则（render() 里那几个布尔）：
  · showFeedback = 非 user 且 status==='completed'  → 点赞/点踩
  · showReset    = isLastChat 且 role==='assistant' → 重新生成
  · showEdit     = role==='user'                    → 编辑
  · finished     = status 不是 in_progress/incomplete
  · 外层类：-show（showReset&&finished 或 hover）、-hidden（未 finished）

  复用 Button / Dropdown / Modal / Toast —— Semi 也复用这四个。
-->
<script lang="ts">
  import type { AIDialogueMessage } from '@chenzy-design/core';
  import {
    IconCopyStroked,
    IconRedoStroked,
    IconEditStroked,
    IconShareStroked,
    IconThumbUpStroked,
    IconLikeThumb,
    IconMoreStroked,
    IconDeleteStroked,
  } from '@chenzy-design/icons';
  import { Button } from '../button/index.js';
  import { Dropdown } from '../dropdown/index.js';
  import { modal } from '../modal/index.js';
  import { Toast } from '../toast/index.js';
  import { useLocale } from '../locale-provider/index.js';

  interface Props {
    message: AIDialogueMessage;
    /** 是否列表最后一条（决定是否显示「重新生成」，对齐 Semi isLastChat）。 */
    isLastChat?: boolean;
    onMessageCopy?: ((message: AIDialogueMessage) => void) | undefined;
    onMessageDelete?: ((message: AIDialogueMessage) => void) | undefined;
    onMessageReset?: ((message: AIDialogueMessage) => void) | undefined;
    onMessageEdit?: ((message: AIDialogueMessage) => void) | undefined;
    onMessageShare?: ((message: AIDialogueMessage) => void) | undefined;
    onMessageGoodFeedback?: ((message: AIDialogueMessage) => void) | undefined;
    onMessageBadFeedback?: ((message: AIDialogueMessage) => void) | undefined;
  }

  let {
    message,
    isLastChat = false,
    onMessageCopy,
    onMessageDelete,
    onMessageReset,
    onMessageEdit,
    onMessageShare,
    onMessageGoodFeedback,
    onMessageBadFeedback,
  }: Props = $props();

  const loc = useLocale();

  // 显隐规则逐条对齐 Semi render()。
  const status = $derived(message.status ?? 'completed');
  const completed = $derived(status === 'completed');
  const finished = $derived(status !== 'in_progress' && status !== 'incomplete');
  const isUser = $derived(message.role === 'user');
  const showFeedback = $derived(!isUser && completed);
  const showReset = $derived(isLastChat && message.role === 'assistant');
  const showEdit = $derived(isUser);

  let moreVisible = $state(false);

  /**
   * 复制消息正文（对齐 Semi copyToClipboardAndToast）：string 直取，
   * 数组则逐块把 content 拼起来（内层再是数组时取各 part 的 text）。
   */
  function messageText(): string {
    const c = message.content;
    if (typeof c === 'string') return c;
    if (!Array.isArray(c)) return '';
    return c
      .map((item) => {
        const inner = (item as { content?: unknown }).content;
        if (typeof inner === 'string') return inner;
        if (Array.isArray(inner)) {
          return inner.map((p) => (p as { text?: string })?.text ?? '').join('');
        }
        return '';
      })
      .join('');
  }

  async function handleCopy(): Promise<void> {
    try {
      await navigator.clipboard?.writeText(messageText());
    } catch {
      // 剪贴板不可用时静默（同 ChatCode / SideBar 的处理）。
    }
    // 对齐 Semi：复制后弹 Toast。
    Toast.success({ content: loc().t('AIChatDialogue.copySuccess') });
    onMessageCopy?.(message);
  }

  /** 删除前弹确认 Modal（对齐 Semi showDeleteModal）。 */
  function handleDelete(): void {
    moreVisible = false;
    modal.warning({
      title: loc().t('AIChatDialogue.deleteConfirm'),
      content: loc().t('AIChatDialogue.deleteContent'),
      onOk: () => onMessageDelete?.(message),
    });
  }
</script>

<div
  class="cd-ai-chat-dialogue-action"
  class:cd-ai-chat-dialogue-action-show={showReset && finished}
  class:cd-ai-chat-dialogue-action-hidden={!finished}
>
  {#if showEdit}
    <Button
      theme="borderless"
      type="tertiary"
      class="cd-ai-chat-dialogue-action-btn"
      aria-label={loc().t('AIChatDialogue.edit')}
      onclick={() => onMessageEdit?.(message)}
    >
      {#snippet icon()}<IconEditStroked />{/snippet}
    </Button>
  {/if}

  {#if showReset}
    <Button
      theme="borderless"
      type="tertiary"
      class="cd-ai-chat-dialogue-action-btn"
      aria-label={loc().t('AIChatDialogue.reset')}
      onclick={() => onMessageReset?.(message)}
    >
      {#snippet icon()}<IconRedoStroked class="cd-ai-chat-dialogue-action-icon-redo" />{/snippet}
    </Button>
  {/if}

  <Button
    theme="borderless"
    type="tertiary"
    class="cd-ai-chat-dialogue-action-btn"
    aria-label={loc().t('AIChatDialogue.copy')}
    onclick={handleCopy}
  >
    {#snippet icon()}<IconCopyStroked />{/snippet}
  </Button>

  <!-- 分享：对齐 Semi，仅在传了回调时渲染。 -->
  {#if onMessageShare}
    <Button
      theme="borderless"
      type="tertiary"
      class="cd-ai-chat-dialogue-action-btn"
      aria-label={loc().t('AIChatDialogue.share')}
      onclick={() => onMessageShare?.(message)}
    >
      {#snippet icon()}<IconShareStroked />{/snippet}
    </Button>
  {/if}

  {#if showFeedback}
    <!-- 点赞/点踩：已选中用实心 IconLikeThumb，点踩额外挂 -icon-flip 上下翻转（对齐 Semi）。 -->
    <Button
      theme="borderless"
      type="tertiary"
      class="cd-ai-chat-dialogue-action-btn"
      aria-label={loc().t('AIChatDialogue.like')}
      onclick={() => onMessageGoodFeedback?.(message)}
    >
      {#snippet icon()}
        {#if (message as { like?: boolean }).like}<IconLikeThumb />{:else}<IconThumbUpStroked />{/if}
      {/snippet}
    </Button>
    <Button
      theme="borderless"
      type="tertiary"
      class="cd-ai-chat-dialogue-action-btn"
      aria-label={loc().t('AIChatDialogue.dislike')}
      onclick={() => onMessageBadFeedback?.(message)}
    >
      {#snippet icon()}
        {#if (message as { dislike?: boolean }).dislike}
          <IconLikeThumb class="cd-ai-chat-dialogue-action-icon-flip" />
        {:else}
          <IconThumbUpStroked class="cd-ai-chat-dialogue-action-icon-flip" />
        {/if}
      {/snippet}
    </Button>
  {/if}

  <!-- 删除收在「更多」下拉里，点击后弹确认 Modal（对齐 Semi moreNode + showDeleteModal）。
       position：Semi 写 bottomLeft，本库 Placement 用逻辑方位命名，等价值是 bottomStart。 -->
  <Dropdown
    trigger="custom"
    position="bottomStart"
    className="cd-ai-chat-dialogue-action-dropdown"
    visible={moreVisible}
    onVisibleChange={(v) => (moreVisible = v)}
    spacing={12}
  >
    {#snippet render()}
      <Dropdown.Menu>
        <Dropdown.Item onClick={handleDelete}>
          <IconDeleteStroked />
          {loc().t('AIChatDialogue.delete')}
        </Dropdown.Item>
      </Dropdown.Menu>
    {/snippet}
    <Button
      theme="borderless"
      type="tertiary"
      class="cd-ai-chat-dialogue-action-btn"
      aria-label={loc().t('AIChatDialogue.more')}
      onclick={() => (moreVisible = !moreVisible)}
    >
      {#snippet icon()}<IconMoreStroked />{/snippet}
    </Button>
  </Dropdown>
</div>

<style>
  /* 逐条对齐 Semi aiChatDialogue.scss &-action。 */
  .cd-ai-chat-dialogue-action {
    margin-top: var(--cd-ai-chat-dialogue-action-margin-top);
    visibility: hidden;
  }

  .cd-ai-chat-dialogue-action-show {
    visibility: visible;
  }

  /* Semi &-action-btn：24×24。 */
  .cd-ai-chat-dialogue-action :global(.cd-ai-chat-dialogue-action-btn) {
    width: var(--cd-width-ai-chat-dialogue-action-btn);
    height: var(--cd-height-ai-chat-dialogue-action-btn);
  }

  /* Semi &-action-icon-flip：点踩图标上下翻转复用点赞图标。 */
  .cd-ai-chat-dialogue-action :global(.cd-ai-chat-dialogue-action-icon-flip) {
    transform: rotate(180deg);
  }

  /* Semi &-action-dropdown 只有一条：li 用 danger 色（删除是危险操作）。
     浮层 portal 到 body，必须 :global。 */
  :global(.cd-ai-chat-dialogue-action-dropdown li) {
    color: var(--cd-ai-chat-dialogue-action-dropdown-text);
  }
</style>
