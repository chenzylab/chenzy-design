/**
 * rich-text-input —— 富文本编辑区的内核装配与生命周期（对齐 Semi `richTextInput.tsx`）。
 *
 * Semi 把「tiptap 内核装配 + editorProps + 生命周期回调」单独拆成 richTextInput.tsx，
 * 主文件只负责外壳与业务；本库同样拆出来。
 *
 * 为什么是 `.svelte.ts` 而不是 `.svelte`：
 * Semi 的 RichTextInput 是个真组件，因为 React 里 hooks 只能在组件里用。本库这块
 * **没有自己的标记**（编辑器把 DOM 挂在外部传入的 host 上），全部内容是「一个 $effect
 * 的生命周期」。做成组件反而要凭空造一层 div 破坏 Semi 的 DOM 结构，故改用 rune 模块
 * ——拆分的目的（主文件不再夹带内核装配细节）达到了，DOM 也没多一层。
 *
 * 体积约束（见 spec §0）：@tiptap/core + pm + starter-kit gzip ~126KB，本模块内
 * **全程动态 import**，绝不进主 bundle。本文件顶层只有 `import type`。
 */
import { untrack } from 'svelte';
import type { Editor } from '@tiptap/core';
import type { AIChatInputChangePayload, AIChatInputContent } from '@chenzy-design/core';

export interface RichTextInputOptions {
  /**
   * 编辑器挂载的宿主元素（由调用方 bind:this 取得）。
   * 这是**唯一**应当被 effect 追踪的输入：host 出现即创建、消失即销毁。
   */
  getHost: () => HTMLElement | undefined;
  /**
   * 以下创建期参数一律用 getter 且在内部 untrack 读取——写成裸值会让调用方的
   * effect 追踪它们，任何 prop 变化都重建编辑器、丢掉用户已输入内容。
   */
  getDefaultContent: () => string;
  /** 占位文本；空串表示不显示占位符。 */
  getPlaceholder: () => string;
  /** 仅选中技能时是否仍显示 placeholder。 */
  getShowPlaceholderWhenSkillOnly: () => boolean;
  /** 编辑区 aria-label（已过 i18n）。 */
  getEditorLabel: () => string;
  /** 用户附加的 tiptap extensions。 */
  getExtensions: () => unknown[];
  /** 键盘处理；返回 true 表示已消费、阻断编辑器默认行为。 */
  onKeyDown: (event: KeyboardEvent) => boolean;
  /** 粘贴到编辑区的文件（不改变默认粘贴行为）。 */
  onPasteFiles: (files: File[]) => void;
  /** 编辑区聚焦/失焦。 */
  onFocus: (event: FocusEvent) => void;
  onBlur: (event: FocusEvent) => void;
  /** 空态变化（挂载与每次更新都会回调）。 */
  onEmptyChange: (isEmpty: boolean) => void;
  /** 内容变化。 */
  onContentChange: (payload: AIChatInputChangePayload) => void;
  /** editor 实例创建/销毁通知（销毁时传 undefined）。 */
  onEditorChange: (editor: Editor | undefined) => void;
}

/** 从剪贴板事件抽取文件列表（对齐 Semi onPaste：只旁路通知，不改默认粘贴行为）。 */
export function extractClipboardFiles(event: ClipboardEvent): File[] {
  const items = event.clipboardData?.items;
  if (!items) return [];
  const files: File[] = [];
  for (const item of items) {
    // 不筛 item.kind：getAsFile() 对非文件项本就返回 null，多一层判断反而与原行为不一致。
    const file = item.getAsFile();
    if (file) files.push(file);
  }
  return files;
}

/**
 * 装配并持有富文本编辑器。在组件的 `$effect` 里调用：host 出现即创建，
 * 返回的清理函数销毁实例。
 *
 * 注意：内部对 options 上各 getter 的读取都在异步段之后，且创建只跟 host 走
 * ——占位符/扩展等后续变化不重建编辑器（与 Semi 一致：这些在 tiptap 侧本就是
 * 创建期参数，重建会丢失用户已输入的内容）。
 */
export function mountRichTextInput(options: RichTextInputOptions): (() => void) | undefined {
  const host = options.getHost();
  if (!host) return undefined;

  let ed: Editor | undefined;
  let destroyed = false;

  // 动态 import 整个 editor 内核（gzip ~126KB）+ svelte-tiptap（NodeView 适配）+
  // 各 slot 扩展工厂，像 JsonViewer/MarkdownRender 那样懒加载（内核不进主 bundle）。
  void (async () => {
    const [
      tiptapCore,
      { default: StarterKit },
      { SvelteNodeViewRenderer },
      { createSkillSlotExtension },
      { createSelectSlotExtension },
      { createInputSlotExtension },
      pmState,
      pmView,
      placeholderExt,
      inputSlotPlugins,
      statusExt,
    ] = await Promise.all([
      import('@tiptap/core'),
      import('@tiptap/starter-kit'),
      import('svelte-tiptap'),
      import('./skill-slot-extension.js'),
      import('./select-slot-extension.js'),
      import('./input-slot-extension.js'),
      import('@tiptap/pm/state'),
      import('@tiptap/pm/view'),
      import('./placeholder-extension.js'),
      import('./input-slot-plugins.js'),
      import('./status-extension.js'),
    ]);
    if (destroyed) return;

    const { Editor: TiptapEditor, Node, mergeAttributes, Extension } = tiptapCore;
    const { Plugin, PluginKey, TextSelection } = pmState;
    const pmDeps = { Plugin, PluginKey, TextSelection } as never;
    const inputSlotHandlePaste = inputSlotPlugins.makeHandlePaste(pmDeps);
    // skillSlot / selectSlot / inputSlot 自定义节点始终注册（编辑器需能渲染/序列化这些节点，
    // 且 inputSlot 的光标 plugin 需识别全部 isCustomSlot 节点）；是否用到另由 props/模版决定。
    const skillSlot = createSkillSlotExtension(Node, mergeAttributes, SvelteNodeViewRenderer);
    const selectSlot = createSelectSlotExtension(Node, mergeAttributes, SvelteNodeViewRenderer);
    const inputSlot = createInputSlotExtension(
      Node,
      mergeAttributes,
      SvelteNodeViewRenderer,
      pmDeps,
    );

    // untrack：创建期参数只取当次快照，避免把 placeholder/extensions 变化
    // 也变成 effect 依赖而重建编辑器（会丢用户已输入内容）。
    const placeholderText = untrack(options.getPlaceholder);
    const editorLabel = untrack(options.getEditorLabel);
    const userExtensions = untrack(options.getExtensions);
    const initialContent = untrack(options.getDefaultContent);
    const skillOnlyPlaceholder = untrack(options.getShowPlaceholderWhenSkillOnly);

    ed = new TiptapEditor({
      element: host,
      extensions: [
        StarterKit,
        placeholderExt
          .createPlaceholderExtension(Extension as never, {
            Plugin,
            PluginKey,
            Decoration: pmView.Decoration,
            DecorationSet: pmView.DecorationSet,
          } as never)
          .configure({
            placeholder: placeholderText,
            showPlaceholderWhenSkillOnly: skillOnlyPlaceholder,
          }) as never,
        skillSlot as never,
        selectSlot as never,
        inputSlot as never,
        // 状态扩展（对齐 Semi statusExtension）：在 editor.storage 上挂 allowHotKeySend，
        // 供自定义扩展声明「Enter 被我占用了，别拿去发送」。必须在用户 extensions 之前
        // 注册，否则用户扩展的 onCreate 里读不到该 storage 命名空间。
        statusExt.StatusExtension as never,
        ...(userExtensions as never[]),
      ],
      content: initialContent,
      editorProps: {
        attributes: {
          role: 'textbox',
          'aria-multiline': 'true',
          'aria-label': editorLabel,
        },
        handleKeyDown: (_view, event) => options.onKeyDown(event),
        // inputSlot 的粘贴/文本输入零宽锚点清理（对齐 Semi editorProps）；
        // 粘贴时先抽取剪贴板文件交给 onPaste（不改变默认粘贴行为）。
        handlePaste: (view, event) => {
          const files = extractClipboardFiles(event as ClipboardEvent);
          if (files.length > 0) options.onPasteFiles(files);
          return inputSlotHandlePaste(view, event);
        },
        handleTextInput: inputSlotPlugins.makeHandleTextInput(),
        handleDOMEvents: {
          focus: (_view, event) => {
            options.onFocus(event as FocusEvent);
            return false;
          },
          blur: (_view, event) => {
            options.onBlur(event as FocusEvent);
            return false;
          },
          // IME 合成结束后清理 inputSlot 内残留零宽字符（延迟等 ProseMirror flush composition）。
          compositionend: (view) => {
            setTimeout(() => inputSlotPlugins.handleCompositionEndLogic(view), 60);
            return false;
          },
        },
      },
      onCreate: ({ editor: created }) => {
        options.onEmptyChange(created.isEmpty);
        // 初次挂载补齐零宽锚点（若 defaultContent 含自定义节点）。
        const tr = inputSlotPlugins.handleZeroWidthCharLogic(created.state);
        if (tr) created.view.dispatch(tr);
      },
      onUpdate: ({ editor: updated }) => {
        options.onEmptyChange(updated.isEmpty);
        options.onContentChange({
          text: updated.getText(),
          html: updated.getHTML(),
          json: updated.getJSON(),
        });
      },
    });
    options.onEditorChange(ed);
  })();

  return () => {
    destroyed = true;
    ed?.destroy();
    options.onEditorChange(undefined);
  };
}

/** 供调用方标注 transformer 入参类型时复用。 */
export type { AIChatInputContent };
