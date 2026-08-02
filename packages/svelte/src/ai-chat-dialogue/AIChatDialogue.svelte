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
    resolveDefault,
  } from '@chenzy-design/core';
  import { untrack } from 'svelte';
  import { SvelteSet } from 'svelte/reactivity';
  import { IconChevronDown } from '@chenzy-design/icons';
  import { Button } from '../button/index.js';
  import { useLocale } from '../locale-provider/index.js';
  import DialogueBox from './DialogueBox.svelte';
  import DialogueHint from './DialogueHint.svelte';
  import type { DialogueRenderConfig } from './render-config.js';

  interface Props {
    /** 是否对用户消息中的 HTML 标签进行转义，防止被 Markdown 解析器当作 HTML 处理导致内容丢失（对齐 Semi escapeHtml）。 */
    escapeHtml?: boolean;
    /** 是否禁用文件点击（对齐 Semi disabledFileItemClick）。 */
    disabledFileItemClick?: boolean;
    /** 提示区最外层样式类名（对齐 Semi hintCls）。 */
    hintCls?: string;
    /** 提示区最外层样式（对齐 Semi hintStyle）。 */
    hintStyle?: string;
    /** 分享消息回调（对齐 Semi onMessageShare）。 */
    onMessageShare?: ((message: unknown) => void) | undefined;
    /** annotation 点击回调（对齐 Semi onAnnotationClick）。 */
    onAnnotationClick?: ((annotation: unknown) => void) | undefined;
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
    /**
     * 是否展示编辑操作（默认 true；仅 user 消息）。
     * **本库自有**：Semi 的 showEdit 恒为 `role === USER`（dialogueAction.tsx:261），
     * 没有开关，user 消息必出编辑按钮。本库多这个 prop 供使用方关掉。
     */
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
    align: alignProp,
    mode: modeProp,
    hints,
    selecting: selectingProp,
    showReset: showResetProp,
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
    showReference: showReferenceProp,
    onReferenceClick,
    dialogueRenderConfig,
    escapeHtml = true,
    disabledFileItemClick = false,
    hintCls = '',
    hintStyle = '',
    onMessageShare,
    onAnnotationClick,
  }: Props = $props();
  // cdGlobal 全局默认 props（对齐 Semi semiGlobal.config.overrideDefaultProps）：
  // 优先级 = 显式传值 > cdGlobal['AIChatDialogue'] > 组件内置默认值。
  const align = $derived(resolveDefault(alignProp, 'AIChatDialogue', 'align', 'leftRight'));
  const mode = $derived(resolveDefault(modeProp, 'AIChatDialogue', 'mode', 'bubble'));
  const selecting = $derived(resolveDefault(selectingProp, 'AIChatDialogue', 'selecting', false));
  const showReset = $derived(resolveDefault(showResetProp, 'AIChatDialogue', 'showReset', true));
  const showReference = $derived(resolveDefault(showReferenceProp, 'AIChatDialogue', 'showReference', false));

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

  // 滚动条按需显隐（对齐 Semi 的 wheelScroll 状态）：
  // 新消息到来时先隐藏（-list-scroll-hidden），用户真的滚轮滚动后再显示。
  // Semi 在 componentDidUpdate 里 chats 变长时置 false，wheel 事件里置 true。
  let wheelScroll = $state(false);

  function handleWheel(): void {
    wheelScroll = true;
  }

  // chats 变长 → 回到「隐藏滚动条」态（下次用户滚轮再显示）。
  // 初值用 -1 而非 chats.length：后者在 setup 期只会捕获初始值（编译器 state_referenced_locally
  // 告警），首次 effect 会拿它跟当前长度比，语义不对。-1 让首帧必定同步一次。
  let prevChatCount = -1;
  $effect(() => {
    const n = chats.length;
    untrack(() => {
      if (prevChatCount >= 0 && n > prevChatCount) wheelScroll = false;
      prevChatCount = n;
    });
  });

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

<div class="cd-ai-chat-dialogue {className}" {style}>
  <div
    bind:this={containerEl}
    class="cd-ai-chat-dialogue-list"
    class:cd-ai-chat-dialogue-list-scroll-hidden={!wheelScroll}
    role="log"
    aria-live="polite"
    aria-label={loc().t('AIChatDialogue.messageList')}
    onscroll={handleScroll}
    onwheel={handleWheel}
  >
    {#each chats as message, index (message.id)}
      <DialogueBox
        {message}
        role={resolveRole(message)}
        {align}
        {mode}
        {selecting}
        continueSend={index > 0 && message.role === chats[index - 1]?.role}
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
        {escapeHtml}
        {disabledFileItemClick}
        {onMessageShare}
        {onAnnotationClick}
      />
    {/each}
  </div>

  {#if showBackBottom}
    <!-- Semi 是 span.-backBottom 包一个 Button.-backBottom-button（index.tsx:367-373），
         本库原来只有一层 button 且内容是裸「↓」字符。 -->
    <span class="cd-ai-chat-dialogue-backBottom">
      <Button
        class="cd-ai-chat-dialogue-backBottom-button"
        type="tertiary"
        aria-label={loc().t('AIChatDialogue.backToBottom')}
        onclick={() => scrollToBottom(true)}
      >
        {#snippet icon()}<IconChevronDown />{/snippet}
      </Button>
    </span>
  {/if}

  {#if hints && hints.length > 0}
    <DialogueHint
      {hints}
      {selecting}
      onHintClick={handleHintClick}
      {renderHintBox}
      class={hintCls}
      style={hintStyle}
    />
  {/if}
</div>

<style>
  .cd-ai-chat-dialogue {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
  }

  .cd-ai-chat-dialogue-list {
    flex: 1 1 auto;
    overflow-y: auto;
    min-height: 0;
  }

  .cd-ai-chat-dialogue-backBottom {
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
