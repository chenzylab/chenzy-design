<!--
  AIChatInput — AI 聊天输入框（阶段 1 基础输入 + 阶段 2 引用/建议）。对标 Semi AIChatInput 子集：
  富文本输入（tiptap）+ 发送（sendHotKey / canSend / generating / stop）+ Upload 附件
  + references 引用条 + suggestions 建议浮层 + 自定义渲染插槽（renderTopSlot/renderReference/renderSuggestionItem）。

  关键约束（见 spec §0）：@tiptap/core+pm+starter-kit gzip ~126KB，**动态 import 整个内核**，
  绝不进主 bundle。editor 是命令式实例（需 DOM host + 生命周期），用 $effect 动态 import 后
  new Editor() 创建、赋值给 $state，cleanup 销毁（MVVM 适配命令式库，autofixer「$effect 里
  赋值 $state」建议不适用；同 POC 已验证模式，此处不经 svelte-tiptap store 而直接持有实例）。

  headless 逻辑（canSend/sendHotKey/MessageContent/suggestion 键盘导航/reference 归一）在
  @chenzy-design/core，此处只做渲染 + tiptap 桥接。全 token，类名前缀 cd-，aria-label 走 i18n。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { Editor } from '@tiptap/core';
  import {
    isSendHotKey,
    resolveCanSend,
    buildMessageContent,
    transformDocToContents,
    suggestionContent,
    nextSuggestionIndex,
    referenceLabel,
    isImageReference,
    useDismiss,
    type AIChatInputSendHotKey,
    type AIChatInputMessageContent,
    type AIChatInputContent,
    type AIChatInputChangePayload,
    type AIChatInputAttachment,
    type AIChatInputReference,
    type AIChatInputSuggestion,
  } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';
  import { Upload } from '../upload/index.js';
  import type { UploadFileItem } from '../upload/types.js';

  interface Props {
    /** 初始内容（HTML 或纯文本，tiptap Content）。 */
    defaultContent?: string;
    /** 占位文本（缺省走 locale AIChatInput.placeholder）。 */
    placeholder?: string | undefined;
    /**
     * 是否可发送（对齐 Semi canSend）。未设置时按内容/附件推断；显式设置以此为准。
     */
    canSend?: boolean | undefined;
    /** 生成中：发送按钮变停止按钮，Enter 不发送。 */
    generating?: boolean;
    /** 发送快捷键：enter（默认）/ shift+enter。 */
    sendHotKey?: AIChatInputSendHotKey;
    /** 是否展示上传按钮。 */
    showUploadButton?: boolean;
    /** 透传给内部 Upload 的 props。 */
    uploadProps?: Record<string, unknown> | undefined;
    /** 圆角样式（对齐 Semi round）。 */
    round?: boolean;
    /** 附加 tiptap extensions（阶段 1 追加到 StarterKit 之后）。 */
    extensions?: unknown[];
    /** 富文本节点归一覆盖（对齐 Semi transformer）。 */
    transformer?: Map<string, (node: unknown) => AIChatInputContent> | undefined;
    /** 内容变化回调。 */
    onContentChange?: ((payload: AIChatInputChangePayload) => void) | undefined;
    /** 发送回调，载荷对齐 Semi MessageContent。 */
    onMessageSend?: ((message: AIChatInputMessageContent) => void) | undefined;
    /** 停止生成回调。 */
    onStopGenerate?: (() => void) | undefined;
    /** 上传附件变化回调。 */
    onUploadChange?: ((attachments: AIChatInputAttachment[]) => void) | undefined;
    /** 自定义发送/停止按钮区渲染（对齐 Semi renderActionArea 子集）。 */
    renderActionArea?: Snippet<[{ canSend: boolean; generating: boolean }]> | undefined;
    // —— 阶段 2 · 引用 ——
    /** 受控引用列表，渲染于编辑区上方 top area（对齐 Semi references）。 */
    references?: AIChatInputReference[];
    /** 是否展示引用条（对齐 Semi showReference，默认 true）。 */
    showReference?: boolean;
    /** 自定义单条引用渲染（对齐 Semi renderReference）。 */
    renderReference?: Snippet<[AIChatInputReference]> | undefined;
    /** 引用点击回调。 */
    onReferenceClick?: ((reference: AIChatInputReference) => void) | undefined;
    /** 引用删除回调。 */
    onReferenceDelete?: ((reference: AIChatInputReference) => void) | undefined;
    // —— 阶段 2 · 建议 ——
    /** 建议列表：聚焦空编辑区时弹出面板（对齐 Semi suggestions）。 */
    suggestions?: AIChatInputSuggestion[];
    /** 自定义单条建议渲染（对齐 Semi renderSuggestionItem）。 */
    renderSuggestionItem?: Snippet<[{ suggestion: AIChatInputSuggestion; active: boolean }]> | undefined;
    /**
     * 建议点击/选中回调。未提供时默认把建议文本 setContent 进编辑器。
     * 提供时以回调为准（不再默认插入）。
     */
    onSuggestClick?: ((suggestion: AIChatInputSuggestion) => void) | undefined;
    // —— 阶段 2 · top 插槽 ——
    /** 自定义 top slot 渲染（对齐 Semi renderTopSlot）。 */
    renderTopSlot?: Snippet<[{ references: AIChatInputReference[]; attachments: AIChatInputAttachment[] }]> | undefined;
    /** top slot 相对引用条的位置（对齐 Semi topSlotPosition，默认 top）。 */
    topSlotPosition?: 'top' | 'bottom';
    /** 附加类名。 */
    class?: string;
    /** 内联样式。 */
    style?: string;
  }

  let {
    defaultContent = '',
    placeholder,
    canSend,
    generating = false,
    sendHotKey = 'enter',
    showUploadButton = true,
    uploadProps,
    round = false,
    extensions = [],
    transformer,
    onContentChange,
    onMessageSend,
    onStopGenerate,
    onUploadChange,
    renderActionArea,
    references = [],
    showReference = true,
    renderReference,
    onReferenceClick,
    onReferenceDelete,
    suggestions = [],
    renderSuggestionItem,
    onSuggestClick,
    renderTopSlot,
    topSlotPosition = 'top',
    class: className = '',
    style,
  }: Props = $props();

  const loc = useLocale();

  // tiptap editor 命令式实例：动态 import 内核后创建，store.subscribe 桥接进 runes。
  let editor = $state<Editor>();
  let isEmpty = $state(true);
  let attachments = $state<AIChatInputAttachment[]>([]);
  let editorHost = $state<HTMLDivElement>();
  let rootEl = $state<HTMLDivElement>();

  // —— 建议面板状态（阶段 2）——
  let suggestionOpen = $state(false);
  let activeSuggestionIndex = $state(-1);

  const placeholderText = $derived(placeholder ?? loc().t('AIChatInput.placeholder'));

  // 当前是否可发送（headless 判定；显式 canSend 优先）。
  const computedCanSend = $derived(
    resolveCanSend({ canSend, isEmpty, attachments }),
  );

  // 建议面板可见性：显式 open 且有建议项。空编辑区聚焦/点击时开，选中/失焦/Esc 时关。
  const showSuggestionPanel = $derived(suggestionOpen && suggestions.length > 0);
  // top area 是否有内容（引用条 / topSlot），无则不渲染容器。
  const hasReferences = $derived(showReference && references.length > 0);
  const hasTopSlot = $derived(!!renderTopSlot);

  // —— tiptap 内核动态 import + editor 生命周期（体积约束：内核不进主 bundle）——
  $effect(() => {
    const host = editorHost;
    if (!host) return;

    let ed: Editor | undefined;
    let destroyed = false;

    // 动态 import 整个 editor 内核（gzip ~126KB），像 JsonViewer/MarkdownRender 那样懒加载。
    void (async () => {
      const [{ Editor: TiptapEditor }, { default: StarterKit }, { Placeholder }] = await Promise.all([
        import('@tiptap/core'),
        import('@tiptap/starter-kit'),
        import('@tiptap/extensions'),
      ]);
      if (destroyed) return;

      ed = new TiptapEditor({
        element: host,
        extensions: [
          StarterKit,
          Placeholder.configure({ placeholder: placeholderText }),
          ...(extensions as never[]),
        ],
        content: defaultContent,
        editorProps: {
          attributes: {
            role: 'textbox',
            'aria-multiline': 'true',
            'aria-label': loc().t('AIChatInput.editor'),
          },
          handleKeyDown: (_view, event) => handleEditorKeyDown(event),
          handleDOMEvents: {
            // 聚焦编辑区且有建议项时弹出建议面板（对齐 Semi：点击/聚焦即开）。
            focus: () => {
              openSuggestions();
              return false;
            },
          },
        },
        onCreate: ({ editor: created }) => {
          isEmpty = created.isEmpty;
        },
        onUpdate: ({ editor: updated }) => {
          isEmpty = updated.isEmpty;
          onContentChange?.({
            text: updated.getText(),
            html: updated.getHTML(),
            json: updated.getJSON(),
          });
        },
      });
      editor = ed;
    })();

    return () => {
      destroyed = true;
      ed?.destroy();
      editor = undefined;
    };
  });

  // 编辑区 keydown：建议面板可见时先拦截 ↑↓/Enter/Esc 用于面板导航（返回 true 阻断编辑器默认）；
  // 否则走发送快捷键判定（generating/IME 中不发送）。返回 true = 已处理，tiptap 停止默认行为。
  function handleEditorKeyDown(event: KeyboardEvent): boolean {
    if (event.isComposing) return false;

    if (showSuggestionPanel) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        activeSuggestionIndex = nextSuggestionIndex(
          activeSuggestionIndex,
          suggestions.length,
          event.key === 'ArrowDown' ? 1 : -1,
        );
        return true;
      }
      if (event.key === 'Enter') {
        const picked = suggestions[activeSuggestionIndex];
        if (picked !== undefined) {
          selectSuggestion(picked);
          return true;
        }
        // 未高亮任何项时 Enter 落到发送判定。
      }
      if (event.key === 'Escape') {
        closeSuggestions();
        return true;
      }
    }

    if (event.key !== 'Enter') return false;
    if (generating) return false;
    if (!isSendHotKey(event.key, event.shiftKey, sendHotKey)) return false;
    event.preventDefault();
    doSend();
    return true;
  }

  function doSend(): void {
    if (generating || !computedCanSend || !editor) return;
    const inputContents = transformDocToContents(editor.getJSON(), transformer);
    const message = buildMessageContent({ inputContents, attachments, references });
    onMessageSend?.(message);
  }

  // —— 建议面板（阶段 2）——
  function openSuggestions(): void {
    if (suggestions.length === 0) return;
    suggestionOpen = true;
    activeSuggestionIndex = -1;
  }
  function closeSuggestions(): void {
    suggestionOpen = false;
    activeSuggestionIndex = -1;
  }
  function selectSuggestion(suggestion: AIChatInputSuggestion): void {
    closeSuggestions();
    if (onSuggestClick) {
      onSuggestClick(suggestion);
    } else {
      // 默认行为：把建议文本填入编辑器并聚焦。
      editor?.commands.setContent(suggestionContent(suggestion));
      editor?.commands.focus('end');
    }
  }

  // —— 引用条（阶段 2）——
  function handleReferenceClick(reference: AIChatInputReference): void {
    onReferenceClick?.(reference);
  }
  function handleReferenceDelete(reference: AIChatInputReference, event: MouseEvent): void {
    event.stopPropagation();
    onReferenceDelete?.(reference);
  }

  // 点击外部关闭建议面板（Esc 已在编辑区 keydown 处理）。
  $effect(() => {
    if (!showSuggestionPanel || !rootEl) return;
    return useDismiss(rootEl, {
      escape: false,
      onDismiss: () => closeSuggestions(),
    });
  });

  function handleActionClick(): void {
    if (generating) {
      onStopGenerate?.();
      return;
    }
    doSend();
  }

  function handleAttachmentChange(list: UploadFileItem[]): void {
    attachments = list as unknown as AIChatInputAttachment[];
    onUploadChange?.(attachments);
  }

  // —— ref 方法（对齐 Semi Methods 子集）——
  export function setContent(next: string): void {
    editor?.commands.setContent(next);
  }
  export function focusEditor(): void {
    editor?.commands.focus();
  }
  export function getText(): string {
    return editor?.getText() ?? '';
  }
  export function getHTML(): string {
    return editor?.getHTML() ?? '';
  }
  export function getEditor(): Editor | undefined {
    return editor;
  }
  export function clearContent(): void {
    editor?.commands.clearContent(true);
  }
</script>

<div
  class="cd-ai-chat-input {className}"
  class:cd-ai-chat-input--round={round}
  {style}
  bind:this={rootEl}
>
  {#if hasReferences || hasTopSlot}
    <div class="cd-ai-chat-input-top">
      {#if hasTopSlot && topSlotPosition === 'top'}
        {@render renderTopSlot?.({ references, attachments })}
      {/if}
      {#if hasReferences}
        <div class="cd-ai-chat-input-references">
          {#each references as reference (reference.id)}
            {#if renderReference}
              {@render renderReference(reference)}
            {:else}
              <!-- chip 容器本身非交互（避免 nested-interactive）；名称按钮与删除按钮平级。 -->
              <div class="cd-ai-chat-input-reference">
                <button
                  type="button"
                  class="cd-ai-chat-input-reference-main"
                  onclick={() => handleReferenceClick(reference)}
                >
                  {#if isImageReference(reference)}
                    <img class="cd-ai-chat-input-reference-img" src={reference.url} alt="" />
                  {/if}
                  <span class="cd-ai-chat-input-reference-name">{referenceLabel(reference)}</span>
                </button>
                <button
                  type="button"
                  class="cd-ai-chat-input-reference-delete"
                  aria-label={loc().t('AIChatInput.deleteReference')}
                  onclick={(e) => handleReferenceDelete(reference, e)}
                >
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" aria-hidden="true">
                    <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                  </svg>
                </button>
              </div>
            {/if}
          {/each}
        </div>
      {/if}
      {#if hasTopSlot && topSlotPosition === 'bottom'}
        {@render renderTopSlot?.({ references, attachments })}
      {/if}
    </div>
  {/if}

  <div class="cd-ai-chat-input-editor-wrap">
    <div class="cd-ai-chat-input-editor" bind:this={editorHost}></div>

    {#if showSuggestionPanel}
      <div class="cd-ai-chat-input-suggestions" role="listbox" aria-label={loc().t('AIChatInput.suggestions')}>
        {#each suggestions as suggestion, i (suggestionContent(suggestion) + i)}
          <div
            class="cd-ai-chat-input-suggestion"
            class:cd-ai-chat-input-suggestion--active={i === activeSuggestionIndex}
            role="option"
            aria-selected={i === activeSuggestionIndex}
            tabindex="-1"
            onmousedown={(e) => {
              // mousedown 而非 click：避免编辑器先 blur 触发 useDismiss 关闭面板。
              e.preventDefault();
              selectSuggestion(suggestion);
            }}
            onmouseenter={() => (activeSuggestionIndex = i)}
          >
            {#if renderSuggestionItem}
              {@render renderSuggestionItem({ suggestion, active: i === activeSuggestionIndex })}
            {:else}
              {suggestionContent(suggestion)}
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <div class="cd-ai-chat-input-footer">
    {#if showUploadButton}
      <div class="cd-ai-chat-input-upload">
        <Upload
          listType="picture-card"
          multiple
          {...uploadProps}
          onChange={handleAttachmentChange}
        >
          <span class="cd-ai-chat-input-upload-trigger" aria-label={loc().t('AIChatInput.upload')}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
              <path
                d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M12 3v13m0-13-4 4m4-4 4 4"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
        </Upload>
      </div>
    {/if}

    <div class="cd-ai-chat-input-action">
      {#if renderActionArea}
        {@render renderActionArea({ canSend: computedCanSend, generating })}
      {:else}
        <button
          type="button"
          class="cd-ai-chat-input-send"
          class:cd-ai-chat-input-send--stop={generating}
          disabled={!generating && !computedCanSend}
          onclick={handleActionClick}
          title={generating ? loc().t('AIChatInput.stop') : loc().t('AIChatInput.send')}
          aria-label={generating ? loc().t('AIChatInput.stop') : loc().t('AIChatInput.send')}
        >
          {#if generating}
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" />
            </svg>
          {:else}
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
              <path
                d="M12 20V5m0 0-6 6m6-6 6 6"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          {/if}
        </button>
      {/if}
    </div>
  </div>
</div>

<style>
  .cd-ai-chat-input {
    display: flex;
    flex-direction: column;
    gap: var(--cd-ai-chat-input-gap);
    padding: var(--cd-ai-chat-input-padding);
    background: var(--cd-ai-chat-input-bg);
    border: 1px solid var(--cd-ai-chat-input-border);
    border-radius: var(--cd-ai-chat-input-radius);
    transition: border-color var(--cd-ai-chat-input-motion-duration) ease;
  }

  .cd-ai-chat-input--round {
    border-radius: var(--cd-ai-chat-input-radius-round);
  }

  .cd-ai-chat-input:focus-within {
    border-color: var(--cd-ai-chat-input-border-focus);
  }

  /* —— top area · 引用条 / topSlot（阶段 2）—— */
  .cd-ai-chat-input-top {
    display: flex;
    flex-direction: column;
    gap: var(--cd-ai-chat-input-gap);
  }

  .cd-ai-chat-input-references {
    display: flex;
    flex-wrap: wrap;
    gap: var(--cd-ai-chat-input-gap);
  }

  .cd-ai-chat-input-reference {
    display: inline-flex;
    align-items: center;
    gap: var(--cd-spacing-extra-tight);
    max-width: 100%;
    padding: var(--cd-spacing-extra-tight) var(--cd-spacing-tight);
    background: var(--cd-ai-chat-input-reference-bg);
    color: var(--cd-ai-chat-input-reference-color);
    border-radius: var(--cd-ai-chat-input-reference-radius);
    transition: background var(--cd-ai-chat-input-motion-duration) ease;
  }

  .cd-ai-chat-input-reference:hover {
    background: var(--cd-ai-chat-input-reference-bg-hover);
  }

  /* chip 内的名称按钮：无边框透明，负责图标+名称布局与点击。 */
  .cd-ai-chat-input-reference-main {
    appearance: none;
    border: none;
    background: transparent;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: var(--cd-spacing-extra-tight);
    min-width: 0;
    max-width: 100%;
    padding: 0;
    color: inherit;
    font: inherit;
  }

  .cd-ai-chat-input-reference-main:focus-visible {
    outline: 2px solid var(--cd-color-primary);
    outline-offset: 2px;
  }

  .cd-ai-chat-input-reference-img {
    width: 20px;
    height: 20px;
    object-fit: cover;
    border-radius: var(--cd-border-radius-small);
  }

  .cd-ai-chat-input-reference-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: var(--cd-font-size-regular);
  }

  .cd-ai-chat-input-reference-delete {
    appearance: none;
    border: none;
    background: transparent;
    cursor: pointer;
    display: inline-flex;
    padding: 0;
    color: var(--cd-ai-chat-input-action-icon);
  }

  .cd-ai-chat-input-reference-delete:hover {
    color: var(--cd-ai-chat-input-action-icon-hover);
  }

  .cd-ai-chat-input-reference-delete:focus-visible {
    outline: 2px solid var(--cd-color-primary);
    outline-offset: 1px;
  }

  /* —— 建议浮层面板（阶段 2）—— */
  .cd-ai-chat-input-editor-wrap {
    position: relative;
  }

  .cd-ai-chat-input-suggestions {
    position: absolute;
    left: 0;
    right: 0;
    top: calc(100% + var(--cd-spacing-extra-tight));
    z-index: 10;
    max-height: 270px;
    overflow-y: auto;
    padding: var(--cd-spacing-extra-tight);
    background: var(--cd-ai-chat-input-suggestions-bg);
    border-radius: var(--cd-ai-chat-input-suggestions-radius);
    box-shadow: var(--cd-ai-chat-input-suggestions-shadow);
  }

  .cd-ai-chat-input-suggestion {
    padding: var(--cd-spacing-tight);
    border-radius: var(--cd-ai-chat-input-reference-radius);
    color: var(--cd-ai-chat-input-suggestion-color);
    cursor: pointer;
  }

  .cd-ai-chat-input-suggestion--active {
    background: var(--cd-ai-chat-input-suggestion-bg-active);
  }

  .cd-ai-chat-input-editor {
    min-height: var(--cd-ai-chat-input-editor-min-height);
    max-height: var(--cd-ai-chat-input-editor-max-height);
    overflow-y: auto;
    color: var(--cd-ai-chat-input-color);
    font: inherit;
    line-height: 1.5;
  }

  /* tiptap ProseMirror 编辑区：去默认 outline，占位符用 data 属性伪元素。 */
  .cd-ai-chat-input-editor :global(.ProseMirror) {
    outline: none;
    min-height: inherit;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .cd-ai-chat-input-editor :global(.ProseMirror p) {
    margin: 0;
  }

  .cd-ai-chat-input-editor :global(.ProseMirror p.is-editor-empty:first-child::before) {
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
    color: var(--cd-ai-chat-input-placeholder-color);
  }

  .cd-ai-chat-input-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--cd-ai-chat-input-gap);
  }

  .cd-ai-chat-input-upload {
    display: inline-flex;
  }

  .cd-ai-chat-input-action {
    display: inline-flex;
    align-items: center;
    gap: var(--cd-ai-chat-input-gap);
    margin-inline-start: auto;
  }

  .cd-ai-chat-input-upload-trigger,
  .cd-ai-chat-input-send {
    appearance: none;
    border: none;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: var(--cd-ai-chat-input-action-padding);
    border-radius: var(--cd-ai-chat-input-action-radius);
    transition:
      color var(--cd-ai-chat-input-motion-duration) ease,
      background var(--cd-ai-chat-input-motion-duration) ease;
  }

  .cd-ai-chat-input-upload-trigger {
    background: transparent;
    color: var(--cd-ai-chat-input-action-icon);
  }

  .cd-ai-chat-input-upload-trigger:hover {
    color: var(--cd-ai-chat-input-action-icon-hover);
  }

  .cd-ai-chat-input-send {
    background: var(--cd-ai-chat-input-send-bg);
    color: var(--cd-ai-chat-input-send-icon);
  }

  .cd-ai-chat-input-send:hover:not(:disabled) {
    background: var(--cd-ai-chat-input-send-bg-hover);
  }

  .cd-ai-chat-input-send--stop {
    background: var(--cd-ai-chat-input-stop-bg);
  }

  .cd-ai-chat-input-send:disabled {
    background: var(--cd-ai-chat-input-send-bg-disabled);
    color: var(--cd-ai-chat-input-send-icon-disabled);
    cursor: not-allowed;
  }

  .cd-ai-chat-input-upload-trigger:focus-visible,
  .cd-ai-chat-input-send:focus-visible {
    outline: 2px solid var(--cd-color-primary);
    outline-offset: 2px;
  }
</style>
