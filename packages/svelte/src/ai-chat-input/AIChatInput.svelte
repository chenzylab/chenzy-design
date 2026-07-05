<!--
  AIChatInput — AI 聊天输入框（阶段 1 · 基础输入）。对标 Semi AIChatInput 子集：
  富文本输入（tiptap）+ 发送（sendHotKey / canSend / generating / stop）+ Upload 附件。

  关键约束（见 spec §0）：@tiptap/core+pm+starter-kit gzip ~126KB，**动态 import 整个内核**，
  绝不进主 bundle。editor 是命令式实例（需 DOM host + 生命周期），用 $effect 动态 import 后
  new Editor() 创建、赋值给 $state，cleanup 销毁（MVVM 适配命令式库，autofixer「$effect 里
  赋值 $state」建议不适用；同 POC 已验证模式，此处不经 svelte-tiptap store 而直接持有实例）。

  headless 逻辑（canSend/sendHotKey/MessageContent 组装）在 @chenzy-design/core，此处只做渲染 + tiptap 桥接。
  全 token，类名前缀 cd-，aria-label 走 i18n。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { Editor } from '@tiptap/core';
  import {
    isSendHotKey,
    resolveCanSend,
    buildMessageContent,
    transformDocToContents,
    type AIChatInputSendHotKey,
    type AIChatInputMessageContent,
    type AIChatInputContent,
    type AIChatInputChangePayload,
    type AIChatInputAttachment,
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
    class: className = '',
    style,
  }: Props = $props();

  const loc = useLocale();

  // tiptap editor 命令式实例：动态 import 内核后创建，store.subscribe 桥接进 runes。
  let editor = $state<Editor>();
  let isEmpty = $state(true);
  let attachments = $state<AIChatInputAttachment[]>([]);
  let editorHost = $state<HTMLDivElement>();

  const placeholderText = $derived(placeholder ?? loc().t('AIChatInput.placeholder'));

  // 当前是否可发送（headless 判定；显式 canSend 优先）。
  const computedCanSend = $derived(
    resolveCanSend({ canSend, isEmpty, attachments }),
  );

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

  // Enter 键：generating / IME 组字中不发送；命中 sendHotKey 则发送并阻止默认换行。
  function handleEditorKeyDown(event: KeyboardEvent): boolean {
    if (event.key !== 'Enter' || event.isComposing) return false;
    if (generating) return false;
    if (!isSendHotKey(event.key, event.shiftKey, sendHotKey)) return false;
    event.preventDefault();
    doSend();
    return true;
  }

  function doSend(): void {
    if (generating || !computedCanSend || !editor) return;
    const inputContents = transformDocToContents(editor.getJSON(), transformer);
    const message = buildMessageContent({ inputContents, attachments });
    onMessageSend?.(message);
  }

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
>
  <div class="cd-ai-chat-input-editor" bind:this={editorHost}></div>

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
