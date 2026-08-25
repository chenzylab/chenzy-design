<!--
  Select — see specs/components/input/Select.spec.md
  单选 / 多选 / 本地过滤 / 键盘导航 / 浮层。Token-driven, a11y-correct.
  下拉 portal 到 body + position:fixed（脱离 overflow:hidden 裁剪），matchWidth 跟随触发器宽度，flip 避让。
  maxTagCount：多选 tag 超出折叠为 +N。allowCreate：filter 无匹配时可创建新选项。
  分组：仅 <Select.OptGroup> 组合式 children 支持（对齐 Semi，optionList 数组不支持分组）；
  按组渲染组标题，逻辑/键盘/filter 基于扁平序列。
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
  renderOptionItem snippet：完全自定义候选项渲染；renderSelectedTag snippet：自定义选中值内容（仍套 Tag 容器，
  对齐 Semi renderSelectedItem 返回 isRenderInTag:true 的分支）；renderSelectedItem snippet：多选态完全自定义
  单个已选 chip（不再套 Tag 容器，需自行处理关闭等交互，对齐 Semi renderSelectedItem 返回 isRenderInTag:false 的分支）。
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
    registerOverlayRoot,
    fixedRange,
    scrollOffsetForIndex,
    type Placement,
    resolveDefault,
  } from '@chenzy-design/core';
  import { IconClear, IconChevronDown, IconTick, IconSearch } from '@chenzy-design/icons';
  import { useLocale } from '../locale-provider/index.js';
  import { floating } from '../_floating/use-floating.js';
  import Tag from '../tag/Tag.svelte';
  import TagGroup from '../tag/TagGroup.svelte';
  import Input from '../input/Input.svelte';
  import Highlight from '../highlight/Highlight.svelte';
  import { getInputGroupContext } from '../input/context.js';
  import { createRootOptionCollector, setRootOptionsContext } from './context.js';
  import type { OptionValue, OptionData, OptionGroup, OptionOrGroup } from './types.js';

  type Size = 'small' | 'default' | 'large';
  type Status = 'default' | 'warning' | 'error';
  /** 单个多选 Tag 的渲染信息（选项 + 截断后显示文本 + 是否被截断）。 */
  type TagInfo = { opt: OptionData; display: string; truncated: boolean; index: number };

  function isGroup(o: OptionOrGroup): o is OptionGroup {
    return Array.isArray((o as OptionGroup).options);
  }

  interface Props {
    value?: OptionValue | OptionValue[];
    defaultValue?: OptionValue | OptionValue[];
    /**
     * 选项（对齐 Semi optionList）。不支持分组——Semi optionList 本身即不支持分组对象，
     * 分组只能通过 `<Select.Option>` / `<Select.OptGroup>` 组合式 children 声明。
     */
    optionList?: OptionData[];
    /**
     * 组合式候选项声明（对齐 Semi `<Select.Option>` / `<Select.OptGroup>` children），
     * 与 optionList 并存；optionList 非空时优先生效（同配置式/组合式双写法惯例）。
     * 分组（`<Select.OptGroup>`）仅此形态支持，对齐 Semi。
     */
    children?: Snippet;
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
    'aria-label'?: string;
    /** 关联外部 label 的 id（优先于 ariaLabel） */
    ariaLabelledby?: string;
    /** 关联外部辅助说明的 id（对齐 Semi withField aria-describedby 注入） */
    ariaDescribedby?: string;
    /** 关联外部错误提示的 id（对齐 Semi withField aria-errormessage 注入） */
    ariaErrormessage?: string;
    /** 标记为必填（对齐 Semi withField aria-required 注入） */
    ariaRequired?: boolean;
    /**
     * 标记触发器为无效态（对齐 Semi aria-invalid，纯透传，非由 validateStatus 自动推导——
     * Semi 源码里两者互不关联，此前本库误自造成「validateStatus==='error' 时自动 true」，
     * 违背用户明确的「有则有、无则去」对齐原则，已改回纯透传）。
     */
    ariaInvalid?: boolean;
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
    /** 浮层根 div 追加的自定义 className（与内置 cd-select-dropdown 并存） */
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
    /**
     * 浮层进出场动画开关（默认 true，对齐 Semi Select 内部 Popover 实例 motion prop）。
     * false 时浮层展开无过渡效果，瞬时显示（同 Tooltip/Popover 的 motion 惯例）。
     */
    motion?: boolean;
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
    onChange?: (v: OptionValue | OptionValue[] | undefined) => void;
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
    /** 触发器获焦时触发（对齐 Semi onFocus(e: FocusEvent)，携带原生 focus 事件） */
    onFocus?: (e?: FocusEvent) => void;
    /** 触发器失焦时触发（对齐 Semi onBlur(e: FocusEvent)，携带原生 blur 事件） */
    onBlur?: (e?: FocusEvent) => void;
    /** 浮层列表滚动触底时触发 */
    onScrollToBottom?: () => void;
    /** 多选超出 maxTagCount 时触发（携带被隐藏的 option） */
    onExceed?: (option: OptionData) => void;
    /** 携带完整 option 对象的 change 回调（单选 OptionData；多选 OptionData[]） */
    onChangeWithObject?: (option: OptionData | OptionData[]) => void;
    /** 触发器左侧前缀 */
    prefix?: Snippet | string;
    /** 触发器右侧后缀（覆盖默认箭头区域） */
    suffix?: Snippet | string;
    /**
     * prefix/suffix 为 Snippet 时是否按图标变体处理外边距（默认 true，对齐 Semi `isSemiIcon` 判别）。
     * Snippet 渲染的是非图标节点（如文案 span）时传 false，回落到「既非文案也非图标」的第三态（外边距 0）。
     */
    affixIsIcon?: boolean;
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
    /**
     * 自定义已选项内容渲染（单选回显文本 / 多选 Tag 内部内容），仍由 Select 套自身的 Tag 容器
     * （对齐 Semi renderSelectedItem 返回 `{ isRenderInTag: true, content }` 的分支）。
     */
    renderSelectedTag?: Snippet<[{ option: OptionData }]>;
    /**
     * 多选态完全自定义单个已选 chip 渲染，提供后 Select 不再套自身的 <Tag> 容器，需自行处理关闭等
     * 交互（对齐 Semi renderSelectedItem 返回 `{ isRenderInTag: false, content }` 的分支；入参含
     * index/disabled/onClose，onClose 接回 Select 内部移除该项的逻辑）。仅多选生效，单选自定义走
     * renderSelectedTag。
     */
    renderSelectedItem?: Snippet<
      [{ option: OptionData; index: number; disabled: boolean; onClose: (e?: Event) => void }]
    >;
    /** 自定义"创建xxx"项渲染 */
    renderCreateItem?: Snippet<[string]>;
    /**
     * 完全自定义触发器渲染，替换默认 combobox 触发框。
     * 入参含当前 value/选中项/placeholder/open 态，供调用方自绘触发器；
     * 另含 onSearch/onRemove/onClear（对齐 Semi TriggerRenderProps），用于向 Select 内部同步搜索词/移除单项/清空。
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
          /** 更新搜索词并向 Select 内部同步（对齐 Semi onSearch；需同时开启 filter 才会参与过滤） */
          onSearch: (value: string) => void;
          /** 移除单个已选项（对齐 Semi onRemove；option 至少带 value/label） */
          onRemove: (option: OptionData) => void;
          /** 清空所有已选（对齐 Semi onClear） */
          onClear: () => void;
        },
      ]
    >;
  }

  let {
    value = $bindable(),
    defaultValue,
    optionList = [],
    children,
    multiple: multipleProp,
    filter: filterProp,
    open: openProp = $bindable(),
    defaultOpen: defaultOpenProp,
    size: sizeProp,
    style,
    class: className,
    validateStatus = 'default',
    position = 'bottomStart',
    placeholder,
    'aria-label': ariaLabel,
    ariaLabelledby,
    ariaDescribedby,
    ariaErrormessage,
    ariaRequired,
    ariaInvalid,
    id,
    disabled: disabledProp,
    showClear: showClearProp,
    max,
    maxTagCount = 0,
    maxTagTextLength,
    allowCreate: allowCreateProp,
    remote: remoteProp,
    onSearch,
    loading = false,
    virtualize,
    maxHeight: maxHeightProp,
    dropdownMatchSelectWidth: dropdownMatchSelectWidthProp,
    dropdownClassName,
    dropdownStyle,
    zIndex,
    dropdownMargin,
    stopPropagation: stopPropagationProp,
    onMouseEnter,
    onMouseLeave,
    destroyOnClose = false,
    getPopupContainer,
    autoAdjustOverflow: autoAdjustOverflowProp,
    motion: motionProp,
    borderless: borderlessProp,
    autoFocus = false,
    autoClearSearchValue: autoClearSearchValueProp,
    showRestTagsPopover: showRestTagsPopoverProp,
    restTagsPopoverProps,
    defaultActiveFirstOption: defaultActiveFirstOptionProp,
    inputProps,
    showArrow: showArrowProp,
    clickToHide = false,
    onListScroll,
    preventScroll = false,
    expandRestTagsOnClick: expandRestTagsOnClickProp,
    ellipsisTrigger: ellipsisTriggerProp,
    searchPosition: searchPositionProp,
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
    affixIsIcon = true,
    clearIcon,
    arrowIcon,
    emptyContent,
    innerTopSlot,
    innerBottomSlot,
    outerTopSlot,
    outerBottomSlot,
    renderOptionItem,
    renderSelectedTag,
    renderSelectedItem,
    renderCreateItem,
    triggerRender,
  }: Props = $props();
  // cdGlobal 全局默认 props（对齐 Semi semiGlobal.config.overrideDefaultProps）：
  // 优先级 = 显式传值 > cdGlobal['Select'] > 组件内置默认值。
  const stopPropagation = $derived(resolveDefault(stopPropagationProp, 'Select', 'stopPropagation', true));
  const borderless = $derived(resolveDefault(borderlessProp, 'Select', 'borderless', false));
  const filter = $derived(resolveDefault(filterProp, 'Select', 'filter', false));
  const multiple = $derived(resolveDefault(multipleProp, 'Select', 'multiple', false));
  const defaultOpen = $derived(resolveDefault(defaultOpenProp, 'Select', 'defaultOpen', false));
  const allowCreate = $derived(resolveDefault(allowCreateProp, 'Select', 'allowCreate', false));
  const maxHeight = $derived(resolveDefault(maxHeightProp, 'Select', 'maxHeight', 270));
  const dropdownMatchSelectWidth = $derived(resolveDefault(dropdownMatchSelectWidthProp, 'Select', 'dropdownMatchSelectWidth', true));
  const defaultActiveFirstOption = $derived(resolveDefault(defaultActiveFirstOptionProp, 'Select', 'defaultActiveFirstOption', true));
  const showArrow = $derived(resolveDefault(showArrowProp, 'Select', 'showArrow', true));
  const showClear = $derived(resolveDefault(showClearProp, 'Select', 'showClear', false));
  const searchPosition = $derived(resolveDefault(searchPositionProp, 'Select', 'searchPosition', 'trigger'));
  const remote = $derived(resolveDefault(remoteProp, 'Select', 'remote', false));
  const autoAdjustOverflow = $derived(resolveDefault(autoAdjustOverflowProp, 'Select', 'autoAdjustOverflow', true));
  const motion = $derived(resolveDefault(motionProp, 'Select', 'motion', true));
  const autoClearSearchValue = $derived(resolveDefault(autoClearSearchValueProp, 'Select', 'autoClearSearchValue', true));
  const showRestTagsPopover = $derived(resolveDefault(showRestTagsPopoverProp, 'Select', 'showRestTagsPopover', false));
  const expandRestTagsOnClick = $derived(resolveDefault(expandRestTagsOnClickProp, 'Select', 'expandRestTagsOnClick', false));
  const ellipsisTrigger = $derived(resolveDefault(ellipsisTriggerProp, 'Select', 'ellipsisTrigger', false));

  // InputGroup 组级默认（size/disabled）：显式 prop 始终优先，否则回退组级，再回退组件默认。
  const group = getInputGroupContext();
  const size = $derived<Size>(sizeProp ?? group?.size ?? 'default');
  const disabled = $derived<boolean>(disabledProp ?? group?.disabled ?? false);

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
    if (multiple) {
      // 对齐 Semi foundation.ts _updateMultiple 的 propValueIsArray 防御：多选态非数组
      // value（如受控 value 误传字符串 ''）视为无选中，不包装成单元素数组。Semi 源码注释
      // 明确「Multiple selection is to determine whether it is an array to avoid the
      // problem of defaultValue/value incoming string error」——整个 selections 填充逻辑
      // 都挂在 `if (propValueIsArray && ...)` 之下，非数组时 selections 保持空 Map。
      // 此前无条件 `[v]` 包装会把 value='' 误判成「选中了空字符串」这个不存在的选项，
      // hasSelection 恒为 true，触发器视觉空但仍走「有选中」渲染分支（真机复现：搜索框
      // 未获得空值态的 12px 左边距，光标贴边，见 远程搜索 demo 用 value=$state('') 初始化）。
      return Array.isArray(v) ? v : [];
    }
    return Array.isArray(v) ? v : [v];
  }

  function setValue(next: OptionValue | OptionValue[] | undefined) {
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

  /**
   * 进/退场动画对齐 Semi（与 TreeSelect 同构模式）：destroyOnClose=false（默认）时面板
   * 挂载后一直保留 DOM，仅靠 hidden 隐藏——关闭时先播放 hide 动画（panelLeaving=true），
   * animationend 后才真正 hidden（panelHidden=true）。destroyOnClose=true 时面板整个从
   * `{#if}` 移除，DOM 立即卸载，来不及播放退场动画——用户显式要求"不保留 DOM"，
   * "立即消失"符合该语义，不强行补退场动画（与 Tooltip keepDOM=false 场景同一决策）。
   */
  let panelLeaving = $state(false);
  let panelHidden = $state(true);
  $effect(() => {
    if (isOpen) {
      panelHidden = false;
      panelLeaving = false;
    } else if (motion) {
      panelLeaving = true;
    } else {
      panelHidden = true;
    }
  });
  function finalizeClose(): void {
    if (!panelLeaving) return;
    panelLeaving = false;
    panelHidden = true;
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
  // 多选触发器内搜索框宽度：逐字段照抄 Semi renderTriggerInput 的 inline style 计算
  // （index.tsx:719-725 `style = { width: inputValue ? \`${inputValue.length * 16}px\` : '2px' }`，
  // 属性名 width 是 Semi 运行时算好写入 style 的物理属性，非本库常规的逻辑属性
  // inline-size，此处按值逐字复刻，不改写成逻辑属性）。无输入时窄至 2px，紧贴最后
  // 一个 tag，使 tag 组 + 输入框能在同一行放下（本库原用 flex:1 1 auto +
  // min-inline-size:2rem 强制至少 32px，导致触发器稍窄时输入框单独换行，
  // 与 Semi 三个 tag + 搜索仍同一行的效果不符）。
  const multiSearchWidth = $derived(query ? `${query.length * 16}px` : '2px');

  // --- 组合式 <Select.Option>/<Select.OptGroup> 收集（对齐 Semi children 声明）---
  // optionList 非空时优先生效（配置式/组合式双写法惯例，同 Table columns/Column）。
  let optionsVersion = $state(0);
  const rootOptionCollector = createRootOptionCollector(() => {
    optionsVersion += 1;
  });
  setRootOptionsContext(rootOptionCollector);
  const collectedOptionList = $derived.by<OptionOrGroup[]>(() => {
    void optionsVersion;
    return rootOptionCollector.snapshot();
  });
  const effectiveOptionList = $derived<OptionOrGroup[]>(optionList.length > 0 ? optionList : collectedOptionList);

  // 是否含分组：决定渲染走分组结构还是扁平。
  const hasGroups = $derived(effectiveOptionList.some(isGroup));
  // 扁平选项序列（拍平分组）——逻辑/键盘/filter/回显统一基于它。
  const flatBase = $derived<OptionData[]>(
    effectiveOptionList.flatMap((o) => (isGroup(o) ? o.options : [o])),
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
    for (const o of effectiveOptionList) {
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
    selectedOptions.map((opt, index) => {
      const raw = getOptionLabel(opt);
      const display = truncate(raw, maxTagTextLength);
      return { opt, display, truncated: display !== raw, index };
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
  // 对齐 Semi `isHovering || isOpen` 门控：清除按钮仅 hover 或展开态显示，非常驻。
  let isHovering = $state(false);
  const showClearBtn = $derived(showClear && !disabled && hasSelection && (isHovering || isOpen));

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
    setValue(multiple ? [] : undefined);
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
    setValue(multiple ? [] : undefined);
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

  // Input 组件受控回调（对齐 Semi handleInputChange，经 Input 的 onChange(value, e) 接线，
  // 非裸 input 的 oninput 事件——三处搜索框统一走此入口）。
  function onSearchInput(value: string, e: Event) {
    query = value;
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

  // --- 全局浮层注册（见 core registerOverlayRoot 注释）：dropdown portal 到 body 后
  //     与祖先浮层（如包裹本 Select 的 hover 触发 Popover）在真实 DOM 树上脱节，
  //     登记后祖先浮层的 pointerleave 判断能识别"鼠标去了合法子浮层"而非真的离开。---
  $effect(() => {
    if (!dropdownRootEl) return;
    return registerOverlayRoot(dropdownRootEl);
  });

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
    ['cd-select-dropdown', dropdownClassName].filter(Boolean).join(' '),
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
      `cd-select-${size}`,
      // 校验态（对齐 Semi validateStatus）：仅 warning/error 有视觉样式，default 不加类。
      validateStatus === 'warning' && 'cd-select-warning',
      validateStatus === 'error' && 'cd-select-error',
      disabled && 'cd-select-disabled',
      isOpen && 'cd-select-open',
      multiple && 'cd-select-multiple',
      borderless && 'cd-select-borderless',
      // ellipsisTrigger：多选 tag 溢出时对可见 tag 文本作单行省略（对齐 Semi）。
      // 对齐 Semi `-content-wrapper-one-line` 只在 maxTagCount && !isOpen（即 tagsCollapsed）时生效——
      // expandRestTagsOnClick 展开态（tagsCollapsed=false）必须让 nowrap 失效，否则展开的多个 tag
      // 被挤压裁成单行（实测「抖..」「轻..」等近乎不可读）。无 maxTagCount 场景 tagsCollapsed 恒 false，
      // 也不应有 nowrap（对齐 Semi 折叠态才 nowrap，非折叠恒 wrap）。
      ellipsisTrigger && multiple && tagsCollapsed && 'cd-select-ellipsis-trigger',
      // 对齐 Semi `.semi-select-with-prefix`：左侧留白改由 prefix / insetLabel 自身的
      // 外边距承担，内容区的 margin-left 归零（否则会叠出双份留白）。
      (prefix !== undefined || insetLabel !== undefined) && 'cd-select-with-prefix',
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
  // 单选态搜索 input 仅浮层打开时挂载（对齐 Semi renderSingleSelection 的 showInput state，
  // 由 toggle2SearchInput 随 open/close 切换）；关闭态回填文本用纯 span，触发器 hover 显示
  // pointer 而非浏览器 UA 赋给 <input> 的 text 光标。多选态 Semi 不受 isOpen 影响、始终挂载
  // （见 renderMultipleSelection showTriggerInput 无 isOpen 判断），故只对单选收窄。
  const singleTriggerInputVisible = $derived(triggerSearch && isOpen);
  // 搜索框占位文本（对齐 Semi searchPlaceholder）：显式 prop 优先，缺省走 locale。
  const searchPlaceholderText = $derived(searchPlaceholder ?? loc().t('Select.searchPlaceholder'));

  // searchPosition='dropdown' 时，对齐 Semi foundation.open() 的 openMenu 回调：
  // `if (autoFocus && searchPosition === SEARCH_POSITION_DROPDOWN) focusDropdownInput()`——
  // 与 trigger 位置（open() 内 toggle2SearchInput(true) 无条件聚焦）不同，dropdown 位置的
  // 自动聚焦要靠 autoFocus prop 显式开启，默认 false 时点击展开不聚焦（真机核对 semi.design
  // 官网"搜索框位置"两个 demo：点击展开后 activeElement 是触发器根节点而非搜索 input）。
  // .cd-select-search-dropdown 挂在 Input 组件的 wrapper div 上（class prop 对齐 Semi
  // 挂载点，见 Input.svelte），真正可聚焦的原生 <input class="cd-input"> 是其内层子节点，
  // 故需再往下取一层。
  $effect(() => {
    if (!isOpen || !autoFocus || triggerSearch || !filterEnabled || !dropdownEl) return;
    const searchEl = dropdownEl.querySelector<HTMLInputElement>('.cd-select-search-dropdown .cd-input');
    searchEl?.focus();
  });

  // 单选 + searchPosition='trigger' 时，触发器内搜索 input 仅打开态挂载（见
  // singleTriggerInputVisible），新挂载的 DOM 节点不会自动继承触发器已有的焦点——
  // 打开后需主动聚焦，否则键入被触发器自身的 onTriggerKeydown 拦截而非落入 input。
  // 同上，.cd-select-search-single 挂在 Input wrapper 上，实际 <input> 在其内层。
  $effect(() => {
    if (!singleTriggerInputVisible || !rootEl) return;
    const searchEl = rootEl.querySelector<HTMLInputElement>('.cd-select-search-single .cd-input');
    searchEl?.focus({ preventScroll });
  });

  // 多选 + searchPosition='trigger' 时，对齐 Semi foundation.open() 的
  // toggle2SearchInput(true) → focusInput() 链路：多选搜索 input 恒挂载（不随
  // isOpen 卸载/重挂），故不能靠"新节点挂载后聚焦"，需在 isOpen 转为 true 时
  // 主动 focus，否则焦点停留在触发器根节点，用户看不到光标、无法直接键入过滤。
  $effect(() => {
    if (!isOpen || !triggerSearch || !multiple || !rootEl) return;
    const searchEl = rootEl.querySelector<HTMLInputElement>('.cd-select-search-multiple .cd-input');
    searchEl?.focus({ preventScroll });
  });
</script>

<div class={cls} {style} bind:this={rootEl}>
  {#if children}
    <!-- 组合式 <Select.Option>/<Select.OptGroup> 收集宿主：display:none 不产生可见/占位 DOM
         也不进 a11y 树，但仍挂载子组件、跑其 init/effect（注册选项元数据）。 -->
    <div class="cd-select-option-collector" aria-hidden="true" style="display:none">
      {@render children()}
    </div>
  {/if}
  <!--
    对齐 Semi handleClick：挂在整个触发器根节点，点击触发器内任意位置（含内联搜索框）
    都应展开浮层——故触发器内联搜索框（下方 -search-single/-search-multiple）的 click
    不再 stopPropagation，让事件冒泡到此处触发 toggleOpen。toggleOpen 已对展开态做了
    防护（isOpen && !clickToHide 时直接 return），故点击已展开的搜索框不会误触收起。

    {style} 与外层 .cd-select（rootEl）重复绑定：Semi 的 `role=combobox` div 就是唯一的
    视觉盒子，`style` prop 直接挂在它身上，内联样式特异性天然压过 `.semi-select { height:
    32px }` 的 class 规则（自定义 height 生效）。本库拆成 外层 .cd-select（承担定位锚点/
    floating trigger 引用）+ 内层 .cd-select-trigger（真正可见盒子，固定 block-size token）
    两层，若只把 style 绑在外层，外层拿到自定义高度但只是透明容器，内层看不到、仍固定
    32px——头像/内容贴边无呼吸感（真机对比 Semi 截图发现）。挂两处后内层的内联 height
    才能真正压过其 class 里的 block-size 声明，视觉盒子随之变高，对齐 Semi 单元素行为；
    未传自定义 style 时两处都是空字符串，不影响默认 token 高度。

    对齐 Semi useCustomTrigger 分支：`triggerRender` 只替换 role=combobox div **内部**的
    inner 内容（prefix/selection/suffix/clear-arrow 四段），外层这个带 onClick/aria/tabIndex
    的 combobox 容器本身始终存在、不被 triggerRender 取代（Semi index.tsx 1487-1515 行的
    outer div 在 useCustomTrigger 为 true/false 时是同一个，只是 children 换成 <Trigger>）。
    此前 triggerRender 整体替换掉了这层容器，自定义内容裸渲染、无点击展开/无 aria/无键盘——
    真机复现「自定义触发器点击没反应」正因于此。
  -->
  <div
    class={triggerRender ? 'cd-select-trigger-custom' : 'cd-select-trigger'}
    role="combobox"
    {id}
    {style}
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
    aria-invalid={ariaInvalid}
    tabindex={disabled ? -1 : 0}
    onclick={toggleOpen}
    onkeydown={onTriggerKeydown}
    onfocus={(e) => onFocus?.(e)}
    onblur={(e) => onBlur?.(e)}
    onmouseenter={(e) => {
      isHovering = true;
      onMouseEnter?.(e);
    }}
    onmouseleave={(e) => {
      isHovering = false;
      onMouseLeave?.(e);
    }}
  >
    {#if triggerRender}
      {@render triggerRender({
        value: currentValue,
        selectedOptions,
        placeholder: placeholder ?? '',
        open: isOpen,
        disabled,
        toggle: toggleOpen,
        onTriggerKeydown,
        onSearch: search,
        onRemove: (option) => removeTag(option.value),
        onClear: () => {
          setValue(multiple ? [] : undefined);
          onClear?.();
        },
      })}
    {:else}
    {#if prefix}
      <!-- prefix 支持 string | Snippet（对齐 Semi ReactNode）。三态外边距变体（对齐 Semi
           isString→text 12px+bold、isSemiIcon→icon 8px、其余→0，Svelte 无法内省 Snippet
           故按 string=text、Snippet+affixIsIcon=icon、Snippet 非图标=0 近似）。 -->
      <span
        class="cd-select-prefix"
        class:cd-select-prefix-text={typeof prefix === 'string'}
        class:cd-select-prefix-icon={typeof prefix !== 'string' && affixIsIcon}
      >
        {#if typeof prefix === 'string'}{prefix}{:else}{@render prefix()}{/if}
      </span>
    {/if}

    {#if hasInsetLabel}
      <span class="cd-select-inset-label" id={insetLabelId}>
        {#if typeof insetLabel === 'string'}
          {insetLabel}
        {:else if insetLabel}
          {@render insetLabel()}
        {/if}
      </span>
    {/if}

    <div
      class="cd-select-selection"
      class:cd-select-selection-wrap={multiple && selectedOptions.length > 0 && !tagsCollapsed}
      class:cd-select-selection-empty={multiple && !hasSelection}
    >
      {#if multiple}
        <!--
          对齐 Semi renderMultipleSelection：走多选渲染只看 multiple，不看是否有选中值
          （Semi `multiple ? renderMultipleSelection() : renderSingleSelection()`，判断
          与 selections.size 无关）。原实现按 `multiple && selectedOptions.length > 0`
          判断，无选中值时会整体退化到单选分支渲染（.cd-select-search-single 绝对定位
          铺满 + 叠字淡出），而非多选态该有的内联宽度动态搜索框（.cd-select-search-multiple），
          真机对比 Semi 空态多选触发器出现双层边框视觉即因于此。
        -->
        {#if hasSelection}
          {#if tagsCollapsed}
            <!--
              折叠态：复用 TagGroup（mode=custom）承担「可见 tag + 折叠 +N + hover Popover」。
              - tagList：全部已选项的 custom tag 节点（TagGroup 内部按 maxTagCount 切可见/剩余）；
              - maxTagCount/restCount：对齐 Semi renderOneLineTags 传参；
              - showPopover 接 showRestTagsPopover；popoverProps 接 restTagsPopoverProps。
              expandRestTagsOnClick 展开由浮层打开态驱动（见 tagsCollapsed 派生），无需 +N 单独点击。
            -->
            <TagGroup
              class="cd-select-tag-group"
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
        {:else}
          <!--
            对齐 Semi renderMultipleSelection：`placeholderText = placeholder && !inputValue
            ? <span className={spanCls}>{placeholder}</span> : null`——多选态无选中值时显示
            占位符，且有输入时不显示（非单选态的三态叠字淡出机制，这里更简单：直接不渲染）。
          -->
          {#if placeholder && !query}
            <span class="cd-select-placeholder">{placeholder}</span>
          {/if}
        {/if}
        {#if triggerSearch}
          <!--
            对齐 Semi renderTriggerInput 多选分支：复用 Input 组件（非裸 input），无条件
            渲染（不随 hasSelection 变化）。style（width:multiSearchWidth）对齐 Semi
            selectInputProps.style，挂在 Input 的 wrapper div 上（Semi Input 源码 style
            prop 即挂 .semi-input-wrapper，非内层裸 <input>，见 Input.svelte wrapper 上的
            {style} 绑定）。
          -->
          <Input
            {...inputProps}
            class="cd-select-search cd-select-search-multiple"
            borderless
            {size}
            {disabled}
            value={query}
            aria-label={searchPlaceholderText}
            style="width:{multiSearchWidth}"
            onChange={onSearchInput}
            onKeyDown={onTriggerKeydown}
          />
        {/if}
      {:else}
        <!--
          对齐 Semi renderSingleSelection：回填文本 span 与触发器内搜索框是
          **content-wrapper 内的兄弟节点、始终并存**（非二选一），由 span 上的三态类区分：
            有输入 → -text-hide（隐藏原文本，只见输入）
            无输入 → -text-inactive（原文本 opacity 0.4 垫在输入框下方）
            非搜索 → 正常显示
          input 仅打开态挂载（singleTriggerInputVisible），故三态判断也以它为准——
          关闭态下 input 不存在，恒走「正常显示」分支。
        -->
        {#if hasSelection && renderSelectedTag}
          <span
            class="cd-select-value"
            class:cd-select-value-hide={singleTriggerInputVisible && !!query}
            class:cd-select-value-inactive={singleTriggerInputVisible && !query}
          >
            {@render renderSelectedTag({ option: selectedOptions[0]! })}
          </span>
        {:else if hasSelection}
          <span
            class="cd-select-value"
            class:cd-select-value-hide={singleTriggerInputVisible && !!query}
            class:cd-select-value-inactive={singleTriggerInputVisible && !query}
          >{singleLabel}</span>
        {:else}
          <!--
            严格对齐 Semi：placeholder 无内置文案（Semi select/index.tsx:349
            `defaultProps.placeholder = ''`，其 Select locale 只有 emptyText/createText）。
            本库原先兜底到一个自造的 Select 占位 locale 键，会凭空显示「请选择」，现已连键一并删除。
            （注意：注释里别写出完整的 locale 取值调用形式——locale-coverage 闸门按文本扫描引用，
             会把注释当成真实消费方而误报悬空键。）
          -->
          <span
            class="cd-select-placeholder"
            class:cd-select-value-hide={singleTriggerInputVisible && !!query}
            class:cd-select-value-inactive={singleTriggerInputVisible && !query}
          >{placeholder ?? ''}</span>
        {/if}
        {#if singleTriggerInputVisible}
          <!--
            对齐 Semi renderTriggerInput 单选分支：同一 Input 组件，无 multiple 专属 width
            style。叠字淡出定位（绝对定位铺满原文本上方）本库自有，靠 wrapper 上的
            cd-select-search-single 修饰类承担（见下方样式，挂在 Input 组件根 class 上）。
          -->
          <Input
            {...inputProps}
            class="cd-select-search cd-select-search-single"
            borderless
            {size}
            {disabled}
            value={query}
            aria-label={searchPlaceholderText}
            onChange={onSearchInput}
            onKeyDown={onTriggerKeydown}
          />
        {/if}
      {/if}
    </div>

    {#if suffix}
      <span
        class="cd-select-suffix"
        class:cd-select-suffix-text={typeof suffix === 'string'}
        class:cd-select-suffix-icon={typeof suffix !== 'string' && affixIsIcon}
      >
        {#if typeof suffix === 'string'}{suffix}{:else}{@render suffix()}{/if}
      </span>
    {/if}

    <!--
      对齐 Semi `{showClear ? clearDiv : arrowContent}`：清除按钮与箭头是**同一位置的互斥
      替换**，非并列——hover/展开态有值时清除按钮顶替箭头，而非额外插到箭头旁边挤占空间
      （原实现两者各自独立 {#if}，会同时渲染、把触发器撑宽，且清除按钮紧贴箭头易误触）。
    -->
    {#if showClearBtn}
      <button
        type="button"
        class="cd-select-clear"
        aria-label={loc().t('Select.clear')}
        onclick={clearAll}
      >
        {#if clearIcon}
          {@render clearIcon()}
        {:else}
          <IconClear aria-hidden="true" />
        {/if}
      </button>
    {:else if showArrow}
      <span class="cd-select-arrow" aria-hidden="true">
        {#if arrowIcon}
          {@render arrowIcon()}
        {:else}
          <IconChevronDown aria-hidden="true" />
        {/if}
      </span>
    {:else}
      <!-- 对齐 Semi `&-arrow-empty { width: 12px }`：不显示箭头时右侧仍留出空白，非塌陷为 0。 -->
      <span class="cd-select-arrow-empty" aria-hidden="true"></span>
    {/if}
    {/if}
  </div>

  {#if isOpen || !destroyOnClose}
    <!--
      浮层最外层容器（use:floating 定位）：承载 outerTopSlot / 滚动列表 / outerBottomSlot 三层。
      outer slot 与滚动列表平级、位于滚动区之外，始终固定展现（对齐 Semi outer*Slot）；
      滚动/虚拟化/onListScroll/触底检测均作用于内部 role=listbox 的滚动容器（dropdownEl）。
    -->
    <div
      class={dropdownCls}
      class:cd-select-dropdown-motion-show={motion && isOpen}
      class:cd-select-dropdown-motion-hide={motion && panelLeaving}
      onanimationend={finalizeClose}
      bind:this={dropdownRootEl}
      use:floating={{ trigger: rootEl, placement: position, autoAdjust: autoAdjustOverflow, offset: dropdownOffset, matchWidth: dropdownMatchSelectWidth, getContainer: getPopupContainer, rePosKey: reposKey, open: isOpen }}
      style={dropdownRootInlineStyle}
      hidden={destroyOnClose ? undefined : (panelHidden || undefined)}
    >
      {#if outerTopSlot}
        <div class="cd-select-outer-top">{@render outerTopSlot()}</div>
      {/if}
      <div
        class="cd-select-list"
        bind:this={dropdownEl}
        role="listbox"
        id={listId}
        aria-multiselectable={multiple}
        aria-busy={loading || undefined}
        style={dropdownListInlineStyle}
      >
      {#if filterEnabled && !triggerSearch}
        <!--
          searchPosition='dropdown'：搜索框在浮层顶部（对齐 Semi renderDropdownInput）。
          外层 wrapperCls（`${prefixcls}-dropdown-search-wrapper`）对齐 Semi 结构；内部复用
          Input 组件，prefix 传 IconSearch snippet（对齐 Semi `prefix={<IconSearch/>}`），
          showClear 恒 true（对齐 Semi selectInputProps.showClear = true，未走 inputProps
          覆盖时的默认值）。清除按钮不必单接 onClear——Input.clear() 内部已在清空后追加调用
          onChange('', e)（同一条链路），经 onSearchInput 同步 query/重算 filteredOptions，
          对齐 Semi Input 的 clear 行为（无独立 onClear 分支，统一走 handleInputChange）。
        -->
        <div class="cd-select-dropdown-search-wrapper">
          <Input
            {...inputProps}
            class="cd-select-search cd-select-search-dropdown"
            {disabled}
            value={query}
            placeholder={searchPlaceholderText}
            aria-label={searchPlaceholderText}
            aria-controls={listId}
            showClear={true}
            onChange={onSearchInput}
            onKeyDown={onTriggerKeydown}
          >
            {#snippet prefix()}
              <IconSearch aria-hidden="true" />
            {/snippet}
          </Input>
        </div>
      {/if}
      {#if innerTopSlot}
        <div class="cd-select-dropdown-header">{@render innerTopSlot()}</div>
      {/if}
      {#if loading}
        <!-- 对齐 Semi renderLoading：仅指示器，无文案（Spin 裸用，无 tip）。 -->
        <div class="cd-select-loading" role="status" aria-label={loc().t('Select.loading')}>
          <span class="cd-select-spinner" aria-hidden="true"></span>
        </div>
      {/if}
      {#if canCreate}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <div
          class="cd-select-option cd-select-option-create"
          role="option"
          aria-selected={false}
          tabindex="-1"
          onclick={createOption}
        >
          {#if renderCreateItem}
            {@render renderCreateItem(query.trim())}
          {:else}
            <!-- 对齐 Semi：`<span class="-create-tips">创建</span>` + 裸的输入值两个节点，
                 而非把值插值进一整串（Semi locale.createText 就是不含占位符的「创建」）。 -->
            <span class="cd-select-create-tips">{loc().t('Select.createText')}</span>
            {query.trim()}
          {/if}
        </div>
      {/if}
      {#if filteredOptions.length === 0 && !canCreate && !loading}
        <div class="cd-select-empty">
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
            <div class="cd-select-group" role="presentation">{group.label}</div>
          {/if}
          {#each group.items as it (it.opt.value)}
            {@render optionRow(it.opt, it.flatIndex)}
          {/each}
        {/each}
      {:else if isVirtual}
        <!-- 虚拟化：spacer 撑总高，可见 option 绝对定位按全局索引偏移；只渲染视口切片 -->
        <div class="cd-select-spacer" style={`block-size:${vTotalHeight}px`}>
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
        <div class="cd-select-dropdown-footer">{@render innerBottomSlot()}</div>
      {/if}
      </div>
      {#if outerBottomSlot}
        <div class="cd-select-outer-bottom">{@render outerBottomSlot()}</div>
      {/if}
    </div>
  {/if}
</div>

{#snippet optionRow(opt: OptionData, i: number, vStyle?: string)}
  <!-- 选项通过 combobox 的 roving + aria-activedescendant 键盘操作，无需自身键事件 -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div
    class={['cd-select-option', opt._className].filter(Boolean).join(' ')}
    class:cd-select-option-active={i === activeIndex}
    class:cd-select-option-selected={isSelected(opt.value)}
    id={`${listId}-opt-${i}`}
    role="option"
    aria-selected={isSelected(opt.value)}
    aria-disabled={opt.disabled || undefined}
    tabindex="-1"
    style={[vStyle, opt._style].filter(Boolean).join('; ')}
    onpointerenter={() => {
      if (!opt.disabled) activeIndex = i;
    }}
    onclick={renderOptionItem ? undefined : () => selectOption(opt)}
  >
    <!--
      对齐 Semi option.tsx render()：`if (typeof renderOptionItem === 'function') return
      renderOptionItem({...})`——custom 渲染是完全替换返回值，与默认分支（外层 div 自带
      onClick）互斥，Semi 从未让两者叠加。本库外层这个 div 此前无条件挂 onclick=
      selectOption，renderOptionItem 场景下自定义内容仍嵌在同一个 div 里，点击既触发
      demo 里透传的 onClick（内层 wrapper 自己绑的），又冒泡到这层再触发一次——多选态
      表现为「选中又立刻被取消」（连续调用两次 selectOption 等于 toggle 两次，净效果
      为空，真机复现「自定义候选项渲染」多选 demo 点击无反应）。renderOptionItem 存在时
      这层不再兜底绑定，选中职责完全交给 demo 自己接住的 onClick 入参。
    -->
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
    {:else if opt._content}
      <!--
        对齐 Semi Select.Option children 自定义渲染：单个选项自带的 _content（组合式
        <Select.Option> 声明的 children，见 Option.svelte）替代默认纯文本 label——tick
        占位是否渲染独立由 _showTick 控制（对齐 Semi Option 组件自身 showTick prop，与
        children 是否自定义无关；未显式传时不显示，同 Semi Option 组件自身无默认值）。
      -->
      {#if opt._showTick}
        <span class="cd-select-check" class:cd-select-check-active={isSelected(opt.value)} aria-hidden="true">
          <IconTick aria-hidden="true" />
        </span>
      {/if}
      {@render (opt._content as Snippet)()}
    {:else}
      <!--
        对齐 Semi option.tsx：showTick 恒为 true（单选/多选皆然），对勾占位容器
        始终渲染（默认 color: transparent 不可见，选中态才变实色），而非按 multiple
        切换容器存在与否——否则单选选项无占位、文字紧贴 padding-left(12px)，
        与分组标题 padding-left(12+16+8=36px，为对勾占位预留) 左边缘对不齐。
      -->
      <span class="cd-select-check" class:cd-select-check-active={isSelected(opt.value)} aria-hidden="true">
        <IconTick aria-hidden="true" />
      </span>
      <!--
        对齐 Semi option.tsx renderOptionContent：label 为字符串且 inputValue（当前搜索词）
        非空时，用 Highlight 包裹高亮命中片段（Semi 复用自己的 Highlight 组件，本库同理复用
        ../highlight/Highlight.svelte）；无搜索词时纯文本，避免空 searchWords 时仍多一层
        <mark> 判断的无谓开销。highlightClassName 对齐 Semi `${prefixCls}-keyword`——线上
        CSS 对其有专属覆盖（color 走主色、background 透明，非 Highlight 组件默认的黄底黑字，
        见下方 :global(.cd-highlight-tag.cd-select-keyword) 规则；本地 checkout 的
        select.scss 缺这条规则，属版本落后于线上，真机核对 semi.design 实测值为准）。
      -->
      <span class="cd-select-option-label">
        {#if query}
          <Highlight sourceString={getOptionLabel(opt)} searchWords={[query]} highlightClassName="cd-select-keyword" />
        {:else}
          {getOptionLabel(opt)}
        {/if}
      </span>
    {/if}
  </div>
{/snippet}

<!--
  单个多选 Tag（对齐 Semi renderTag：color=white、closable+onClose 删除该项）。
  可见 tag（展开态）与折叠态经 TagGroup custom 渲染的可见/剩余 tag 均复用此 snippet。

  对齐 Semi renderTag 的 isRenderInTag 分支：renderSelectedItem 提供时（isRenderInTag:false
  等效）整个 chip 由该 snippet 输出，不再套本组件的 <Tag>，需自行处理关闭等交互（入参 onClose
  已接回 removeTag，用法同 Semi demo 里自定义 <Tag avatarSrc closable onClose /> 的写法）；
  否则走 renderSelectedTag（isRenderInTag:true 等效，内容套本组件 Tag）或默认纯文本。
-->
{#snippet selectTag(tag: TagInfo)}
  {#if renderSelectedItem}
    {@render renderSelectedItem({
      option: tag.opt,
      index: tag.index,
      disabled,
      onClose: (e) => {
        (e as Event)?.stopPropagation?.();
        removeTag(tag.opt.value);
      },
    })}
  {:else}
    <Tag
      class="cd-select-tag"
      size="small"
      color="white"
      closable={!disabled}
      aria-label={loc().t('Select.removeItem', { label: getOptionLabel(tag.opt) })}
      onClose={(_c, e) => {
        (e as Event)?.stopPropagation?.();
        removeTag(tag.opt.value);
      }}
    >
      {#if renderSelectedTag}
        {@render renderSelectedTag({ option: tag.opt })}
      {:else}
        <span
          class="cd-select-tag-label"
          title={tag.truncated ? getOptionLabel(tag.opt) : undefined}
        >{tag.display}</span>
      {/if}
    </Tag>
  {/if}
{/snippet}

<!-- TagGroup mode=custom 的每项渲染入口：从 tagList 项取回 tagInfo，委托 selectTag。 -->
{#snippet customTagItem(item: Record<string, unknown>)}
  {@const tag = item.tagInfo as TagInfo | undefined}
  {#if tag}
    {@render selectTag(tag)}
  {/if}
{/snippet}

<style>
  /* Semi .semi-select 根节点无 width 声明：display:inline-flex 天然收缩到内容宽度
     （single 模式下即 selection 文本 + 箭头的实际宽度）。本库此前多写了 inline-size:100%，
     与 inline-flex 的收缩语义矛盾——效果是"撑满父容器"而非"自适应内容"，在 flex 父级
     （如 AIChatInput 配置区）里会挤占其它兄弟项的空间。 */
  .cd-select {
    position: relative;
    display: inline-flex;
    font-size: var(--cd-select-font-size);
  }
  .cd-select-trigger {
    display: flex;
    align-items: center;
    /* 对齐 Semi `.semi-select { box-sizing: border-box }`：高度含 1px 边框，
       不靠站点全局 reset（组件自持才不会在无 reset 的宿主里胖 2px）。 */
    box-sizing: border-box;
    inline-size: 100%;
    /*
     * 高度对齐 Semi `.semi-select { height: 32px; max-height: 300px; overflow-y: auto }`：
     * **固定 height 而非 min-height**——内容（Avatar / 多个 tag）比行高高时 Semi 是滚动，
     * 不是把触发器撑开。本库原用 min-block-size，实测 41 个实例里有 3 个被撑到 42/43/34
     * （Semi 同页 42 个实例只有 24/32/40 三种高度，多选带 tag 的也恒 32）。
     */
    block-size: var(--cd-select-height-default);
    min-block-size: var(--cd-select-height-default);
    max-block-size: var(--cd-select-max-height);
    overflow-y: auto;
    /*
     * 对齐 Semi：触发器**本身无水平内边距、无 gap**——左侧留白由 .cd-select-selection 的
     * margin-left（12px）承担，右侧由固定 32px 宽的箭头盒承担（图标 16px 在其中居中）。
     * 原先写 padding 0 12px + gap 8px，右侧被 12+8+16=36px 吃掉，80px 宽的格式选择器
     * 只剩 30px 放文本，"rgba" 被截成 "rg…"（Semi 同宽下文本区有 34px）。
     */
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
  /*
   * 对齐 Semi useCustomTrigger 分支：`selectionCls = cls(className)`——完全不带 prefixcls，
   * 真机核对 select.scss 第 13 行 `.semi-select {...}` 整块规则（box-sizing/border-radius/
   * border/height/background/display:inline-flex/cursor:pointer/position:relative/
   * transition/transform/max-height/overflow-y）全部限定在 `.semi-select` 类选择器下——
   * 不挂这个类，这些属性一个都不会生效，纯粹由消费方自己的 style/内容决定布局与外观。
   * 此前 triggerRender 场景仍套用完整的 .cd-select-trigger（含 background/border/
   * border-radius/固定 block-size），custom 内容背后多出一层灰底描边盒子；第二次修复时
   * 自己又加了 display:flex/cursor:pointer 等——这些同样是 Semi 没有的自造属性，一并删除。
   * .cd-select-trigger-custom 因此不声明任何视觉/布局属性，仅作为选择器标记本身存在
   * （模板里仍需要一个 class 名承载 role=combobox 语义，但不附带任何 CSS 规则）。
   */
  /*
   * 尺寸对齐 Semi select.scss：`&-small { height }` 是**固定 height 不是 min-height**，
   * `&-large { min-height }` 才是 min。真正让小尺寸从 26.5px 收回 24px 的是
   * content 的 line-height（见下方 .cd-select-selection）——docs 正文 24.5px 的继承行高
   * 撑开内容后，只有 min-block-size 拦不住。此处固定 height 是照抄 Semi 的写法。
   */
  .cd-select-small .cd-select-trigger {
    block-size: var(--cd-select-height-small);
    min-block-size: var(--cd-select-height-small);
  }
  /* 大尺寸对齐 Semi `&-large { min-height }`：是 min 不是固定值，故要抵消基础规则的固定 height。 */
  .cd-select-large .cd-select-trigger {
    block-size: auto;
    min-block-size: var(--cd-select-height-large);
  }
  /*
   * 多选对齐 Semi `&-multiple { height: auto }`：源码顺序在 &-small/&-large 之后，
   * 无条件覆盖三档尺寸的固定/最小高度（多选换行时触发器随内容撑高，不裁剪 tag）。
   */
  .cd-select-multiple .cd-select-trigger {
    block-size: auto;
    min-block-size: var(--cd-select-height-default);
  }
  .cd-select-multiple.cd-select-small .cd-select-trigger {
    min-block-size: var(--cd-select-height-small);
  }
  .cd-select-multiple.cd-select-large .cd-select-trigger {
    min-block-size: var(--cd-select-height-large);
  }
  /*
   * 对齐 Semi 填充式：悬浮加深底色（非展开/禁用/校验态）。必须排除 -warning/-error，
   * 否则这条规则（3 类选择器）特异性高于 warning/error 各自的 hover 规则（2 类），
   * 会覆盖掉警示色的 hover 加深，hover 时错误地退回默认灰底。
   */
  .cd-select:not(.cd-select-open):not(.cd-select-disabled):not(.cd-select-warning):not(.cd-select-error)
    .cd-select-trigger:hover {
    background: var(--cd-select-bg-hover);
  }
  /* 对齐 Semi `&:active { background: bg-active }`：按下态（非展开时）再加深一档底色，同排除警示态。 */
  .cd-select:not(.cd-select-open):not(.cd-select-disabled):not(.cd-select-warning):not(.cd-select-error)
    .cd-select-trigger:active {
    background: var(--cd-select-bg-active);
  }
  .cd-select-trigger:focus-visible {
    outline: none;
    background: var(--cd-select-bg);
    border-color: var(--cd-select-border-active);
    box-shadow: var(--cd-focus-ring);
  }
  .cd-select-open .cd-select-trigger {
    background: var(--cd-select-bg);
    border-color: var(--cd-select-border-active);
  }
  /* 对齐 Semi `&-open, &-focus { &:active { background: bg-active; border-color: border-active } }`：
     展开态下点击触发器（获焦态被按下）时背景再加深一档。 */
  .cd-select-open .cd-select-trigger:active {
    background: var(--cd-select-bg-active);
    border-color: var(--cd-select-border-active);
  }
  /* 校验态 warning（对齐 Semi &-warning：背景 + 描边 light 变体，聚焦/按下时加深） */
  .cd-select-warning .cd-select-trigger {
    background: var(--cd-color-select-warning-bg);
    border-color: var(--cd-color-select-warning-border);
  }
  .cd-select-warning:not(.cd-select-disabled) .cd-select-trigger:hover {
    background: var(--cd-color-select-warning-bg-hover);
  }
  .cd-select-warning:not(.cd-select-disabled) .cd-select-trigger:active {
    background: var(--cd-color-select-warning-bg-active);
    border-color: var(--cd-color-select-warning-border-active);
  }
  .cd-select-warning .cd-select-trigger:focus-visible,
  .cd-select-warning.cd-select-open .cd-select-trigger {
    border-color: var(--cd-color-select-warning-border-focus);
  }
  /* 校验态 error（对齐 Semi &-error：danger light 背景 + 描边，聚焦/按下时加深） */
  .cd-select-error .cd-select-trigger {
    background: var(--cd-color-select-danger-bg);
    border-color: var(--cd-color-select-danger-border);
  }
  .cd-select-error:not(.cd-select-disabled) .cd-select-trigger:hover {
    background: var(--cd-color-select-danger-bg-hover);
  }
  .cd-select-error:not(.cd-select-disabled) .cd-select-trigger:active {
    background: var(--cd-color-select-danger-bg-active);
    border-color: var(--cd-color-select-danger-border-active);
  }
  .cd-select-error .cd-select-trigger:focus-visible,
  .cd-select-error.cd-select-open .cd-select-trigger {
    border-color: var(--cd-color-select-danger-border-focus);
  }
  .cd-select-disabled .cd-select-trigger {
    background: var(--cd-color-select-input-disabled-bg);
    color: var(--cd-color-select-input-disabled-text);
    cursor: not-allowed;
  }
  .cd-select-disabled .cd-select-trigger:hover {
    background: var(--cd-color-select-input-disabled-bg-hover);
  }
  /* 对齐 Semi：禁用态聚焦不应有强调边框，描边透明。 */
  .cd-select-disabled .cd-select-trigger:focus-visible {
    border-color: var(--cd-color-select-input-disabled-border-focus);
    background: var(--cd-color-select-input-disabled-bg);
    box-shadow: none;
  }
  /*
   * 对齐 Semi `.arrow, .prefix, .suffix { color: disabled-text }` +
   * `.selection, .selection-placeholder { color: disabled-text }`：显式覆盖，
   * 不能只靠 .cd-select-trigger 的 color 继承——这些元素各自设了自己的 color
   * （.cd-select-value/.cd-select-placeholder 的回填文本色最容易漏，继承链断在此）。
   */
  .cd-select-disabled .cd-select-arrow,
  .cd-select-disabled .cd-select-prefix,
  .cd-select-disabled .cd-select-suffix,
  .cd-select-disabled .cd-select-value,
  .cd-select-disabled .cd-select-placeholder {
    color: var(--cd-color-select-input-disabled-text);
  }
  /* 对齐 Semi `.semi-tag { color: disabled-text; background-color: transparent }`：
     禁用态多选 tag 文字变灰、背景透明（Tag 组件本身不知晓 Select 的 disabled，靠父级覆盖）。 */
  .cd-select-disabled :global(.cd-select-tag) {
    color: var(--cd-color-select-input-disabled-text);
    background: transparent;
  }
  .cd-select-selection {
    display: flex;
    flex: 1 1 auto;
    /* 对齐 Semi `.semi-select-selection { flex-wrap: nowrap }`（单选/多选折叠态皆然）：
       原先无条件 wrap，触发器窄时占位文本会折行，再被固定高度裁掉半行
       （实测「请选择业务 / 线」）。多选展开态（tagsCollapsed=false，见 .cd-select-selection-wrap）
       对齐 Semi `.semi-select-content-wrapper` 默认 wrap，覆盖此 nowrap。 */
    flex-wrap: nowrap;
    align-items: center;
    gap: var(--cd-spacing-extra-tight);
    min-inline-size: 0;
    /*
     * 行高对齐 Semi：`.semi-select-selection` 用 `@include font-size-regular`，
     * 该 mixin 的 line-height 恒为 20px（semi-theme-default/scss/_font.scss），
     * 对应本库 --cd-line-height-regular。必须写在 selection（内层）而非 trigger——
     * 挂到 trigger 会让行高等于容器高，把 Semi 留的 1px 边框内缩吃掉（实测 gap 1→0）。
     */
    line-height: var(--cd-line-height-regular);
    /* 对齐 Semi `.semi-select-selection { height: 100%; margin-left; overflow: hidden }`：
       触发器无 padding，左侧留白由此承担；撑满高度 + overflow hidden 保证内容
       （长文本 / Avatar / 多 tag）被裁而非撑破触发器（Semi 实测 selection 恒 = root − 2 边框）。 */
    block-size: 100%;
    margin-inline-start: var(--cd-spacing-select-selection-marginleft);
    overflow: hidden;
    /* 对齐 Semi `.semi-select-content-wrapper { position: relative }`（恒定，非按需）：
       本库把 Semi 的外层 selection + 内层 content-wrapper 拍平成了一层 .cd-select-selection，
       故由它兼任「多选空值态搜索框绝对定位」的包含块（见下方 .cd-select-selection-empty
       .cd-select-search-multiple 规则）。 */
    position: relative;
  }
  /* 对齐 Semi `.semi-select-multiple .semi-select-selection { margin-left: 4px }`：多选左距更小 */
  .cd-select-multiple .cd-select-selection {
    margin-inline-start: var(--cd-spacing-select-multiple-selection-marginleft);
  }
  /* 对齐 Semi `.semi-select-content-wrapper-empty { margin-left: $spacing-tight }`（8px）：
     多选无选中值时，Semi 在外层 selection 的 4px 基础上、内层 content-wrapper 再加 8px，
     合计 12px——与单选态的 12px 视觉对齐。本库无独立 content-wrapper 层，故在 -empty 态
     直接把 .cd-select-selection 自身的 margin-inline-start 覆盖为 12px（4+8 的合计值，
     而非在 4px 基础上"再加 8px"——CSS margin 同属性后写覆盖不叠加）。
     此前只有基础 4px，实测 placeholder 比单选态更贴边框（"placeholder 太靠左"）。 */
  .cd-select-multiple .cd-select-selection-empty {
    margin-inline-start: calc(
      var(--cd-spacing-select-multiple-selection-marginleft) +
        var(--cd-spacing-select-multiple-content-wrapper-empty-marginleft)
    );
  }
  /* 对齐 Semi `.semi-select-with-prefix .semi-select-selection { margin-left: 0 }` */
  .cd-select-with-prefix .cd-select-selection {
    margin-inline-start: 0;
  }
  /* 对齐 Semi `.semi-select-selection-text { width:100%; overflow:hidden; text-overflow:ellipsis }`：
     占位文本单行省略，绝不换行——触发器窄时换行会被固定高度裁掉半行（实测「请选择业务/线」）。 */
  .cd-select-placeholder {
    inline-size: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    color: var(--cd-color-select-input-placeholder-text);
  }
  /* 内嵌标签：常驻触发器左侧的标签文本 */
  /* 对齐 Semi `&-inset-label`：同 -prefix-text 变体的 margin(12px)/字重(bold)/色，不靠基类继承。 */
  .cd-select-inset-label {
    display: inline-flex;
    align-items: center;
    flex: 0 0 auto;
    margin-inline: var(--cd-spacing-base-tight);
    color: var(--cd-color-select-prefix-suffix-text-default);
    font-weight: var(--cd-font-weight-bold);
    white-space: nowrap;
    user-select: none;
  }
  /*
   * searchPosition='dropdown'：浮层顶部搜索框容器（对齐 Semi `.semi-select-dropdown-search-wrapper`：
   * padding 8px/12px + 底部描边分隔选项列表；描边色对齐 Semi $color-select_dropdown_input-border
   * = $color-select-border-default = transparent，默认不可见，主题可覆盖显现）。
   * 内部搜索框复用 Input 组件（对齐 Semi renderDropdownInput：完整 Input + IconSearch 前缀 +
   * 自身边框/圆角/背景，本库不再手绘图标 span / 边框，全部交给 Input 组件承担）。
   */
  .cd-select-dropdown-search-wrapper {
    padding: var(--cd-spacing-tight) var(--cd-spacing-base-tight);
    border-block-end: 1px solid var(--cd-select-border);
  }
  .cd-select-value {
    overflow: hidden;
    color: var(--cd-color-select-main-text-default);
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  /*
   * 多选：对齐 Semi renderTriggerInput 的精确字符宽度（inline style 算出的
   * multiSearchWidth 生效，挂在 Input 组件 wrapper 上），borderless + 透明背景
   * 让输入框在触发器内呈内联态（无独立边框/底色，视觉上与 tag 组连成一片）。
   * flex 不参与伸缩/收缩，避免 wrap 容器里被当成 "至少 32px" 的块而挤出当前行
   * （对齐 Semi 三个 tag + 空搜索框仍同一行）。单选态是绝对定位铺满
   * （见下方 .cd-select-search-single 规则），不受此基类缺省 flex 影响。
   */
  /*
   * 对齐 Semi `.semi-multiple.semi-filterable .semi-input-wrapper { border:none;
   * background-color:transparent }` + `.semi-input-wrapper-focus { border:none }`：
   * 无条件覆盖含聚焦态。
   *
   * 整条选择器必须包进 :global()，不能只包最内层的 .cd-input：这个 class 是通过 Input
   * 组件的 `class` prop 传入、渲染在 **Input.svelte 内部模板**的 wrapper div 上，并非
   * Select.svelte 模板里直接出现的标签。Svelte 编译器按源码文本静态判断要不要给选择器
   * 加 scope hash，看不到这层跨组件传递，会把 `.cd-select-search-multiple` 也当成本组件
   * 元素编译成 `.cd-select-search-multiple.svelte-1e7kwym`（Select 自己的 scope 类）——
   * 但该 div 实际持有的 scope 类是 `svelte-f7muf0`（Input 组件的），两者对不上，规则整条
   * 静默失效（真机 document.styleSheets 遍历验证：该规则完全不出现在 matches() 命中列表
   * 里，此前只是巧合命中了 Input 自身 `:not(:focus-within)` 的 borderless 规则才看似正常，
   * 真正 focus 后蓝色实边框重新露出）。:global() 内的 :not(#neverExistElement) 权重技巧
   * （Semi datePicker.scss 同款）确保就算日后 Input 内部规则改动也压得过。
   */
  :global(.cd-select-search-multiple:not(#neverExistElement)) {
    flex: 0 0 auto;
    padding: 0;
    background: transparent;
    border: none;
  }
  :global(.cd-select-search-multiple:focus-within:not(#neverExistElement)) {
    border: none;
    background: transparent;
  }
  :global(.cd-select-search-multiple .cd-input) {
    padding-inline: 0;
  }
  /*
   * 多选 + 无选中值（对齐 Semi `.semi-select-multiple.semi-select-filterable
   * .semi-select-content-wrapper-empty .semi-input-wrapper { position:absolute; top:0;
   * left:0; height:100% }`，源码注释明确 `width` 留白不设——由 JS 算好的 inline style
   * （multiSearchWidth，2px/无输入 或 len*16px/有输入）接管，故此处不写 inline-size）：
   * 无选中值时占位 span 与搜索 input **叠在同一起点**，而非 flex 并排跟在占位文字后面——
   * 后者会把 2px 宽的搜索框推到占位文字末尾（实测出现在占位文字右侧 260px 处），
   * 使聚焦态光标视觉上与 placeholder 完全脱节（"光标跑右边了"）。仅无选中值时叠加，
   * 有 tag 时搜索框仍在 tag 后正常 flex 续行（Semi `:not(-empty)` 分支不设 absolute）。
   */
  :global(.cd-select-selection-empty .cd-select-search-multiple:not(#neverExistElement)) {
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: 0;
    block-size: 100%;
  }
  /*
   * 单选 + 触发器内搜索（对齐 Semi `.semi-select-single.semi-select-filterable`
   * `.semi-input-wrapper { position:absolute; inset:0; border:none; background:transparent }`
   * + `.semi-input-wrapper-focus { border:none }`——无条件覆盖，含聚焦态）：
   * content 作定位上下文，Input 组件的 wrapper 绝对定位铺满，与原回填文本**叠在一起**——
   * 无输入时原文本以 0.4 透明度垫在下方（-inactive），有输入时隐藏（-hide）。
   *
   * 同上，整条选择器必须 :global()（跨组件传递的 class，见多选态同款注释）。
   * :not(#neverExistElement) 是 Semi 原样的权重技巧，纯粹用永不存在的 id 选择器
   * 抬 (+1,0,0) 特异性压过 Input 自身的聚焦边框/背景规则。
   */
  :global(.cd-select-search-single:not(#neverExistElement)) {
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: 0;
    inline-size: 100%;
    block-size: 100%;
    padding: 0;
    background: transparent;
    border: none;
  }
  :global(.cd-select-search-single:focus-within:not(#neverExistElement)) {
    border: none;
    background: transparent;
  }
  :global(.cd-select-search-single .cd-input) {
    padding-inline: 0;
  }
  /* 对齐 Semi `-selection-text-inactive`（opacity 0.4）与 `-selection-text-hide`（隐藏）。 */
  .cd-select-value-inactive {
    opacity: var(--cd-opacity-select-selection-text-inactive);
  }
  .cd-select-value-hide {
    display: none;
  }
  /*
   * 对齐 Semi `.semi-select-option-keyword { color: var(--semi-color-primary);
   * background-color: inherit; font-weight: 600 }`：选项高亮命中片段渲染在 Highlight
   * 组件内部（<mark class="cd-highlight-tag cd-select-keyword">），跨组件传递的 class，
   * 同上必须 :global()。用 .cd-highlight-tag.cd-select-keyword 复合选择器（(0,2,0)）
   * 而非单独 .cd-select-keyword（(0,1,0)），确保特异性稳定压过 Highlight 自身
   * .cd-highlight-tag 的默认黄底黑字规则，不依赖两个组件样式表的加载顺序。
   */
  :global(.cd-highlight-tag.cd-select-keyword) {
    color: var(--cd-color-select-option-keyword);
    background-color: inherit;
    font-weight: var(--cd-font-weight-bold);
  }
  /* 折叠态 TagGroup 实例：在触发器 flex 内联排布（与 search input 并排），随内容换行 */
  /* 对应 Semi `.semi-select-content-wrapper`：撑满高度 + 多选态换行 + 溢出裁切
     （Semi 实测 content-wrapper 高度恒 = selection = root − 2 边框）。 */
  .cd-select :global(.cd-select-tag-group) {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    min-inline-size: 0;
    block-size: 100%;
    overflow: hidden;
  }
  /*
   * 展开态（tagsCollapsed=false）：全部 tag 直接渲染进 selection，无 TagGroup 包裹层承担 wrap。
   * 对齐 Semi `.semi-select-content-wrapper` 默认 flex-wrap:wrap（仅折叠态 -one-line 才 nowrap，
   * 见 renderMultipleSelection contentWrapperCls）——覆盖 .cd-select-selection 的默认 nowrap，
   * 否则展开的多个 tag 被挤压裁成一行（实测「抖..」「轻..」等近乎不可读）。block-size 也需放开
   * 为 auto，让触发器随多行 tag 撑高（对齐本轮 multiple height:auto）。
   */
  .cd-select-selection-wrap {
    flex-wrap: wrap;
    block-size: auto;
    min-block-size: 100%;
  }
  /* ellipsisTrigger：多选 tag 溢出时，对可见 tag 文本做单行省略（完整文本经 title 查看）；
     仅折叠态生效（class 上已由 tagsCollapsed 门控，见模板），展开态不应再单行省略。 */
  .cd-select-ellipsis-trigger .cd-select-selection {
    flex-wrap: nowrap;
    overflow: hidden;
  }
  .cd-select-ellipsis-trigger .cd-select-tag-label {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  /* 对齐 Semi：只有「创建」提示前缀染色（$color-select_create_tips-text = text-2）+ 右间距 4px，
     整行不额外染色（Semi 无 `.semi-select-option-create` 规则，原先本库把整行染成 primary 是自造差异）。 */
  .cd-select-create-tips {
    margin-inline-end: var(--cd-spacing-select-create-tips-marginright);
    color: var(--cd-color-select-create-tips-text);
  }
  .cd-select-clear,
  /* 对齐 Semi `.semi-select-arrow { width: $width-select_arrow }`：固定 32px 盒、撑满高度，
     图标 16px 在其中居中，右侧留白即由此产生（触发器不再出 padding）。 */
  .cd-select-arrow {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    inline-size: var(--cd-width-select-arrow);
    block-size: 100%;
    color: var(--cd-color-select-icon-default);
  }
  .cd-select-clear {
    padding: 0;
    border: none;
    background: transparent;
    color: var(--cd-color-select-clearbtn-text-default);
    cursor: pointer;
  }
  .cd-select-clear:hover {
    color: var(--cd-color-select-clearbtn-text-hover);
  }
  /* 对齐 Semi `&-arrow-empty { width: 12px }`：不显示箭头时右侧留白宽度（非 32px 箭头盒）。 */
  .cd-select-arrow-empty {
    display: inline-flex;
    flex: 0 0 auto;
    inline-size: 12px;
  }
  .cd-select-arrow {
    transform: var(--cd-transform-rotate-select-arrow);
    transition: transform var(--cd-transition-duration-select-border)
      var(--cd-transition-function-select-border) var(--cd-transition-delay-select-border);
  }
  .cd-select-open .cd-select-arrow {
    transform: rotate(180deg);
  }
  /* 下拉 portal 到 body，由 JS 写 position:fixed + transform + matchWidth。
     外层容器只负责底色/圆角/阴影/层级；滚动限高在内层 .cd-select-list（使 outer slot 固定不滚） */
  .cd-select-dropdown {
    z-index: var(--cd-select-dropdown-z);
    display: flex;
    flex-direction: column;
    background: var(--cd-select-dropdown-bg);
    border-radius: var(--cd-select-dropdown-radius);
    box-shadow: var(--cd-select-dropdown-shadow);
  }
  /* destroyOnClose=false 时浮层保持挂载，靠 [hidden] 隐藏；
     display:flex 会压过 [hidden] 的 UA display:none，故显式补一条属性选择器（对齐关闭态真正不可见）。 */
  .cd-select-dropdown[hidden] {
    display: none;
  }
  /*
   * motion：进出场 zoomIn/zoomOut（对齐 Semi Select 内部 Popover 实例的 zoomIn/zoomOut——
   * 两者 SCSS 变量命名空间不同但取值一致，见 tokens/select.ts 顶部注释）。用独立 scale 属性
   * （非 transform）做缩放：use:floating 用 transform: translate() 定位，动画走 transform
   * 会覆盖定位把浮层拉到 (0,0)；scale 属性与 transform 正交，二者叠加互不覆盖（同 Tooltip 解法，
   * 与 TreeSelect 同构）。退场：关闭时先播放 hide 动画（panelLeaving），onanimationend 触发
   * finalizeClose 才真正 [hidden]（destroyOnClose=false 场景；true 场景关闭即整个卸载，
   * 不适用退场动画——用户已显式要求不保留 DOM，立即消失符合预期）。
   */
  .cd-select-dropdown-motion-show {
    animation: cd-select-dropdown-zoom-in var(--cd-animation-duration-select-dropdown-in)
      var(--cd-animation-function-select-dropdown-in);
  }
  .cd-select-dropdown-motion-hide {
    animation: cd-select-dropdown-zoom-out var(--cd-animation-duration-select-dropdown-out)
      var(--cd-animation-function-select-dropdown-out);
  }
  @keyframes cd-select-dropdown-zoom-in {
    from {
      opacity: var(--cd-select-dropdown-motion-zoom-opacity-from);
      scale: var(--cd-select-dropdown-motion-zoom-scale-from);
    }
    50% {
      opacity: var(--cd-select-dropdown-motion-zoom-opacity-to);
    }
    to {
      opacity: var(--cd-select-dropdown-motion-zoom-opacity-to);
      scale: 1;
    }
  }
  @keyframes cd-select-dropdown-zoom-out {
    from {
      opacity: var(--cd-select-dropdown-motion-zoom-opacity-to);
      scale: 1;
    }
    60% {
      opacity: var(--cd-select-dropdown-motion-zoom-opacity-from);
      scale: var(--cd-select-dropdown-motion-zoom-scale-from);
    }
    to {
      opacity: var(--cd-select-dropdown-motion-zoom-opacity-from);
      scale: var(--cd-select-dropdown-motion-zoom-scale-from);
    }
  }
  /* 减少动效：时长归零而非 animation:none——后者不触发 animationend，
     会让 finalizeClose 永远不被调用，面板卡在展开态无法真正隐藏（对齐 TreeSelect/Toast）。 */
  @media (prefers-reduced-motion: reduce) {
    .cd-select-dropdown-motion-show,
    .cd-select-dropdown-motion-hide {
      animation-duration: 0.01ms;
    }
  }
  /* 内层滚动列表：optionList + inner header/footer + 浮层搜索框，超出 maxHeight 时纵向滚动 */
  .cd-select-list {
    max-block-size: 16rem;
    overflow-y: auto;
    padding-block: var(--cd-spacing-extra-tight);
  }
  /*
   * outer slot：与滚动列表平级、位于滚动区之外，始终固定展现。对齐 Semi：
   * select.scss 里 `-option-list-outer-top-slot`/`-outer-bottom-slot` 无任何样式规则，
   * 纯包裹层不叠加 padding——内容外观完全由调用方自己的 outerTopSlot/outerBottomSlot
   * 传入内容决定（原实现误加了内边距，导致自定义节点背景色缩进、铺不满宽度）。
   */
  .cd-select-outer-top,
  .cd-select-outer-bottom {
    flex: 0 0 auto;
  }
  /* 虚拟化：spacer 撑出未渲染选项的总高，可见 option 绝对定位于其内 */
  .cd-select-spacer {
    position: relative;
    inline-size: 100%;
  }
  /* 虚拟化行带固定 block-size + 内边距，需 border-box 保证行高与 virtualize.itemSize 一致 */
  .cd-select-spacer .cd-select-option {
    box-sizing: border-box;
    overflow: hidden;
  }
  /*
   * 对齐 Semi `.semi-select-group`：padding-top(base-tight=12px 由 margin-top(4px)+padding-top(8px)
   * 复合)/padding-bottom(4px)/padding-left(base-tight+tick宽+tick间距)/padding-right(base=16px)，
   * font-size-small mixin **不含 font-weight**（原自造 500 已删，随浏览器默认继承）。
   * 分隔线：非首个渲染的组才有顶部描边（`&:not(:nth-of-type(1))`，CSS 结构选择器天然处理
   * 过滤后首组变化，无需模板判断）。
   */
  .cd-select-group {
    padding-block-start: var(--cd-spacing-base-tight);
    padding-block-end: var(--cd-spacing-extra-tight);
    /* 12px(base-tight) + 16px(tick 图标宽，同 .cd-select-check) + 8px(tick 右间距) */
    padding-inline-start: calc(var(--cd-spacing-base-tight) + 1rem + var(--cd-spacing-tight));
    padding-inline-end: var(--cd-spacing-base);
    margin-block-start: var(--cd-spacing-extra-tight);
    color: var(--cd-color-select-group-text);
    font-size: var(--cd-font-size-small);
    line-height: var(--cd-line-height-small);
    cursor: default;
    user-select: none;
  }
  .cd-select-group:not(:first-child) {
    border-block-start: 1px solid var(--cd-color-select-option-border-default);
  }
  .cd-select-option {
    display: flex;
    align-items: center;
    gap: var(--cd-spacing-tight);
    padding: var(--cd-select-option-padding);
    cursor: pointer;
    transition: background-color var(--cd-transition-duration-select-option-bg)
      var(--cd-transition-function-select-option-bg) var(--cd-transition-delay-select-option-bg);
  }
  /* 对齐 Semi option.scss `&-selected { font-weight: bold; background: transparent }`：
     选中态本身加粗 + 透明背景，不靠色块区分。 */
  .cd-select-option-selected {
    color: var(--cd-select-option-color-selected);
    background: var(--cd-select-option-bg-selected);
    font-weight: var(--cd-font-weight-bold);
  }
  /* 对齐 Semi option.scss 源码顺序：`&-selected`（74 行）写在 `&-focused`（82 行）
     之前——同一项既选中又被 hover/键盘高亮时，后写的 -focused 规则覆盖先写的
     -selected，背景色能正常显示（"选中项 hover 也要有背景色"，真机核实 Semi 官方
     选中项 hover 确实变色，不是只加粗不变色）。本库 -selected 曾写在 -active 之后，
     顺序反了，选中项 hover 永远没有背景色变化。此处把 -active 移到 -selected 之后
     以复现同样的层叠结果，而非简单靠特异性打平覆盖。 */
  .cd-select-option-active {
    background: var(--cd-select-option-bg-hover);
  }
  /* 对齐 Semi option.scss `&:active { background: bg-active }`：鼠标按下瞬时再加深一档。 */
  .cd-select-option:active {
    background: var(--cd-select-option-bg-active);
  }
  .cd-select-option[aria-disabled='true'] {
    color: var(--cd-color-select-option-disabled-text);
    cursor: not-allowed;
  }
  /* 对齐 Semi `&-icon { color: option-icon-default(transparent) }`：占位恒渲染，
     颜色默认透明不可见，选中态（-active）才切到实色，对勾 DOM 不随选中态增删。 */
  .cd-select-check {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: 1rem;
    flex: 0 0 auto;
    color: transparent;
  }
  .cd-select-check-active {
    color: var(--cd-select-option-check-color);
  }
  .cd-select-empty {
    padding: var(--cd-select-option-padding);
    color: var(--cd-color-text-3);
    text-align: center;
  }
  /* 对齐 Semi `.semi-select-loading-wrapper`：padding 8px/16px（非 option 的 8px/12px）+
     固定 20px 高（content-box，撑开而不挤压 padding）+ cursor not-allowed。 */
  .cd-select-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--cd-spacing-tight) var(--cd-spacing-base);
    block-size: 20px;
    box-sizing: content-box;
    cursor: not-allowed;
    color: var(--cd-color-text-3);
  }
  .cd-select-spinner {
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
  .cd-select-borderless .cd-select-trigger {
    border-color: transparent;
    background: transparent;
  }
  .cd-select-borderless .cd-select-trigger:focus-visible {
    border-color: transparent;
    box-shadow: var(--cd-focus-ring);
  }
  /*
   * 前缀 / 后缀插槽（对齐 Semi `&-prefix, &-suffix { all-center }`：基类只做居中，
   * 不出外边距；外边距/字重按 -text(12px+bold)/-icon(8px) 两套变体，触发器无 padding
   * 后左右留白全靠这两个变体自持——第三态（既非 text 也非 icon）外边距为 0）。
   */
  .cd-select-prefix,
  .cd-select-suffix {
    display: inline-flex;
    align-items: center;
    flex: 0 0 auto;
  }
  .cd-select-prefix-text,
  .cd-select-suffix-text {
    margin-inline: var(--cd-spacing-base-tight);
    color: var(--cd-color-select-prefix-suffix-text-default);
    font-weight: var(--cd-font-weight-bold);
  }
  .cd-select-prefix-icon,
  .cd-select-suffix-icon {
    margin-inline: var(--cd-spacing-tight);
    color: var(--cd-color-select-icon-default);
  }
  /*
   * 浮层顶/底固定区（inner slot）：对齐 Semi——select.scss 里
   * `-option-list-inner-top-slot`/`-inner-bottom-slot` 无任何样式规则，纯包裹层
   * 不叠加 padding/边框（原实现自造了内边距 + 分隔线，Semi 官方 demo 需要边框时
   * 是调用方自己在传入内容的内联样式里写 border-top，非组件内置）。
   */
  @media (prefers-reduced-motion: reduce) {
    .cd-select-spinner {
      animation: none;
    }
    .cd-select-trigger,
    .cd-select-arrow {
      transition: none;
    }
  }
</style>
