<!--
  Select — see specs/components/input/Select.spec.md
  单选 / 多选 / 本地过滤 / 键盘导航 / 浮层。Token-driven, a11y-correct.
  下拉 portal 到 body + position:fixed（脱离 overflow:hidden 裁剪），matchWidth 跟随触发器宽度，flip 避让。
  maxTagCount：多选 tag 超出折叠为 +N。allowCreate：filter 无匹配时可创建新选项。
  分组：options 含 { label, options:[] } 时按组渲染组标题；逻辑/键盘/filter 基于扁平序列。
  remote：提供 onSearch 时输入防抖回调（searchDebounce ms），由外部更新 options；loading 显示 spinner。
  虚拟化：virtualized=true 时下拉只渲染视口内 option（复用 core fixedRange），spacer 撑总高、
  option 绝对定位按索引偏移；scrollTop 由命令式 scroll 回调 + rAF 节流写入本地 $state，可见区间
  纯 $derived render 期只读（红线 #2/#3）。键盘移动 activeIndex 时命令式 scrollOffsetForIndex 滚到可见
  （未渲染的 active option 移动后会被滚进视口而渲染，a11y 取舍同 Tree 虚拟化）。
  虚拟化仅作用于「非分组」扁平选项集（hasGroups 时回退全量渲染，忽略 virtualized）。
  dropdownMatchSelectWidth：浮层宽度是否跟随触发器（默认 true）；false 时浮层自适应内容宽度。
  destroyOnClose：关闭时销毁浮层 DOM（默认 false，保持挂载）。
  getPopupContainer：浮层挂载目标容器（由 use:floating action 接管）。
  emptyContent/empty snippet：空态自定义内容。
  prefix/suffix/arrowIcon/clearIcon snippet：触发器前后缀与图标。
  dropdownHeader/dropdownFooter snippet：浮层顶/底固定区。
  option snippet：自定义单项渲染；label snippet：自定义选中值/Tag 渲染。
  onSelect/onDeselect/onClear/onCreate/onFocus/onBlur/onScrollToBottom/onExceed/onChangeWithObject。
  autoClearSearchValue：多选选中后自动清空搜索词（默认 true）。
  showRestTagsPopover：+N tag 悬停展示剩余 tags（利用 title 属性）。
  borderless：无边框模式；autoFocus：挂载自动聚焦；id：关联外部 label。
  optionLabelProp：用作回显的字段名（默认 'label'，当前 OptionData 仅支持 label/value）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { untrack } from 'svelte';
  import {
    useId,
    useDismiss,
    fixedRange,
    scrollOffsetForIndex,
    type Placement,
  } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';
  import { floating } from '../_floating/use-floating.js';

  type OptionValue = string | number;
  type OptionData = { label: string; value: OptionValue; disabled?: boolean; [key: string]: unknown };
  /** 选项分组：含 options 即为分组项 */
  type OptionGroup = { label: string; options: OptionData[] };
  type OptionOrGroup = OptionData | OptionGroup;
  type Size = 'small' | 'default' | 'large';
  type Status = 'default' | 'warning' | 'error';

  function isGroup(o: OptionOrGroup): o is OptionGroup {
    return Array.isArray((o as OptionGroup).options);
  }

  interface Props {
    value?: OptionValue | OptionValue[];
    defaultValue?: OptionValue | OptionValue[];
    /** 选项；可含分组项 { label, options: [] } */
    options?: OptionOrGroup[];
    multiple?: boolean;
    filter?: boolean;
    open?: boolean;
    defaultOpen?: boolean;
    size?: Size;
    status?: Status;
    /** 下拉浮层 placement（默认 bottomStart，自动避让仍生效） */
    placement?: Placement;
    placeholder?: string;
    /** combobox 触发器可访问名；缺省回退到 placeholder 或 locale 默认 */
    ariaLabel?: string;
    /** 关联外部 label 的 id（优先于 ariaLabel） */
    ariaLabelledby?: string;
    /** 绑定到触发器的 id 属性，用于关联外部 <label for="..."> */
    id?: string;
    disabled?: boolean;
    clearable?: boolean;
    /** 多选 tag 最大显示数，超出折叠为 +N（0=不折叠） */
    maxTagCount?: number;
    /** 多选单个 Tag 文本最大长度，超出截断为「前缀…」，完整文本经 title 查看（不截则不传） */
    maxTagTextLength?: number;
    /** filter 无匹配时允许创建新选项（值=输入文本） */
    allowCreate?: boolean;
    /** 远程搜索：输入防抖后回调（由外部更新 options，不再本地过滤） */
    onSearch?: (query: string) => void;
    /** 远程加载中（显示 spinner） */
    loading?: boolean;
    /** onSearch 防抖毫秒（默认 300） */
    searchDebounce?: number;
    /** 选项虚拟化：大数据下拉只渲染视口内 option（仅非分组生效，默认 false） */
    virtualized?: boolean;
    /** 虚拟化选项行高（px，默认 32）；需与样式实际行高一致 */
    optionHeight?: number;
    /** 下拉最大高度（px，默认 256）；虚拟化时同时作为视口高度 */
    maxHeight?: number;
    /** 浮层宽度是否跟随触发器（默认 true）；false 时浮层自适应内容宽度 */
    dropdownMatchSelectWidth?: boolean;
    /** 浮层根 div 追加的自定义 className（与内置 cd-select__dropdown 并存） */
    dropdownClassName?: string;
    /** 浮层根 div 合并的自定义内联样式（拼在内置 style 之后；勿含 position/transform，会与定位冲突） */
    dropdownStyle?: string;
    /** 浮层层级（z-index）；不传时由 CSS 层级 token 控制 */
    zIndex?: number;
    /**
     * 浮层与触发器的间距(px)，映射到 floating 主轴 offset；不传保持默认 4。
     * 兼容 Semi object 形态 { top?, bottom?, left?, right? }：按 placement 主轴方向取值
     * （bottom/top 系取 bottom/top，left/right 系取 left/right），缺项回退默认。
     */
    dropdownMargin?: number | { top?: number; bottom?: number; left?: number; right?: number };
    /** 关闭时销毁浮层 DOM（默认 false，复用节点避免重建开销） */
    destroyOnClose?: boolean;
    /** 浮层挂载目标容器（默认 body） */
    getPopupContainer?: () => HTMLElement;
    /** 无边框模式：移除触发器边框 */
    borderless?: boolean;
    /** 挂载后自动聚焦触发器 */
    autoFocus?: boolean;
    /** 多选选中后自动清空搜索词（默认 true） */
    autoClearSearchValue?: boolean;
    /** 超出 maxTagCount 时，将 +N 悬停展示剩余 tags（title tooltip） */
    showRestTagsPopover?: boolean;
    /** 透传给 +N 悬停 popover 的参数（预留，当前通过 title 实现） */
    restTagsPopoverProps?: Record<string, unknown>;
    /**
     * 打开浮层时是否默认高亮第一个可用选项（键盘 Enter 可直接选中，对齐 Semi v2.17+ 默认 true）。
     * 接入 activeIndex 初始化：打开时把 activeIndex 定位到首个非禁用选项（filter 输入变化后同样重定位）。
     */
    defaultActiveFirstOption?: boolean;
    /**
     * 透传给搜索 input 的额外属性（filter 搜索框；searchPosition='trigger' 内联 input 与 'dropdown' 浮层 input 均生效）。
     * 对齐 Semi：勿传 value/onChange/onFocus 等会覆盖组件内部搜索回调的键（内部绑定优先，展开在前）。
     */
    inputProps?: Record<string, unknown>;
    /** 是否显示触发器右侧下拉箭头（默认 true）；false 时隐藏箭头区（suffix 存在时以 suffix 为准） */
    showArrow?: boolean;
    /** 浮层已展开时，点击触发器是否收起浮层（默认 false；对齐 Semi clickToHide） */
    clickToHide?: boolean;
    /** 浮层选项列表滚动时的回调（对齐 Semi onListScroll，携带原生 scroll 事件） */
    onListScroll?: (e: Event) => void;
    /** autoFocus/命令式聚焦触发器时是否传入 focus({ preventScroll })，避免页面跳动（对齐 Semi preventScroll） */
    preventScroll?: boolean;
    /**
     * 多选且 maxTagCount 折叠出 +N 时，浮层打开状态下点击 +N 是否就地展开剩余全部 Tag（对齐 Semi expandRestTagsOnClick）。
     * 展开为纯展示态（本地 $state），不影响选中值；浮层关闭时自动复位为折叠。
     */
    expandRestTagsOnClick?: boolean;
    /**
     * 多选且存在 maxTagCount 时，对溢出部分的可见 Tag 做省略处理（最后一个可见 Tag 文本超出触发器宽度时截断为「前缀…」）。
     * 对齐 Semi ellipsisTrigger：纯 CSS 单行省略，完整文本经 title 查看；不影响选中值。
     */
    ellipsisTrigger?: boolean;
    /** 用作回显的字段名（默认 'label'）；当选项含自定义字段时取对应值作显示文本 */
    optionLabelProp?: string;
    /**
     * 搜索框位置：'dropdown'（默认，浮层内独立搜索框）| 'trigger'（搜索输入内联在触发器上）。
     * 仅在 filter=true 时生效。'trigger' 时输入框长驻触发器（单选选中值作 placeholder，
     * 多选与 tags 并排），键入即在触发器上就地过滤，无需先打开浮层内的独立搜索框。
     */
    searchPosition?: 'dropdown' | 'trigger';
    /**
     * 内嵌标签：浮入触发器左侧的常驻标签（string 或 Snippet），用于「标签+值」一体式触发器。
     * 渲染在前缀之后、内容之前，不影响选中值/过滤逻辑（纯展示，对齐 DatePicker insetInput 的展示层定位）。
     */
    insetLabel?: string | Snippet;
    /**
     * insetLabel 的 id，挂到内嵌标签元素上并经 aria-labelledby 关联触发器 combobox，
     * 使屏幕阅读器把内嵌标签朗读为触发器可访问名的一部分。仅 insetLabel 存在时生效。
     */
    insetLabelId?: string;
    onChange?: (v: OptionValue | OptionValue[]) => void;
    onOpenChange?: (open: boolean) => void;
    /** 选中某项时触发（多选：每次单个 toggle 选中时；单选：选中时） */
    onSelect?: (value: OptionValue, option: OptionData) => void;
    /** 多选取消某项时触发 */
    onDeselect?: (value: OptionValue, option: OptionData) => void;
    /** 点击清除按钮时触发 */
    onClear?: () => void;
    /** allowCreate 创建新项时触发 */
    onCreate?: (value: string) => void;
    /** 触发器获焦时触发 */
    onFocus?: () => void;
    /** 触发器失焦时触发 */
    onBlur?: () => void;
    /** 浮层列表滚动触底时触发 */
    onScrollToBottom?: () => void;
    /** 多选超出 maxTagCount 时触发（携带被隐藏的 option） */
    onExceed?: (option: OptionData) => void;
    /** 携带完整 option 对象的 change 回调（单选 OptionData；多选 OptionData[]） */
    onChangeWithObject?: (option: OptionData | OptionData[]) => void;
    /** 触发器左侧前缀 */
    prefix?: Snippet;
    /** 触发器右侧后缀（覆盖默认箭头区域） */
    suffix?: Snippet;
    /** 自定义清除按钮图标 */
    clearIcon?: Snippet;
    /** 自定义下拉箭头图标 */
    arrowIcon?: Snippet;
    /** 自定义空态内容（字符串或 Snippet 均可，为字符串时直接渲染文本） */
    emptyContent?: string | Snippet;
    /** 自定义空态 snippet（与 emptyContent 等价，优先级同） */
    empty?: Snippet;
    /** 浮层顶部固定区（inner：渲染在滚动列表内部顶端，随 optionList 滚动，对齐 Semi innerTopSlot） */
    dropdownHeader?: Snippet;
    /** 浮层底部固定区（inner：渲染在滚动列表内部底端，随 optionList 滚动，对齐 Semi innerBottomSlot） */
    dropdownFooter?: Snippet;
    /** 浮层最外层顶部 slot（outer：与滚动列表平级、位于滚动区之外，始终固定展现，对齐 Semi outerTopSlot） */
    outerTopSlot?: Snippet;
    /** 浮层最外层底部 slot（outer：与滚动列表平级、位于滚动区之外，始终固定展现，对齐 Semi outerBottomSlot） */
    outerBottomSlot?: Snippet;
    /** 自定义单项渲染 */
    option?: Snippet<[{ option: OptionData; selected: boolean; active: boolean }]>;
    /** 自定义选中值/Tag 渲染 */
    label?: Snippet<[{ option: OptionData }]>;
    /** 自定义"创建xxx"项渲染 */
    renderCreateItem?: Snippet<[string]>;
    /**
     * 完全自定义触发器渲染，替换默认 combobox 触发框。
     * 入参含当前 value/选中项/placeholder/open 态，供调用方自绘触发器。
     * a11y 注意：默认触发框携带的 role=combobox / aria-expanded / 键盘（↑↓/Enter/Esc）随之移除；
     * 自定义触发器需自行把必要 aria（role/aria-expanded/aria-controls）与聚焦/键盘事件挂到自绘元素上，
     * 或复用 params 里透传的 open/toggle/onTriggerKeydown 保持键盘可达。
     */
    triggerRender?: Snippet<
      [
        {
          value: OptionValue | OptionValue[] | undefined;
          selectedOptions: OptionData[];
          placeholder: string;
          open: boolean;
          disabled: boolean;
          toggle: () => void;
          onTriggerKeydown: (e: KeyboardEvent) => void;
        },
      ]
    >;
  }

  let {
    value = $bindable(),
    defaultValue,
    options = [],
    multiple = false,
    filter = false,
    open = $bindable(),
    defaultOpen = false,
    size = 'default',
    status = 'default',
    placement = 'bottomStart',
    placeholder,
    ariaLabel,
    ariaLabelledby,
    id,
    disabled = false,
    clearable = false,
    maxTagCount = 0,
    maxTagTextLength,
    allowCreate = false,
    onSearch,
    loading = false,
    searchDebounce = 300,
    virtualized = false,
    optionHeight = 32,
    maxHeight = 256,
    dropdownMatchSelectWidth = true,
    dropdownClassName,
    dropdownStyle,
    zIndex,
    dropdownMargin,
    destroyOnClose = false,
    getPopupContainer,
    borderless = false,
    autoFocus = false,
    autoClearSearchValue = true,
    showRestTagsPopover = false,
    restTagsPopoverProps,
    defaultActiveFirstOption = true,
    inputProps,
    showArrow = true,
    clickToHide = false,
    onListScroll,
    preventScroll = false,
    expandRestTagsOnClick = false,
    ellipsisTrigger = false,
    optionLabelProp = 'label',
    searchPosition = 'dropdown',
    insetLabel,
    insetLabelId,
    onChange,
    onOpenChange,
    onSelect,
    onDeselect,
    onClear,
    onCreate,
    onFocus,
    onBlur,
    onScrollToBottom,
    onExceed,
    onChangeWithObject,
    prefix,
    suffix,
    clearIcon,
    arrowIcon,
    emptyContent,
    empty,
    dropdownHeader,
    dropdownFooter,
    outerTopSlot,
    outerBottomSlot,
    option: optionSnippet,
    label: labelSnippet,
    renderCreateItem,
    triggerRender,
  }: Props = $props();

  const loc = useLocale();

  const listId = useId('cd-select-list');

  // --- 受控值 (红线 #1): 不无条件回写 value，仅 onChange ---
  const isValueControlled = $derived(value !== undefined);
  let innerValue = $state<OptionValue | OptionValue[] | undefined>(getInitialValue());
  const currentValue = $derived(isValueControlled ? value : innerValue);

  function getInitialValue(): OptionValue | OptionValue[] | undefined {
    return defaultValue;
  }

  const selectedValues = $derived<OptionValue[]>(
    normalizeSelected(currentValue),
  );

  function normalizeSelected(v: OptionValue | OptionValue[] | undefined): OptionValue[] {
    if (v === undefined) return [];
    return Array.isArray(v) ? v : [v];
  }

  function setValue(next: OptionValue | OptionValue[]) {
    if (!isValueControlled) innerValue = next;
    onChange?.(next);
  }

  // --- 受控 open (红线 #1): 不无条件回写 open，仅 onOpenChange ---
  const isOpenControlled = $derived(open !== undefined);
  let innerOpen = $state(getInitialOpen());
  const isOpen = $derived(isOpenControlled ? !!open : innerOpen);

  function getInitialOpen(): boolean {
    return defaultOpen;
  }

  function setOpen(next: boolean) {
    if (next === isOpen) return;
    if (!isOpenControlled) innerOpen = next;
    onOpenChange?.(next);
    if (!next) {
      activeIndex = -1;
      query = '';
      // 关闭浮层时复位 +N 展开态（展开仅在打开时生效，对齐 Semi expandRestTagsOnClick）。
      restTagsExpanded = false;
    }
  }

  // expandRestTagsOnClick：浮层打开态下点击 +N 就地展开剩余 Tag 的本地展示态（不影响选中值）。
  let restTagsExpanded = $state(false);

  // 挂载自动聚焦（autoFocus）；preventScroll 时透传给 focus 避免页面跳动。
  $effect(() => {
    if (!autoFocus || !rootEl) return;
    const trigger = rootEl.querySelector<HTMLElement>('[role="combobox"]');
    trigger?.focus({ preventScroll });
  });

  // --- 本地过滤搜索 ---
  let query = $state('');

  // 是否含分组：决定渲染走分组结构还是扁平。
  const hasGroups = $derived(options.some(isGroup));
  // 扁平选项序列（拍平分组）——逻辑/键盘/filter/回显统一基于它。
  const flatBase = $derived<OptionData[]>(
    options.flatMap((o) => (isGroup(o) ? o.options : [o])),
  );

  // allowCreate：本地已创建选项，合并进选项集供回显与列表（不写回 options prop）。
  let createdOptions = $state<OptionData[]>([]);
  const mergedOptions = $derived<OptionData[]>(
    createdOptions.length === 0 ? flatBase : [...flatBase, ...createdOptions],
  );

  // remote 模式：外部已按 query 更新 options，本地不再过滤。
  const isRemote = $derived(onSearch !== undefined);

  const filteredOptions = $derived.by(() => {
    if (isRemote) return mergedOptions;
    if (!filter || query.trim() === '') return mergedOptions;
    const q = query.toLowerCase();
    return mergedOptions.filter((o) => o.label.toLowerCase().includes(q));
  });

  // 分组渲染视图：每组过滤后的选项 + 全局扁平索引（用于 activeIndex 匹配）。
  // 仅在 hasGroups 时使用；createdOptions 归入末尾「（新建）」无组段。
  const groupedView = $derived.by<{ label: string | null; items: { opt: OptionData; flatIndex: number }[] }[]>(() => {
    if (!hasGroups) return [];
    const out: { label: string | null; items: { opt: OptionData; flatIndex: number }[] }[] = [];
    const indexOf = (opt: OptionData) => filteredOptions.indexOf(opt);
    for (const o of options) {
      if (isGroup(o)) {
        const items = o.options
          .filter((opt) => filteredOptions.includes(opt))
          .map((opt) => ({ opt, flatIndex: indexOf(opt) }));
        if (items.length > 0) out.push({ label: o.label, items });
      } else if (filteredOptions.includes(o)) {
        out.push({ label: null, items: [{ opt: o, flatIndex: indexOf(o) }] });
      }
    }
    // 已创建选项（无组）
    const created = createdOptions
      .filter((opt) => filteredOptions.includes(opt))
      .map((opt) => ({ opt, flatIndex: indexOf(opt) }));
    if (created.length > 0) out.push({ label: null, items: created });
    return out;
  });

  // 当前输入是否可创建新选项：allowCreate + filter 有输入 + 无 label 完全匹配。
  const canCreate = $derived(
    allowCreate &&
      filter &&
      query.trim() !== '' &&
      !mergedOptions.some((o) => o.label.toLowerCase() === query.trim().toLowerCase()),
  );

  function createOption() {
    const label = query.trim();
    if (!label) return;
    const opt: OptionData = { label, value: label };
    createdOptions = [...createdOptions, opt];
    onCreate?.(label);
    selectOption(opt);
    query = '';
  }

  // --- roving 高亮 (红线 #2): activeIndex 为本地 $state，不依赖挂载 registry ---
  let activeIndex = $state(-1);

  // defaultActiveFirstOption（对齐 Semi 默认 true）：浮层打开时默认高亮首个可用选项，
  // 使键盘 Enter 可直接选中；filter 输入变化导致选项集变更后同样重定位到首项。
  // 依赖 isOpen + filteredOptions（选项集）触发；activeIndex 以 untrack 读取避免自触发循环
  // （写回 activeIndex 不应再次调度本 effect —— 参考记忆「声明式子组件注册勿用 $state 数组」的自循环坑）。
  $effect(() => {
    if (!defaultActiveFirstOption || !isOpen) return;
    const list = filteredOptions; // 显式建立依赖：选项集变化后重算
    const len = list.length;
    const cur = untrack(() => activeIndex);
    if (cur < 0 || cur >= len) {
      activeIndex = list.findIndex((o) => !o.disabled);
    }
  });

  const activeOptionId = $derived(
    activeIndex >= 0 && activeIndex < filteredOptions.length
      ? `${listId}-opt-${activeIndex}`
      : undefined,
  );

  // --- 选项虚拟化（仅非分组生效；分组时回退全量渲染）---
  // 视口=下拉容器自身滚动；scrollTop 由命令式 scroll 回调写入本地 $state，
  // 可见区间纯 $derived render 期只读不读 DOM（红线 #2/#3）。
  const VIRTUAL_OVERSCAN = 4;
  const isVirtual = $derived(virtualized && !hasGroups);
  const vOptionHeight = $derived(optionHeight > 0 ? optionHeight : 32);
  const vViewportH = $derived(maxHeight > 0 ? maxHeight : 256);
  // 仅由 scroll 回调写入的本地 scrollTop，render 期只读。
  let scrollTop = $state(0);
  // rAF 节流句柄（非响应式）。
  let rafId = 0;

  const vTotalHeight = $derived(filteredOptions.length * vOptionHeight);
  const vRange = $derived(
    isVirtual
      ? fixedRange(scrollTop, vViewportH, vOptionHeight, filteredOptions.length, VIRTUAL_OVERSCAN)
      : { startIndex: 0, endIndex: filteredOptions.length },
  );
  // 实际喂给 #each 的选项集合：虚拟化时只取视口内切片，否则全量。
  const vRenderOptions = $derived(
    isVirtual ? filteredOptions.slice(vRange.startIndex, vRange.endIndex) : filteredOptions,
  );

  const selectedOptions = $derived(
    mergedOptions.filter((o) => selectedValues.includes(o.value)),
  );
  // 截断纯函数：仅影响显示，超过 limit 取前 limit 字符 + 省略号（红线 #2）。
  function truncate(text: string, limit?: number): string {
    if (limit === undefined || limit < 0) return text;
    return text.length > limit ? `${text.slice(0, limit)}…` : text;
  }

  // maxTagCount 折叠：显示前 N 个 tag + 隐藏数。
  // maxTagTextLength 仅影响 tag 显示文本（截断派生），实际值/回显不变（红线 #1/#2）。
  // expandRestTagsOnClick 且已点击 +N 展开（restTagsExpanded）时，视为不折叠、全量展示（对齐 Semi）。
  const tagsCollapsed = $derived(
    maxTagCount > 0 && !(expandRestTagsOnClick && restTagsExpanded),
  );
  const visibleTags = $derived(
    (tagsCollapsed ? selectedOptions.slice(0, maxTagCount) : selectedOptions).map(
      (opt) => {
        const raw = getOptionLabel(opt);
        const display = truncate(raw, maxTagTextLength);
        return { opt, display, truncated: display !== raw };
      },
    ),
  );
  const hiddenTagCount = $derived(
    tagsCollapsed ? Math.max(0, selectedOptions.length - maxTagCount) : 0,
  );

  // optionLabelProp：取选项对应字段作为显示文本（默认 'label'）。
  function getOptionLabel(opt: OptionData): string {
    const val = opt[optionLabelProp];
    return typeof val === 'string' ? val : opt.label;
  }

  const singleLabel = $derived(
    !multiple && selectedOptions.length > 0 ? getOptionLabel(selectedOptions[0]!) : '',
  );

  const hasSelection = $derived(selectedValues.length > 0);
  const showClear = $derived(clearable && !disabled && hasSelection);

  function isSelected(v: OptionValue): boolean {
    return selectedValues.includes(v);
  }

  function selectOption(opt: OptionData) {
    if (opt.disabled || disabled) return;
    if (multiple) {
      const set = selectedValues.slice();
      const idx = set.indexOf(opt.value);
      const isAdd = idx === -1;
      if (isAdd) {
        set.push(opt.value);
        onSelect?.(opt.value, opt);
        // onExceed：新增后超出 maxTagCount 时，把被隐藏的 option 逐个通知
        if (onExceed && maxTagCount > 0 && set.length > maxTagCount) {
          // 新加入的 opt 将落入隐藏区（set 已包含 opt，取其后面被挤出的部分）
          const hiddenValues = set.slice(maxTagCount);
          for (const v of hiddenValues) {
            const hiddenOpt = mergedOptions.find((o) => o.value === v);
            if (hiddenOpt) onExceed(hiddenOpt);
          }
        }
      } else {
        set.splice(idx, 1);
        onDeselect?.(opt.value, opt);
      }
      setValue(set);
      // 多选携带完整对象回调：按新选中集合取 option
      const newSelected = mergedOptions.filter((o) => set.includes(o.value));
      onChangeWithObject?.(newSelected);
      // 多选选中后自动清空搜索词
      if (autoClearSearchValue && isAdd) query = '';
      // 多选不关闭
    } else {
      onSelect?.(opt.value, opt);
      setValue(opt.value);
      onChangeWithObject?.(opt);
      setOpen(false);
    }
  }

  function removeTag(v: OptionValue) {
    if (disabled) return;
    const set = selectedValues.filter((x) => x !== v);
    setValue(set);
  }

  function clearAll(e: MouseEvent) {
    e.stopPropagation();
    if (disabled) return;
    setValue(multiple ? [] : '');
    onClear?.();
  }

  function toggleOpen() {
    if (disabled) return;
    // clickToHide（对齐 Semi，默认 false）：展开态下点击触发器默认不收起浮层，
    // 仅 clickToHide=true 时点击收起；关闭态点击始终打开。
    if (isOpen && !clickToHide) return;
    setOpen(!isOpen);
  }

  function moveActive(delta: number) {
    const len = filteredOptions.length;
    if (len === 0) return;
    let next = activeIndex;
    for (let i = 0; i < len; i += 1) {
      next = (next + delta + len) % len;
      if (!filteredOptions[next]?.disabled) {
        activeIndex = next;
        scrollIndexIntoView(next);
        return;
      }
    }
  }

  // Home/End：从列表首/末向内找首个可用（非禁用）选项作为活动项（spec §6 键盘）。
  function moveActiveEdge(edge: 'first' | 'last') {
    const len = filteredOptions.length;
    if (len === 0) return;
    const step = edge === 'first' ? 1 : -1;
    let i = edge === 'first' ? 0 : len - 1;
    while (i >= 0 && i < len) {
      if (!filteredOptions[i]?.disabled) {
        activeIndex = i;
        scrollIndexIntoView(i);
        return;
      }
      i += step;
    }
  }

  // 命令式滚到指定选项索引使其落入视口（虚拟化键盘导航时调用）。
  // 未渲染的 active option 经此滚入视口后才会渲染（a11y 取舍同 Tree 虚拟化）。
  function scrollIndexIntoView(index: number) {
    const el = dropdownEl;
    if (!el || !isVirtual || index < 0) return;
    const itemStart = index * vOptionHeight;
    const top = el.scrollTop;
    const bottom = top + el.clientHeight;
    // 已完整可见则不滚动，避免抖动。
    if (itemStart >= top && itemStart + vOptionHeight <= bottom) return;
    const align = itemStart < top ? 'start' : 'end';
    const target = scrollOffsetForIndex(
      itemStart,
      vOptionHeight,
      el.clientHeight,
      vTotalHeight,
      align,
    );
    el.scrollTop = target;
    scrollTop = target;
  }

  function onTriggerKeydown(e: KeyboardEvent) {
    if (disabled) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) setOpen(true);
        else moveActive(1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!isOpen) setOpen(true);
        else moveActive(-1);
        break;
      case 'Home':
        // 打开态下跳到列表首项；未打开则不拦截（让文本输入光标行为默认）。
        if (isOpen) {
          e.preventDefault();
          moveActiveEdge('first');
        }
        break;
      case 'End':
        if (isOpen) {
          e.preventDefault();
          moveActiveEdge('last');
        }
        break;
      case 'Enter':
        e.preventDefault();
        if (!isOpen) {
          setOpen(true);
        } else if (activeIndex >= 0) {
          const opt = filteredOptions[activeIndex];
          if (opt) selectOption(opt);
        } else if (canCreate) {
          createOption();
        }
        break;
      case ' ':
        // filter 输入时空格应输入到搜索框，不拦截
        if (!filter) {
          e.preventDefault();
          if (!isOpen) setOpen(true);
        }
        break;
      case 'Escape':
        if (isOpen) {
          e.preventDefault();
          setOpen(false);
        }
        break;
      default:
        break;
    }
  }

  // --- remote 搜索防抖（命令式定时器 + cleanup，红线 #3）---
  let searchTimer: ReturnType<typeof setTimeout> | undefined;
  function scheduleSearch(q: string) {
    if (searchTimer !== undefined) clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      searchTimer = undefined;
      onSearch?.(q);
    }, Math.max(0, searchDebounce));
  }
  // 卸载兜底清理。
  $effect(() => () => {
    if (searchTimer !== undefined) clearTimeout(searchTimer);
  });

  function onSearchInput(e: Event & { currentTarget: HTMLInputElement }) {
    query = e.currentTarget.value;
    if (!isOpen) setOpen(true);
    activeIndex = -1;
    if (isRemote) scheduleSearch(query);
  }

  // --- DOM 引用：触发根 + portal 下拉外层容器 + 内层滚动列表（定位由 use:floating action 接管）---
  let rootEl = $state<HTMLDivElement | null>(null);
  // dropdownRootEl：浮层最外层（use:floating 定位、outer slot 所在层）。
  let dropdownRootEl = $state<HTMLDivElement | null>(null);
  // dropdownEl：内层 role=listbox 滚动容器（onListScroll/虚拟化/触底/浮层搜索聚焦均以它为准）。
  let dropdownEl = $state<HTMLDivElement | null>(null);

  // --- 虚拟化滚动监听（命令式 + rAF 节流 + cleanup，红线 #3）---
  // 开启下拉后绑定到滚动容器；scrollTop 写本地 $state 驱动 vRange 派生。
  // 同时处理 onScrollToBottom（无论是否虚拟化）。
  $effect(() => {
    const el = dropdownEl;
    if (!el || !isOpen) return;
    if (isVirtual) {
      // 重新打开时复位滚动位置，避免沿用上次 scrollTop。
      scrollTop = el.scrollTop;
    }
    function onScroll(e: Event) {
      if (isVirtual) {
        if (rafId) return;
        rafId = requestAnimationFrame(() => {
          rafId = 0;
          if (el) scrollTop = el.scrollTop;
        });
      }
      // 选项列表滚动回调（对齐 Semi onListScroll，携带原生事件）
      onListScroll?.(e);
      // 触底检测（1px 容差）
      if (onScrollToBottom && el) {
        const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
        if (atBottom) onScrollToBottom();
      }
    }
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };
  });

  // --- useDismiss (红线 #3): dropdown portal 出 root 子树后列入 extraTargets ---
  $effect(() => {
    if (!isOpen || !rootEl) return;
    const cleanup = useDismiss(rootEl, {
      onDismiss: () => setOpen(false),
      escape: true,
      outsideClick: true,
      extraTargets: [dropdownRootEl],
    });
    return cleanup;
  });

  // dropdownMargin → floating 主轴 offset：number 直用；object 按 placement 主轴取值（缺项回退 4）。
  const dropdownOffset = $derived.by(() => {
    if (dropdownMargin === undefined) return 4;
    if (typeof dropdownMargin === 'number') return dropdownMargin;
    const horizontal = placement.startsWith('left') || placement.startsWith('right');
    if (horizontal) return (placement.startsWith('left') ? dropdownMargin.left : dropdownMargin.right) ?? 4;
    return (placement.startsWith('top') ? dropdownMargin.top : dropdownMargin.bottom) ?? 4;
  });

  // 浮层根 div class：内置类名 + dropdownClassName。
  const dropdownCls = $derived(
    ['cd-select__dropdown', dropdownClassName].filter(Boolean).join(' '),
  );

  // 浮层最外层 div 内联样式：可选 z-index + dropdownStyle（用户自定义样式，如 width）。
  // 注意 use:floating 后写 position/transform（inline 优先级更高），此串勿含二者。
  const dropdownRootInlineStyle = $derived(
    [
      zIndex !== undefined ? `z-index:${zIndex}` : undefined,
      dropdownStyle,
    ]
      .filter(Boolean)
      .join(';') || undefined,
  );

  // 内层滚动列表内联样式：max-block-size 限高 + 溢出滚动（outer slot 不受此限高裁剪）。
  const dropdownListInlineStyle = $derived(`max-block-size:${maxHeight}px`);

  const cls = $derived(
    [
      'cd-select',
      `cd-select--${size}`,
      `cd-select--${status}`,
      disabled && 'cd-select--disabled',
      isOpen && 'cd-select--open',
      multiple && 'cd-select--multiple',
      borderless && 'cd-select--borderless',
      // ellipsisTrigger：多选 tag 溢出时对可见 tag 文本作单行省略（对齐 Semi）。
      ellipsisTrigger && multiple && 'cd-select--ellipsis-trigger',
    ]
      .filter(Boolean)
      .join(' '),
  );

  // insetLabel 提供 insetLabelId 时，把内嵌标签纳入 combobox 的 aria-labelledby，
  // 使屏幕阅读器把内嵌标签朗读为触发器可访问名的一部分（与外部 ariaLabelledby 拼接）。
  const hasInsetLabel = $derived(insetLabel !== undefined);
  const resolvedLabelledby = $derived(
    [ariaLabelledby, hasInsetLabel && insetLabelId ? insetLabelId : undefined]
      .filter(Boolean)
      .join(' ') || undefined,
  );

  // combobox 可访问名：aria-labelledby（含内嵌标签）> ariaLabel > placeholder > locale 默认
  const triggerAriaLabel = $derived(
    resolvedLabelledby ? undefined : (ariaLabel || placeholder || loc().t('Select.ariaLabel')),
  );

  // searchPosition='trigger' 且 filter 时，搜索框内联在触发器上（无需浮层内独立搜索框）。
  const triggerSearch = $derived(filter && searchPosition === 'trigger');

  // searchPosition='dropdown' 时，打开浮层后自动聚焦浮层内搜索框，便于直接键入过滤。
  $effect(() => {
    if (!isOpen || triggerSearch || !filter || !dropdownEl) return;
    const searchEl = dropdownEl.querySelector<HTMLInputElement>('.cd-select__search--dropdown');
    searchEl?.focus();
  });
</script>

<div class={cls} bind:this={rootEl}>
  {#if triggerRender}
    {@render triggerRender({
      value: currentValue,
      selectedOptions,
      placeholder: placeholder ?? loc().t('Select.placeholder'),
      open: isOpen,
      disabled,
      toggle: toggleOpen,
      onTriggerKeydown,
    })}
  {:else}
  <div
    class="cd-select__trigger"
    role="combobox"
    {id}
    aria-label={triggerAriaLabel}
    aria-labelledby={resolvedLabelledby}
    aria-expanded={isOpen}
    aria-haspopup="listbox"
    aria-controls={listId}
    aria-activedescendant={activeOptionId}
    aria-disabled={disabled || undefined}
    aria-invalid={status === 'error' || undefined}
    tabindex={disabled ? -1 : 0}
    onclick={toggleOpen}
    onkeydown={onTriggerKeydown}
    onfocus={() => onFocus?.()}
    onblur={() => onBlur?.()}
  >
    {#if prefix}
      <span class="cd-select__prefix">{@render prefix()}</span>
    {/if}

    {#if hasInsetLabel}
      <span class="cd-select__inset-label" id={insetLabelId}>
        {#if typeof insetLabel === 'string'}
          {insetLabel}
        {:else if insetLabel}
          {@render insetLabel()}
        {/if}
      </span>
    {/if}

    <div class="cd-select__content">
      {#if multiple && selectedOptions.length > 0}
        {#each visibleTags as tag (tag.opt.value)}
          <span class="cd-select__tag">
            {#if labelSnippet}
              {@render labelSnippet({ option: tag.opt })}
            {:else}
              <span
                class="cd-select__tag-label"
                title={tag.truncated ? getOptionLabel(tag.opt) : undefined}
              >{tag.display}</span>
            {/if}
            <button
              type="button"
              class="cd-select__tag-close"
              aria-label={loc().t('Select.removeItem', { label: getOptionLabel(tag.opt) })}
              onclick={(e) => {
                e.stopPropagation();
                removeTag(tag.opt.value);
              }}
            >
              <svg viewBox="0 0 16 16" width="10" height="10" aria-hidden="true" focusable="false">
                <path
                  fill="currentColor"
                  d="M9.1 8l3.2-3.2-1.1-1.1L8 6.9 4.8 3.7 3.7 4.8 6.9 8l-3.2 3.2 1.1 1.1L8 9.1l3.2 3.2 1.1-1.1L9.1 8Z"
                />
              </svg>
            </button>
          </span>
        {/each}
        {#if hiddenTagCount > 0}
          {@const hiddenOpts = selectedOptions.slice(maxTagCount)}
          {#if expandRestTagsOnClick}
            <!-- expandRestTagsOnClick：+N 可点击就地展开剩余 Tag（浮层打开态下，纯展示不改值） -->
            <button
              type="button"
              class="cd-select__tag cd-select__tag--rest cd-select__tag--rest-clickable"
              title={showRestTagsPopover ? hiddenOpts.map((o) => getOptionLabel(o)).join(', ') : undefined}
              aria-expanded={restTagsExpanded}
              onclick={(e) => {
                e.stopPropagation();
                // 对齐 Semi：面板打开状态下展开剩余 Tag；未打开则先打开浮层再展开。
                if (!isOpen) setOpen(true);
                restTagsExpanded = true;
              }}
            >+{hiddenTagCount}</button>
          {:else}
            <span
              class="cd-select__tag cd-select__tag--rest"
              title={showRestTagsPopover ? hiddenOpts.map((o) => getOptionLabel(o)).join(', ') : undefined}
            >+{hiddenTagCount}</span>
          {/if}
        {/if}
        {#if triggerSearch}
          <input
            {...inputProps}
            class="cd-select__search"
            type="text"
            value={query}
            aria-label={loc().t('Select.searchPlaceholder')}
            oninput={onSearchInput}
            onkeydown={onTriggerKeydown}
            onclick={(e) => e.stopPropagation()}
          />
        {/if}
      {:else if triggerSearch}
        <input
          {...inputProps}
          class="cd-select__search"
          type="text"
          value={query}
          placeholder={hasSelection ? singleLabel : (placeholder ?? loc().t('Select.placeholder'))}
          aria-label={loc().t('Select.searchPlaceholder')}
          oninput={onSearchInput}
          onkeydown={onTriggerKeydown}
          onclick={(e) => e.stopPropagation()}
        />
      {:else if hasSelection}
        {#if labelSnippet}
          {@render labelSnippet({ option: selectedOptions[0]! })}
        {:else}
          <span class="cd-select__value">{singleLabel}</span>
        {/if}
      {:else}
        <span class="cd-select__placeholder">{placeholder ?? loc().t('Select.placeholder')}</span>
      {/if}
    </div>

    {#if showClear}
      <button
        type="button"
        class="cd-select__clear"
        aria-label={loc().t('Select.clear')}
        onclick={clearAll}
      >
        {#if clearIcon}
          {@render clearIcon()}
        {:else}
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
            <path
              fill="currentColor"
              d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm2.5 9.1-1.4 1.4L8 9.4 6.5 11l-1.4-1.4L6.6 8 5.1 6.5 6.5 5.1 8 6.6 9.5 5.1l1.4 1.4L9.4 8l1.1 1.1Z"
            />
          </svg>
        {/if}
      </button>
    {/if}

    {#if suffix}
      <span class="cd-select__suffix">{@render suffix()}</span>
    {:else if showArrow}
      <span class="cd-select__arrow" aria-hidden="true">
        {#if arrowIcon}
          {@render arrowIcon()}
        {:else}
          <svg viewBox="0 0 16 16" width="12" height="12" focusable="false">
            <path fill="currentColor" d="M3.5 6 8 10.5 12.5 6l-1-1L8 8.5 4.5 5l-1 1Z" />
          </svg>
        {/if}
      </span>
    {/if}
  </div>
  {/if}

  {#if isOpen || !destroyOnClose}
    <!--
      浮层最外层容器（use:floating 定位）：承载 outerTopSlot / 滚动列表 / outerBottomSlot 三层。
      outer slot 与滚动列表平级、位于滚动区之外，始终固定展现（对齐 Semi outer*Slot）；
      滚动/虚拟化/onListScroll/触底检测均作用于内部 role=listbox 的滚动容器（dropdownEl）。
    -->
    <div
      class={dropdownCls}
      bind:this={dropdownRootEl}
      use:floating={{ trigger: rootEl, placement, autoAdjust: true, offset: dropdownOffset, matchWidth: dropdownMatchSelectWidth }}
      style={dropdownRootInlineStyle}
      hidden={!isOpen || undefined}
    >
      {#if outerTopSlot}
        <div class="cd-select__outer-top">{@render outerTopSlot()}</div>
      {/if}
      <div
        class="cd-select__list"
        bind:this={dropdownEl}
        role="listbox"
        id={listId}
        aria-multiselectable={multiple}
        aria-busy={loading || undefined}
        style={dropdownListInlineStyle}
      >
      {#if filter && !triggerSearch}
        <!-- searchPosition='dropdown'（默认）：搜索框在浮层顶部 -->
        <div class="cd-select__dropdown-search">
          <input
            {...inputProps}
            class="cd-select__search cd-select__search--dropdown"
            type="text"
            value={query}
            placeholder={loc().t('Select.searchPlaceholder')}
            aria-label={loc().t('Select.searchPlaceholder')}
            aria-controls={listId}
            oninput={onSearchInput}
            onkeydown={onTriggerKeydown}
            onclick={(e) => e.stopPropagation()}
          />
        </div>
      {/if}
      {#if dropdownHeader}
        <div class="cd-select__dropdown-header">{@render dropdownHeader()}</div>
      {/if}
      {#if loading}
        <div class="cd-select__loading">
          <span class="cd-select__spinner" aria-hidden="true"></span>
          <span>{loc().t('Select.loading')}</span>
        </div>
      {/if}
      {#if canCreate}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <div
          class="cd-select__option cd-select__option--create"
          role="option"
          aria-selected={false}
          tabindex="-1"
          onclick={createOption}
        >
          {#if renderCreateItem}
            {@render renderCreateItem(query.trim())}
          {:else}
            <span class="cd-select__option-label">{loc().t('Select.create', { label: query.trim() })}</span>
          {/if}
        </div>
      {/if}
      {#if filteredOptions.length === 0 && !canCreate && !loading}
        <div class="cd-select__empty">
          {#if empty}
            {@render empty()}
          {:else if emptyContent !== undefined}
            {#if typeof emptyContent === 'string'}
              {emptyContent}
            {:else}
              {@render emptyContent()}
            {/if}
          {:else}
            {loc().t('Select.emptyText')}
          {/if}
        </div>
      {:else if hasGroups}
        {#each groupedView as group, gi (group.label ?? `g-${gi}`)}
          {#if group.label !== null}
            <div class="cd-select__group-label" role="presentation">{group.label}</div>
          {/if}
          {#each group.items as it (it.opt.value)}
            {@render optionRow(it.opt, it.flatIndex)}
          {/each}
        {/each}
      {:else if isVirtual}
        <!-- 虚拟化：spacer 撑总高，可见 option 绝对定位按全局索引偏移；只渲染视口切片 -->
        <div class="cd-select__spacer" style={`block-size:${vTotalHeight}px`}>
          {#each vRenderOptions as opt, i (opt.value)}
            {@render optionRow(
              opt,
              vRange.startIndex + i,
              `position:absolute; inset-inline:0; transform:translateY(${(vRange.startIndex + i) * vOptionHeight}px); block-size:${vOptionHeight}px`,
            )}
          {/each}
        </div>
      {:else}
        {#each filteredOptions as opt, i (opt.value)}
          {@render optionRow(opt, i)}
        {/each}
      {/if}
      {#if dropdownFooter}
        <div class="cd-select__dropdown-footer">{@render dropdownFooter()}</div>
      {/if}
      </div>
      {#if outerBottomSlot}
        <div class="cd-select__outer-bottom">{@render outerBottomSlot()}</div>
      {/if}
    </div>
  {/if}
</div>

{#snippet optionRow(opt: OptionData, i: number, style?: string)}
  <!-- 选项通过 combobox 的 roving + aria-activedescendant 键盘操作，无需自身键事件 -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div
    class="cd-select__option"
    class:cd-select__option--active={i === activeIndex}
    class:cd-select__option--selected={isSelected(opt.value)}
    id={`${listId}-opt-${i}`}
    role="option"
    aria-selected={isSelected(opt.value)}
    aria-disabled={opt.disabled || undefined}
    tabindex="-1"
    {style}
    onpointerenter={() => {
      if (!opt.disabled) activeIndex = i;
    }}
    onclick={() => selectOption(opt)}
  >
    {#if optionSnippet}
      {@render optionSnippet({ option: opt, selected: isSelected(opt.value), active: i === activeIndex })}
    {:else}
      {#if multiple}
        <span class="cd-select__check" aria-hidden="true">
          {#if isSelected(opt.value)}
            <svg viewBox="0 0 16 16" width="12" height="12" focusable="false">
              <path
                fill="currentColor"
                d="M6.2 11.2 2.9 7.9l1.1-1.1 2.2 2.2 5-5L12.3 5l-6.1 6.2Z"
              />
            </svg>
          {/if}
        </span>
      {/if}
      <span class="cd-select__option-label">{getOptionLabel(opt)}</span>
    {/if}
  </div>
{/snippet}

<style>
  .cd-select {
    position: relative;
    display: inline-flex;
    inline-size: 100%;
    font-size: var(--cd-select-font-size);
  }
  .cd-select__trigger {
    display: flex;
    align-items: center;
    gap: var(--cd-spacing-tight);
    inline-size: 100%;
    min-block-size: var(--cd-select-height-default);
    padding-inline: var(--cd-select-padding-x);
    background: var(--cd-select-bg);
    border: 1px solid var(--cd-select-border);
    border-radius: var(--cd-select-radius);
    cursor: pointer;
    /* 过渡/变换由 select 专属 transition/transform token 接管（对齐 Semi animation.scss）：
       默认 duration=0ms（无过渡），主题/DSM 可开启。 */
    transition:
      background-color var(--cd-transition-duration-select-bg)
        var(--cd-transition-function-select-bg) var(--cd-transition-delay-select-bg),
      border-color var(--cd-transition-duration-select-border)
        var(--cd-transition-function-select-border) var(--cd-transition-delay-select-border);
    transform: var(--cd-transform-scale-select);
  }
  .cd-select--small .cd-select__trigger {
    min-block-size: var(--cd-select-height-small);
  }
  .cd-select--large .cd-select__trigger {
    min-block-size: var(--cd-select-height-large);
  }
  /* 对齐 Semi 填充式：悬浮加深底色（非展开/禁用态） */
  .cd-select:not(.cd-select--open):not(.cd-select--disabled) .cd-select__trigger:hover {
    background: var(--cd-select-bg-hover);
  }
  .cd-select__trigger:focus-visible {
    outline: none;
    background: var(--cd-select-bg);
    border-color: var(--cd-select-border-active);
    box-shadow: var(--cd-focus-ring);
  }
  .cd-select--open .cd-select__trigger {
    background: var(--cd-select-bg);
    border-color: var(--cd-select-border-active);
  }
  .cd-select--error .cd-select__trigger {
    border-color: var(--cd-select-border-error);
  }
  .cd-select--disabled .cd-select__trigger {
    background: var(--cd-color-select-input-disabled-bg);
    color: var(--cd-color-select-input-disabled-text);
    cursor: not-allowed;
  }
  .cd-select__content {
    display: flex;
    flex: 1 1 auto;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--cd-spacing-extra-tight);
    min-inline-size: 0;
  }
  .cd-select__placeholder {
    color: var(--cd-color-select-input-placeholder-text);
  }
  /* 内嵌标签：常驻触发器左侧的标签文本 */
  .cd-select__inset-label {
    display: inline-flex;
    align-items: center;
    flex: 0 0 auto;
    margin-inline-end: var(--cd-spacing-extra-tight);
    color: var(--cd-color-select-prefix-suffix-text-default);
    user-select: none;
  }
  /* searchPosition='dropdown'：浮层顶部搜索框容器 */
  .cd-select__dropdown-search {
    padding: var(--cd-spacing-extra-tight) var(--cd-select-option-padding, var(--cd-spacing-tight));
  }
  .cd-select__search--dropdown {
    inline-size: 100%;
    box-sizing: border-box;
    min-block-size: var(--cd-select-height-small);
    padding-inline: var(--cd-select-padding-x);
    border: 1px solid var(--cd-select-border);
    border-radius: var(--cd-select-radius);
    background: var(--cd-select-bg);
  }
  .cd-select__search--dropdown:focus-visible {
    border-color: var(--cd-select-border-active);
    box-shadow: var(--cd-focus-ring);
  }
  .cd-select__value {
    overflow: hidden;
    color: var(--cd-color-select-main-text-default);
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .cd-select__search {
    flex: 1 1 auto;
    min-inline-size: 2rem;
    margin: 0;
    padding: 0;
    border: none;
    background: transparent;
    color: inherit;
    font: inherit;
    outline: none;
  }
  .cd-select__search::placeholder {
    color: var(--cd-color-select-input-placeholder-text);
  }
  .cd-select__tag {
    display: inline-flex;
    align-items: center;
    gap: var(--cd-spacing-extra-tight);
    padding-inline: var(--cd-spacing-tight);
    background: var(--cd-color-fill-1);
    border-radius: var(--cd-border-radius-small);
    font-size: var(--cd-font-size-small);
  }
  .cd-select__tag--rest {
    color: var(--cd-color-select-prefix-suffix-text-default);
  }
  /* expandRestTagsOnClick：+N 作为可点击按钮，去除原生 button 外观 */
  .cd-select__tag--rest-clickable {
    border: none;
    cursor: pointer;
    font: inherit;
  }
  /* ellipsisTrigger：多选 tag 溢出时，对可见 tag 文本做单行省略（完整文本经 title 查看） */
  .cd-select--ellipsis-trigger .cd-select__content {
    flex-wrap: nowrap;
    overflow: hidden;
  }
  .cd-select--ellipsis-trigger .cd-select__tag-label {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .cd-select__option--create {
    color: var(--cd-color-select-option-keyword-text);
  }
  .cd-select__tag-close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--cd-color-select-icon-default);
    cursor: pointer;
  }
  .cd-select__tag-close:hover {
    color: var(--cd-color-select-clearbtn-text-hover);
  }
  .cd-select__clear,
  .cd-select__arrow {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    color: var(--cd-color-select-icon-default);
  }
  .cd-select__clear {
    padding: 0;
    border: none;
    background: transparent;
    color: var(--cd-color-select-clearbtn-text-default);
    cursor: pointer;
  }
  .cd-select__clear:hover {
    color: var(--cd-color-select-clearbtn-text-hover);
  }
  .cd-select__arrow {
    transform: var(--cd-transform-rotate-select-arrow);
    transition: transform var(--cd-transition-duration-select-border)
      var(--cd-transition-function-select-border) var(--cd-transition-delay-select-border);
  }
  .cd-select--open .cd-select__arrow {
    transform: rotate(180deg);
  }
  /* 下拉 portal 到 body，由 JS 写 position:fixed + transform + matchWidth。
     外层容器只负责底色/圆角/阴影/层级；滚动限高在内层 .cd-select__list（使 outer slot 固定不滚） */
  .cd-select__dropdown {
    z-index: var(--cd-select-dropdown-z);
    display: flex;
    flex-direction: column;
    background: var(--cd-select-dropdown-bg);
    border-radius: var(--cd-select-dropdown-radius);
    box-shadow: var(--cd-select-dropdown-shadow);
  }
  /* 内层滚动列表：optionList + inner header/footer + 浮层搜索框，超出 maxHeight 时纵向滚动 */
  .cd-select__list {
    max-block-size: 16rem;
    overflow-y: auto;
    padding-block: var(--cd-spacing-extra-tight);
  }
  /* outer slot：与滚动列表平级、位于滚动区之外，始终固定展现 */
  .cd-select__outer-top,
  .cd-select__outer-bottom {
    flex: 0 0 auto;
    padding: var(--cd-spacing-extra-tight) var(--cd-select-option-padding, var(--cd-spacing-tight));
  }
  /* 虚拟化：spacer 撑出未渲染选项的总高，可见 option 绝对定位于其内 */
  .cd-select__spacer {
    position: relative;
    inline-size: 100%;
  }
  /* 虚拟化行带固定 block-size + 内边距，需 border-box 保证行高与 optionHeight 一致 */
  .cd-select__spacer .cd-select__option {
    box-sizing: border-box;
    overflow: hidden;
  }
  .cd-select__group-label {
    padding: var(--cd-spacing-extra-tight) var(--cd-select-option-padding, var(--cd-spacing-tight));
    color: var(--cd-color-select-group-text);
    font-size: var(--cd-font-size-small);
    font-weight: var(--cd-font-weight-medium, 500);
    user-select: none;
  }
  .cd-select__option {
    display: flex;
    align-items: center;
    gap: var(--cd-spacing-tight);
    padding: var(--cd-select-option-padding);
    cursor: pointer;
    transition: background-color var(--cd-transition-duration-select-option-bg)
      var(--cd-transition-function-select-option-bg) var(--cd-transition-delay-select-option-bg);
  }
  .cd-select__option--active {
    background: var(--cd-select-option-bg-hover);
  }
  .cd-select__option--selected {
    color: var(--cd-select-option-color-selected);
    background: var(--cd-select-option-bg-active);
  }
  .cd-select__option[aria-disabled='true'] {
    color: var(--cd-color-select-option-disabled-text);
    cursor: not-allowed;
  }
  .cd-select__check {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: 1rem;
    flex: 0 0 auto;
    color: var(--cd-select-option-check-color);
  }
  .cd-select__empty {
    padding: var(--cd-select-option-padding);
    color: var(--cd-color-text-3);
    text-align: center;
  }
  .cd-select__loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--cd-spacing-tight);
    padding: var(--cd-select-option-padding);
    color: var(--cd-color-text-3);
  }
  .cd-select__spinner {
    inline-size: 1em;
    block-size: 1em;
    border: 2px solid var(--cd-color-select-option-border-default);
    border-block-start-color: var(--cd-color-select-option-keyword-text);
    border-radius: var(--cd-border-radius-full);
    animation: cd-select-spin 0.7s linear infinite;
  }
  @keyframes cd-select-spin {
    to {
      transform: rotate(360deg);
    }
  }
  /* 无边框模式：移除触发器边框与背景 */
  .cd-select--borderless .cd-select__trigger {
    border-color: transparent;
    background: transparent;
  }
  .cd-select--borderless .cd-select__trigger:focus-visible {
    border-color: transparent;
    box-shadow: var(--cd-focus-ring);
  }
  /* 前缀 / 后缀插槽 */
  .cd-select__prefix,
  .cd-select__suffix {
    display: inline-flex;
    align-items: center;
    flex: 0 0 auto;
    color: var(--cd-color-select-prefix-suffix-text-default);
  }
  .cd-select__prefix {
    margin-inline-end: var(--cd-spacing-extra-tight);
  }
  .cd-select__suffix {
    margin-inline-start: var(--cd-spacing-extra-tight);
  }
  /* 浮层顶/底固定区 */
  .cd-select__dropdown-header,
  .cd-select__dropdown-footer {
    padding: var(--cd-spacing-extra-tight) var(--cd-select-option-padding, var(--cd-spacing-tight));
    border-block-color: var(--cd-color-select-option-border-default);
  }
  .cd-select__dropdown-header {
    border-block-end-width: 1px;
    border-block-end-style: solid;
  }
  .cd-select__dropdown-footer {
    border-block-start-width: 1px;
    border-block-start-style: solid;
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-select__spinner {
      animation: none;
    }
    .cd-select__trigger,
    .cd-select__arrow {
      transition: none;
    }
  }
</style>
