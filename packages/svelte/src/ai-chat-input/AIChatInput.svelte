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
    isImageType,
    getAttachmentType,
    getContentType,
    skillLabel,
    getSkillSlotHTML,
    shouldOpenSkillPanel,
    setConfigureField,
    removeConfigureField,
    useDismiss,
    type AIChatInputSendHotKey,
    type AIChatInputMessageContent,
    type AIChatInputContent,
    type AIChatInputChangePayload,
    type AIChatInputAttachment,
    type AIChatInputReference,
    type AIChatInputSuggestion,
    type AIChatInputSkill,
    type AIChatInputConfigureValue,
  } from '@chenzy-design/core';
  import {
    IconArrowUp,
    IconClose,
    IconCode,
    IconCrossStroked,
    IconExcel,
    IconFile,
    IconMusic,
    IconPaperclip,
    IconPdf,
    IconSendMsgStroked,
    IconStop,
    IconTemplateStroked,
    IconVideo,
    IconWord,
  } from '@chenzy-design/icons';
  import { useLocale } from '../locale-provider/index.js';
  import { Upload } from '../upload/index.js';
  // 复用现有组件：Semi renderAttachment 用 Progress type=circle 显示上传进度，本库同样复用。
  import { Progress } from '../progress/index.js';
  import AIChatInputHorizontalScroller from './AIChatInputHorizontalScroller.svelte';
  // Semi 把技能/建议单项拆成 skillItem.tsx / suggestionItem.tsx，本库同样拆分。
  import AIChatInputSkillItem from './AIChatInputSkillItem.svelte';
  import AIChatInputSuggestionItem from './AIChatInputSuggestionItem.svelte';
  import type { UploadFileItem } from '../upload/types.js';
  import { untrack } from 'svelte';
  import { setConfigureContext } from './configure-context.js';

  interface Props {
    /** 初始内容（HTML 或纯文本，tiptap Content）。 */
    defaultContent?: string;
    /** 占位文本（对齐 Semi：无内置默认文案，不传则不显示）。 */
    placeholder?: string | undefined;
    /**
     * 仅选中技能（无其他内容）时是否仍显示 placeholder（对齐 Semi showPlaceholderWhenSkillOnly）。
     * 开启后 placeholder 显示在 skill 后方。
     */
    showPlaceholderWhenSkillOnly?: boolean;
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
    /**
     * 自定义单条建议渲染（对齐 Semi renderSuggestionItem）：**整项替换**，
     * 入参逐字段对齐 Semi RenderSuggestionItemProps —— 消费方需自己渲染根节点并挂上
     * className / onClick / onMouseEnter。
     */
    renderSuggestionItem?:
      | Snippet<
          [
            {
              suggestion: AIChatInputSuggestion;
              className: string;
              onClick: () => void;
              onMouseEnter: () => void;
            },
          ]
        >
      | undefined;
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
    // —— 阶段 3 · 技能 + 模版 ——
    /** 技能列表：空编辑区按 skillHotKey 弹出面板，选中后插入 skillSlot 节点（对齐 Semi skills）。 */
    skills?: AIChatInputSkill[];
    /** 触发技能面板的按键（对齐 Semi skillHotKey，默认 '/'）。 */
    skillHotKey?: string;
    /**
     * 自定义单条技能渲染（对齐 Semi renderSkillItem）：**整项替换**，
     * 入参逐字段对齐 Semi RenderSkillItemProps。
     */
    renderSkillItem?:
      | Snippet<
          [
            {
              skill: AIChatInputSkill;
              className: string;
              onClick: () => void;
              onMouseEnter: () => void;
            },
          ]
        >
      | undefined;
    /** 技能选中回调。 */
    onSkillChange?: ((skill: AIChatInputSkill) => void) | undefined;
    /**
     * 模版面板渲染（对齐 Semi renderTemplate）：当前技能 hasTemplate 时，点击模版按钮弹出，
     * 参数 (skill, setContent)——调 setContent 把模版内容填入编辑器。
     */
    renderTemplate?: Snippet<[{ skill: AIChatInputSkill; setContent: (html: string) => void }]> | undefined;
    /** 是否展示模版按钮（对齐 Semi showTemplateButton，默认 true；仅当前技能 hasTemplate 时生效）。 */
    showTemplateButton?: boolean;
    /** 模版面板显隐变化回调。 */
    onTemplateVisibleChange?: ((visible: boolean) => void) | undefined;
    // —— 阶段 4 · 配置区 ——
    /**
     * 配置区渲染（对齐 Semi renderConfigureArea）：渲染于 footer 左侧。里面放
     * AIChatInputConfigureSelect/Button/RadioButton 等（经 configure context 绑定），
     * 其值发送时并入 MessageContent.setup。
     */
    renderConfigureArea?: Snippet | undefined;
    /** 配置区初始值（对齐 Semi Configure defaultValue）。 */
    configureDefaultValue?: AIChatInputConfigureValue;
    /** 配置区变更回调（value 为全量，changed 为本次变更字段，对齐 Semi onConfigureChange）。 */
    onConfigureChange?: ((value: AIChatInputConfigureValue, changed: AIChatInputConfigureValue) => void) | undefined;
    // —— 补齐 Semi 剩余 props ——
    /** 是否在 top area 展示上传附件列表（对齐 Semi showUploadFile，默认 true）。 */
    showUploadFile?: boolean;
    /**
     * 自定义上传按钮 UI（对齐 Semi renderUploadButton），保留内置上传/粘贴逻辑。
     * 参数 defaultNode=默认按钮、openFileDialog=打开文件选择、disabled、attachments。
     */
    renderUploadButton?:
      | Snippet<
          [
            {
              openFileDialog: () => void;
              disabled: boolean;
              attachments: AIChatInputAttachment[];
            },
          ]
        >
      | undefined;
    /** generating 从 false→true 时清空输入（对齐 Semi clearContentOnGenerating，默认 true）。 */
    clearContentOnGenerating?: boolean;
    /** 编辑区聚焦回调。 */
    onFocus?: ((event: FocusEvent) => void) | undefined;
    /** 编辑区失焦回调。 */
    onBlur?: ((event: FocusEvent) => void) | undefined;
    /** 粘贴回调（携带粘贴的文件，对齐 Semi onPaste；不改变默认粘贴行为）。 */
    onPaste?: ((files: File[]) => void) | undefined;
    /** 附加类名。 */
    class?: string;
    /** 内联样式。 */
    style?: string;
  }

  let {
    defaultContent = '',
    placeholder,
    showPlaceholderWhenSkillOnly = false,
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
    skills = [],
    skillHotKey = '/',
    renderSkillItem,
    onSkillChange,
    renderTemplate,
    showTemplateButton = true,
    onTemplateVisibleChange,
    renderConfigureArea,
    configureDefaultValue,
    onConfigureChange,
    showUploadFile = true,
    renderUploadButton,
    clearContentOnGenerating = true,
    onFocus,
    onBlur,
    onPaste,
    class: className = '',
    style,
  }: Props = $props();

  const loc = useLocale();

  // tiptap editor 命令式实例：动态 import 内核后创建，store.subscribe 桥接进 runes。
  let editor = $state<Editor>();
  let isEmpty = $state(true);
  // 初值取 uploadProps.defaultFileList（对齐 Semi：
  // `const defaultAttachment = props?.uploadProps?.defaultFileList ?? []`）。
  // untrack：只吃初始值，后续变化归 Upload 的 onChange 驱动。
  let attachments = $state<AIChatInputAttachment[]>(
    untrack(() => (uploadProps?.defaultFileList as AIChatInputAttachment[] | undefined) ?? []),
  );
  let editorHost = $state<HTMLDivElement>();
  let rootEl = $state<HTMLDivElement>();

  // —— 建议面板状态（阶段 2）——
  let suggestionOpen = $state(false);
  let activeSuggestionIndex = $state(-1);

  // —— 技能面板 / 模版状态（阶段 3）——
  let skillPanelOpen = $state(false);
  let activeSkillIndex = $state(-1);
  // 当前已选技能（决定是否展示模版按钮）。
  let currentSkill = $state<AIChatInputSkill>();
  let templateOpen = $state(false);

  // —— 配置区状态（阶段 4）：value 供 Configure 子组件经 context 读写，发送时并入 setup ——
  // 只取初始值（untrack 表明有意不追踪后续 prop 变化——配置区值由内部/onConfigureChange 管理）。
  let configureValue = $state<AIChatInputConfigureValue>(
    untrack(() => ({ ...(configureDefaultValue ?? {}) })),
  );
  setConfigureContext({
    getValue: () => configureValue,
    setField: (patch, init = false) => {
      configureValue = setConfigureField(configureValue, patch);
      if (!init) onConfigureChange?.(configureValue, patch);
    },
    removeField: (field) => {
      configureValue = removeConfigureField(configureValue, field);
    },
  });

  // 严格对齐 Semi：placeholder 原样透传，**无内置兜底文案**
  // （Semi aiChatInput/index.tsx:637 直接 `placeholder={placeholder}`，defaultProps 未含该项，
  //  且 Semi 的 AIChatInput locale 只有 template/configure/selected 三个键、无 placeholder）。
  const placeholderText = $derived(placeholder ?? '');

  // 当前是否可发送（headless 判定；显式 canSend 优先）。
  const computedCanSend = $derived(
    resolveCanSend({ canSend, isEmpty, attachments }),
  );

  // 建议面板可见性：显式 open 且有建议项。空编辑区聚焦/点击时开，选中/失焦/Esc 时关。
  const showSuggestionPanel = $derived(suggestionOpen && suggestions.length > 0);
  // 技能面板可见性：显式 open 且有技能项（skillHotKey 触发）。
  const showSkillPanel = $derived(skillPanelOpen && skills.length > 0);
  // 模版按钮可见性：开关开、有 renderTemplate、当前技能 hasTemplate。
  const showTemplate = $derived(
    showTemplateButton && !!renderTemplate && !!currentSkill?.hasTemplate,
  );
  // top area 是否有内容（引用条 / topSlot / 附件列表），无则不渲染容器。
  const hasReferences = $derived(showReference && references.length > 0);
  const hasTopSlot = $derived(!!renderTopSlot);
  const hasAttachments = $derived(showUploadFile && attachments.length > 0);

  // clearContentOnGenerating：generating false→true 边沿时清空输入（对齐 Semi）。
  let prevGenerating = untrack(() => generating);
  $effect(() => {
    const now = generating;
    if (clearContentOnGenerating && now && !untrack(() => prevGenerating)) {
      editor?.commands.clearContent(true);
    }
    prevGenerating = now;
  });

  // —— tiptap 内核动态 import + editor 生命周期（体积约束：内核不进主 bundle）——
  $effect(() => {
    const host = editorHost;
    if (!host) return;

    let ed: Editor | undefined;
    let destroyed = false;

    // 动态 import 整个 editor 内核（gzip ~126KB）+ svelte-tiptap（NodeView 适配）+
    // skillSlot 扩展工厂，像 JsonViewer/MarkdownRender 那样懒加载（内核不进主 bundle）。
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
              showPlaceholderWhenSkillOnly,
            }) as never,
          skillSlot as never,
          selectSlot as never,
          inputSlot as never,
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
          // inputSlot 的粘贴/文本输入零宽锚点清理（对齐 Semi editorProps）；
          // 粘贴时先抽取剪贴板文件交给 onPaste（不改变默认粘贴行为）。
          handlePaste: (view, event) => {
            const files = extractClipboardFiles(event as ClipboardEvent);
            if (files.length > 0) onPaste?.(files);
            return inputSlotHandlePaste(view, event);
          },
          handleTextInput: inputSlotPlugins.makeHandleTextInput(),
          handleDOMEvents: {
            // 聚焦编辑区且有建议项时弹出建议面板（对齐 Semi：点击/聚焦即开）+ onFocus 回调。
            focus: (_view, event) => {
              openSuggestions();
              onFocus?.(event as FocusEvent);
              return false;
            },
            blur: (_view, event) => {
              onBlur?.(event as FocusEvent);
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
          isEmpty = created.isEmpty;
          // 初次挂载补齐零宽锚点（若 defaultContent 含自定义节点）。
          const tr = inputSlotPlugins.handleZeroWidthCharLogic(created.state);
          if (tr) created.view.dispatch(tr);
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

    // 空编辑区按下 skillHotKey → 弹技能面板（对齐 Semi）。
    if (!showSkillPanel && shouldOpenSkillPanel({
      key: event.key,
      skillHotKey,
      isEmpty,
      skillCount: skills.length,
    })) {
      openSkillPanel();
      return true;
    }

    if (showSkillPanel) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        activeSkillIndex = nextSuggestionIndex(
          activeSkillIndex,
          skills.length,
          event.key === 'ArrowDown' ? 1 : -1,
        );
        return true;
      }
      if (event.key === 'Enter') {
        const picked = skills[activeSkillIndex];
        if (picked !== undefined) {
          selectSkill(picked);
          return true;
        }
      }
      if (event.key === 'Escape') {
        closeSkillPanel();
        return true;
      }
    }

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
    // 配置区值并入 setup（对齐 Semi getConfigureValue → MessageContent.setup）。
    const message = buildMessageContent({
      inputContents,
      attachments,
      references,
      setup: configureValue,
    });
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

  // —— 技能面板 / 模版（阶段 3）——
  function openSkillPanel(): void {
    if (skills.length === 0) return;
    skillPanelOpen = true;
    activeSkillIndex = 0;
    // 打开技能面板时先关掉建议面板，避免两个浮层叠加。
    closeSuggestions();
  }
  function closeSkillPanel(): void {
    skillPanelOpen = false;
    activeSkillIndex = -1;
  }
  function selectSkill(skill: AIChatInputSkill): void {
    closeSkillPanel();
    currentSkill = skill;
    onSkillChange?.(skill);
    // 把技能作为 skillSlot 节点插入编辑器（对齐 Semi setContent(getSkillSlotString)）。
    editor?.commands.setContent(getSkillSlotHTML(skill));
    editor?.commands.focus('end');
  }
  function toggleTemplate(): void {
    setTemplateVisible(!templateOpen);
  }
  function setTemplateVisible(visible: boolean): void {
    if (templateOpen === visible) return;
    templateOpen = visible;
    onTemplateVisibleChange?.(visible);
  }
  // 模版面板里 renderTemplate 回调用的 setContent（填入模版内容并关闭面板）。
  function applyTemplate(html: string): void {
    editor?.commands.setContent(html);
    editor?.commands.focus('end');
    setTemplateVisible(false);
  }

  // 点击外部关闭技能面板 / 模版面板。
  $effect(() => {
    if (!showSkillPanel || !rootEl) return;
    return useDismiss(rootEl, { escape: false, onDismiss: () => closeSkillPanel() });
  });
  $effect(() => {
    if (!templateOpen || !rootEl) return;
    return useDismiss(rootEl, { escape: true, onDismiss: () => setTemplateVisible(false) });
  });

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

  function handleAttachmentChange({ fileList }: { fileList: UploadFileItem[]; currentFile: UploadFileItem }): void {
    attachments = fileList as unknown as AIChatInputAttachment[];
    onUploadChange?.(attachments);
  }

  // 从剪贴板事件抽取文件（供 onPaste + 粘贴上传）。
  function extractClipboardFiles(e: ClipboardEvent): File[] {
    const items = e.clipboardData?.items;
    if (!items) return [];
    const files: File[] = [];
    for (const it of items) {
      const f = it.getAsFile();
      if (f) files.push(f);
    }
    return files;
  }

  /**
   * 从附件列表移除一项（top area 附件列表删除按钮 + ref deleteUploadFile 共用）。
   *
   * ⚠️ 附件列表是本组件**自绘**的（Upload 传 `listType="none"`，只当触发器+上传管线），
   * 所以删除**不会**走 Upload 内部的移除流程 —— 必须在这里显式兑现
   * `uploadProps.beforeRemove` / `onRemove` 两个钩子，否则 Semi 文档里
   * 「删除上传文件时会触发 onRemove 并遵循 beforeRemove」这条对本库就是假的。
   *
   * beforeRemove 支持返回 Promise（对齐 Semi 与本库 Upload 的签名）：
   * 返回 false / resolve(false) 即中止删除。
   */
  async function removeAttachment(target: AIChatInputAttachment): Promise<void> {
    const before = uploadProps?.['beforeRemove'] as
      | ((file: unknown, fileList: unknown[]) => boolean | Promise<boolean>)
      | undefined;
    if (typeof before === 'function') {
      const ok = await before(target, attachments);
      if (ok === false) return;
    }

    const next = attachments.filter((a) => a.uid !== target.uid);
    attachments = next;

    const onRemove = uploadProps?.['onRemove'] as
      | ((currentFile: unknown, fileList: unknown[], currentFileItem: unknown) => void)
      | undefined;
    // 与本库 Upload 的 onRemove 同签名：(currentFile, fileList, currentFileItem)
    onRemove?.(target['file'], next, target);

    onUploadChange?.(next);
  }

  // —— ref 方法（对齐 Semi Methods）——
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
  /** 显隐模版面板（对齐 Semi changeTemplateVisible）。仅当前技能 hasTemplate 时有效。 */
  export function changeTemplateVisible(visible: boolean): void {
    setTemplateVisible(visible);
  }
  /** 取当前配置区值（对齐 Semi getConfigureValue）。 */
  export function getConfigureValue(): AIChatInputConfigureValue {
    return configureValue;
  }
  /**
   * 删除编辑器中匹配的一段内容（对齐 Semi deleteContent）。按 content.text 精确匹配删除，
   * 用于外部（如工具卡片）联动移除某段输入。找不到则不动。
   */
  export function deleteContent(content: { type?: string; text?: string }): void {
    if (!editor || !content?.text) return;
    const target = content.text;
    let found: { from: number; to: number } | undefined;
    editor.state.doc.descendants((node, pos) => {
      if (found) return false;
      if (node.isText && node.text && node.text.includes(target)) {
        const start = pos + node.text.indexOf(target);
        found = { from: start, to: start + target.length };
        return false;
      }
      return true;
    });
    if (found) editor.chain().focus().deleteRange(found).run();
  }
  /**
   * 设置内容但保留已选技能标记（对齐 Semi setContentWhileSaveTool）：把当前技能作为
   * skill-slot 前缀 + 新内容一起 setContent，避免覆盖技能选择。
   */
  export function setContentWhileSaveTool(next: string): void {
    if (!editor) return;
    if (currentSkill) {
      editor.commands.setContent(getSkillSlotHTML(currentSkill) + next);
    } else {
      editor.commands.setContent(next);
    }
  }
  /** 从附件列表删除一项（对齐 Semi deleteUploadFile）。 */
  export function deleteUploadFile(attachment: AIChatInputAttachment): void {
    // beforeRemove 可能是异步的；此处不等待（与点击删除按钮一致，属即发即忘）。
    void removeAttachment(attachment);
  }

  /**
   * 引用/附件类型 → 具名图标组件（逐条对齐 Semi `getIconByType`）。
   * text 不出图标；file 与 word 共用 IconWord；未知类型兜底 IconFile。
   */
  function iconByType(type: string | undefined) {
    switch (type) {
      case 'text':
        return null;
      case 'file':
      case 'word':
        return IconWord;
      case 'code':
        return IconCode;
      case 'excel':
        return IconExcel;
      case 'video':
        return IconVideo;
      case 'audio':
        return IconMusic;
      case 'pdf':
        return IconPdf;
      default:
        return IconFile;
    }
  }
</script>

<div
  class="cd-ai-chat-input {className}"
  class:cd-ai-chat-input-round={round}
  {style}
  bind:this={rootEl}
>
  {#if hasReferences || hasTopSlot || hasAttachments}
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
              <!--
                结构对齐 Semi renderReference：前置 IconSendMsgStroked + .-reference-content
                （内含图/图标 + name）+ .-reference-delete 三段。
                与 Semi 的一处有意差异：Semi 把 onClick 挂在 -reference 根 div 上（键盘不可达，
                其源码里也挂着 eslint-disable click-events-have-key-events），本库改为
                -reference-content 用 button 承载点击，容器保持非交互避免 nested-interactive。
              -->
              <div class="cd-ai-chat-input-reference">
                <IconSendMsgStroked />
                <button
                  type="button"
                  class="cd-ai-chat-input-reference-content"
                  onclick={() => handleReferenceClick(reference)}
                >
                  {#if reference.type !== 'text'}
                    {#if isImageReference(reference)}
                      <img
                        class="cd-ai-chat-input-reference-img"
                        src={reference.url}
                        alt={reference.name}
                      />
                    {:else}
                      {@const signIconType = getContentType(getAttachmentType(reference))}
                      {@const RefIcon = iconByType(signIconType)}
                      <span
                        class="cd-ai-chat-input-ref-icon cd-ai-chat-input-ref-icon-{signIconType} cd-ai-chat-input-reference-icon"
                      >
                        {#if RefIcon}<RefIcon size="small" />{/if}
                      </span>
                    {/if}
                  {/if}
                  <span class="cd-ai-chat-input-reference-name">{referenceLabel(reference)}</span>
                </button>
                <button
                  type="button"
                  class="cd-ai-chat-input-reference-delete"
                  aria-label={loc().t('AIChatInput.deleteReference')}
                  onclick={(e) => handleReferenceDelete(reference, e)}
                >
                  <IconCrossStroked size="small" />
                </button>
              </div>
            {/if}
          {/each}
        </div>
      {/if}
      {#if hasAttachments}
        <!--
          附件区结构逐条对齐 Semi renderAttachment：HorizontalScroller 包裹，卡片内
          「图片缩略图 或 类型图标」+ -content（name / `类型 大小` 两行）+ 上传中的环形进度
          + hover 才显示的右上角删除钮。类型由 getContentType(getAttachmentType(item)) 推导。
        -->
        <AIChatInputHorizontalScroller>
          {#each attachments as attachment (attachment.uid)}
            {@const signIconType = getContentType(getAttachmentType(attachment))}
            {@const realType = getAttachmentType(attachment)}
            {@const showPercent =
              !(attachment.percent === 100 || attachment.percent === undefined) &&
              attachment.status === 'uploading'}
            <div class="cd-ai-chat-input-attachment">
              {#if isImageType(attachment)}
                <img
                  class="cd-ai-chat-input-attachment-img"
                  src={attachment.url}
                  alt={attachment.name}
                />
              {:else}
                {@const AttIcon = iconByType(signIconType)}
                <!-- 附件图标：Semi getAttachmentIconByType 用 size='large'（引用处是 small）。 -->
                <span
                  class="cd-ai-chat-input-attachment-icon cd-ai-chat-input-ref-icon cd-ai-chat-input-ref-icon-{signIconType}"
                >
                  {#if AttIcon}<AttIcon size="large" />{/if}
                </span>
              {/if}
              <div class="cd-ai-chat-input-attachment-content">
                <div class="cd-ai-chat-input-attachment-content-name">{attachment.name}</div>
                <div class="cd-ai-chat-input-attachment-content-size">
                  {`${realType} ${attachment.size ?? ''}`}
                </div>
              </div>
              {#if showPercent}
                <Progress
                  type="circle"
                  width={30}
                  class="cd-ai-chat-input-attachment-progress"
                  percent={attachment.percent ?? 0}
                  showInfo={false}
                  aria-label="upload progress"
                />
              {/if}
              <button
                type="button"
                class="cd-ai-chat-input-attachment-delete"
                aria-label={loc().t('AIChatInput.deleteAttachment')}
                onclick={() => void removeAttachment(attachment)}
              >
                <IconClose size="small" />
              </button>
            </div>
          {/each}
        </AIChatInputHorizontalScroller>
      {/if}
      {#if hasTopSlot && topSlotPosition === 'bottom'}
        {@render renderTopSlot?.({ references, attachments })}
      {/if}
    </div>
  {/if}

  <div class="cd-ai-chat-input-editor-wrap">
    <div class="cd-ai-chat-input-editor" bind:this={editorHost}></div>

    {#if showSuggestionPanel}
      <div class="cd-ai-chat-input-suggestion" role="listbox" aria-label={loc().t('AIChatInput.suggestions')}>
        {#each suggestions as suggestion, i (suggestionContent(suggestion) + i)}
          <AIChatInputSuggestionItem
            {suggestion}
            index={i}
            isActive={i === activeSuggestionIndex}
            {renderSuggestionItem}
            onClick={selectSuggestion}
            onMouseEnter={(idx) => (activeSuggestionIndex = idx)}
          />
        {/each}
      </div>
    {/if}

    {#if showSkillPanel}
      <div class="cd-ai-chat-input-skill" role="listbox" aria-label={loc().t('AIChatInput.skills')}>
        {#each skills as skill, i (skillLabel(skill) + i)}
          <AIChatInputSkillItem
            {skill}
            index={i}
            isActive={i === activeSkillIndex}
            {renderSkillItem}
            onClick={selectSkill}
            onMouseEnter={(idx) => (activeSkillIndex = idx)}
          />
        {/each}
      </div>
    {/if}

    {#if templateOpen && currentSkill && renderTemplate}
      <div class="cd-ai-chat-input-template">
        {@render renderTemplate({ skill: currentSkill, setContent: applyTemplate })}
      </div>
    {/if}
  </div>

  <!-- footer 结构逐条对齐 Semi renderFooter：左 configure、右 action（上传+发送同组）。
       round 由 -footer-round 修饰类统一改各控件圆角（对齐 Semi &-footer-round）。 -->
  <div class="cd-ai-chat-input-footer" class:cd-ai-chat-input-footer-round={round}>
    <div class="cd-ai-chat-input-footer-configure">
      {#if renderConfigureArea}
        {@render renderConfigureArea()}
      {/if}
      {#if showTemplate}
        <button
          type="button"
          class="cd-ai-chat-input-template-btn"
          class:cd-ai-chat-input-template-btn-active={templateOpen}
          aria-expanded={templateOpen}
          aria-label={loc().t('AIChatInput.template')}
          onclick={toggleTemplate}
        >
          <IconTemplateStroked />
          <span>{loc().t('AIChatInput.template')}</span>
        </button>
      {/if}
    </div>

    <div class="cd-ai-chat-input-footer-action">
      {#if renderActionArea}
        {@render renderActionArea({ canSend: computedCanSend, generating })}
      {:else}
        {#if showUploadButton}
          <!-- listType='none'：附件列表由本组件 top area 自绘（showUploadFile），Upload 仅做触发器+上传管线。 -->
          <Upload listType="none" multiple {...uploadProps} onChange={handleAttachmentChange}>
            {#if renderUploadButton}
              {@render renderUploadButton({
                openFileDialog: () => {},
                disabled: generating,
                attachments,
              })}
            {:else}
              <!-- ⚠️ 这里必须是 span 不能是 button：本库 Upload 的触发器外壳
                   `.cd-upload-add` 自带 role="button" tabindex="0"，再套一个真 button
                   会构成 nested-interactive（axe serious）。Semi 侧写的是 button，
                   因为它的 Upload 外壳不是交互元素 —— 属**框架实现差异**，
                   视觉与类名仍与 Semi 一致（-footer-action-button + -footer-action-upload）。 -->
              <span
                class="cd-ai-chat-input-footer-action-button cd-ai-chat-input-footer-action-upload"
                aria-label={loc().t('AIChatInput.upload')}
              >
                <IconPaperclip />
              </span>
            {/if}
          </Upload>
        {/if}
        <button
          type="button"
          class="cd-ai-chat-input-footer-action-button"
          class:cd-ai-chat-input-footer-action-send={!generating}
          class:cd-ai-chat-input-footer-action-stop={generating}
          class:cd-ai-chat-input-footer-action-send-disabled={!generating && !computedCanSend}
          disabled={!generating && !computedCanSend}
          onclick={handleActionClick}
          title={generating ? loc().t('AIChatInput.stop') : loc().t('AIChatInput.send')}
          aria-label={generating ? loc().t('AIChatInput.stop') : loc().t('AIChatInput.send')}
        >
          {#if generating}
            <IconStop />
          {:else}
            <IconArrowUp />
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

  .cd-ai-chat-input-round {
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

  /* Semi: &-references —— @include font-size-small（12px + line-height 16px）+ text-2。 */
  .cd-ai-chat-input-references {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: var(--cd-ai-chat-input-references-marginBottom);
    font-size: var(--cd-font-size-small);
    line-height: 16px;
    color: var(--cd-ai-chat-input-references-text);
    column-gap: var(--cd-ai-chat-input-references-columnGap);
    row-gap: var(--cd-ai-chat-input-references-rowGap);
  }

  /* Semi 的引用条按条数自适应 1/2/3 列（本库此前完全没有这套规则，恒为内容宽度）：
     1 条占满、2 条各半、3 条及以上各 1/3，宽度都减去一个列间距。 */
  .cd-ai-chat-input-references > .cd-ai-chat-input-reference:only-child {
    width: 100%;
  }

  .cd-ai-chat-input-references > .cd-ai-chat-input-reference:nth-last-child(2):first-child,
  .cd-ai-chat-input-references > .cd-ai-chat-input-reference:nth-child(2):nth-last-child(1) {
    flex-basis: calc(50% - var(--cd-ai-chat-input-references-columnGap));
    max-width: calc(50% - var(--cd-ai-chat-input-references-columnGap));
  }

  .cd-ai-chat-input-references > .cd-ai-chat-input-reference:nth-last-child(n + 3):nth-child(1),
  .cd-ai-chat-input-references
    > .cd-ai-chat-input-reference:nth-last-child(n + 3):nth-child(1)
    ~ .cd-ai-chat-input-reference {
    width: calc(33.333% - var(--cd-ai-chat-input-references-columnGap));
  }

  /* —— 附件卡片（showUploadFile）：逐条对齐 Semi aiChatInput.scss &-attachment —— */
  .cd-ai-chat-input-attachment {
    position: relative;
    display: flex;
    align-items: center;
    column-gap: var(--cd-ai-chat-input-attachment-columnGap);
    border-radius: var(--cd-ai-chat-input-attachment-radius);
    background: var(--cd-ai-chat-input-attachment-bg);
    padding: var(--cd-ai-chat-input-attachment-padding);
    width: var(--cd-ai-chat-input-attachment-width);
    height: var(--cd-ai-chat-input-attachment-height);
    overflow: hidden;
    letter-spacing: 0;
    flex-shrink: 0;
  }

  .cd-ai-chat-input-attachment-icon,
  .cd-ai-chat-input-attachment-img {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    border-radius: 3px;
    width: var(--cd-ai-chat-input-attachment-left-height);
    height: var(--cd-ai-chat-input-attachment-left-height);
  }

  .cd-ai-chat-input-attachment-img {
    object-fit: cover;
  }

  .cd-ai-chat-input-attachment-content {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    align-items: flex-start;
    width: var(--cd-ai-chat-input-attachment-content-width);
  }

  /* @include font-size-small 同时带 line-height:16px，别只搬 font-size。 */
  .cd-ai-chat-input-attachment-content-name {
    flex-shrink: 0;
    width: var(--cd-ai-chat-input-attachment-content-width);
    height: var(--cd-ai-chat-input-attachment-content-height);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    color: var(--cd-ai-chat-input-attachment-name-text);
    font-size: var(--cd-font-size-small);
    line-height: 16px;
    font-weight: var(--cd-ai-chat-input-attachment-content-name-fontWeight);
  }

  .cd-ai-chat-input-attachment-content-size {
    display: flex;
    flex-shrink: 0;
    align-items: flex-start;
    column-gap: var(--cd-ai-chat-input-attachment-content-size-columnGap);
    color: var(--cd-color-text-2);
    font-size: var(--cd-font-size-small);
    line-height: 16px;
    text-transform: uppercase;
  }

  /* Semi：删除钮默认 display:none，仅 hover 卡片时才显示在右上角。 */
  .cd-ai-chat-input-attachment-delete {
    display: none;
  }

  .cd-ai-chat-input-attachment:hover > .cd-ai-chat-input-attachment-delete {
    cursor: pointer;
    position: absolute;
    top: 0;
    right: 0;
    border: none;
    padding: 0;
    background: var(--cd-ai-chat-input-attachment-delete-bg);
    color: var(--cd-ai-chat-input-attachment-delete-icon);
    border-radius: 50%;
    width: var(--cd-ai-chat-input-attachment-delete-width);
    height: var(--cd-ai-chat-input-attachment-delete-width);
    font-size: var(--cd-ai-chat-input-attachment-content-delete-fontSize);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* 键盘可达：Semi 靠 hover 显示，纯键盘用户拿不到删除钮，故补 focus-within 同显。 */
  .cd-ai-chat-input-attachment:focus-within > .cd-ai-chat-input-attachment-delete {
    cursor: pointer;
    position: absolute;
    top: 0;
    right: 0;
    border: none;
    padding: 0;
    background: var(--cd-ai-chat-input-attachment-delete-bg);
    color: var(--cd-ai-chat-input-attachment-delete-icon);
    border-radius: 50%;
    width: var(--cd-ai-chat-input-attachment-delete-width);
    height: var(--cd-ai-chat-input-attachment-delete-width);
    font-size: var(--cd-ai-chat-input-attachment-content-delete-fontSize);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .cd-ai-chat-input-attachment-delete:focus-visible {
    outline: 2px solid var(--cd-color-primary);
    outline-offset: 1px;
  }

  /* Semi：&-attachment-progress.#{$prefix}-progress-circle 绝对居中在卡片上。 */
  .cd-ai-chat-input-attachment :global(.cd-ai-chat-input-attachment-progress) {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  /* Semi: &-reference { padding 8/12 + radius 6 + fill-0 + flex + column-gap 8 } */
  .cd-ai-chat-input-reference {
    padding: var(--cd-ai-chat-input-reference-paddingY)
      var(--cd-ai-chat-input-reference-paddingX);
    box-sizing: border-box;
    border-radius: var(--cd-ai-chat-input-reference-radius);
    background: var(--cd-ai-chat-input-reference-bg);
    flex-shrink: 1;
    display: flex;
    align-items: center;
    column-gap: var(--cd-ai-chat-input-reference-columnGap);
  }

  /* Semi 的 -reference-content 是 span；本库用 button 承载点击（Semi 把 onClick 挂根 div，
     键盘不可达），故额外重置按钮默认外观，视觉与 Semi 的 span 等价。 */
  .cd-ai-chat-input-reference-content {
    display: flex;
    align-items: center;
    flex-grow: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    appearance: none;
    border: none;
    background: transparent;
    cursor: pointer;
    min-width: 0;
    padding: 0;
    color: inherit;
    font: inherit;
    text-align: start;
  }

  .cd-ai-chat-input-reference-content:focus-visible {
    outline: 2px solid var(--cd-color-primary);
    outline-offset: 2px;
  }

  .cd-ai-chat-input-reference-img {
    width: var(--cd-ai-chat-input-reference-icon-width);
    height: var(--cd-ai-chat-input-reference-icon-width);
    margin-right: var(--cd-ai-chat-input-reference-icon-marginRight);
  }

  /* Semi: &-reference-icon（与 -img 同宽高，另有 radius 2px）。 */
  .cd-ai-chat-input-reference-icon {
    width: var(--cd-ai-chat-input-reference-icon-width);
    height: var(--cd-ai-chat-input-reference-icon-width);
    border-radius: var(--cd-ai-chat-input-reference-icon-radius);
    margin-right: var(--cd-ai-chat-input-reference-icon-marginRight);
  }

  .cd-ai-chat-input-reference-name {
    display: inline-block;
    text-overflow: ellipsis;
    overflow: hidden;
    word-break: break-all;
  }

  .cd-ai-chat-input-reference-delete {
    cursor: pointer;
    padding: var(--cd-ai-chat-input-references-delete-padding);
    border-radius: 50%;

    appearance: none;
    border: none;
    background: transparent;
    display: inline-flex;
    color: inherit;
  }

  .cd-ai-chat-input-reference-delete:hover {
    background: var(--cd-ai-chat-input-reference-delete-bg);
  }

  .cd-ai-chat-input-reference-delete:focus-visible {
    outline: 2px solid var(--cd-color-primary);
    outline-offset: 1px;
  }

  /* —— 建议浮层面板（阶段 2）—— */
  .cd-ai-chat-input-editor-wrap {
    position: relative;
  }

  /* —— 建议面板 / 技能面板 ——
     类树逐条对齐 Semi aiChatInput.scss：`&-suggestion > &-item` 与 `&-skill > &-item`
     是**两棵独立的树**（此前本库让技能复用了建议的类，是自造合并）。
     浮层定位/背景/阴影 Semi 侧由 Popover 承担，本库自绘面板故保留这几条。 */
  .cd-ai-chat-input-suggestion,
  .cd-ai-chat-input-skill {
    position: absolute;
    left: 0;
    right: 0;
    top: calc(100% + var(--cd-spacing-extra-tight));
    z-index: 10;
    max-height: 270px;
    overflow: scroll;
    background: var(--cd-ai-chat-input-suggestions-bg);
    box-shadow: var(--cd-ai-chat-input-suggestions-shadow);
  }

  /* Semi: &-skill { padding: 4px 0; border-radius: 8px } */
  .cd-ai-chat-input-skill {
    padding: var(--cd-spacing-ai-chat-input-skill-paddingy)
      var(--cd-spacing-ai-chat-input-skill-paddingx);
    border-radius: var(--cd-radius-ai-chat-input-skill);
  }

  /* 技能项 / 建议项的样式已随组件拆分迁到 AIChatInputSkillItem.svelte /
     AIChatInputSuggestionItem.svelte —— Svelte scoped CSS 不跨组件，留在这里会静默失效。 */

  /* —— 模版面板 / 按钮（阶段 3）—— */
  .cd-ai-chat-input-template {
    position: absolute;
    left: 0;
    right: 0;
    top: calc(100% + var(--cd-spacing-extra-tight));
    z-index: 10;
    max-height: 500px;
    overflow-y: auto;
    padding: var(--cd-spacing-tight);
    background: var(--cd-ai-chat-input-suggestions-bg);
    border-radius: var(--cd-ai-chat-input-suggestions-radius);
    box-shadow: var(--cd-ai-chat-input-suggestions-shadow);
  }

  .cd-ai-chat-input-template-btn {
    appearance: none;
    border: none;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: var(--cd-spacing-extra-tight);
    padding: var(--cd-ai-chat-input-action-padding) var(--cd-spacing-tight);
    border-radius: var(--cd-ai-chat-input-action-radius);
    background: transparent;
    color: var(--cd-ai-chat-input-template-color);
    font: inherit;
    transition: background var(--cd-ai-chat-input-motion-duration) ease;
  }

  .cd-ai-chat-input-template-btn:hover,
  .cd-ai-chat-input-template-btn-active {
    background: var(--cd-ai-chat-input-template-bg-hover);
  }

  .cd-ai-chat-input-template-btn:focus-visible {
    outline: 2px solid var(--cd-color-primary);
    outline-offset: 2px;
  }

  /* —— 配置区（阶段 4）—— */
  .cd-ai-chat-input-configure {
    display: inline-flex;
    align-items: center;
    gap: var(--cd-ai-chat-input-gap);
    flex-wrap: wrap;
  }

  .cd-ai-chat-input-editor {
    min-height: var(--cd-ai-chat-input-editor-min-height);
    max-height: var(--cd-ai-chat-input-editor-max-height);
    overflow-y: auto;
    color: var(--cd-ai-chat-input-color);
    font: inherit;
    /* 对齐 Semi aiChatInput.scss:499 `line-height: $font-aiChatInput_rich_text-lineHeight`
       —— Semi 用组件专属变量，本库 token 同形同值。 */
    line-height: var(--cd-ai-chat-input-rich-text-lineheight);
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

  /*
    showPlaceholderWhenSkillOnly：段落里只有 skillSlot 时仍显示 placeholder，
    且要排在 skill **后方**——故关掉 ::before（float:left 会跑到 skill 前），
    改用 ::after 内联跟随。逐条对齐 Semi aiChatInput.scss:510-521。
  */
  .cd-ai-chat-input-editor
    :global(.ProseMirror p.has-skill-slot.is-editor-empty:first-child::before) {
    content: none;
  }
  .cd-ai-chat-input-editor
    :global(.ProseMirror p.has-skill-slot.is-editor-empty:first-child::after) {
    content: attr(data-placeholder);
    display: inline;
    height: 0;
    margin-inline-start: var(--cd-spacing-ai-chat-input-skill-item-columngap);
    pointer-events: none;
    color: var(--cd-ai-chat-input-placeholder-color);
  }

  /* —— footer —— 逐条对齐 Semi aiChatInput.scss 的 &-footer 段 —— */
  .cd-ai-chat-input-footer {
    display: flex;
    justify-content: space-between;
    margin-top: var(--cd-spacing-ai-chat-input-footer-margintop);
    align-items: center;
    user-select: none;
    -webkit-user-select: none;
  }

  /* Semi &-footer-round：统一把配置/操作各控件改成全圆角 */
  .cd-ai-chat-input-footer-round .cd-ai-chat-input-footer-action-button,
  .cd-ai-chat-input-footer-round .cd-ai-chat-input-footer-action-upload,
  .cd-ai-chat-input-footer-round .cd-ai-chat-input-template-btn {
    border-radius: var(--cd-radius-ai-chat-input-footer-round);
  }

  /* Semi &-footer-configure：flex + column-gap 8px */
  .cd-ai-chat-input-footer-configure {
    display: flex;
    align-items: center;
    column-gap: var(--cd-spacing-ai-chat-input-footer-configure-columngap);
  }

  /* Semi &-footer-action：flex + column-gap 8px，内部 button 去默认样式 */
  .cd-ai-chat-input-footer-action {
    display: flex;
    align-items: center;
    column-gap: var(--cd-spacing-ai-chat-input-footer-action-columngap);
  }
  .cd-ai-chat-input-footer-action :global(button) {
    padding: 0;
    border: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Semi &-footer-action-button：32×32 + radius 8px */
  .cd-ai-chat-input-footer-action-button {
    width: var(--cd-width-ai-chat-input-footer-action-button);
    height: var(--cd-height-ai-chat-input-footer-action-button);
    cursor: pointer;
    border-radius: var(--cd-radius-ai-chat-input-footer-action-button);
  }

  /* Semi &-footer-action-send / -stop：同一组配色（primary 系） */
  .cd-ai-chat-input-footer-action-send,
  .cd-ai-chat-input-footer-action-stop {
    background-color: var(--cd-color-ai-chat-input-footer-send-bg-default);
    color: var(--cd-color-ai-chat-input-footer-send-text);
  }
  .cd-ai-chat-input-footer-action-send:hover:not(.cd-ai-chat-input-footer-action-send-disabled),
  .cd-ai-chat-input-footer-action-stop:hover:not(.cd-ai-chat-input-footer-action-send-disabled) {
    background-color: var(--cd-color-ai-chat-input-footer-send-bg-hover);
  }
  .cd-ai-chat-input-footer-action-send:active:not(.cd-ai-chat-input-footer-action-send-disabled),
  .cd-ai-chat-input-footer-action-stop:active:not(.cd-ai-chat-input-footer-action-send-disabled) {
    background-color: var(--cd-color-ai-chat-input-footer-send-bg-active);
  }
  .cd-ai-chat-input-footer-action-send-disabled {
    background-color: var(--cd-color-ai-chat-input-footer-send-bg-disabled);
    cursor: not-allowed;
  }

  /* Semi &-footer-action-upload */
  .cd-ai-chat-input-footer-action-upload {
    background: var(--cd-color-ai-chat-input-footer-upload-bg-default);
    color: var(--cd-color-ai-chat-input-footer-upload-text);
  }
  .cd-ai-chat-input-footer-action-upload:hover {
    background-color: var(--cd-color-ai-chat-input-footer-upload-bg-hover);
  }
  .cd-ai-chat-input-footer-action-upload:active {
    background-color: var(--cd-color-ai-chat-input-footer-upload-bg-active);
  }

  .cd-ai-chat-input-footer-action-button:focus-visible {
    outline: 2px solid var(--cd-color-primary);
    outline-offset: 2px;
  }
</style>
