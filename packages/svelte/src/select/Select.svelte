<!--
  Select — see specs/components/input/Select.spec.md
  单选 / 多选 / 本地过滤 / 键盘导航 / 浮层。Token-driven, a11y-correct.
  下拉 portal 到 body + position:fixed（脱离 overflow:hidden 裁剪），matchWidth 跟随触发器宽度，flip 避让。
  maxTagCount：多选 tag 超出折叠为 +N。allowCreate：filter 无匹配时可创建新选项。
  分组：optionList 含 { label, options:[] } 时按组渲染组标题；逻辑/键盘/filter 基于扁平序列。
  remote：remote=true 时输入防抖回调 onSearch(value, event)，由外部更新 optionList；loading 显示 spinner。
  虚拟化：传入 virtualize 对象时下拉只渲染视口内 option（复用 core fixedRange），spacer 撑总高、
  option 绝对定位按索引偏移；scrollTop 由命令式 scroll 回调 + rAF 节流写入本地 $state，可见区间
  纯 $derived render 期只读（红线 #2/#3）。键盘移动 activeIndex 时命令式 scrollOffsetForIndex 滚到可见
  （未渲染的 active option 移动后会被滚进视口而渲染，a11y 取舍同 Tree 虚拟化）。
  虚拟化仅作用于「非分组」扁平选项集（hasGroups 时回退全量渲染，忽略 virtualize）。
  dropdownMatchSelectWidth：浮层宽度是否跟随触发器（默认 true）；false 时浮层自适应内容宽度。
  destroyOnClose：关闭时销毁浮层 DOM（默认 false，保持挂载）。
  getPopupContainer：浮层挂载目标容器（透传给 use:floating 的 getContainer，portal 到该容器；缺省 body）。
  命令式 Methods（bind:this）：open/close/focus/clearInput/deselectAll/selectAll/search/rePosition，对齐 Semi ref。
  emptyContent snippet：空态自定义内容。
  prefix/suffix/arrowIcon/clearIcon snippet：触发器前后缀与图标。
  innerTopSlot/innerBottomSlot snippet：浮层滚动区内顶/底固定区；outerTopSlot/outerBottomSlot：滚动区外固定区。
  renderOptionItem snippet：完全自定义候选项渲染；renderSelectedItem snippet：自定义选中值/Tag 渲染。
  onSelect/onDeselect/onClear/onCreate/onFocus/onBlur/onScrollToBottom/onExceed/onChangeWithObject。
  autoClearSearchValue：多选选中后自动清空搜索词（默认 true）。
  多选折叠复用 TagGroup（mode=custom）：可见 tag + 折叠 +N + hover Popover 全由 TagGroup 承担。
  showRestTagsPopover：+N tag 悬停用 Popover 浮层展示剩余全部 tags（接 TagGroup showPopover）；restTagsPopoverProps 透传给该 Popover。
  borderless：无边框模式；autoFocus：挂载自动聚焦；id：关联外部 label。
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
  import { IconClear, IconChevronDown, IconTick } from '@chenzy-design/icons';
  import { useLocale } from '../locale-provider/index.js';
  import { floating } from '../_floating/use-floating.js';
  import Tag from '../tag/Tag.svelte';
  import TagGroup from '../tag/TagGroup.svelte';

  type OptionValue = string | number;
  type OptionData = { label: string; value: OptionValue; disabled?: boolean; [key: string]: unknown };
  /** 选项分组：含 options 即为分组项 */
  type OptionGroup = { label: string; options: OptionData[] };
  type OptionOrGroup = OptionData | OptionGroup;
  type Size = 'small' | 'default' | 'large';
  type Status = 'default' | 'warning' | 'error';
  /** 单个多选 Tag 的渲染信息（选项 + 截断后显示文本 + 是否被截断）。 */
  type TagInfo = { opt: OptionData; display: string; truncated: boolean };

  function isGroup(o: OptionOrGroup): o is OptionGroup {
    return Array.isArray((o as OptionGroup).options);
  }

  interface Props {
    value?: OptionValue | OptionValue[];
    defaultValue?: OptionValue | OptionValue[];
    /** 选项；可含分组项 { label, options: [] }（对齐 Semi optionList） */
    optionList?: OptionOrGroup[];
    multiple?: boolean;
    /**
     * 是否开启输入过滤（对齐 Semi filter: boolean | function）。
     * boolean：true 时按选项 label 本地包含匹配；
     * function：自定义过滤逻辑 (input, option) => boolean，返回 true 保留该项。
     */
    filter?: boolean | ((input: string, option: OptionData) => boolean);
    open?: boolean;
    defaultOpen?: boolean;
    size?: Size;
    /** 校验态样式（对齐 Semi validateStatus） */
    validateStatus?: Status;
    /** 下拉浮层弹出位置（对齐 Semi position，默认 bottomStart，自动避让仍生效） */
    position?: Placement;
    placeholder?: string;
    /** combobox 触发器可访问名；缺省回退到 placeholder 或 locale 默认 */
    ariaLabel?: string;
    /** 关联外部 label 的 id（优先于 ariaLabel） */
    ariaLabelledby?: string;
    /** 关联外部辅助说明的 id（对齐 Semi withField aria-describedby 注入） */
    ariaDescribedby?: string;
    /** 关联外部错误提示的 id（对齐 Semi withField aria-errormessage 注入） */
    ariaErrormessage?: string;
    /** 标记为必填（对齐 Semi withField aria-required 注入） */
    ariaRequired?: boolean;
    /** 绑定到触发器的 id 属性，用于关联外部 <label for="..."> */
    id?: string;
    disabled?: boolean;
    /** 多选/单选是否显示清除按钮（对齐 Semi showClear，默认 false） */
    showClear?: boolean;
    /** 多选最多可选项数（对齐 Semi max）；达到上限后新增项被忽略并触发 onExceed */
    max?: number;
    /** 多选 tag 最大显示数，超出折叠为 +N（0=不折叠） */
    maxTagCount?: number;
    /** 多选单个 Tag 文本最大长度，超出截断为「前缀…」，完整文本经 title 查看（不截则不传） */
    maxTagTextLength?: number;
    /** filter 无匹配时允许创建新选项（值=输入文本） */
    allowCreate?: boolean;
    /**
     * 远程搜索（对齐 Semi remote，默认 false）：为 true 时不本地过滤，
     * 输入防抖后回调 onSearch，由外部按 query 更新 optionList。
     */
    remote?: boolean;
    /** 搜索输入回调（对齐 Semi onSearch(value, event)）；remote=true 时防抖触发 */
    onSearch?: (value: string, event?: Event) => void;
    /** 远程加载中（显示 spinner） */
    loading?: boolean;
    /**
     * 选项虚拟化（对齐 Semi virtualize 对象）：非分组大数据下拉只渲染视口内 option。
     * itemSize：选项行高（px，默认 32，需与样式实际行高一致）；
     * height：虚拟视口高度（px，默认取 maxHeight）；width：预留（当前跟随触发器宽度，忽略）。
     * 传入该对象即开启虚拟化（仅非分组生效）。
     */
    virtualize?: { itemSize?: number; height?: number; width?: string | number };
    /** 下拉最大高度（px，默认 270，对齐 Semi maxHeight） */
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
    /** 浮层点击是否 stopPropagation（对齐 Semi stopPropagation，默认 true），避免冒泡到外层触发无关点击 */
    stopPropagation?: boolean;
    /** 触发器鼠标进入回调（对齐 Semi onMouseEnter） */
    onMouseEnter?: (e: MouseEvent) => void;
    /** 触发器鼠标离开回调（对齐 Semi onMouseLeave） */
    onMouseLeave?: (e: MouseEvent) => void;
    /** 关闭时销毁浮层 DOM（默认 false，复用节点避免重建开销） */
    destroyOnClose?: boolean;
    /** 浮层挂载目标容器（默认 body） */
    getPopupContainer?: () => HTMLElement;
    /** 浮层溢出视口时自动翻转到反向 placement（默认 true，对齐 Semi autoAdjustOverflow） */
    autoAdjustOverflow?: boolean;
    /** 无边框模式：移除触发器边框 */
    borderless?: boolean;
    /** 挂载后自动聚焦触发器 */
    autoFocus?: boolean;
    /** 多选选中后自动清空搜索词（默认 true） */
    autoClearSearchValue?: boolean;
    /** 超出 maxTagCount 折叠出 +N 时，hover +N 用 Popover 浮层展示剩余全部 Tag（对齐 Semi restTagsPopover） */
    showRestTagsPopover?: boolean;
    /** 透传给 +N 悬停 Popover 浮层的配置（spread 到 Popover，可覆盖 position/trigger/spacing 等） */
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
     * 多选且 maxTagCount 折叠出 +N 时，浮层打开状态下是否就地展开剩余全部 Tag（对齐 Semi expandRestTagsOnClick）。
     * 对齐 Semi renderMultipleSelection：为 true 且浮层打开时全量展开（NotOneLine 分支），关闭时复位折叠；
     * 展开为纯展示态，不影响选中值。点击触发器即打开浮层→展开，无需单独点击 +N。
     */
    expandRestTagsOnClick?: boolean;
    /**
     * 多选且存在 maxTagCount 时，对溢出部分的可见 Tag 做省略处理（最后一个可见 Tag 文本超出触发器宽度时截断为「前缀…」）。
     * 对齐 Semi ellipsisTrigger：纯 CSS 单行省略，完整文本经 title 查看；不影响选中值。
     */
    ellipsisTrigger?: boolean;
    /**
     * 搜索框位置（对齐 Semi searchPosition，默认 'trigger'）：'trigger'（搜索输入内联在触发器上）
     * | 'dropdown'（浮层内独立搜索框）。仅在 filter 开启时生效。'trigger' 时输入框长驻触发器
     * （单选选中值作 placeholder，多选与 tags 并排），键入即就地过滤。
     */
    searchPosition?: 'dropdown' | 'trigger';
    /** 搜索框占位文本（对齐 Semi searchPlaceholder）；缺省走 locale Select.searchPlaceholder */
    searchPlaceholder?: string;
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
    /** 浮层显隐变化回调（对齐 Semi onDropdownVisibleChange） */
    onDropdownVisibleChange?: (open: boolean) => void;
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
    /** 根容器内联样式（对齐 Semi style，可设 width 等） */
    style?: string;
    /** 根容器自定义类名（与内置 cd-select 并存，对齐 Semi className） */
    class?: string;
    /** 自定义清除按钮图标 */
    clearIcon?: Snippet;
    /** 自定义下拉箭头图标 */
    arrowIcon?: Snippet;
    /** 自定义空态内容（字符串或 Snippet 均可，为字符串时直接渲染文本，对齐 Semi emptyContent） */
    emptyContent?: string | Snippet;
    /** 浮层顶部固定区（inner：渲染在滚动列表内部顶端，随 optionList 滚动，对齐 Semi innerTopSlot） */
    innerTopSlot?: Snippet;
    /** 浮层底部固定区（inner：渲染在滚动列表内部底端，随 optionList 滚动，对齐 Semi innerBottomSlot） */
    innerBottomSlot?: Snippet;
    /** 浮层最外层顶部 slot（outer：与滚动列表平级、位于滚动区之外，始终固定展现，对齐 Semi outerTopSlot） */
    outerTopSlot?: Snippet;
    /** 浮层最外层底部 slot（outer：与滚动列表平级、位于滚动区之外，始终固定展现，对齐 Semi outerBottomSlot） */
    outerBottomSlot?: Snippet;
    /** 完全自定义候选项渲染（对齐 Semi renderOptionItem，入参含 selected/focused/onMouseEnter/onClick） */
    renderOptionItem?: Snippet<
      [
        {
          option: OptionData;
          selected: boolean;
          focused: boolean;
          onMouseEnter: () => void;
          onClick: () => void;
        },
      ]
    >;
    /** 自定义已选项标签/回显渲染（对齐 Semi renderSelectedItem，单选返回节点，多选逐个 Tag 内容） */
    renderSelectedItem?: Snippet<[{ option: OptionData }]>;
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
    optionList = [],
    multiple = false,
    filter = false,
    open: openProp = $bindable(),
    defaultOpen = false,
    size = 'default',
    style,
    class: className,
    validateStatus = 'default',
    position = 'bottomStart',
    placeholder,
    ariaLabel,
    ariaLabelledby,
    ariaDescribedby,
    ariaErrormessage,
    ariaRequired,
    id,
    disabled = false,
    showClear = false,
    max,
    maxTagCount = 0,
    maxTagTextLength,
    allowCreate = false,
    remote = false,
    onSearch,
    loading = false,
    virtualize,
    maxHeight = 270,
    dropdownMatchSelectWidth = true,
    dropdownClassName,
    dropdownStyle,
    zIndex,
    dropdownMargin,
    stopPropagation = true,
    onMouseEnter,
    onMouseLeave,
    destroyOnClose = false,
    getPopupContainer,
    autoAdjustOverflow = true,
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
    searchPosition = 'trigger',
    searchPlaceholder,
    insetLabel,
    insetLabelId,
    onChange,
    onDropdownVisibleChange,
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
    innerTopSlot,
    innerBottomSlot,
    outerTopSlot,
    outerBottomSlot,
    renderOptionItem,
    renderSelectedItem,
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

  // --- 受控 open (红线 #1): 不无条件回写 open，仅 onDropdownVisibleChange ---
  const isOpenControlled = $derived(openProp !== undefined);
  let innerOpen = $state(getInitialOpen());
  const isOpen = $derived(isOpenControlled ? !!openProp : innerOpen);

  function getInitialOpen(): boolean {
    return defaultOpen;
  }

  function setOpen(next: boolean) {
    if (next === isOpen) return;
    if (!isOpenControlled) innerOpen = next;
    onDropdownVisibleChange?.(next);
    if (!next) {
      activeIndex = -1;
      query = '';
    }
  }

  // rePosition() 命令式重定位钩子：递增该 key 传入 use:floating 参数，触发 action 的 update
  // 在原位重算浮层位置（use-floating action 参数变化且 trigger/placement 不变时走 handle.update()）。
  let reposKey = $state(0);

  // 挂载自动聚焦（autoFocus）；preventScroll 时透传给 focus 避免页面跳动。
  $effect(() => {
    if (!autoFocus || !rootEl) return;
    const trigger = rootEl.querySelector<HTMLElement>('[role="combobox"]');
    trigger?.focus({ preventScroll });
  });

  // --- 本地过滤搜索 ---
  let query = $state('');

  // 是否含分组：决定渲染走分组结构还是扁平。
  const hasGroups = $derived(optionList.some(isGroup));
  // 扁平选项序列（拍平分组）——逻辑/键盘/filter/回显统一基于它。
  const flatBase = $derived<OptionData[]>(
    optionList.flatMap((o) => (isGroup(o) ? o.options : [o])),
  );

  // allowCreate：本地已创建选项，合并进选项集供回显与列表（不写回 optionList prop）。
  let createdOptions = $state<OptionData[]>([]);
  const mergedOptions = $derived<OptionData[]>(
    createdOptions.length === 0 ? flatBase : [...flatBase, ...createdOptions],
  );

  // remote 模式（对齐 Semi remote 布尔）：外部已按 query 更新 optionList，本地不再过滤。
  const isRemote = $derived(remote);
  // filter 是否开启（boolean true 或函数形态）。
  const filterEnabled = $derived(filter === true || typeof filter === 'function');

  const filteredOptions = $derived.by(() => {
    if (isRemote) return mergedOptions;
    if (!filterEnabled || query.trim() === '') return mergedOptions;
    // 函数形态：自定义过滤逻辑 (input, option) => boolean（对齐 Semi filter function）。
    if (typeof filter === 'function') {
      const q = query.trim();
      return mergedOptions.filter((o) => (filter as (i: string, o: OptionData) => boolean)(q, o));
    }
    const q = query.toLowerCase();
    return mergedOptions.filter((o) => o.label.toLowerCase().includes(q));
  });

  // 分组渲染视图：每组过滤后的选项 + 全局扁平索引（用于 activeIndex 匹配）。
  // 仅在 hasGroups 时使用；createdOptions 归入末尾「（新建）」无组段。
  const groupedView = $derived.by<{ label: string | null; items: { opt: OptionData; flatIndex: number }[] }[]>(() => {
    if (!hasGroups) return [];
    const out: { label: string | null; items: { opt: OptionData; flatIndex: number }[] }[] = [];
    const indexOf = (opt: OptionData) => filteredOptions.indexOf(opt);
    for (const o of optionList) {
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
      filterEnabled &&
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
  // virtualize 对象（对齐 Semi）：传入即开启（仅非分组）；itemSize 行高、height 视口高。
  const VIRTUAL_OVERSCAN = 4;
  const isVirtual = $derived(virtualize !== undefined && !hasGroups);
  const vOptionHeight = $derived(virtualize?.itemSize && virtualize.itemSize > 0 ? virtualize.itemSize : 32);
  const vViewportH = $derived(virtualize?.height && virtualize.height > 0 ? virtualize.height : (maxHeight > 0 ? maxHeight : 270));
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

  // maxTagCount 折叠：折叠逻辑复用 TagGroup（mode=custom），本组件只组装 tag 数据 + 折叠开关。
  // maxTagTextLength 仅影响 tag 显示文本（截断派生），实际值/回显不变（红线 #1/#2）。
  // expandRestTagsOnClick 且已点击 +N 展开（restTagsExpanded）时，视为不折叠、全量展示（对齐 Semi）。
  // 对齐 Semi renderMultipleSelection：expandRestTagsOnClick 且浮层打开时全量展开（NotOneLine 分支），
  // 否则折叠。展开由「浮层打开」驱动（点击触发器即开浮层→展开），无需 +N 单独点击态。
  const tagsCollapsed = $derived(
    maxTagCount > 0 && !(expandRestTagsOnClick && isOpen),
  );
  // 全部已选项的显示信息（label 截断态一并算好，供 tag 内容渲染）。
  const allTags = $derived(
    selectedOptions.map((opt) => {
      const raw = getOptionLabel(opt);
      const display = truncate(raw, maxTagTextLength);
      return { opt, display, truncated: display !== raw };
    }),
  );
  // 折叠时透传给 TagGroup 的 maxTagCount（对齐 Semi：n = length>max ? max : undefined）。
  const tagGroupMaxCount = $derived(
    tagsCollapsed && selectedOptions.length > maxTagCount ? maxTagCount : undefined,
  );
  // 折叠时透传给 TagGroup 的 restCount（对齐 Semi：selectedItems.length - maxTagCount）。
  const tagGroupRestCount = $derived(
    tagsCollapsed ? Math.max(0, selectedOptions.length - maxTagCount) : undefined,
  );

  // 取选项显示文本（对齐 Semi：以 label 字段回显）。
  function getOptionLabel(opt: OptionData): string {
    return opt.label;
  }

  const singleLabel = $derived(
    !multiple && selectedOptions.length > 0 ? getOptionLabel(selectedOptions[0]!) : '',
  );

  const hasSelection = $derived(selectedValues.length > 0);
  const showClearBtn = $derived(showClear && !disabled && hasSelection);

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
        // max（对齐 Semi）：已达上限时忽略新增并通知 onExceed，不改变选中值。
        if (max !== undefined && max >= 0 && set.length >= max) {
          onExceed?.(opt);
          return;
        }
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

  // --- 命令式 Methods（对齐 Semi ref API 形状；配 bind:this 调用）---
  // open()/close() 与 open prop 不冲突：prop 已解构为 openProp，open 标识符在此供方法名占用。
  /** 打开浮层 */
  export function open(): void {
    setOpen(true);
  }
  /** 关闭浮层 */
  export function close(): void {
    setOpen(false);
  }
  /** 聚焦触发器（复用 autoFocus 的 combobox 查询 + preventScroll 透传） */
  export function focus(): void {
    rootEl?.querySelector<HTMLElement>('[role="combobox"]')?.focus({ preventScroll });
  }
  /** 清空搜索框（写 query state 即经 $derived 重算 filteredOptions；一并回调 onSearch('')） */
  export function clearInput(): void {
    query = '';
    emitSearch('');
  }
  /** 清空所有已选（复用 clearAll 的值/回调逻辑，无事件） */
  export function deselectAll(): void {
    if (disabled) return;
    setValue(multiple ? [] : '');
    onClear?.();
  }
  /** 全选（仅多选生效）：选中全量选项集里所有非禁用项的 value */
  export function selectAll(): void {
    if (!multiple || disabled) return;
    // mergedOptions = flatBase(拍平分组) + createdOptions，即全量可选源（非 filteredOptions）。
    const all = mergedOptions.filter((o) => !o.disabled).map((o) => o.value);
    setValue(all);
    const newSelected = mergedOptions.filter((o) => all.includes(o.value));
    onChangeWithObject?.(newSelected);
  }
  /** 命令式设置搜索值并触发过滤（比照 onSearchInput：写 query 重算 filteredOptions；回调 onSearch） */
  export function search(value: string): void {
    query = value;
    activeIndex = -1;
    emitSearch(value);
  }
  /** 触发浮层重新定位（递增 reposKey 触发 use:floating action 原位重算） */
  export function rePosition(): void {
    reposKey += 1;
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

  // --- 搜索回调（对齐 Semi onSearch(value, event)；防抖交由使用方处理）---
  function emitSearch(q: string, event?: Event) {
    onSearch?.(q, event);
  }

  function onSearchInput(e: Event & { currentTarget: HTMLInputElement }) {
    query = e.currentTarget.value;
    if (!isOpen) setOpen(true);
    activeIndex = -1;
    emitSearch(query, e);
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
    const horizontal = position.startsWith('left') || position.startsWith('right');
    if (horizontal) return (position.startsWith('left') ? dropdownMargin.left : dropdownMargin.right) ?? 4;
    return (position.startsWith('top') ? dropdownMargin.top : dropdownMargin.bottom) ?? 4;
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
      // 校验态（对齐 Semi validateStatus）：仅 warning/error 有视觉样式，default 不加类。
      validateStatus === 'warning' && 'cd-select--warning',
      validateStatus === 'error' && 'cd-select--error',
      disabled && 'cd-select--disabled',
      isOpen && 'cd-select--open',
      multiple && 'cd-select--multiple',
      borderless && 'cd-select--borderless',
      // ellipsisTrigger：多选 tag 溢出时对可见 tag 文本作单行省略（对齐 Semi）。
      ellipsisTrigger && multiple && 'cd-select--ellipsis-trigger',
      className,
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
  const triggerSearch = $derived(filterEnabled && searchPosition === 'trigger');
  // 搜索框占位文本（对齐 Semi searchPlaceholder）：显式 prop 优先，缺省走 locale。
  const searchPlaceholderText = $derived(searchPlaceholder ?? loc().t('Select.searchPlaceholder'));

  // searchPosition='dropdown' 时，打开浮层后自动聚焦浮层内搜索框，便于直接键入过滤。
  $effect(() => {
    if (!isOpen || triggerSearch || !filterEnabled || !dropdownEl) return;
    const searchEl = dropdownEl.querySelector<HTMLInputElement>('.cd-select__search--dropdown');
    searchEl?.focus();
  });
</script>

<div class={cls} {style} bind:this={rootEl}>
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
    aria-describedby={ariaDescribedby}
    aria-errormessage={ariaErrormessage}
    aria-required={ariaRequired || undefined}
    aria-expanded={isOpen}
    aria-haspopup="listbox"
    aria-controls={listId}
    aria-activedescendant={activeOptionId}
    aria-disabled={disabled || undefined}
    aria-invalid={validateStatus === 'error' || undefined}
    tabindex={disabled ? -1 : 0}
    onclick={toggleOpen}
    onkeydown={onTriggerKeydown}
    onfocus={() => onFocus?.()}
    onblur={() => onBlur?.()}
    onmouseenter={(e) => onMouseEnter?.(e)}
    onmouseleave={(e) => onMouseLeave?.(e)}
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
        {#if tagsCollapsed}
          <!--
            折叠态：复用 TagGroup（mode=custom）承担「可见 tag + 折叠 +N + hover Popover」。
            - tagList：全部已选项的 custom tag 节点（TagGroup 内部按 maxTagCount 切可见/剩余）；
            - maxTagCount/restCount：对齐 Semi renderOneLineTags 传参；
            - showPopover 接 showRestTagsPopover；popoverProps 接 restTagsPopoverProps。
            expandRestTagsOnClick 展开由浮层打开态驱动（见 tagsCollapsed 派生），无需 +N 单独点击。
          -->
          <TagGroup
            class="cd-select__tag-group"
            mode="custom"
            tagList={allTags.map((tag) => ({ tagKey: tag.opt.value, tagInfo: tag }))}
            maxTagCount={tagGroupMaxCount}
            restCount={tagGroupRestCount}
            size="small"
            showPopover={showRestTagsPopover}
            popoverProps={restTagsPopoverProps}
            renderTagItem={customTagItem}
          />
        {:else}
          <!-- 展开态（无 maxTagCount，或 expandRestTagsOnClick 已展开）：直接逐个渲染全部 tag（对齐 Semi NotOneLine 分支） -->
          {#each allTags as tag (tag.opt.value)}
            {@render selectTag(tag)}
          {/each}
        {/if}
        {#if triggerSearch}
          <input
            {...inputProps}
            class="cd-select__search"
            type="text"
            value={query}
            placeholder={searchPlaceholderText}
            aria-label={searchPlaceholderText}
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
          aria-label={searchPlaceholderText}
          oninput={onSearchInput}
          onkeydown={onTriggerKeydown}
          onclick={(e) => e.stopPropagation()}
        />
      {:else if hasSelection}
        {#if renderSelectedItem}
          {@render renderSelectedItem({ option: selectedOptions[0]! })}
        {:else}
          <span class="cd-select__value">{singleLabel}</span>
        {/if}
      {:else}
        <span class="cd-select__placeholder">{placeholder ?? loc().t('Select.placeholder')}</span>
      {/if}
    </div>

    {#if showClearBtn}
      <button
        type="button"
        class="cd-select__clear"
        aria-label={loc().t('Select.clear')}
        onclick={clearAll}
      >
        {#if clearIcon}
          {@render clearIcon()}
        {:else}
          <IconClear aria-hidden="true" />
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
          <IconChevronDown aria-hidden="true" />
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
      use:floating={{ trigger: rootEl, placement: position, autoAdjust: autoAdjustOverflow, offset: dropdownOffset, matchWidth: dropdownMatchSelectWidth, getContainer: getPopupContainer, rePosKey: reposKey }}
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
      {#if filterEnabled && !triggerSearch}
        <!-- searchPosition='dropdown'：搜索框在浮层顶部 -->
        <div class="cd-select__dropdown-search">
          <input
            {...inputProps}
            class="cd-select__search cd-select__search--dropdown"
            type="text"
            value={query}
            placeholder={searchPlaceholderText}
            aria-label={searchPlaceholderText}
            aria-controls={listId}
            oninput={onSearchInput}
            onkeydown={onTriggerKeydown}
            onclick={(e) => e.stopPropagation()}
          />
        </div>
      {/if}
      {#if innerTopSlot}
        <div class="cd-select__dropdown-header">{@render innerTopSlot()}</div>
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
          {#if emptyContent !== undefined}
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
      {#if innerBottomSlot}
        <div class="cd-select__dropdown-footer">{@render innerBottomSlot()}</div>
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
    {#if renderOptionItem}
      {@render renderOptionItem({
        option: opt,
        selected: isSelected(opt.value),
        focused: i === activeIndex,
        onMouseEnter: () => {
          if (!opt.disabled) activeIndex = i;
        },
        onClick: () => selectOption(opt),
      })}
    {:else}
      {#if multiple}
        <span class="cd-select__check" aria-hidden="true">
          {#if isSelected(opt.value)}
            <IconTick aria-hidden="true" />
          {/if}
        </span>
      {/if}
      <span class="cd-select__option-label">{getOptionLabel(opt)}</span>
    {/if}
  </div>
{/snippet}

<!--
  单个多选 Tag（对齐 Semi renderTag：color=white、closable+onClose 删除该项）。
  可见 tag（展开态）与折叠态经 TagGroup custom 渲染的可见/剩余 tag 均复用此 snippet。
-->
{#snippet selectTag(tag: TagInfo)}
  <Tag
    class="cd-select__tag"
    size="small"
    color="white"
    closable={!disabled}
    ariaLabel={loc().t('Select.removeItem', { label: getOptionLabel(tag.opt) })}
    onClose={(_c, e) => {
      (e as Event)?.stopPropagation?.();
      removeTag(tag.opt.value);
    }}
  >
    {#if renderSelectedItem}
      {@render renderSelectedItem({ option: tag.opt })}
    {:else}
      <span
        class="cd-select__tag-label"
        title={tag.truncated ? getOptionLabel(tag.opt) : undefined}
      >{tag.display}</span>
    {/if}
  </Tag>
{/snippet}

<!-- TagGroup mode=custom 的每项渲染入口：从 tagList 项取回 tagInfo，委托 selectTag。 -->
{#snippet customTagItem(item: Record<string, unknown>)}
  {@const tag = item.tagInfo as TagInfo | undefined}
  {#if tag}
    {@render selectTag(tag)}
  {/if}
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
  /* 校验态 warning（对齐 Semi &-warning：背景 + 描边 light 变体，聚焦时描边加深） */
  .cd-select--warning .cd-select__trigger {
    background: var(--cd-color-select-warning-bg);
    border-color: var(--cd-color-select-warning-border);
  }
  .cd-select--warning:not(.cd-select--disabled) .cd-select__trigger:hover {
    background: var(--cd-color-select-warning-bg-hover);
  }
  .cd-select--warning .cd-select__trigger:focus-visible,
  .cd-select--warning.cd-select--open .cd-select__trigger {
    border-color: var(--cd-color-select-warning-border-focus);
  }
  /* 校验态 error（对齐 Semi &-error：danger light 背景 + 描边，聚焦时描边加深） */
  .cd-select--error .cd-select__trigger {
    background: var(--cd-color-select-danger-bg);
    border-color: var(--cd-color-select-danger-border);
  }
  .cd-select--error:not(.cd-select--disabled) .cd-select__trigger:hover {
    background: var(--cd-color-select-danger-bg-hover);
  }
  .cd-select--error .cd-select__trigger:focus-visible,
  .cd-select--error.cd-select--open .cd-select__trigger {
    border-color: var(--cd-color-select-danger-border-focus);
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
  /* 折叠态 TagGroup 实例：在触发器 flex 内联排布（与 search input 并排），随内容换行 */
  .cd-select :global(.cd-select__tag-group) {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    min-inline-size: 0;
    height: auto;
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
  /* destroyOnClose=false 时浮层保持挂载，靠 [hidden] 隐藏；
     display:flex 会压过 [hidden] 的 UA display:none，故显式补一条属性选择器（对齐关闭态真正不可见）。 */
  .cd-select__dropdown[hidden] {
    display: none;
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
  /* 虚拟化行带固定 block-size + 内边距，需 border-box 保证行高与 virtualize.itemSize 一致 */
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
    background: var(--cd-select-option-bg-selected);
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
