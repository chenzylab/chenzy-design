<!--
  AIChatDialogue — AI 对话展示（对齐 Semi aiChatDialogue）。
  消息格式以 OpenAI Response Object 为原型（core 提供类型 + Adapter）。
  容器：消息流（role=log）+ 选择模式 + 提示区。逐条 DialogueBox 渲染，
  内容按 ContentItem 分块（ContentItemRenderer）。滚动到底 / 回到底部对齐 Chat。
  ref 方法：selectAll / deselectAll / scrollToBottom / scrollToTop。
  全 token，类名前缀 cd-。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import {
    isAboveThreshold,
    type AIDialogueMessage,
    type AIDialogueMetadata,
    type AIDialogueRoleConfig,
    type AIDialogueReference,
    type ContentItem,
    type AIChatInputMessageContent,
  } from '@chenzy-design/core';
  import { SvelteSet } from 'svelte/reactivity';
  import { useLocale } from '../locale-provider/index.js';
  import DialogueBox from './DialogueBox.svelte';
  import Hint from '../chat/Hint.svelte';
  import type { DialogueRenderConfig } from './render-config.js';

  interface Props {
    /** 受控对话列表。 */
    chats?: AIDialogueMessage[];
    /** 角色配置（必填，对齐 Semi）。 */
    roleConfig?: AIDialogueRoleConfig;
    align?: 'leftRight' | 'leftAlign';
    mode?: 'bubble' | 'noBubble' | 'userBubble';
    /** 提示信息。 */
    hints?: string[];
    /** 选择模式。 */
    selecting?: boolean;
    /** 展示重置操作。 */
    showReset?: boolean;
    /** 透传 MarkdownRender props。 */
    markdownRenderProps?: Record<string, unknown> | undefined;
    /** ContentItem 按类型覆盖渲染（对齐 Semi renderDialogueContentItem）。 */
    renderDialogueContentItem?: Record<string, Snippet<[ContentItem]>> | undefined;
    /** 自定义提示项渲染。 */
    renderHintBox?: Snippet<[{ content: string; index: number; onHintClick: () => void }]> | undefined;
    class?: string;
    style?: string;
    // 回调
    onChatsChange?: ((chats: AIDialogueMessage[]) => void) | undefined;
    onHintClick?: ((hint: string) => void) | undefined;
    onSelect?: ((selectedIds: string[]) => void) | undefined;
    onMessageCopy?: ((message: AIDialogueMessage) => void) | undefined;
    onMessageDelete?: ((message: AIDialogueMessage) => void) | undefined;
    onMessageReset?: ((message: AIDialogueMessage) => void) | undefined;
    onMessageGoodFeedback?: ((message: AIDialogueMessage) => void) | undefined;
    onMessageBadFeedback?: ((message: AIDialogueMessage) => void) | undefined;
    onFileClick?: ((file: unknown) => void) | undefined;
    onImageClick?: ((image: unknown) => void) | undefined;
    /** 消息编辑渲染（对齐 Semi messageEditRender）：user 消息 editing 态用它替代内容。 */
    messageEditRender?: Snippet<[AIChatInputMessageContent]> | undefined;
    /** 点击编辑操作回调（对齐 Semi onMessageEdit）。 */
    onMessageEdit?: ((message: AIDialogueMessage) => void) | undefined;
    /** 是否展示编辑操作（默认 true；仅 user 消息）。 */
    editable?: boolean;
    /** 是否在 user 消息展示引用区（对齐 Semi showReference）。 */
    showReference?: boolean;
    /** 引用项点击回调（对齐 Semi onReferenceClick）。 */
    onReferenceClick?: ((item: AIDialogueReference) => void) | undefined;
    /** 自定义各区块渲染（对齐 Semi dialogueRenderConfig）。 */
    dialogueRenderConfig?: DialogueRenderConfig | undefined;
  }

  let {
    chats = [],
    roleConfig,
    align = 'leftRight',
    mode = 'bubble',
    hints,
    selecting = false,
    showReset = true,
    markdownRenderProps,
    renderDialogueContentItem,
    renderHintBox,
    class: className = '',
    style,
    onChatsChange,
    onHintClick,
    onSelect,
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

  let containerEl = $state<HTMLDivElement>();
  let showBackBottom = $state(false);
  // 选中的消息 id 集合（选择模式）。用 SvelteSet 以细粒度响应 add/delete。
  const selectedIds = new SvelteSet<string>();

  /** 解析某消息的角色元数据。roleConfig[role] 可为 Metadata 或 Map<name,Metadata>。 */
  function resolveRole(message: AIDialogueMessage): AIDialogueMetadata | undefined {
    const entry = roleConfig?.[message.role];
    if (!entry) return undefined;
    if (entry instanceof Map) {
      return message.name ? entry.get(message.name) : undefined;
    }
    return entry;
  }

  function handleScroll(): void {
    const el = containerEl;
    if (!el) return;
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    // 距底超过阈值时显示回到底部（复用 back-top 的阈值判定语义）。
    showBackBottom = isAboveThreshold(distanceToBottom, 100);
  }

  function handleHintClick(hint: string): void {
    onHintClick?.(hint);
  }

  function toggleSelect(message: AIDialogueMessage): void {
    if (selectedIds.has(message.id)) selectedIds.delete(message.id);
    else selectedIds.add(message.id);
    onSelect?.([...selectedIds]);
  }

  // —— ref 方法（对齐 Semi Methods）——
  export function selectAll(): void {
    selectedIds.clear();
    for (const c of chats) selectedIds.add(c.id);
    onSelect?.([...selectedIds]);
  }
  export function deselectAll(): void {
    selectedIds.clear();
    onSelect?.([]);
  }
  export function scrollToBottom(animation = false): void {
    const el = containerEl;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: animation ? 'smooth' : 'auto' });
  }
  export function scrollToTop(animation = false): void {
    const el = containerEl;
    if (!el) return;
    el.scrollTo({ top: 0, behavior: animation ? 'smooth' : 'auto' });
  }

  // 注：受控语义——外部持有 chats。内部变更（删除/重置）通过各 onMessageX 交给
  // 使用方处理，本组件不主动改 chats，故 onChatsChange 预留给需要时透传（当前不内部触发）。
</script>

<div class="cd-ai-dialogue {className}" {style}>
  <div
    bind:this={containerEl}
    class="cd-ai-dialogue-container"
    role="log"
    aria-live="polite"
    aria-label={loc().t('AIChatDialogue.messageList')}
    onscroll={handleScroll}
  >
    {#each chats as message (message.id)}
      <DialogueBox
        {message}
        role={resolveRole(message)}
        {align}
        {mode}
        {selecting}
        selected={selectedIds.has(message.id)}
        {markdownRenderProps}
        renderMap={renderDialogueContentItem}
        {showReset}
        onSelectToggle={toggleSelect}
        {onMessageCopy}
        {onMessageDelete}
        {onMessageReset}
        {onMessageGoodFeedback}
        {onMessageBadFeedback}
        {onFileClick}
        {onImageClick}
        {messageEditRender}
        {onMessageEdit}
        {editable}
        {showReference}
        {onReferenceClick}
        {dialogueRenderConfig}
      />
    {/each}
  </div>

  {#if showBackBottom}
    <button
      type="button"
      class="cd-ai-dialogue-backbottom"
      aria-label={loc().t('AIChatDialogue.backToBottom')}
      onclick={() => scrollToBottom(true)}>↓</button
    >
  {/if}

  {#if hints && hints.length > 0}
    <Hint {hints} onHintClick={handleHintClick} {renderHintBox} />
  {/if}
</div>

<style>
  .cd-ai-dialogue {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
  }

  .cd-ai-dialogue-container {
    flex: 1 1 auto;
    overflow-y: auto;
    min-height: 0;
  }

  .cd-ai-dialogue-backbottom {
    position: absolute;
    right: var(--cd-spacing-loose);
    bottom: var(--cd-spacing-loose);
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 1px solid var(--cd-color-border);
    background: var(--cd-color-bg-0);
    color: var(--cd-color-text-1);
    cursor: pointer;
    box-shadow: var(--cd-shadow-elevated);
  }
</style>
