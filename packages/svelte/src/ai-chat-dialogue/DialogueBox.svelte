<!--
  DialogueBox — AIChatDialogue 单条消息（对齐 Semi aiChatDialogue 会话框）。
  头像 / 标题 / 内容（ContentItem 分块，走 ContentItemRenderer）/ 操作区 / status。
  content 归一：string → 单文本块；ContentItem[] → 逐块渲染。
  选择模式下前置 checkbox。全 token，类名前缀 cd-。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import {
    normalizeDialogueContent,
    dialogueMessageToInput,
    type AIDialogueMessage,
    type AIDialogueMetadata,
    type ContentItem,
    type AIChatInputMessageContent,
  } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';
  import ContentItemRenderer from './ContentItemRenderer.svelte';

  interface Props {
    message: AIDialogueMessage;
    /** 解析后的角色元数据（名称/头像/色）。 */
    role?: AIDialogueMetadata | undefined;
    /** 布局。 */
    align?: 'leftRight' | 'leftAlign';
    /** 气泡模式。 */
    mode?: 'bubble' | 'noBubble' | 'userBubble';
    /** 选择模式。 */
    selecting?: boolean;
    /** 当前是否被选中。 */
    selected?: boolean;
    /** 透传 MarkdownRender props。 */
    markdownRenderProps?: Record<string, unknown> | undefined;
    /** ContentItem 按类型覆盖渲染。 */
    renderMap?: Record<string, Snippet<[ContentItem]>> | undefined;
    /** 展示重置操作。 */
    showReset?: boolean;
    onSelectToggle?: ((message: AIDialogueMessage) => void) | undefined;
    onMessageCopy?: ((message: AIDialogueMessage) => void) | undefined;
    onMessageDelete?: ((message: AIDialogueMessage) => void) | undefined;
    onMessageReset?: ((message: AIDialogueMessage) => void) | undefined;
    onMessageGoodFeedback?: ((message: AIDialogueMessage) => void) | undefined;
    onMessageBadFeedback?: ((message: AIDialogueMessage) => void) | undefined;
    onFileClick?: ((file: unknown) => void) | undefined;
    onImageClick?: ((image: unknown) => void) | undefined;
    /**
     * 消息编辑渲染（对齐 Semi messageEditRender）：message.editing=true 且 user 消息时，
     * 用它替代正常内容渲染。参数为该消息转成的 MessageContent（messageToChatInput），
     * 消费方通常在里面放 AIChatInput 编辑器。
     */
    messageEditRender?: Snippet<[AIChatInputMessageContent]> | undefined;
    /** 点击编辑操作回调（对齐 Semi onMessageEdit）。 */
    onMessageEdit?: ((message: AIDialogueMessage) => void) | undefined;
    /** 是否展示编辑操作（默认 true；仅 user 消息显示编辑按钮）。 */
    editable?: boolean;
  }

  let {
    message,
    role,
    align = 'leftRight',
    mode = 'bubble',
    selecting = false,
    selected = false,
    markdownRenderProps,
    renderMap,
    showReset = true,
    onSelectToggle,
    onMessageCopy,
    onMessageDelete,
    onMessageReset,
    onMessageGoodFeedback,
    onMessageBadFeedback,
    onFileClick,
    onImageClick,
    messageEditRender,
    onMessageEdit,
    editable = true,
  }: Props = $props();

  const loc = useLocale();

  const isUser = $derived(message.role === 'user');
  // 编辑态：message.editing 受控 + 仅 user 消息 + 提供了 messageEditRender（对齐 Semi）。
  const isEditing = $derived(!!message.editing && message.role === 'user' && !!messageEditRender);
  // 编辑态载荷：把 dialogue 消息抽取成 MessageContent（inputContents 文本段），喂给编辑器载入。
  const editPayload = $derived<AIChatInputMessageContent>(
    isEditing ? dialogueMessageToInput(message) : { inputContents: [] },
  );
  const isLoading = $derived(
    message.status === 'in_progress' || message.status === 'queued',
  );
  const isError = $derived(message.status === 'failed' || message.status === 'cancelled');
  const showBubble = $derived(mode === 'bubble' || (mode === 'userBubble' && isUser));
  const title = $derived(role?.name ?? message.name ?? message.role ?? '');
  const items = $derived(normalizeDialogueContent(message.content));

  // 头像：有 avatar 用图，否则色块 + 首字。
  const avatarInitial = $derived(title.slice(0, 1).toUpperCase());

  async function handleCopy(): Promise<void> {
    try {
      const text = items
        .flatMap((it) => {
          const inner = (it as { content?: { text?: string }[] }).content;
          return Array.isArray(inner) ? inner.map((p) => p.text ?? '') : [];
        })
        .join('\n\n');
      await navigator.clipboard?.writeText(text);
    } catch {
      // 剪贴板不可用静默。
    }
    onMessageCopy?.(message);
  }
</script>

<div
  class="cd-ai-dialogue-box"
  class:cd-ai-dialogue-box--user={isUser}
  class:cd-ai-dialogue-box--leftAlign={align === 'leftAlign'}
  class:cd-ai-dialogue-box--error={isError}
  class:cd-ai-dialogue-box--bubble={showBubble}
>
  {#if selecting}
    <input
      type="checkbox"
      class="cd-ai-dialogue-box-select"
      checked={selected}
      aria-label={loc().t('AIChatDialogue.selectMessage')}
      onchange={() => onSelectToggle?.(message)}
    />
  {/if}

  <!-- 头像 -->
  {#if role?.avatar}
    <img class="cd-ai-dialogue-box-avatar" src={role.avatar} alt="" />
  {:else}
    <div
      class="cd-ai-dialogue-box-avatar cd-ai-dialogue-box-avatar--text"
      style={role?.color ? `background:${role.color}` : undefined}
      aria-hidden="true"
    >
      {avatarInitial}
    </div>
  {/if}

  <div class="cd-ai-dialogue-box-body">
    {#if title}
      <div class="cd-ai-dialogue-box-title">{title}</div>
    {/if}

    <div class="cd-ai-dialogue-box-content" aria-busy={isLoading}>
      {#if isEditing && messageEditRender}
        <!-- 编辑态：用 messageEditRender 替代内容（对齐 Semi），消费方通常放 AIChatInput 编辑器。 -->
        {@render messageEditRender(editPayload)}
      {:else if isLoading && items.length === 0}
        <span class="cd-ai-dialogue-box-loading">{loc().t('AIChatDialogue.loading')}</span>
      {:else if isError}
        <span class="cd-ai-dialogue-box-error">{loc().t('AIChatDialogue.error')}</span>
      {:else}
        {#each items as item, i (i)}
          <ContentItemRenderer {item} {markdownRenderProps} {renderMap} {onFileClick} {onImageClick} />
        {/each}
      {/if}
    </div>

    {#if !isLoading && !selecting && !isEditing}
      <div class="cd-ai-dialogue-box-actions">
        <button type="button" onclick={handleCopy} aria-label={loc().t('AIChatDialogue.copy')} title={loc().t('AIChatDialogue.copy')}>⧉</button>
        {#if editable && isUser && onMessageEdit}
          <button type="button" onclick={() => onMessageEdit?.(message)} aria-label={loc().t('AIChatDialogue.edit')} title={loc().t('AIChatDialogue.edit')}>✎</button>
        {/if}
        {#if showReset}
          <button type="button" onclick={() => onMessageReset?.(message)} aria-label={loc().t('AIChatDialogue.reset')} title={loc().t('AIChatDialogue.reset')}>↻</button>
        {/if}
        <button type="button" onclick={() => onMessageGoodFeedback?.(message)} aria-label={loc().t('AIChatDialogue.like')} title={loc().t('AIChatDialogue.like')}>👍</button>
        <button type="button" onclick={() => onMessageBadFeedback?.(message)} aria-label={loc().t('AIChatDialogue.dislike')} title={loc().t('AIChatDialogue.dislike')}>👎</button>
        <button type="button" onclick={() => onMessageDelete?.(message)} aria-label={loc().t('AIChatDialogue.delete')} title={loc().t('AIChatDialogue.delete')}>🗑</button>
      </div>
    {/if}
  </div>
</div>

<style>
  .cd-ai-dialogue-box {
    display: flex;
    gap: var(--cd-spacing-tight);
    padding: var(--cd-spacing-tight);
    align-items: flex-start;
  }

  .cd-ai-dialogue-box--user {
    flex-direction: row-reverse;
  }

  .cd-ai-dialogue-box--leftAlign,
  .cd-ai-dialogue-box--leftAlign.cd-ai-dialogue-box--user {
    flex-direction: row;
  }

  .cd-ai-dialogue-box-avatar {
    width: var(--cd-chat-avatar-size, 32px);
    height: var(--cd-chat-avatar-size, 32px);
    border-radius: var(--cd-chat-avatar-radius, 50%);
    flex-shrink: 0;
    object-fit: cover;
  }

  .cd-ai-dialogue-box-avatar--text {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--cd-chat-avatar-bg, var(--cd-color-fill-1));
    color: var(--cd-color-text-0);
    font-size: var(--cd-font-size-regular);
  }

  .cd-ai-dialogue-box-body {
    min-width: 0;
    flex: 1 1 auto;
  }

  .cd-ai-dialogue-box-title {
    color: var(--cd-color-text-2);
    font-size: var(--cd-font-size-secondary, var(--cd-font-size-regular));
    margin-bottom: var(--cd-spacing-extra-tight);
  }

  .cd-ai-dialogue-box--bubble .cd-ai-dialogue-box-content {
    padding: var(--cd-spacing-tight);
    border-radius: var(--cd-border-radius-large, var(--cd-border-radius-medium));
    background: var(--cd-chat-bubble-assistant-bg, var(--cd-color-fill-0));
  }

  .cd-ai-dialogue-box--bubble.cd-ai-dialogue-box--user .cd-ai-dialogue-box-content {
    background: var(--cd-chat-bubble-user-bg, var(--cd-color-primary-light-default));
  }

  .cd-ai-dialogue-box-error {
    color: var(--cd-color-danger);
  }

  .cd-ai-dialogue-box-loading {
    color: var(--cd-color-text-2);
  }

  .cd-ai-dialogue-box-actions {
    display: flex;
    gap: var(--cd-spacing-extra-tight);
    margin-top: var(--cd-spacing-extra-tight);
  }

  .cd-ai-dialogue-box-actions button {
    appearance: none;
    border: none;
    background: none;
    cursor: pointer;
    padding: var(--cd-spacing-extra-tight);
    border-radius: var(--cd-border-radius-small);
    color: var(--cd-chat-action-icon, var(--cd-color-text-2));
    font-size: var(--cd-font-size-regular);
  }

  .cd-ai-dialogue-box-actions button:hover {
    color: var(--cd-chat-action-icon-hover, var(--cd-color-text-0));
  }
</style>
