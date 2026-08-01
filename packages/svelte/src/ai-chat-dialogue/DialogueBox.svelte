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
  // 复用现有组件：Semi dialogueAvatar.tsx 用 Avatar，本库同样复用。
  import { Avatar } from '../avatar/index.js';
  import ContentItemRenderer from './ContentItemRenderer.svelte';
  import DialogueAction from './DialogueAction.svelte';
  import type { DialogueRenderConfig } from './render-config.js';

  interface Props {
    /** 是否转义用户消息中的 HTML 标签（对齐 Semi escapeHtml）。 */
    escapeHtml?: boolean;
    /** 是否禁用文件点击（对齐 Semi disabledFileItemClick）。 */
    disabledFileItemClick?: boolean;
    /** 分享消息回调（对齐 Semi onMessageShare）。 */
    onMessageShare?: ((message: unknown) => void) | undefined;
    /** annotation 点击回调（对齐 Semi onAnnotationClick）。 */
    onAnnotationClick?: ((annotation: unknown) => void) | undefined;
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
    escapeHtml = true,
    disabledFileItemClick = false,
    onMessageShare,
    onAnnotationClick,
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

</script>

<!-- 默认头像节点。 -->
{#snippet defaultAvatar()}
  <!-- 复用 Avatar（对齐 Semi dialogueAvatar.tsx：`<Avatar className={-avatar} src size="extra-small">`）。
       此前是自绘 img/div——圆角、底色、文字居中全靠本组件自造样式，与 Semi 的 Avatar 视觉两套。 -->
  <!-- alt 取角色名：本库 Avatar 的文字/图片模式都带 role="img"，没有可访问名会触发
       axe role-img-alt（serious）。Semi 侧 demo 只传 src 不传 alt，但那是它的 demo 疏漏，
       不是可照搬的契约——这里补上真实可访问名。 -->
  {#if role?.avatar}
    <Avatar
      class="cd-ai-chat-dialogue-avatar"
      src={role.avatar}
      alt={role?.name ?? ''}
      size="extra-small"
    />
  {:else}
    <Avatar class="cd-ai-chat-dialogue-avatar" alt={role?.name ?? ''} size="extra-small">
      {avatarInitial}
    </Avatar>
  {/if}
{/snippet}

<!-- 默认标题节点。 -->
{#snippet defaultTitle()}
  {#if title}
    <div class="cd-ai-chat-dialogue-title">{title}</div>
  {/if}
{/snippet}

<!-- 默认内容节点（含编辑态 / loading / error / 内容块 + 引用区）。 -->
{#snippet defaultContent()}
  <div class="cd-ai-chat-dialogue-content" aria-busy={isLoading}>
    {#if isEditing && messageEditRender}
      <!-- 编辑态：用 messageEditRender 替代内容（对齐 Semi），消费方通常放 AIChatInput 编辑器。 -->
      {@render messageEditRender(editPayload)}
    {:else if isLoading && items.length === 0}
      <span class="cd-ai-chat-dialogue-content-loading">{loc().t('AIChatDialogue.loading')}</span>
    {:else if isError}
      <span class="cd-ai-chat-dialogue-content-failed-text">{loc().t('AIChatDialogue.error')}</span>
    {:else}
      {#each items as item, i (i)}
        <ContentItemRenderer
          {item}
          {markdownRenderProps}
          {renderMap}
          onFileClick={disabledFileItemClick ? undefined : onFileClick}
          {onImageClick}
          {escapeHtml}
          {isUser}
          {onAnnotationClick}
        />
      {/each}
    {/if}
  </div>

  {#if references.length > 0}
    <ul class="cd-ai-chat-dialogue-references" aria-label={loc().t('AIChatDialogue.references')}>
      {#each references as ref, i (ref.id ?? i)}
        <li>
          <button
            type="button"
            class="cd-ai-chat-dialogue-reference"
            class:cd-ai-chat-dialogue-reference-text-only={!!ref.content && !ref.name}
            title={ref.name ?? ref.content ?? ''}
            onclick={() => onReferenceClick?.(ref)}
          >
            {#if ref.name}
              <span class="cd-ai-chat-dialogue-references-icon" aria-hidden="true">◈</span>
              <span class="cd-ai-chat-dialogue-references-name">{ref.name}</span>
            {:else}
              <span class="cd-ai-chat-dialogue-references-content">{ref.content}</span>
            {/if}
          </button>
        </li>
      {/each}
    </ul>
  {/if}
{/snippet}

<!-- 默认操作栏节点：拆到 DialogueAction.svelte（同 Semi widgets/dialogueAction.tsx）。 -->
{#snippet defaultAction()}
  {#if !isLoading && !selecting && !isEditing}
    <DialogueAction
      {message}
      isLastChat={showReset}
      onMessageCopy={onMessageCopy}
      onMessageDelete={onMessageDelete}
      onMessageReset={onMessageReset}
      onMessageEdit={editable && isUser ? onMessageEdit : undefined}
      onMessageShare={onMessageShare}
      onMessageGoodFeedback={onMessageGoodFeedback}
      onMessageBadFeedback={onMessageBadFeedback}
    />
  {/if}
{/snippet}

<div
  class="cd-ai-chat-dialogue-wrapper"
  class:cd-ai-chat-dialogue-content-user={isUser}
  class:cd-ai-chat-dialogue-wrapper-leftAlign={align === 'leftAlign'}
  class:cd-ai-chat-dialogue-content-failed={isError}
  class:cd-ai-chat-dialogue-content-bubble={showBubble}
>
  {#if selecting}
    <input
      type="checkbox"
      class="cd-ai-chat-dialogue-wrapper-selected"
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

    <div class="cd-ai-chat-dialogue-inner">
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
  .cd-ai-chat-dialogue-wrapper {
    display: flex;
    gap: var(--cd-spacing-tight);
    padding: var(--cd-spacing-tight);
    align-items: flex-start;
  }

  .cd-ai-chat-dialogue-content-user {
    flex-direction: row-reverse;
  }

  .cd-ai-chat-dialogue-wrapper-leftAlign,
  .cd-ai-chat-dialogue-wrapper-leftAlign.cd-ai-chat-dialogue-content-user {
    flex-direction: row;
  }

  /* Semi &-avatar 只有这三条：圆角/底色/文字样式都由复用的 Avatar 组件承担。
     必须 :global —— 类名挂在子组件 Avatar 的根节点上，scoped 规则匹配不到
     （编译器已用 unused-selector 警告提示过）。 */
  :global(.cd-ai-chat-dialogue-avatar) {
    flex-shrink: 0;
    width: var(--cd-width-ai-chat-dialogue-avatar);
    height: var(--cd-height-ai-chat-dialogue-avatar);
  }

  /* Semi &-avatar-hidden：continueSend（连续同角色发言）时占位但不显示。 */
  :global(.cd-ai-chat-dialogue-avatar-hidden) {
    visibility: hidden;
  }

  .cd-ai-chat-dialogue-inner {
    min-width: 0;
    flex: 1 1 auto;
  }

  .cd-ai-chat-dialogue-title {
    color: var(--cd-color-text-2);
    font-size: var(--cd-font-size-secondary, var(--cd-font-size-regular));
    margin-bottom: var(--cd-spacing-extra-tight);
  }

  .cd-ai-chat-dialogue-content-bubble .cd-ai-chat-dialogue-content {
    padding: var(--cd-spacing-tight);
    border-radius: var(--cd-border-radius-large, var(--cd-border-radius-medium));
    background: var(--cd-ai-chat-dialogue-bubble-bg);
  }

  .cd-ai-chat-dialogue-content-bubble.cd-ai-chat-dialogue-content-user .cd-ai-chat-dialogue-content {
    background: var(--cd-ai-chat-dialogue-bubble-bg);
  }

  .cd-ai-chat-dialogue-content-failed-text {
    color: var(--cd-color-danger);
  }

  .cd-ai-chat-dialogue-content-loading {
    color: var(--cd-color-text-2);
  }

  /* 操作区样式已随组件拆分迁到 DialogueAction.svelte
     （原来这三条是给裸 emoji 按钮写的，Semi 侧那几个按钮是复用 Button，样式归 Button 管）。 */

  .cd-ai-chat-dialogue-references {
    list-style: none;
    margin: var(--cd-spacing-extra-tight) 0 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: var(--cd-spacing-extra-tight);
  }

  .cd-ai-chat-dialogue-reference {
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

  .cd-ai-chat-dialogue-reference:hover {
    background: var(--cd-color-fill-1);
    border-color: var(--cd-color-primary);
  }

  .cd-ai-chat-dialogue-reference-text-only {
    max-width: 320px;
  }

  .cd-ai-chat-dialogue-references-icon {
    color: var(--cd-color-primary);
    flex-shrink: 0;
  }

  .cd-ai-chat-dialogue-references-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .cd-ai-chat-dialogue-references-content {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
