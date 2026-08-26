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
  import type { DialogueContentItemRendererMap } from './content-item-render-map.js';

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
    renderDialogueContentItem?: DialogueContentItemRendererMap | undefined;
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
    /** 是否在 user 消息展示引用区（对齐 Semi showReference）。 */
    showReference?: boolean;
    /** 引用项点击回调（对齐 Semi onReferenceClick）。 */
    onReferenceClick?: ((item: AIDialogueReference) => void) | undefined;
    /** 自定义各区块渲染（对齐 Semi dialogueRenderConfig）。 */
    dialogueRenderConfig?: DialogueRenderConfig | undefined;
    /**
     * steps 块 action 图标渲染。Semi Step.action.icon 直接是 ReactNode，数据里塞组件实例
     * 即可（如 mapStep 按 type 分派 IconSearchStroked 等）；Svelte 没有「数据即节点」，
     * DialogueStepAction.icon 类型是 unknown，靠这层 Snippet 间接渲染同等效果。
     */
    renderActionIcon?: Snippet<[{ icon: unknown }]> | undefined;
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
    showReference: showReferenceProp,
    onReferenceClick,
    dialogueRenderConfig,
    escapeHtml = true,
    disabledFileItemClick = false,
    hintCls = '',
    hintStyle = '',
    onMessageShare,
    onAnnotationClick,
    renderActionIcon,
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

  // 内部维护一份 chats 的可变副本（对齐 Semi getDerivedStateFromProps 从 props.chats
  // 同步到 state.chats）：like/dislike/reset/edit/delete/onHintClick 六个操作在 Semi
  // 里都是「foundation 直接改 state.chats 并 notifyChatsChange」，不是纯回调转发——
  // 本库原来完全没有这层，六个操作点了都不会真的改变列表，与 Semi 交互结果不一致。
  let internalChats = $state<AIDialogueMessage[]>(untrack(() => chats));
  $effect(() => {
    const next = chats;
    untrack(() => {
      internalChats = next;
    });
  });

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

  // 对齐 Semi foundation.onHintClick：把点击的提示词作为新 user 消息插入 chats。
  function handleHintClick(hint: string): void {
    const newMessage: AIDialogueMessage = {
      role: 'user',
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      content: hint,
    };
    internalChats = [...internalChats, newMessage];
    onChatsChange?.(internalChats);
    onHintClick?.(hint);
  }

  function toggleSelect(message: AIDialogueMessage): void {
    if (selectedIds.has(message.id)) selectedIds.delete(message.id);
    else selectedIds.add(message.id);
    onSelect?.([...selectedIds]);
  }

  /** 对齐 Semi foundation.likeMessage：切换 like，联动清空 dislike。 */
  function handleLike(message: AIDialogueMessage): void {
    onMessageGoodFeedback?.(message);
    const index = internalChats.findIndex((item) => item.id === message.id);
    if (index === -1) return;
    const current = internalChats[index] as AIDialogueMessage & { like?: boolean; dislike?: boolean };
    const newChat = { ...current, like: !current.like, dislike: false };
    internalChats = internalChats.map((item, i) => (i === index ? newChat : item));
    onChatsChange?.(internalChats);
  }

  /** 对齐 Semi foundation.dislikeMessage：切换 dislike，联动清空 like。 */
  function handleDislike(message: AIDialogueMessage): void {
    onMessageBadFeedback?.(message);
    const index = internalChats.findIndex((item) => item.id === message.id);
    if (index === -1) return;
    const current = internalChats[index] as AIDialogueMessage & { like?: boolean; dislike?: boolean };
    const newChat = { ...current, like: false, dislike: !current.dislike };
    internalChats = internalChats.map((item, i) => (i === index ? newChat : item));
    onChatsChange?.(internalChats);
  }

  /** 对齐 Semi foundation.resetMessage：最后一条消息换成新的 in_progress 空消息（重新生成）。 */
  function handleReset(message: AIDialogueMessage): void {
    const lastMessage = internalChats[internalChats.length - 1];
    if (!lastMessage) return;
    const newLastChat: AIDialogueMessage = {
      ...lastMessage,
      status: 'in_progress',
      content: '',
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    internalChats = [...internalChats.slice(0, -1), newLastChat];
    onChatsChange?.(internalChats);
    onMessageReset?.(message);
  }

  /**
   * 对齐 Semi foundation.editMessage：切换该消息 editing，且保证同时只有一条在编辑态
   * （Semi 先把所有消息的 editing 清空，再对目标消息取反）。
   */
  function handleEdit(message: AIDialogueMessage): void {
    onMessageEdit?.(message);
    const index = internalChats.findIndex((item) => item.id === message.id);
    if (index === -1) return;
    const target = internalChats[index] as AIDialogueMessage & { editing?: boolean };
    const willEdit = !target.editing;
    internalChats = internalChats.map((item, i) => {
      if (i === index) return { ...item, editing: willEdit };
      return (item as { editing?: boolean }).editing ? { ...item, editing: false } : item;
    });
    onChatsChange?.(internalChats);
  }

  /** 对齐 Semi foundation.deleteMessage：从 chats 中移除该消息。 */
  function handleDelete(message: AIDialogueMessage): void {
    onMessageDelete?.(message);
    internalChats = internalChats.filter((item) => item.id !== message.id);
    onChatsChange?.(internalChats);
  }

  // —— ref 方法（对齐 Semi Methods）——
  export function selectAll(): void {
    selectedIds.clear();
    for (const c of internalChats) selectedIds.add(c.id);
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

  // 半受控：chats prop 是初始/外部同步值，交互态实际读写 internalChats（对齐 Semi
  // state.chats），每次内部变更后通过 onChatsChange 把新值抛给外部，外部若把它写回
  // chats prop 即可形成闭环（同 Semi demo onChatsChange 里 setMessage(chats) 的用法）。
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
    <!-- Semi index.tsx:331 计算了 continueSend（index>0 && 同角色），但实际传给
         DialogueItem 的第349行硬编码 continueSend={false}，附 todo「暂时设置成
         false，如果用户有相关需求，转为一个对外提供的 API」——这行计算是尚未启用
         的死代码，Semi 当前真实行为是头像/标题永远不因连续同角色隐藏（真机对照
         Semi 截图：连续三条 Assistant 消息，每条都带完整头像）。本库原来接了这行
         计算并让它生效，是超出 Semi 当前实现的自造行为，应恒为 false。 -->
    {#each internalChats as message, index (message.id)}
      <DialogueBox
        {message}
        role={resolveRole(message)}
        {align}
        {mode}
        {selecting}
        continueSend={false}
        selected={selectedIds.has(message.id)}
        {markdownRenderProps}
        renderMap={renderDialogueContentItem}
        {showReset}
        isLastChat={index === internalChats.length - 1}
        onSelectToggle={toggleSelect}
        {onMessageCopy}
        onMessageDelete={handleDelete}
        onMessageReset={handleReset}
        onMessageGoodFeedback={handleLike}
        onMessageBadFeedback={handleDislike}
        {onFileClick}
        {onImageClick}
        {messageEditRender}
        onMessageEdit={handleEdit}
        {showReference}
        {onReferenceClick}
        {dialogueRenderConfig}
        {escapeHtml}
        {disabledFileItemClick}
        {onMessageShare}
        {onAnnotationClick}
        {renderActionIcon}
      />
    {/each}

    <!-- 对齐 Semi index.tsx:355-364：Hint 跟每条 DialogueItem 同级，是 -list 滚动容器
         内部的最后一项，随消息内容一起滚动、紧跟在最后一条消息后面。本库原来把它挪到
         了 -list 容器外部（跟 -list 平级挂在根容器下），真机对照 Semi 截图，提示区
         应紧贴最后一条消息卡片下方，本库原结构会让它被挤到滚动区域之外、明显偏下。 -->
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
    /* Semi aiChatDialogue.scss:87 给它设了 z-index，本库此前漏了这条 ——
       所以 $z-aiChatDialogue_backBottom 对应的 token 一直没有消费方。 */
    z-index: var(--cd-z-ai-chat-dialogue-back-bottom);
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
