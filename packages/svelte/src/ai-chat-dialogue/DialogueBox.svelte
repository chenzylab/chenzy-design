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
    type AIDialogueReference,
    type ContentItem,
    type AIChatInputMessageContent,
  } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';
  import ContentItemRenderer from './ContentItemRenderer.svelte';
  import type { DialogueRenderConfig } from './render-config.js';

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
    /** 是否展示引用区（对齐 Semi showReference；仅 user 消息生效）。 */
    showReference?: boolean;
    /** 引用项点击回调（对齐 Semi onReferenceClick）。 */
    onReferenceClick?: ((item: AIDialogueReference) => void) | undefined;
    /** 自定义各区块渲染（对齐 Semi dialogueRenderConfig）。 */
    dialogueRenderConfig?: DialogueRenderConfig | undefined;
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
    showReference = false,
    onReferenceClick,
    dialogueRenderConfig,
  }: Props = $props();

  const loc = useLocale();

  const isUser = $derived(message.role === 'user');
  // 引用区：仅 user 消息 + showReference + 有 references 时展示（对齐 Semi）。
  const references = $derived<AIDialogueReference[]>(
    (showReference && isUser && Array.isArray(message.references) ? message.references : []),
  );
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

<!-- 默认头像节点。 -->
{#snippet defaultAvatar()}
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
{/snippet}

<!-- 默认标题节点。 -->
{#snippet defaultTitle()}
  {#if title}
    <div class="cd-ai-dialogue-box-title">{title}</div>
  {/if}
{/snippet}

<!-- 默认内容节点（含编辑态 / loading / error / 内容块 + 引用区）。 -->
{#snippet defaultContent()}
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

  {#if references.length > 0}
    <ul class="cd-ai-dialogue-box-references" aria-label={loc().t('AIChatDialogue.references')}>
      {#each references as ref, i (ref.id ?? i)}
        <li>
          <button
            type="button"
            class="cd-ai-dialogue-box-reference"
            class:cd-ai-dialogue-box-reference--text={!!ref.content && !ref.name}
            title={ref.name ?? ref.content ?? ''}
            onclick={() => onReferenceClick?.(ref)}
          >
            {#if ref.name}
              <span class="cd-ai-dialogue-box-reference-icon" aria-hidden="true">◈</span>
              <span class="cd-ai-dialogue-box-reference-name">{ref.name}</span>
            {:else}
              <span class="cd-ai-dialogue-box-reference-text">{ref.content}</span>
            {/if}
          </button>
        </li>
      {/each}
    </ul>
  {/if}
{/snippet}

<!-- 默认操作栏节点。 -->
{#snippet defaultAction()}
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
{/snippet}

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

  {#if dialogueRenderConfig?.renderFullDialogue}
    <!-- 整块自定义渲染（优先级最高，对齐 Semi renderFullDialogue）。 -->
    {@render dialogueRenderConfig.renderFullDialogue({
      message,
      role,
      defaultNodes: { avatar: defaultAvatar, title: defaultTitle, content: defaultContent, action: defaultAction },
    })}
  {:else}
    <!-- 头像 -->
    {#if dialogueRenderConfig?.renderDialogueAvatar}
      {@render dialogueRenderConfig.renderDialogueAvatar({ message, role, defaultAvatar })}
    {:else}
      {@render defaultAvatar()}
    {/if}

    <div class="cd-ai-dialogue-box-body">
      {#if dialogueRenderConfig?.renderDialogueTitle}
        {@render dialogueRenderConfig.renderDialogueTitle({ message, role, defaultTitle })}
      {:else}
        {@render defaultTitle()}
      {/if}

      {#if dialogueRenderConfig?.renderDialogueContent}
        {@render dialogueRenderConfig.renderDialogueContent({ message, role, defaultContent })}
      {:else}
        {@render defaultContent()}
      {/if}

      {#if dialogueRenderConfig?.renderDialogueAction}
        {@render dialogueRenderConfig.renderDialogueAction({ message, defaultAction })}
      {:else}
        {@render defaultAction()}
      {/if}
    </div>
  {/if}
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

  .cd-ai-dialogue-box-references {
    list-style: none;
    margin: var(--cd-spacing-extra-tight) 0 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: var(--cd-spacing-extra-tight);
  }

  .cd-ai-dialogue-box-reference {
    appearance: none;
    display: inline-flex;
    align-items: center;
    gap: var(--cd-spacing-extra-tight);
    max-width: 100%;
    padding: var(--cd-spacing-extra-tight) var(--cd-spacing-tight);
    border: 1px solid var(--cd-color-border);
    border-radius: var(--cd-border-radius-medium);
    background: var(--cd-color-fill-0);
    color: var(--cd-color-text-1);
    font-size: var(--cd-font-size-secondary, var(--cd-font-size-regular));
    cursor: pointer;
    text-align: left;
  }

  .cd-ai-dialogue-box-reference:hover {
    background: var(--cd-color-fill-1);
    border-color: var(--cd-color-primary);
  }

  .cd-ai-dialogue-box-reference--text {
    max-width: 320px;
  }

  .cd-ai-dialogue-box-reference-icon {
    color: var(--cd-color-primary);
    flex-shrink: 0;
  }

  .cd-ai-dialogue-box-reference-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .cd-ai-dialogue-box-reference-text {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
