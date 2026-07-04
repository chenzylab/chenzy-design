<!--
  Chat — 对话主容器（对齐 Semi Chat）。
  消息列表滚动区（role=log）+ back-bottom 悬浮按钮（core.shouldShowBackBottom + SHOW_SCROLL_GAP）
  + 输入区（InputBox）+ 提示区（Hint）+ topSlot / bottomSlot。
  受控/非受控 chats（对齐 Upload 的 value 模式）：所有 chats 变换（发送/删除/赞/踩/重生成/
  清除上下文）经 core 纯函数产出新数组，经 onChatsChange 回传；非受控时内部 inner 承载。

  滚动红线：$effect 只监听容器 scroll → 写专用 backBottomVisible state；不在 effect 里回读派生量做二次 set，
  避免自循环。scrollToBottom 命令式（rAF / 动画），不在 render 期触发。

  ref 方法（export function）：resetMessage / scrollToBottom(animation) / clearContext / sendMessage。
  全 token，类名前缀 cd-。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { untrack } from 'svelte';
  import {
    CHAT_ALIGN,
    CHAT_MODE,
    SHOW_SCROLL_GAP,
    SCROLL_ANIMATION_TIME,
    shouldShowBackBottom,
    resolveEnableUpload,
    buildSendContent,
    appendDivider,
    makeUserMessage,
    deleteMessageFrom,
    toggleLike,
    toggleDislike,
    resetLastMessage,
    type Message,
    type RoleConfig,
    type ChatAttachment,
    type ChatAlign,
    type ChatMode,
    type SendHotKey,
    type EnableUploadProps,
  } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';
  import type { UploadFileItem } from '../upload/types.js';
  import ChatBox from './ChatBox.svelte';
  import InputBox from './InputBox.svelte';
  import Hint from './Hint.svelte';
  import type {
    RenderInputAreaProps,
    RenderAvatarProps,
    RenderTitleProps,
    RenderContentProps,
    RenderActionProps,
    RenderFullChatBoxProps,
    RenderHintBoxProps,
  } from './types.js';

  interface Props {
    /** 消息列表。 */
    chats?: Message[];
    /** 角色配置（名称/头像/色）。 */
    roleConfig?: RoleConfig;
    /** 布局对齐。 */
    align?: ChatAlign;
    /** 气泡模式。 */
    mode?: ChatMode;
    /** 发送快捷键。 */
    sendHotKey?: SendHotKey;
    /** 是否展示清除上下文按钮。 */
    showClearContext?: boolean;
    /** 是否展示停止生成按钮。 */
    showStopGenerate?: boolean;
    /**
     * 是否可以发送（对齐 Semi canSend）。未设置时由输入内容 / 附件推断；
     * 显式设置时以此为准。
     */
    canSend?: boolean | undefined;
    /** 提示项列表。 */
    hints?: string[];
    /** 上传能力（true/false 或三态对象）。 */
    enableUpload?: boolean | EnableUploadProps;
    /** 透传内部 Upload 的 props。 */
    uploadProps?: Record<string, unknown>;
    /** 透传 MarkdownRender props。 */
    markdownRenderProps?: Record<string, unknown>;
    /** 输入框占位。 */
    placeholder?: string;
    /** 顶部插槽。 */
    topSlot?: Snippet;
    /** 底部插槽（列表与输入区之间）。 */
    bottomSlot?: Snippet;
    /** 附加类名。 */
    class?: string;
    /** 内联样式。 */
    style?: string;
    // 回调
    onChatsChange?: (chats: Message[]) => void;
    onMessageSend?: (content: string, attachment: UploadFileItem[]) => void;
    onInputChange?: (props: { value: string; attachment: UploadFileItem[] }) => void;
    onClear?: () => void;
    onHintClick?: (hint: string) => void;
    onStopGenerator?: () => void;
    onMessageCopy?: (message: Message) => void;
    onMessageDelete?: (message: Message) => void;
    onMessageReset?: (message: Message) => void;
    onMessageGoodFeedback?: (message: Message) => void;
    onMessageBadFeedback?: (message: Message) => void;
    // 自定义渲染 snippet
    renderInputArea?: Snippet<[RenderInputAreaProps]>;
    renderChatBoxAvatar?: Snippet<[RenderAvatarProps]>;
    renderChatBoxTitle?: Snippet<[RenderTitleProps]>;
    renderChatBoxContent?: Snippet<[RenderContentProps]>;
    renderChatBoxAction?: Snippet<[RenderActionProps]>;
    renderFullChatBox?: Snippet<[RenderFullChatBoxProps]>;
    renderHintBox?: Snippet<[RenderHintBoxProps]>;
    renderDivider?: Snippet<[Message]>;
  }

  let {
    chats,
    roleConfig,
    align = CHAT_ALIGN.LEFT_RIGHT,
    mode = CHAT_MODE.BUBBLE,
    sendHotKey = 'enter',
    showClearContext = false,
    showStopGenerate = false,
    canSend,
    hints,
    enableUpload = true,
    uploadProps,
    markdownRenderProps,
    placeholder,
    topSlot,
    bottomSlot,
    class: className = '',
    style,
    onChatsChange,
    onMessageSend,
    onInputChange,
    onClear,
    onHintClick,
    onStopGenerator,
    onMessageCopy,
    onMessageDelete,
    onMessageReset,
    onMessageGoodFeedback,
    onMessageBadFeedback,
    renderInputArea,
    renderChatBoxAvatar,
    renderChatBoxTitle,
    renderChatBoxContent,
    renderChatBoxAction,
    renderFullChatBox,
    renderHintBox,
    renderDivider,
  }: Props = $props();

  const loc = useLocale();

  // 受控（传了 chats）/ 非受控（内部 inner）——对齐 Upload 的 value 模式。
  // 受控：父级拥有 chats，我们只经 onChatsChange 回传、从不写 prop；
  // 非受控：内部 inner 承载，commitChats 同步写入并回传。
  const isControlled = $derived(chats !== undefined);
  // 非受控初始为空；受控（传了 chats）时 inner 不参与渲染。
  let inner = $state<Message[]>([]);
  const currentChats = $derived(isControlled ? (chats ?? []) : inner);

  const uploadModes = $derived(resolveEnableUpload(enableUpload));

  // back-bottom 显隐：专用 state，仅 scroll / resize 事件命令式写入（红线：不在 effect 回读派生做二次 set）。
  let backBottomVisible = $state(false);
  let containerEl: HTMLDivElement | null = $state(null);

  let idSeq = 0;
  function makeId(): string {
    idSeq += 1;
    return `cd-chat-${Date.now()}-${idSeq}`;
  }

  function commitChats(next: Message[]): void {
    // 非受控时写内部 inner；受控时由父级据 onChatsChange 更新 chats（我们不写 prop）。
    if (!isControlled) inner = next;
    onChatsChange?.(next);
  }

  function updateBackBottom(): void {
    const el = containerEl;
    if (!el) return;
    backBottomVisible = shouldShowBackBottom(
      el.scrollHeight,
      el.scrollTop,
      el.clientHeight,
      SHOW_SCROLL_GAP,
    );
  }

  function handleScroll(): void {
    // rAF 对齐 Semi containerScroll（读布局在下一帧，避免与写抖动）。
    requestAnimationFrame(updateBackBottom);
  }

  function scrollToBottomImmediately(): void {
    const el = containerEl;
    if (el) el.scrollTop = el.scrollHeight;
  }

  function scrollToBottomWithAnimation(): void {
    const el = containerEl;
    if (!el) return;
    const from = el.scrollTop;
    const to = el.scrollHeight;
    const start = performance.now();
    const step = (now: number): void => {
      const t = Math.min(1, (now - start) / SCROLL_ANIMATION_TIME);
      // easeInOutCubic（对齐 Semi 动画曲线）。
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      el.scrollTop = from + (to - from) * eased;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // 新消息后滚到底（列表长度变化时命令式触发）。lastLen 是非响应式簿记（untrack 读，
  // 只依赖 currentChats.length），避免自身进依赖图导致 effect 自循环。
  let lastLen = 0;
  $effect(() => {
    const len = currentChats.length;
    if (len !== untrack(() => lastLen)) {
      lastLen = len;
      requestAnimationFrame(() => {
        scrollToBottomImmediately();
        updateBackBottom();
      });
    }
  });

  // UploadFileItem → core ChatAttachment（file→fileInstance，供 core MIME/后缀图片分流判定）。
  // exactOptionalPropertyTypes：仅在有值时写入可选字段，不显式赋 undefined。
  function toAttachments(list: UploadFileItem[]): ChatAttachment[] {
    return list.map((item) => {
      const att: ChatAttachment = {
        uid: item.uid,
        name: item.name,
        size: item.size,
        status: item.status,
      };
      if (item.url !== undefined) att.url = item.url;
      if (item.file !== undefined) att.fileInstance = item.file;
      return att;
    });
  }

  // 发送：core.buildSendContent 组装 → makeUserMessage 追加 → 回传 + notify。
  function doSend(content: string, attachment: UploadFileItem[]): void {
    const built = buildSendContent(content, toAttachments(attachment));
    const message = makeUserMessage(built, makeId);
    commitChats([...currentChats, message]);
    onMessageSend?.(content, attachment);
  }

  function doClearContext(): void {
    commitChats(appendDivider(currentChats, makeId));
    onClear?.();
  }

  function doHintClick(hint: string): void {
    const message = makeUserMessage(hint, makeId);
    commitChats([...currentChats, message]);
    onHintClick?.(hint);
  }

  function doDelete(message: Message): void {
    onMessageDelete?.(message);
    commitChats(deleteMessageFrom(currentChats, message));
  }

  function doLike(message: Message): void {
    onMessageGoodFeedback?.(message);
    commitChats(toggleLike(currentChats, message));
  }

  function doDislike(message: Message): void {
    onMessageBadFeedback?.(message);
    commitChats(toggleDislike(currentChats, message));
  }

  function doReset(message: Message): void {
    commitChats(resetLastMessage(currentChats, makeId));
    onMessageReset?.(message);
  }

  function roleOf(message: Message) {
    const key = typeof message.role === 'string' ? message.role : '';
    return roleConfig?.[key];
  }

  // ---- ref 方法（对齐 Semi ChatFoundation 暴露的命令式 API） ----
  /** 重置最后一条消息为 loading（对齐 Semi resetMessage）。 */
  export function resetMessage(): void {
    const last = currentChats[currentChats.length - 1];
    commitChats(resetLastMessage(currentChats, makeId));
    if (last) onMessageReset?.(last);
  }
  /** 滚动到底部；animation=true 时带动画。 */
  export function scrollToBottom(animation = false): void {
    if (animation) scrollToBottomWithAnimation();
    else scrollToBottomImmediately();
  }
  /** 清除上下文（追加 divider）。 */
  export function clearContext(): void {
    doClearContext();
  }
  /** 以文本 + 附件发送一条消息。 */
  export function sendMessage(content: string, attachment: UploadFileItem[] = []): void {
    doSend(content, attachment);
  }
</script>

<div class="cd-chat {className}" {style}>
  {#if topSlot}
    <div class="cd-chat-topSlot">{@render topSlot()}</div>
  {/if}

  <div
    bind:this={containerEl}
    class="cd-chat-container"
    role="log"
    aria-live="polite"
    aria-label={loc().t('Chat.messageList')}
    onscroll={handleScroll}
  >
    {#each currentChats as message, i (message.id ?? i)}
      <ChatBox
        {message}
        role={roleOf(message)}
        {align}
        {mode}
        lastChat={i === currentChats.length - 1}
        {markdownRenderProps}
        onMessageCopy={(m) => onMessageCopy?.(m)}
        onMessageDelete={doDelete}
        onMessageReset={doReset}
        onMessageGoodFeedback={doLike}
        onMessageBadFeedback={doDislike}
        {renderChatBoxAvatar}
        {renderChatBoxTitle}
        {renderChatBoxContent}
        {renderChatBoxAction}
        {renderFullChatBox}
        {renderDivider}
      />
    {/each}
  </div>

  {#if backBottomVisible}
    <button
      type="button"
      class="cd-chat-backBottom"
      onclick={() => scrollToBottom(true)}
      title={loc().t('Chat.backToBottom')}
      aria-label={loc().t('Chat.backToBottom')}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
        <path
          d="m6 9 6 6 6-6"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
  {/if}

  {#if bottomSlot}
    <div class="cd-chat-bottomSlot">{@render bottomSlot()}</div>
  {/if}

  {#if hints && hints.length > 0}
    <Hint {hints} onHintClick={doHintClick} {renderHintBox} />
  {/if}

  {#if showStopGenerate}
    <div class="cd-chat-stopBar">
      <button type="button" class="cd-chat-stop" onclick={() => onStopGenerator?.()}>
        {loc().t('Chat.stop')}
      </button>
    </div>
  {/if}

  <InputBox
    {sendHotKey}
    {placeholder}
    {showClearContext}
    {canSend}
    clickUpload={uploadModes.clickUpload}
    pasteUpload={uploadModes.pasteUpload}
    dragUpload={uploadModes.dragUpload}
    {uploadProps}
    onSend={doSend}
    onClearContext={doClearContext}
    onInputChange={(p) => onInputChange?.(p)}
    {renderInputArea}
  />
</div>

<style>
  .cd-chat {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    position: relative;
    background: var(--cd-chat-bg);
  }

  .cd-chat-container {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: var(--cd-chat-gap);
    padding: var(--cd-spacing-base);
  }

  .cd-chat-backBottom {
    position: absolute;
    right: var(--cd-spacing-loose);
    bottom: 120px;
    z-index: 1;
    appearance: none;
    border: none;
    cursor: pointer;
    width: 32px;
    height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--cd-border-radius-full);
    background: var(--cd-chat-back-bottom-bg);
    color: var(--cd-chat-back-bottom-color);
    box-shadow: var(--cd-chat-back-bottom-shadow);
    transition: opacity var(--cd-chat-motion-duration) ease;
  }

  .cd-chat-backBottom:focus-visible {
    outline: 2px solid var(--cd-color-primary);
    outline-offset: 2px;
  }

  .cd-chat-stopBar {
    display: flex;
    justify-content: center;
    padding: var(--cd-spacing-extra-tight) 0;
  }

  .cd-chat-stop {
    appearance: none;
    cursor: pointer;
    padding: var(--cd-spacing-extra-tight) var(--cd-spacing-base);
    border: 1px solid var(--cd-color-border);
    border-radius: var(--cd-border-radius-medium);
    background: var(--cd-color-bg-2);
    color: var(--cd-color-text-1);
    font: inherit;
  }

  .cd-chat-stop:focus-visible {
    outline: 2px solid var(--cd-color-primary);
    outline-offset: 2px;
  }

  .cd-chat-topSlot,
  .cd-chat-bottomSlot {
    flex: 0 0 auto;
  }
</style>
