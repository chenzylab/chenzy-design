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
    findSkillSlotInString,
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
  import { Tooltip } from '../tooltip/index.js';
  import { useLocale } from '../locale-provider/index.js';
  import { Upload } from '../upload/index.js';
  // 复用现有组件：Semi renderAttachment 用 Progress type=circle 显示上传进度，本库同样复用。
  import { Progress } from '../progress/index.js';
  // 对齐 Semi：三个浮层（建议/技能/模版）由同一个 Popover 承载，不再自绘绝对定位面板。
  import { Popover } from '../popover/index.js';
  import AIChatInputHorizontalScroller from './AIChatInputHorizontalScroller.svelte';
  // Semi 把技能/建议单项拆成 skillItem.tsx / suggestionItem.tsx，本库同样拆分。
  import AIChatInputSkillItem from './AIChatInputSkillItem.svelte';
  import AIChatInputSuggestionItem from './AIChatInputSuggestionItem.svelte';
  import AIChatInputConfigureButton from './AIChatInputConfigureButton.svelte';
  import type { UploadFileItem } from '../upload/types.js';
  import { untrack } from 'svelte';
  import { setConfigureContext } from './configure-context.js';
  // 纯读取侧，无 tiptap 依赖，故可静态 import（扩展本体仍随内核动态加载）。
  import { isHotKeySendAllowed } from './status-storage.js';
  // 编辑器内核装配与生命周期（对齐 Semi richTextInput.tsx 的拆分）。
  // 本模块顶层只有 import type，内核仍在其内部动态 import。
  import { mountRichTextInput } from './rich-text-input.svelte.js';

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
    /** 圆角样式（对齐 Semi round，默认 true）。 */
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
    /**
     * 自定义底部操作区渲染（对齐 Semi renderActionArea）：**整块替换**，
     * 入参对齐 Semi ActionAreaProps —— `menuItem` 是默认的「上传 + 发送/停止」按钮组
     * （渲染它即可保留内置能力），`className` 是默认容器类名（需自行挂到根节点上）。
     */
    renderActionArea?: Snippet<[{ menuItem: Snippet; className: string }]> | undefined;
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
    /** 自定义 top slot 渲染（对齐 Semi renderTopSlot / TopSlotProps）。 */
    renderTopSlot?:
      | Snippet<
          [
            {
              references: AIChatInputReference[];
              attachments: AIChatInputAttachment[];
              /** 当前富文本内容（对齐 Semi TopSlotProps.content），随编辑区变化实时更新。 */
              content: AIChatInputContent[];
              handleReferenceDelete: (reference: AIChatInputReference) => void;
              handleUploadFileDelete: (attachment: AIChatInputAttachment) => void;
            },
          ]
        >
      | undefined;
    /** top slot 相对引用条/附件区的位置（对齐 Semi topSlotPosition，默认 top）。 */
    topSlotPosition?: 'top' | 'middle' | 'bottom';
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
    /**
     * 技能变化回调（对齐 Semi onSkillChange）。技能消失（如用户删除了 skillSlot 节点、
     * 或点击其删除按钮清空编辑器）时回调 undefined——Semi 运行时确有此行为
     * （notifySkillChange(undefined)），本库类型如实反映，不同 Semi 的类型标注。
     */
    onSkillChange?: ((skill: AIChatInputSkill | undefined) => void) | undefined;
    /**
     * 模版面板渲染（对齐 Semi renderTemplate）：当前技能 hasTemplate 时，点击模版按钮弹出，
     * 参数 (skill, setContent)——调 setContent 把模版内容填入编辑器。
     */
    renderTemplate?: Snippet<[{ skill: AIChatInputSkill; setContent: (html: string) => void }]> | undefined;
    /**
     * 是否展示模版按钮（对齐 Semi showTemplateButton，默认 false）。
     * 未显式设置时，按当前选中技能的 hasTemplate 决定是否展示；显式设为 true 后
     * 恒展示（不再看 hasTemplate），设为 false 则恒不展示。
     */
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
    /**
     * 配置区初始值。**层级与 Semi 不同**：Semi 的 defaultValue 在 Configure 组件上
     * （configure/index.tsx:19 `props.value || props.defaultValue`），本库的配置区
     * 是由 AIChatInput 提供 context、没有独立的 Configure 容器组件，故提到父层。
     */
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
    /**
     * 清空输入时保留已选技能标记（对齐 Semi keepSkillAfterSend，默认 false）。
     * true 时走 setContentWhileSaveTool('') 而非整体 clearContent。
     */
    keepSkillAfterSend?: boolean;
    /** 模版浮层附加类名（对齐 Semi templatesCls）。 */
    templatesCls?: string;
    /** 模版浮层附加内联样式（对齐 Semi templatesStyle）。 */
    templatesStyle?: string;
    /** 上传按钮的 Tooltip 配置；传了才包 Tooltip（对齐 Semi uploadTipProps）。 */
    uploadTipProps?: Record<string, unknown> | undefined;
    /** 编辑区聚焦回调。 */
    onFocus?: ((event: FocusEvent) => void) | undefined;
    /** 编辑区失焦回调。 */
    onBlur?: ((event: FocusEvent) => void) | undefined;
    /** 粘贴回调（携带粘贴的文件，对齐 Semi onPaste；不改变默认粘贴行为）。 */
    onPaste?: ((files: File[]) => void) | undefined;
    /**
     * 透传给承载建议/技能/模版浮层的 Popover（对齐 Semi popoverProps）。
     * position 默认 bottomLeft、trigger 固定 custom（显隐由组件内部状态驱动，不可覆盖）。
     */
    popoverProps?: Record<string, unknown> | undefined;
    /** 浮层宽度是否跟随触发器宽度（对齐 Semi dropdownMatchTriggerWidth，默认 true）。 */
    dropdownMatchTriggerWidth?: boolean;
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
    round = true,
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
    showTemplateButton = false,
    onTemplateVisibleChange,
    renderConfigureArea,
    configureDefaultValue,
    onConfigureChange,
    showUploadFile = true,
    renderUploadButton,
    clearContentOnGenerating = true,
    keepSkillAfterSend = false,
    templatesCls,
    templatesStyle,
    uploadTipProps,
    onFocus,
    onBlur,
    onPaste,
    popoverProps,
    dropdownMatchTriggerWidth = true,
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
  // 当前富文本内容（对齐 Semi TopSlotProps.content，供 renderTopSlot 渲染非文本节点，
  // 如自定义扩展插入的 referSlot），随编辑区变化在 onContentChange 里同步更新。
  let currentContent = $state<AIChatInputContent[]>([]);

  // —— 配置区状态（阶段 4）：value 供 Configure 子组件经 context 读写，发送时并入 setup ——
  // 只取初始值（untrack 表明有意不追踪后续 prop 变化——配置区值由内部/onConfigureChange 管理）。
  let configureValue = $state<AIChatInputConfigureValue>(
    untrack(() => ({ ...(configureDefaultValue ?? {}) })),
  );
  setConfigureContext({
    getValue: () => configureValue,
    setField: (patch, init = false) => {
      configureValue = setConfigureField(configureValue, patch);
      // $state.snapshot：跨出响应式边界前转普通对象，避免 $state Proxy 泄漏给外部回调
      // （用户若 console.log(value) 会触发 Svelte console_log_state 警告）。
      if (!init) onConfigureChange?.($state.snapshot(configureValue), patch);
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
  // 模版按钮可见性（对齐 Semi index.tsx:507：`(showTemplateButton || hasTemplate) &&
  // <Configure.Button>`——是"显式开关"或"当前技能有模版"任一成立，此前误写成 AND，
  // showTemplateButton=false 时哪怕技能 hasTemplate 也不显示，与 Semi 不符）。
  // renderTemplate 判断是本库补充的防御性条件（Semi 没有——没有 renderTemplate 时按钮
  // 点了也没有面板内容可展示，予以保留）。
  const showTemplate = $derived(
    (showTemplateButton || !!currentSkill?.hasTemplate) && !!renderTemplate,
  );

  // —— 承载三个浮层的 Popover（对齐 Semi render()：同一个 Popover + 内容分派）——
  const showTemplatePanel = $derived(templateOpen && !!currentSkill && !!renderTemplate);
  const popoverVisible = $derived(showTemplatePanel || showSkillPanel || showSuggestionPanel);
  // class 逐条对齐 Semi：按当前显示的是哪种内容挂不同修饰类。
  const popoverClass = $derived(
    [
      showSuggestionPanel && !showSkillPanel && !showTemplatePanel
        ? 'cd-ai-chat-input-popover-suggestion'
        : '',
      showSkillPanel && !showTemplatePanel ? 'cd-ai-chat-input-popover-skill' : '',
      showTemplatePanel ? 'cd-ai-chat-input-popover-template' : '',
      // 模版浮层的附加类名（对齐 Semi templatesCls，只在模版态生效）。
      showTemplatePanel && templatesCls ? templatesCls : '',
    ]
      .filter(Boolean)
      .join(' '),
  );

  // dropdownMatchTriggerWidth（对齐 Semi setDropdownWidth）：浮层宽度跟随触发器。
  // Semi 优先取 style.width 里的定值，否则取触发器实测宽度。
  let popupWidth = $state<number | undefined>();
  const popupWidthStyle = $derived(popupWidth === undefined ? '' : `width: ${popupWidth}px;`);

  // rePosKey：值变化即让 Popover 重新定位（对齐 Semi reposPopover —— 输入内容变化会改变
  // 触发器高度，模版这类高浮层必须跟着重算，否则会错位）。
  let popupKey = $state(0);

  $effect(() => {
    if (!popoverVisible) return;
    if (!dropdownMatchTriggerWidth) {
      popupWidth = undefined;
      return;
    }
    const el = untrack(() => rootEl);
    if (!el) return;
    // 触发器宽度会随窗口/内容变化，用 ResizeObserver 跟随（Semi 侧靠 setDropdownWidth
    // 在每次打开时取一次 + reposPopover 节流重算，效果等价）。
    const sync = (): void => {
      popupWidth = el.offsetWidth;
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  });
  // top area 是否有内容（引用条 / topSlot / 附件列表），无则不渲染容器。
  const hasReferences = $derived(showReference && references.length > 0);
  const hasTopSlot = $derived(!!renderTopSlot);
  const hasAttachments = $derived(showUploadFile && attachments.length > 0);

  // clearContentOnGenerating：generating false→true 边沿时清空输入（对齐 Semi
  // componentDidUpdate:215-220）。两处此前漏了：
  //   · keepSkillAfterSend=true 时走 setContentWhileSaveTool('') 保留技能标记，
  //     而不是整个清空（本库该方法早就有，只是没接上这个 prop）；
  //   · 无论哪条分支，Semi 都会同时 clearAttachments()。
  let prevGenerating = untrack(() => generating);
  $effect(() => {
    const now = generating;
    if (clearContentOnGenerating && now && !untrack(() => prevGenerating)) {
      if (keepSkillAfterSend) {
        setContentWhileSaveTool('');
      } else {
        editor?.commands.clearContent(true);
      }
      attachments = [];
    }
    prevGenerating = now;
  });

  // —— tiptap 内核装配与生命周期：拆到 rich-text-input.svelte.ts（对齐 Semi richTextInput.tsx）——
  // ⚠️ 除 editorHost 外**一律走 getter**：直接把 props 值写进 options 会让它们成为本
  // effect 的依赖，任何一次 prop 变化都会重建编辑器、丢掉用户已输入的内容
  // （曾因此让 clearContentOnGenerating 用例变红：rerender 后编辑器重建，
  // defaultContent 又被填回去了）。
  $effect(() =>
    mountRichTextInput({
      getHost: () => editorHost,
      getDefaultContent: () => defaultContent,
      getPlaceholder: () => placeholderText,
      getShowPlaceholderWhenSkillOnly: () => showPlaceholderWhenSkillOnly,
      getEditorLabel: () => loc().t('AIChatInput.editor'),
      getExtensions: () => extensions,
      onKeyDown: handleEditorKeyDown,
      onPasteFiles: (files) => onPaste?.(files),
      // 聚焦编辑区且有建议项时弹出建议面板（对齐 Semi：点击/聚焦即开）+ onFocus 回调。
      onFocus: (event) => {
        openSuggestions();
        onFocus?.(event);
      },
      onBlur: (event) => onBlur?.(event),
      onEmptyChange: (v) => (isEmpty = v),
      onContentChange: (payload) => {
        // 对齐 Semi handleContentChange：从 HTML 反解析 skillSlot 同步 currentSkill，
        // 不论技能是通过面板选中插入的，还是用户直接 setContent() 注入
        // `<skill-slot>` 字符串——内容变化后都据此更新技能追踪状态（影响
        // setContentWhileSaveTool / renderTemplate 的模版按钮显隐）。
        const hasSkillSlot = payload.html.includes('</skill-slot>');
        if (currentSkill && !hasSkillSlot) {
          currentSkill = undefined;
          onSkillChange?.(undefined);
        } else if (hasSkillSlot) {
          const newSkill = findSkillSlotInString(payload.html);
          if (newSkill?.value !== currentSkill?.value) {
            currentSkill = newSkill;
            onSkillChange?.(newSkill as AIChatInputSkill);
          }
        }
        currentContent = transformDocToContents(payload.json, transformer);
        onContentChange?.(payload);
        // 内容变化会改变触发器高度，通知 Popover 重算位置（对齐 Semi reposPopover）。
        popupKey += 1;
      },
      onEditorChange: (ed) => (editor = ed),
    }),
  );

  // 编辑区 keydown：建议面板可见时先拦截 ↑↓/Enter/Esc 用于面板导航（返回 true 阻断编辑器默认）；
  // 否则走发送快捷键判定（generating/IME 中不发送）。返回 true = 已处理，tiptap 停止默认行为。
  function handleEditorKeyDown(event: KeyboardEvent): boolean {
    if (event.isComposing) return false;

    // 空编辑区按下 skillHotKey → 弹技能面板（对齐 Semi foundation.ts handleKeyDown：
    // 命中分支只 setState({ skillVisible: true })，不调用 preventDefault，skillHotKey
    // 字符本身正常插入编辑器——真机可见"/"、Backspace 能删掉它退出面板（第 169 行
    // `oldValue === skillHotKey` 判断也依赖编辑器里真的有这个字符）。此前 return true
    // 让 tiptap 停止默认输入行为，字符被吞掉，与 Semi 不符。
    if (!showSkillPanel && shouldOpenSkillPanel({
      key: event.key,
      skillHotKey,
      isEmpty,
      skillCount: skills.length,
    })) {
      openSkillPanel();
      return false;
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
      // 对齐 Semi foundation.ts:169 `(oldValue === skillHotKey || oldValue?.length === 0)
      // && Backspace` → 关闭面板。删除动作本身不拦截（不 preventDefault，真机删掉
      // skillHotKey 字符正常发生），只是同步收起面板状态。
      if (event.key === 'Backspace') {
        const currentText = editor?.getText() ?? '';
        if (currentText === skillHotKey || currentText.length === 0) {
          closeSkillPanel();
        }
        return false;
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
    if (
      isSendHotKey(event.key, event.shiftKey, sendHotKey) &&
      isHotKeySendAllowed(editor)
    ) {
      event.preventDefault();
      doSend();
      return true;
    }
    // 换行键位（sendHotKey='enter' 时是 Shift+Enter，反之是裸 Enter）：对齐 Semi
    // foundation.ts:399-417——tiptap 默认用 <br> 实现软换行，但 <br> 在 input-slot
    // 这类 inline-only 节点（schema content:'inline*'，不允许块级分裂）内依然能插入，
    // 与 Semi 表现不一致（真机复现：本库在 input-slot 内 Shift+Enter 换行了，Semi 没有）。
    // 改用 splitBlock（新建 <p>）：该命令在 schema 不允许分裂的位置会静默失败，
    // 这才是 Semi「input-slot 内 Shift+Enter 不换行」的真正机制——不是特殊拦截，
    // 是分裂段落这个操作本身在 inline-only 节点内不成立。
    if (event.key === 'Enter' && (sendHotKey === 'enter' ? event.shiftKey : !event.shiftKey)) {
      event.preventDefault();
      editor?.chain().focus().splitBlock().run();
      return true;
    }
    return false;
  }

  function doSend(): void {
    if (generating || !computedCanSend || !editor) return;
    const inputContents = transformDocToContents(editor.getJSON(), transformer);
    // 配置区值并入 setup（对齐 Semi getConfigureValue → MessageContent.setup）。
    // $state.snapshot：attachments/configureValue 都是 $state，跨出响应式边界前转普通对象。
    const message = buildMessageContent({
      inputContents,
      attachments: $state.snapshot(attachments),
      references,
      setup: $state.snapshot(configureValue),
    });
    onMessageSend?.(message);
  }

  // —— 建议面板（阶段 2）——
  // suggestions 变化即开/关面板（对齐 Semi componentDidUpdate：!isEqual(suggestions,prev)
  // 时按 length>0 决定 show/hide）。没有这条，「按输入内容动态派生建议」这种用法
  // 就必须先失焦再聚焦才看得到面板——Semi 文档的建议 demo 正是这种用法。
  let prevSuggestionsKey = untrack(() => JSON.stringify(suggestions));
  $effect(() => {
    const key = JSON.stringify(suggestions);
    if (key === prevSuggestionsKey) return;
    prevSuggestionsKey = key;
    untrack(() => {
      if (suggestions.length > 0) {
        suggestionOpen = true;
        // 对齐 Semi index.tsx:77 activeSuggestionIndex 初始值 0（默认第一项激活，
        // 非未激活）——同批 openSkillPanel 早已这样处理（activeSkillIndex = 0），
        // 建议面板此前遗漏，写成 -1 导致弹出时无任何项高亮。
        activeSuggestionIndex = 0;
      } else {
        closeSuggestions();
      }
    });
  });

  function openSuggestions(): void {
    if (suggestions.length === 0) return;
    suggestionOpen = true;
    activeSuggestionIndex = 0;
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
  function setTemplateVisible(visible: boolean): void {
    if (templateOpen === visible) return;
    templateOpen = visible;
    onTemplateVisibleChange?.(visible);
  }
  // 模版面板里 renderTemplate 回调用的 setContent（填入模版内容并关闭面板）。
  // 对齐 Semi md 示例 setTemplate：`element.setContentWhileSaveTool(content);
  // element.focusEditor();`——保留已选技能标记（拼接 skill-slot + 模版正文），不是
  // 整体覆盖式 setContent（会连技能标签一起清空）。renderTemplate 本身也没有任何
  // 自动关闭浮层的逻辑（真机核对 Semi 官方渲染确认点击模版卡片浮层保持打开，
  // 此前 setTemplateVisible(false) 是自造行为，予以删除）。
  function applyTemplate(html: string): void {
    setContentWhileSaveTool(html);
    editor?.commands.focus('end');
  }

  // 点击外部关闭技能面板 / 模版面板。
  // 浮层内容（.cd-popover）经 use:floating portal 到 document.body，不在 rootEl 子树
  // 内——useDismiss 的 pointerdown 监听走事件捕获阶段，早于面板内选项自身的 onmousedown
  // 处理器执行，若不显式声明 extraTargets，点击面板内任意选项都会先被误判成"外部点击"
  // 提前关闭面板，选中逻辑因此从未真正跑到（真机复现：鼠标点选技能项无效，仅键盘
  // Enter 能选中——Enter 走 keydown，不受这条 pointerdown 判断影响）。
  $effect(() => {
    if (!showSkillPanel || !rootEl) return;
    return useDismiss(rootEl, {
      escape: false,
      extraTargets: [document.querySelector<HTMLElement>('.cd-popover')],
      onDismiss: () => closeSkillPanel(),
    });
  });
  $effect(() => {
    if (!templateOpen || !rootEl) return;
    return useDismiss(rootEl, {
      escape: true,
      extraTargets: [document.querySelector<HTMLElement>('.cd-popover')],
      onDismiss: () => setTemplateVisible(false),
    });
  });

  // —— 引用条（阶段 2）——
  function handleReferenceClick(reference: AIChatInputReference): void {
    onReferenceClick?.(reference);
  }
  function handleReferenceDelete(reference: AIChatInputReference, event: MouseEvent): void {
    event.stopPropagation();
    onReferenceDelete?.(reference);
  }
  // top slot 透传版：不带 stopPropagation（外部 snippet 自行处理事件冒泡）。
  function handleTopSlotReferenceDelete(reference: AIChatInputReference): void {
    onReferenceDelete?.(reference);
  }
  function handleTopSlotUploadFileDelete(attachment: AIChatInputAttachment): void {
    void removeAttachment(attachment);
  }

  // 点击外部关闭建议面板（Esc 已在编辑区 keydown 处理）。
  // 同技能/模版面板：浮层 portal 到 body，需 extraTargets 声明才不会把面板内点击误判
  // 成外部点击（否则鼠标点选建议项会被这里提前关闭，同一个 bug 类别）。
  $effect(() => {
    if (!showSuggestionPanel || !rootEl) return;
    return useDismiss(rootEl, {
      escape: false,
      extraTargets: [document.querySelector<HTMLElement>('.cd-popover')],
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

  // 对齐 Semi handleContainerMouseDown/handleContainerClick：容器（含上传/发送/配置区
  // 等按钮）点击后主动把焦点拉回编辑器，而不是靠阻止按钮抢焦点——这才是「点击发送/
  // 上传按钮后编辑器焦点始终不消失」的真正机制。mouseDownTarget 记录按下时的目标，
  // 与 click 的 target 比较：富文本区域内拖拽选区、松开时若鼠标已在区域外，click 的
  // target 会变成别的元素，这时不应误触发抢焦点（否则会打断刚建立的选区）。
  let mouseDownTarget: EventTarget | null = null;
  function handleContainerMouseDown(event: MouseEvent): void {
    mouseDownTarget = event.target;
  }
  function handleContainerClick(event: MouseEvent): void {
    const target = event.target;
    if (mouseDownTarget && mouseDownTarget !== target) return;
    if (editorHost && (editorHost === target || editorHost.contains(target as Node))) {
      return;
    }
    editor?.commands.focus();
  }

  function handleAttachmentChange({ fileList }: { fileList: UploadFileItem[]; currentFile: UploadFileItem }): void {
    attachments = fileList as unknown as AIChatInputAttachment[];
    // fileList 本身是调用方传入的普通数组，不经 $state 包裹，直接传出即可。
    onUploadChange?.(fileList as unknown as AIChatInputAttachment[]);
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
    return $state.snapshot(configureValue);
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

<!--
  整个输入框包在一个 Popover 里承载建议/技能/模版三个浮层（对齐 Semi render()）：
  Semi 用**同一个** Popover + renderPopoverContent 按 visible 状态分派内容，
  触发器是整个输入框、方位 bottomLeft、trigger='custom' 全受控。
  此前本库是自绘的绝对定位面板（挂在编辑区内），既无法透传 popoverProps，
  也不会像 Popover 那样自动 flip / 传送到 body。
-->
<Popover
  position="bottomLeft"
  {...popoverProps}
  rePosKey={popupKey}
  class={popoverClass}
  {...showTemplatePanel && templatesStyle ? { style: templatesStyle } : {}}
  wrapperClassName="cd-ai-chat-input-popover-trigger"
  triggerStyle="display: block; width: 100%;"
  visible={popoverVisible}
  trigger="custom"
  content={popoverContent}
>
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!--
  容器级 mousedown/click 对齐 Semi handleContainerMouseDown/handleContainerClick：
  点击容器内任意位置（按钮/配置区等）后把焦点拉回编辑器；真正的可交互元素（按钮/
  编辑器本身）都有各自的键盘可达性，此处容器本身不需要键盘等价物（Semi 同一处用
  eslint-disable-next-line jsx-a11y/click-events-have-key-events 表达同样的判断）。
-->
<div
  class="cd-ai-chat-input {className}"
  class:cd-ai-chat-input-round={round}
  {style}
  bind:this={rootEl}
  onmousedown={handleContainerMouseDown}
  onclick={handleContainerClick}
>
  {#if hasReferences || hasTopSlot || hasAttachments}
    <div class="cd-ai-chat-input-top">
      {#if hasTopSlot && topSlotPosition === 'top'}
        {@render renderTopSlot?.({
          references,
          attachments,
          content: currentContent,
          handleReferenceDelete: handleTopSlotReferenceDelete,
          handleUploadFileDelete: handleTopSlotUploadFileDelete,
        })}
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
      {#if hasTopSlot && topSlotPosition === 'middle'}
        {@render renderTopSlot?.({
          references,
          attachments,
          content: currentContent,
          handleReferenceDelete: handleTopSlotReferenceDelete,
          handleUploadFileDelete: handleTopSlotUploadFileDelete,
        })}
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
              <!-- 对齐 Semi：裸 IconClose 挂 onClick（非 button 元素，无 aria-label，
                   与 Semi 逐字一致）。用户已确认接受随之而来的无障碍代价——纯键盘用户
                   无法触达此删除控件（非可聚焦元素）。 -->
              <IconClose
                class="cd-ai-chat-input-attachment-delete"
                size="small"
                onclick={() => void removeAttachment(attachment)}
              />
            </div>
          {/each}
        </AIChatInputHorizontalScroller>
      {/if}
      {#if hasTopSlot && topSlotPosition === 'bottom'}
        {@render renderTopSlot?.({
          references,
          attachments,
          content: currentContent,
          handleReferenceDelete: handleTopSlotReferenceDelete,
          handleUploadFileDelete: handleTopSlotUploadFileDelete,
        })}
      {/if}
    </div>
  {/if}

  <!-- tiptap 挂载点。Semi 只有 -editor-content 这一层（richTextInput.tsx 的 EditorContent），
       原来外面那层 -editor-wrap 只给了个 position:relative 且无绝对定位子元素，一并去掉。 -->
  <div class="cd-ai-chat-input-editor-content" bind:this={editorHost}></div>

  <!-- footer 结构逐条对齐 Semi renderFooter：左 configure、右 action（上传+发送同组）。
       round 由 -footer-round 修饰类统一改各控件圆角（对齐 Semi &-footer-round）。 -->
  <div class="cd-ai-chat-input-footer" class:cd-ai-chat-input-footer-round={round}>
    <div class="cd-ai-chat-input-footer-configure">
      {#if renderConfigureArea}
        {@render renderConfigureArea()}
      {/if}
      {#if showTemplate}
        <!-- 对齐 Semi index.tsx:507-512：模板按钮就是 Configure.Button（field="template"
             + icon={IconTemplateStroked} + onClick 接管切换），不是手写 <button>——真正
             生效的样式（描边胶囊/padding/字重/hover）全部走 Configure.Button 基线，
             与「联网搜索」是同一个组件。Semi ConfigureButton 内部固定"点击时 !value
             自动 toggle，写回 context 后再调 onClick(newValue)"，changeTemplateVisible
             接收的正是这个 toggle 后的新值，本库 onChange 同构对齐。 -->
        <AIChatInputConfigureButton
          field="template"
          initValue={false}
          icon={iconTemplateStroked}
          onChange={setTemplateVisible}
        >
          {loc().t('AIChatInput.template')}
        </AIChatInputConfigureButton>
      {/if}
    </div>

    <!--
      对齐 Semi renderRightFooter：自定义渲染时**连外层容器一起交给用户**
      （回传 className 让用户自己挂），并把默认的「上传 + 发送」两枚按钮作为
      menuItem 回传，用户可在其前后加东西而非被迫整套重写。
    -->
    {#if renderActionArea}
      {@render renderActionArea({
        menuItem: actionMenuItem,
        className: 'cd-ai-chat-input-footer-action',
      })}
    {:else}
      <div class="cd-ai-chat-input-footer-action">
        {@render actionMenuItem()}
      </div>
    {/if}
  </div>
</div>
</Popover>

{#snippet iconTemplateStroked()}<IconTemplateStroked />{/snippet}

<!--
  浮层内容：按 visible 状态分派模版 / 技能 / 建议（逐条对齐 Semi renderPopoverContent
  的 if-else 优先级：template > skill > suggestion）。
-->
{#snippet popoverContent()}
  {#if templateOpen && currentSkill && renderTemplate}
    <div class="cd-ai-chat-input-template" style={popupWidthStyle}>
      {@render renderTemplate({ skill: currentSkill, setContent: applyTemplate })}
    </div>
  {:else if showSkillPanel}
    <div
      class="cd-ai-chat-input-skill"
      style={popupWidthStyle}
      role="listbox"
      aria-label={loc().t('AIChatInput.skills')}
    >
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
  {:else if showSuggestionPanel}
    <div
      class="cd-ai-chat-input-suggestion"
      style={popupWidthStyle}
      role="listbox"
      aria-label={loc().t('AIChatInput.suggestions')}
    >
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
{/snippet}

<!-- 默认操作按钮组（上传 + 发送/停止）。抽成 snippet 以便原样回传给 renderActionArea。 -->
{#snippet actionMenuItem()}
  {#if showUploadButton}
    <!-- uploadTipProps 存在时给整个上传节点包一层 Tooltip（对齐 Semi index.tsx:558：
         `uploadTipProps ? <Tooltip {...uploadTipProps}><span>{uploadNode}</span></Tooltip> : uploadNode`）。
         此前本库完全没有这个 prop。 -->
    {#if uploadTipProps}
      <Tooltip {...uploadTipProps}>
        <span>{@render uploadNode()}</span>
      </Tooltip>
    {:else}
      {@render uploadNode()}
    {/if}
  {/if}

  {#snippet uploadNode()}
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
  {/snippet}
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
{/snippet}

<style>
  /* Semi 根节点无 gap：子元素间距完全靠各自 margin-bottom/margin-top（&-references
     margin-bottom / &-footer margin-top 等）实现，见下方各条。这里若也加 gap 会与
     子元素自身 margin 叠加，致间距翻倍（实测 references→editor 应 8px 变成 16px）。 */
  .cd-ai-chat-input {
    display: flex;
    flex-direction: column;
    padding: var(--cd-ai-chat-input-padding);
    border: 1px solid var(--cd-ai-chat-input-border);
    border-radius: var(--cd-ai-chat-input-radius);
    box-sizing: border-box;
  }

  .cd-ai-chat-input-round {
    border-radius: var(--cd-ai-chat-input-radius-round);
  }

  /* —— top area · 引用条 / topSlot（阶段 2）——
     Semi 无此 wrapper：renderTopArea 用 Fragment 把 topSlot/references/attachment
     直接摊平渲染在根节点下（本库为了方便管理才包一层 div，纯结构容器不该带样式）。
     子元素间距完全靠各自 margin-bottom（&-references / HorizontalScroller
     &-scroll-wrapper）实现，此处不能再加 gap，否则与子元素自身 margin 叠加。 */
  .cd-ai-chat-input-top {
    display: flex;
    flex-direction: column;
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
  /* Semi 未声明 box-sizing，走默认 content-box：width/height(224×36) 是内容区，
     padding(8px) 向外撑大，最终边框盒 240×52。本库全局有 border-box reset，
     此处显式改回 content-box 才能让边框盒尺寸真正对齐 Semi（而非把 224×36
     误当成边框盒总尺寸，让内容区被 padding 反向挤压到 208×20）。 */
  .cd-ai-chat-input-attachment {
    position: relative;
    display: flex;
    align-items: center;
    column-gap: var(--cd-ai-chat-input-attachment-columnGap);
    border-radius: var(--cd-ai-chat-input-attachment-radius);
    background: var(--cd-ai-chat-input-attachment-bg);
    padding: var(--cd-ai-chat-input-attachment-padding);
    box-sizing: content-box;
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

  /* Semi：删除钮默认 display:none，仅 hover 卡片时才显示在右上角。
     IconClose 渲染出 Icon.svelte 的 .cd-icon（其 scoped hash 类使特异性达 0,2,0），
     单类选择器 0,1,0 打不过——用双类选择器 :global(.cd-icon.cd-ai-chat-input-attachment-delete)
     追平特异性（同 audioplayer-dropdown-classname-specificity-loses 记忆里的解法）。 */
  :global(.cd-icon.cd-ai-chat-input-attachment-delete) {
    display: none;
  }

  .cd-ai-chat-input-attachment:hover > :global(.cd-icon.cd-ai-chat-input-attachment-delete) {
    cursor: pointer;
    position: absolute;
    top: 0;
    right: 0;
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
  /* 文件类型图标：底色按类型分派（逐条对齐 Semi &-ref-icon 的七个子类）。
     本库此前渲染了 -ref-icon-{type} 类名却没有任何对应样式 ——
     七种类型全是同一个默认底色，token 也一条没建。 */
  .cd-ai-chat-input-ref-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--cd-color-white);
    flex-shrink: 0;
  }
  .cd-ai-chat-input-ref-icon-word {
    background-color: var(--cd-color-ai-chat-input-ref-icon-word-bg);
  }
  .cd-ai-chat-input-ref-icon-pdf {
    background-color: var(--cd-color-ai-chat-input-ref-icon-word-pdf);
  }
  .cd-ai-chat-input-ref-icon-code {
    background-color: var(--cd-color-ai-chat-input-ref-icon-word-code);
  }
  .cd-ai-chat-input-ref-icon-excel {
    background-color: var(--cd-color-ai-chat-input-ref-icon-word-excel);
  }
  .cd-ai-chat-input-ref-icon-video {
    background-color: var(--cd-color-ai-chat-input-ref-icon-word-video);
  }
  .cd-ai-chat-input-ref-icon-audio {
    background-color: var(--cd-color-ai-chat-input-ref-icon-word-audio);
  }
  .cd-ai-chat-input-ref-icon-unknown {
    background-color: var(--cd-color-ai-chat-input-ref-icon-word-unknown);
  }

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

  /* 建议 / 技能 / 模版三个面板的样式已随「改由 Popover 承载」迁到组件外
     （见文件末尾的 :global 段）——它们被 portal 到 body，scoped 规则匹配不到。
     技能项 / 建议项的样式则随组件拆分迁到了 AIChatInputSkillItem.svelte /
     AIChatInputSuggestionItem.svelte。模板按钮此前是自造的独立 <button>，已改为真正
     复用 Configure.Button（对齐 Semi index.tsx:507-512），样式随之走 Button 基线，
     这里的手写样式全部删除。 */

  /* Semi &-editor-content 用「负 margin-top + 等量正 padding-top」腾出一圈缓冲区
     （margin-top: -(select_slot_delete/2 - skill_slot-marginY) = -4px；
     padding-top 同值取正 = 4px）：净视觉位置不变，但顶部多出 4px 可绘制区，
     专门容纳 skill-slot 删除圆点 hover 时凸出到 wrapper 外的那一半
     （top:0; transform:translateY(-50%)）——否则会被 overflow-y 裁掉半个圆。
     本库此前没有这两条补偿，实测删除按钮上半截被编辑区裁切。 */
  .cd-ai-chat-input-editor-content {
    min-height: var(--cd-ai-chat-input-editor-min-height);
    max-height: var(--cd-ai-chat-input-editor-max-height);
    margin-top: calc(
      -1 * (var(--cd-width-ai-chat-input-rich-text-select-slot-delete) / 2 - var(--cd-spacing-ai-chat-input-rich-text-skill-slot-marginy))
    );
    padding-top: calc(
      var(--cd-width-ai-chat-input-rich-text-select-slot-delete) / 2 - var(--cd-spacing-ai-chat-input-rich-text-skill-slot-marginy)
    );
    overflow-y: auto;
    color: var(--cd-ai-chat-input-color);
    /* 对齐 Semi aiChatInput.scss:498-499（font-size + line-height 两条都是组件专属变量）。
       原来写 `font: inherit` 会把字号一并继承外部，Semi 是显式 regular。 */
    font-size: var(--cd-font-ai-chat-input-rich-text-fontsize);
    line-height: var(--cd-ai-chat-input-rich-text-lineheight);
  }

  /* tiptap ProseMirror 编辑区：去默认 outline，占位符用 data 属性伪元素。 */
  .cd-ai-chat-input-editor-content :global(.ProseMirror) {
    outline: none;
    min-height: inherit;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .cd-ai-chat-input-editor-content :global(.ProseMirror p) {
    margin: 0;
  }

  .cd-ai-chat-input-editor-content :global(.ProseMirror p.is-editor-empty:first-child::before) {
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
  .cd-ai-chat-input-editor-content
    :global(.ProseMirror p.has-skill-slot.is-editor-empty:first-child::before) {
    content: none;
  }
  .cd-ai-chat-input-editor-content
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

  /* Semi &-footer-round：统一把配置/操作各控件改成全圆角，逐条对齐 Semi aiChatInput.scss
     &-footer-round 选择器列表（select/button/&-footer-configure-radio-button/mcp-trigger/
     action-button/action-upload/radio-addon-buttonRadio 共七项，radio 相关有两条：外层
     配置容器类 + 内层每个按钮项类，两条都要变胶囊，此前只接了其中一条）。
     select/button/radio/mcp-trigger 渲染在子组件里，用 :global 打洞才够得着；
     configure-select 真正带 border-radius 的是内层 .cd-select-trigger（同 select-slot/
     configure-select 边框覆盖踩过的两层结构坑，外层根节点无视觉，border-radius 不继承）；
     radio-button：class 与 RadioGroup 自身的 .cd-radioGroup-buttonRadio（灰底容器，真正
     带背景色）挂在同一个 DOM 节点上（非两层嵌套——`class={cls}` 直接透传给 RadioGroup
     根节点），故用同节点选择器（无后代空格）才能命中，之前误写成后代选择器致规则从未
     命中任何元素，灰底容器圆角实际仍是 scoped 里的默认小圆角。
     内部每个按钮项 .cd-radio-addon-buttonRadio（真正带选中态背景色）需要嵌套后代选择器
     （它在灰底容器内部），也要同步变胶囊，否则选中态背景与已变胶囊的灰底容器不协调。 */
  .cd-ai-chat-input-footer-round .cd-ai-chat-input-footer-action-button,
  .cd-ai-chat-input-footer-round .cd-ai-chat-input-footer-action-upload,
  .cd-ai-chat-input-footer-round :global(.cd-ai-chat-input-footer-configure-select .cd-select-trigger),
  .cd-ai-chat-input-footer-round :global(.cd-ai-chat-input-footer-configure-button),
  .cd-ai-chat-input-footer-round :global(.cd-ai-chat-input-footer-configure-radio-button .cd-radio-addon-buttonRadio),
  .cd-ai-chat-input-footer-round :global(.cd-ai-chat-input-footer-configure-mcp-trigger) {
    border-radius: var(--cd-radius-ai-chat-input-footer-round);
  }

  /* .cd-radioGroup-buttonRadio 的 scoped 圆角声明（RadioGroup.svelte 内，单类但带
     scoped 属性选择器加权）与本处 :global() 双类后代选择器特异性打平，源码顺序判定
     下未生效——单独拆出用 !important 稳定压过（同 select-slot/configure-button 踩过的
     特异性坑，此前误写成三层后代选择器查询不到任何元素，问题被掩盖成"看似未生效"）。 */
  .cd-ai-chat-input-footer-round :global(.cd-ai-chat-input-footer-configure-radio-button) {
    border-radius: var(--cd-radius-ai-chat-input-footer-round) !important;
  }

  /* Semi &-footer-configure：flex + column-gap 8px */
  .cd-ai-chat-input-footer-configure {
    display: flex;
    align-items: center;
    column-gap: var(--cd-spacing-ai-chat-input-footer-configure-columngap);
  }

  /* Semi &-footer-action：flex + column-gap 8px，内部 button 去默认样式。
     renderActionArea 自定义渲染时容器本身（class={className}）由调用方在另一个组件
     文件里创建（如 demo 09-action-area.svelte），不带本文件的 scoped 属性哈希——scoped
     选择器命不中，实测纵向堆叠（同批 configure-select/-button round 特异性问题的另一种
     形态：这次是"scoped 完全够不着"而非"特异性打平"），改 :global() 才能跨文件命中。 */
  :global(.cd-ai-chat-input-footer-action) {
    display: flex;
    align-items: center;
    column-gap: var(--cd-spacing-ai-chat-input-footer-action-columngap);
  }
  :global(.cd-ai-chat-input-footer-action button) {
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

  /* Semi &-footer-action-upload：span 触发器需自补 flex 居中才能吃到 width/height（inline 元素两者均不生效） */
  .cd-ai-chat-input-footer-action-upload {
    display: inline-flex;
    align-items: center;
    justify-content: center;
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

  /* —— 浮层内容（建议 / 技能 / 模版）——
     这三块被 Popover portal 到 body，已脱离本组件的 scope，故必须 :global 打洞。
     定位/背景/圆角/阴影由 Popover 承担（对齐 Semi：其 scss 里这三者也**没有**
     position/box-shadow，全交给 Popover）；这里只留 Semi 确有的那几条。 */

  /* Semi: &-skill { padding + border-radius + overflow:scroll }，高度由内联 style 钉 */
  :global(.cd-ai-chat-input-skill) {
    padding: var(--cd-spacing-ai-chat-input-skill-paddingy)
      var(--cd-spacing-ai-chat-input-skill-paddingx);
    border-radius: var(--cd-radius-ai-chat-input-skill);
    overflow: scroll;
    max-height: 270px;
  }

  /* Semi: &-suggestion { overflow: scroll }，仅此一条 */
  :global(.cd-ai-chat-input-suggestion) {
    overflow: scroll;
    max-height: 270px;
  }

  /* Semi renderTemplate 的容器只有内联 style（width + maxHeight 500），无独立 scss 规则 */
  :global(.cd-ai-chat-input-template) {
    max-height: 500px;
    overflow-y: auto;
  }

  /* Semi: &-popover-suggestion { box-shadow: none } —— 建议浮层不要 Popover 的阴影 */
  :global(.cd-ai-chat-input-popover-suggestion) {
    box-shadow: none;
  }

  /* ⚠️ 触发器包裹层必须撑满宽度。
     本库 Tooltip/Popover 会把触发器包进两层 span（外层 .cd-tooltip + 内层
     .cd-tooltip-trigger），二者都是 inline-block —— 会把本组件这种块级输入框
     **收缩成内容宽度**（实测 890px → 106px，整页每个实例都被压扁）。
     Semi 侧 Popover 用 React.cloneElement 不加包裹层，没有这个问题。
     外层由 triggerStyle 处理，内层只能从这里 :global 打洞。 */
  :global(.cd-ai-chat-input-popover-trigger > .cd-tooltip-trigger) {
    display: block;
    width: 100%;
  }
</style>
