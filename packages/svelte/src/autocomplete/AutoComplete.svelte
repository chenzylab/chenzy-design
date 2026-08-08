<!--
  AutoComplete — 严格对齐 Semi Design（semi-ui/autoComplete）。
  输入联想 + 键盘选择。Token-driven, a11y-correct (combobox + listbox)。

  对齐 Semi 要点：
  - 触发器整个复用本库 <Input>（镜像 Semi renderInput：<div outerProps><Input {...innerProps} value/></div>）。
    Semi 无自绘 __control/__prefix/__input/__clear/__selected 套件，全部由 <Input> 承担
    （Input 自带 wrapper/prefix/insetLabel/showClear/suffix + autoFocus）。
    combobox role 与 aria-*（expanded/controls/activedescendant/autocomplete）经 Input 的 rest
    透传落到内部原生 <input class="cd-input">（本库 a11y 契约：combobox 在原生 input 上）。
  - 组件本身不做本地过滤：data 由用户按 query 准备（远程或本地皆同）。是否远程由 onSearch 存在决定。
  - 下拉列表根 class = cd-autocomplete-option-list（对齐 Semi semi-autocomplete-option-list）。
  - 选项包 cd-autocomplete-option-text 层，字符串候选经 <Highlight> 高亮命中的输入词
    （高亮 tag = cd-autocomplete-option-keyword，对齐 Semi option.tsx renderOptionContent）。
  - loading 复用本库 <Spin>，外层 cd-autocomplete-loading-wrapper（对齐 Semi renderLoading）。
  - defaultActiveFirstOption 默认 false、maxHeight 默认 300、zIndex 默认走 token（对齐 Semi defaultProps）。
  - renderSelectedItem 决定 input 实际显示文本 + value/onChange 实际值（对齐 Semi handleSelect/
    handleValueChange），不是渲染在 suffix 位置的旁路装饰；受控 value 变化时也要经它反查/转换。

  暂缓（本轮保留自绘）：
  - 下拉浮层用 use:floating（与本库 Select 同架构）承载，未包 <Popover>：Popover 的 .cd-popover 卡片
    结构/内边距面向气泡卡而非选项列表，Select 亦直接用 use:floating；保持二者一致的 -option-list 结构。
  - position 复用 tooltip/placement.ts 的 Semi 12 方位映射（Semi AutoComplete position 类型即 Tooltip
    Position，文档明确「可选值参考 Tooltip position」），不含 …Over 覆盖态（AutoComplete 无 insetInput
    覆盖场景，Semi 本身也未在此使用）。
  - 单个候选项渲染拆分至 Option.svelte（对齐 Semi index.tsx + option.tsx 两文件结构）。

  明确不实现：
  - stopPropagation（Semi Popover 透传，默认 true，阻止点击浮层内容时事件冒泡到 document）：
    Svelte 5 的 click 事件走应用根层级的委托机制，声明式 onclick 里 e.stopPropagation() 只能
    阻止 Svelte 内部模拟的回调链向外层 Svelte 组件传播，无法阻止真实 DOM 事件冒泡到 document
    （真实冒泡在委托监听器收到事件那一刻就已完成）；改用原生 addEventListener 在浮层节点上
    调用 stopPropagation 则会连带阻断 Svelte 委托本身，导致候选项点击选中完全失效（标准 DOM
    事件模型不区分监听器注册方式，会阻断同一传播路径上所有后续节点）。两个目标互斥，无法
    用简单手段同时满足，故不提供该 prop（本库浮层关闭走 useDismiss，已将浮层加入白名单，不
    受此限制影响；仅用户自己监听 document click 的边缘场景会有差异）。
  - mouseEnterDelay/mouseLeaveDelay（Semi Popover 透传，均不在官方 API 文档表中）：验证 Semi
    Tooltip foundation._generateEvent 源码，trigger="custom"（AutoComplete 固定用此模式）下
    完全不绑定 mouseenter/mouseleave，delayShow/delayHide 永不触发，是 Semi 自身的死代码。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { useId, useDismiss, registerOverlayRoot, resolveDefault } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';
  import { floating } from '../_floating/use-floating.js';
  import Input from '../input/Input.svelte';
  import Spin from '../spin/Spin.svelte';
  import Option from './Option.svelte';
  import { getInputGroupContext } from '../input/context.js';
  import { positionToPlacement, type Position } from '../tooltip/placement.js';

  type ItemValue = string | number;
  type Item = ItemValue | ({ value: ItemValue; label?: string; disabled?: boolean } & Record<string, unknown>);
  // 归一化后保留原对象的额外字段（对齐 Semi：renderItem 拿到完整候选对象），
  // value/label/disabled 为组件内部约定字段。
  type NormalizedItem = { value: ItemValue; label: string; disabled: boolean } & Record<string, unknown>;
  type Size = 'small' | 'large' | 'default';
  type ValidateStatus = 'default' | 'warning' | 'error';

  interface Props {
    /** 受控输入值（string | number）。 */
    value?: ItemValue;
    /** 非受控初始值。 */
    defaultValue?: ItemValue;
    /** 候选数据（对齐 Semi data，由用户按 query 准备，组件不做本地过滤）。 */
    data?: Item[];
    /** 非受控初始展开。 */
    defaultOpen?: boolean;
    placeholder?: string;
    /** combobox 输入框可访问名；缺省回退到 placeholder 或 locale 默认。 */
    'aria-label'?: string;
    /** 关联外部 label 的 id（优先于 ariaLabel）。 */
    ariaLabelledby?: string;
    /** 输入框内嵌前缀标签。 */
    insetLabel?: string | Snippet;
    /** 内嵌标签 id（关联到 combobox 可访问名，对齐 Semi insetLabelId）。 */
    insetLabelId?: string;
    size?: Size;
    /** 校验状态（对齐 Semi validateStatus）。 */
    validateStatus?: ValidateStatus;
    disabled?: boolean;
    /** 打开浮层时默认高亮首个可用选项（对齐 Semi 默认 false）。 */
    defaultActiveFirstOption?: boolean;
    /** 远程搜索：输入回调（由外部更新 data）。提供即视为远程模式。 */
    onSearch?: (query: string) => void;
    /** 远程加载中（显示 Spin）。 */
    loading?: boolean;
    /** 值变化回调（对齐 Semi (value: string|number)）。 */
    onChange?: (value: ItemValue) => void;
    /** 选中候选项回调；onSelectWithObject=true 时入参为完整对象，否则为 value。 */
    onSelect?: (value: ItemValue | NormalizedItem) => void;
    /** 为 true 时 onSelect 回调入参从 value 变为完整候选对象 { value, label, disabled }（对齐 Semi）。 */
    onSelectWithObject?: boolean;
    /** 浮层显隐切换回调（对齐 Semi onDropdownVisibleChange）。 */
    onDropdownVisibleChange?: (visible: boolean) => void;
    /** 浮层宽度与触发器同宽（默认 true）。 */
    dropdownMatchSelectWidth?: boolean;
    /** 浮层挂载容器。 */
    getPopupContainer?: () => HTMLElement;
    /** 浮层 className。 */
    dropdownClassName?: string;
    /** 浮层样式。 */
    dropdownStyle?: string | Record<string, string>;
    /**
     * 完全自定义触发器（对齐 Semi Trigger：renderInput 把内部 Input 承担的状态/回调整体
     * 透传给 triggerRender，而非仅 value/placeholder/disabled 三项，否则用户无法在自定义
     * 触发器里驱动搜索/清除等内部状态）。
     */
    triggerRender?: Snippet<
      [
        {
          /** 输入框当前显示文本（对齐 Semi inputValue）。 */
          inputValue: string;
          placeholder: string;
          disabled: boolean;
          size: Size;
          showClear: boolean;
          validateStatus: ValidateStatus;
          autoFocus: boolean;
          /** 驱动搜索/更新值（对齐 Semi Trigger onChange，即内部 onSearch）。 */
          onChange: (value: string) => void;
          onClear: (e?: MouseEvent) => void;
          onFocus: (e: FocusEvent) => void;
          onBlur: (e: FocusEvent) => void;
          /** 透传给 AutoComplete 的完整原始 props（对齐 Semi componentProps）。 */
          componentProps: { [K in keyof Props]?: Props[K] | undefined };
        },
      ]
    >;
    /** 自定义候选项渲染。 */
    renderItem?: Snippet<[{ item: NormalizedItem; isSelected: boolean }]>;
    /**
     * 决定选中候选项/受控 value 变化后输入框实际显示的文本（对齐 Semi renderSelectedItem）。
     * 必须返回 string——其返回值就是 input 的显示文本，也是 value/onChange 实际传递的值，
     * 不是渲染在 suffix 位置的附加内容（不同于 Select 的同名 prop，那个可返回任意 ReactNode）。
     */
    renderSelectedItem?: (item: NormalizedItem) => string;
    /** 无候选时展示内容。 */
    emptyContent?: Snippet | string;
    /** 输入框前缀。 */
    prefix?: Snippet | string;
    /** 输入框后缀。 */
    suffix?: Snippet | string;
    /** 显示清除按钮（对齐 Semi showClear）。 */
    showClear?: boolean;
    /** 自定义清除图标。 */
    clearIcon?: Snippet;
    onBlur?: (e: FocusEvent) => void;
    onFocus?: (e: FocusEvent) => void;
    onClear?: () => void;
    /** 挂载自动聚焦。 */
    autoFocus?: boolean;
    /** 浮层位置（对齐 Semi Tooltip 12 方位 position）。 */
    position?: Position;
    /** 浮层溢出视口时自动翻转到反向 placement（默认 true，对齐 Semi autoAdjustOverflow）。 */
    autoAdjustOverflow?: boolean;
    /** 透传键盘原始事件（在内部键盘逻辑之前调用）。 */
    onKeyDown?: (e: KeyboardEvent) => void;
    /** 根节点自定义 class。 */
    class?: string;
    /** 根节点自定义 style。 */
    style?: string;
    /** 浮层最大高度（number→px，string 原样），默认 300（对齐 Semi）。 */
    maxHeight?: number | string;
    /** 浮层 z-index，覆盖默认 token。 */
    zIndex?: number;
  }

  let {
    value,
    defaultValue = '',
    data: dataProp,
    defaultOpen = false,
    placeholder = '',
    'aria-label': ariaLabel,
    ariaLabelledby,
    insetLabel,
    insetLabelId,
    size: sizeProp,
    validateStatus: validateStatusProp,
    disabled: disabledProp,
    defaultActiveFirstOption: defaultActiveFirstOptionProp,
    onSearch,
    loading: loadingProp,
    onChange,
    onSelect,
    onSelectWithObject: onSelectWithObjectProp,
    onDropdownVisibleChange,
    dropdownMatchSelectWidth: dropdownMatchSelectWidthProp,
    getPopupContainer,
    dropdownClassName,
    dropdownStyle,
    triggerRender,
    renderItem,
    renderSelectedItem,
    emptyContent,
    prefix,
    suffix,
    showClear: showClearProp,
    clearIcon,
    onBlur,
    onFocus,
    onClear,
    autoFocus: autoFocusProp,
    position: positionProp,
    autoAdjustOverflow = true,
    onKeyDown,
    class: className = '',
    style = '',
    maxHeight: maxHeightProp,
    zIndex,
  }: Props = $props();
  // cdGlobal 全局默认 props（对齐 Semi semiGlobal.config.overrideDefaultProps）：
  // 优先级 = 显式传值 > cdGlobal['AutoComplete'] > 组件内置默认值。
  const position = $derived(resolveDefault(positionProp, 'AutoComplete', 'position', 'bottomLeft'));
  const data = $derived(resolveDefault(dataProp, 'AutoComplete', 'data', []));
  const showClear = $derived(resolveDefault(showClearProp, 'AutoComplete', 'showClear', false));
  const onSelectWithObject = $derived(resolveDefault(onSelectWithObjectProp, 'AutoComplete', 'onSelectWithObject', false));
  const defaultActiveFirstOption = $derived(resolveDefault(defaultActiveFirstOptionProp, 'AutoComplete', 'defaultActiveFirstOption', false));
  const dropdownMatchSelectWidth = $derived(resolveDefault(dropdownMatchSelectWidthProp, 'AutoComplete', 'dropdownMatchSelectWidth', true));
  const loading = $derived(resolveDefault(loadingProp, 'AutoComplete', 'loading', false));
  const maxHeight = $derived(resolveDefault(maxHeightProp, 'AutoComplete', 'maxHeight', 300));
  const validateStatus = $derived(resolveDefault(validateStatusProp, 'AutoComplete', 'validateStatus', 'default'));
  const autoFocus = $derived(resolveDefault(autoFocusProp, 'AutoComplete', 'autoFocus', false));

  // InputGroup 组级默认（size/disabled）：显式 prop 始终优先，否则回退组级，再回退组件默认。
  const group = getInputGroupContext();
  const size = $derived<Size>(sizeProp ?? group?.size ?? 'default');
  const disabled = $derived<boolean>(disabledProp ?? group?.disabled ?? false);

  // 透传给 triggerRender 的完整生效 props（对齐 Semi componentProps={{ ...this.props }}，
  // React class 组件 this.props 已含 defaultProps 合并结果，故此处用 resolveDefault 后的生效值）。
  // 不标注 Props 类型：value 等字段可能为 undefined，与 exactOptionalPropertyTypes 下 Props
  // 要求「要么不传要么非 undefined」冲突——这里只是给用户参考的快照，无需严格契约。
  const componentProps = $derived({
    value, defaultValue, data, defaultOpen, placeholder,
    'aria-label': ariaLabel, ariaLabelledby, insetLabel, insetLabelId,
    size, validateStatus, disabled, defaultActiveFirstOption,
    onSearch, loading, onChange, onSelect, onSelectWithObject, onDropdownVisibleChange,
    dropdownMatchSelectWidth, getPopupContainer, dropdownClassName, dropdownStyle,
    triggerRender, renderItem, renderSelectedItem, emptyContent, prefix, suffix,
    showClear, clearIcon, onBlur, onFocus, onClear, autoFocus, position,
    autoAdjustOverflow, onKeyDown, class: className, style, maxHeight, zIndex,
  });

  const loc = useLocale();

  const listId = useId('cd-autocomplete-list');

  // --- 受控值 (红线 #1): 不无条件回写 value，仅 onChange ---
  const isValueControlled = $derived(value !== undefined);
  let innerValue = $state<ItemValue>(getInitialValue());
  const currentValue = $derived<ItemValue>(isValueControlled ? (value ?? '') : innerValue);

  function getInitialValue(): ItemValue {
    return defaultValue;
  }

  // 默认「选中项渲染」：对齐 Semi _getRenderSelectedItem 未提供 renderSelectedItem 时的默认实现
  // (option) => option?.value —— 未提供时相当于直接使用候选项的原始 value。
  function resolveSelectedItemText(item: NormalizedItem): string {
    return renderSelectedItem ? renderSelectedItem(item) : String(item.value);
  }

  // 对齐 Semi handleValueChange：拿 renderSelectedItem(option) 的结果反查匹配候选项（不是拿
  // option.value 匹配），命中则原样用 selectedValue，未命中则用 { label, value } 构造临时候选项
  // 再转换一次——仅用于「受控 value 从外部注入」场景，不应用于用户输入中间态（见下方 displayText）。
  function computeDisplayFromValue(raw: string): string {
    if (!renderSelectedItem || !raw) return raw;
    const matched = options.find((o) => resolveSelectedItemText(o) === raw);
    if (matched) return raw;
    return resolveSelectedItemText({ value: raw, label: raw, disabled: false });
  }

  // 输入框回显文本（对齐 Semi state.inputValue）：独立状态，而非从 currentValue 派生的纯函数——
  // Semi 只有 handleValueChange（受控 value 外部变化）与 handleSelect（选中候选）两条路径会经
  // renderSelectedItem 转换，用户主动输入（handleSearch）是原样直写，不转换。若做成纯函数会导致
  // 每次按键都用输入中间态字符串反查/构造临时对象调用用户的 renderSelectedItem——而用户的转换函数
  // 通常假设入参是完整候选对象（如 item.email），臨時对象没有该字段会返回 undefined，破坏显示值。
  let displayText = $state(computeDisplayFromValue(String(getInitialValue() ?? '')));

  // 对齐 Semi componentDidUpdate：受控 value prop 变化时才重新计算显示文本。
  $effect(() => {
    if (isValueControlled) displayText = computeDisplayFromValue(String(value ?? ''));
  });

  function setValue(next: ItemValue) {
    if (!isValueControlled) innerValue = next;
    onChange?.(next);
  }

  // --- 非受控 open (对齐 Semi：无受控 open，仅 defaultOpen + onDropdownVisibleChange) ---
  let innerOpen = $state(getInitialOpen());
  const isOpen = $derived(innerOpen);

  function getInitialOpen(): boolean {
    return defaultOpen;
  }

  function setOpen(next: boolean) {
    if (next === isOpen) return;
    innerOpen = next;
    onDropdownVisibleChange?.(next);
    if (!next) activeIndex = -1;
  }

  function normalize(it: Item): NormalizedItem {
    if (typeof it === 'string' || typeof it === 'number') {
      return { value: it, label: String(it), disabled: false };
    }
    // 保留原对象的额外字段（对齐 Semi：renderItem/renderSelectedItem 拿到完整候选对象）。
    return { ...it, value: it.value, label: it.label ?? String(it.value), disabled: it.disabled ?? false };
  }

  // 候选序列：仅归一化，不做本地过滤（对齐 Semi：data 由用户按 query 准备）。
  const options = $derived<NormalizedItem[]>(data.map(normalize));

  // --- roving 高亮 (红线 #2): activeIndex 本地 $state ---
  // 初始值对齐 Semi init() → defaultOpen 时 openDropdown() → _modifyFocusIndexOnPanelOpen()：
  // defaultOpen + defaultActiveFirstOption 组合下，挂载即应高亮首个可用项，而非等用户交互后才计算。
  function getInitialActiveIndex(): number {
    return defaultOpen && defaultActiveFirstOption ? options.findIndex((o) => !o.disabled) : -1;
  }
  let activeIndex = $state(getInitialActiveIndex());

  const activeOptionId = $derived(
    activeIndex >= 0 && activeIndex < options.length
      ? `${listId}-opt-${activeIndex}`
      : undefined,
  );

  // 展开且（有候选 或 加载中）时才展示浮层。
  const showDropdown = $derived(isOpen && (options.length > 0 || loading));

  // suffix 槽是否有内容——renderSelectedItem 不渲染在 suffix（它决定 input 显示文本本身，见 displayText/commit）。
  const hasSuffixSlot = $derived(suffix != null);
  // prefix 优先、缺省回退 insetLabel（对齐 Semi prefix||insetLabel）。
  const usePrefixSlot = $derived(prefix != null);
  const useInsetLabelSlot = $derived(prefix == null && insetLabel != null);

  function firstEnabledIndex(): number {
    return options.findIndex((o) => !o.disabled);
  }

  // 对齐 Semi _modifyFocusIndex：优先高亮与当前输入值精确匹配的候选项，
  // 否则（且 defaultActiveFirstOption）回退首项；每次搜索都要重算，而非仅面板打开时一次性计算。
  function modifyFocusIndex(searchValue: string) {
    const matched = searchValue ? options.findIndex((o) => o.label === searchValue) : -1;
    activeIndex = matched === -1 && defaultActiveFirstOption ? firstEnabledIndex() : matched;
  }

  function openWithOptions() {
    setOpen(true);
    modifyFocusIndex(displayText);
  }

  // 对齐 Semi handleDataChange：data 变化时（远程搜索场景下由外部异步注入新候选）
  // 高亮项要跟着重算，而不仅在用户主动输入时才计算。
  let previousData: Item[] | undefined;
  $effect(() => {
    const current = data;
    if (previousData !== undefined && current !== previousData) {
      modifyFocusIndex(displayText);
    }
    previousData = current;
  });

  // Input.onInput 签名为 (value, e)（对齐 Semi）。
  // 对齐 Semi handleSearch：直接写显示文本，不经 renderSelectedItem 转换——用户输入中间态
  // 字符串不是完整候选对象，传给 renderSelectedItem 会因缺字段返回 undefined（见 displayText 声明处）。
  function handleInput(next: string) {
    displayText = next;
    setValue(next);
    modifyFocusIndex(next);
    // 面板已展开时不重复触发「打开」副作用，仅未展开时才 open（对齐 Semi handleSearch）。
    if (!isOpen) setOpen(true);
    // 远程：外部按 query 更新 data（受控红线 #1：仅回调，不回写）。
    onSearch?.(next);
  }

  function handleFocus(e: FocusEvent) {
    onFocus?.(e);
  }

  function handleBlur(e: FocusEvent) {
    onBlur?.(e);
  }

  // 清除动作与根 div click 之间的竞态标志（对齐 Semi foundation.handleClear 在事件对象上打
  // CLEARBTN_CLICKED_EVENT_FLAG 标志位的思路）：清除按钮挂在 mousedown（Input.svelte clear()，
  // 非 click），mousedown 上 stopPropagation 挡不住随后独立派发、冒泡到根 div 的 click 事件；
  // 且 DOM class 判断（如 .cd-input-clearbtn）覆盖不到 triggerRender 自定义触发器里用户自己
  // 实现的清除按钮。用同步标志位替代——两次事件在同一 tick 内触发，可靠覆盖所有触发器形态。
  let justCleared = false;

  // 对齐 Semi handleInputClick（绑定在外层 div）：点击触发器时切换浮层显隐。
  function handleTriggerClick() {
    if (disabled) return;
    if (justCleared) {
      justCleared = false;
      return;
    }
    if (isOpen) setOpen(false);
    else openWithOptions();
  }

  function commit(opt: NormalizedItem) {
    if (opt.disabled || disabled) return;
    // 对齐 Semi handleSelect：newInputValue = renderSelectedItem ? renderSelectedItem(option) : option.value，
    // 这个值既写回 value/onChange，也是输入框最终显示的文本——renderSelectedItem 不是仅用于渲染的旁路。
    const newText = resolveSelectedItemText(opt);
    displayText = newText;
    setValue(newText);
    onSelect?.(onSelectWithObject ? opt : opt.value);
    setOpen(false);
  }

  // 桥接内部 <Input showClear> 的清除：同步值 + 关下拉 + 上报 onClear（对齐 Semi onInputClear）。
  // 与 justCleared 标志位配套：调用方无论是内置清除按钮还是 triggerRender 自定义按钮，
  // 都要经过这个函数才能真正清空，故在此统一设标志位，覆盖所有触发器形态。
  function clearAll(e?: MouseEvent) {
    if (disabled) return;
    justCleared = true;
    displayText = '';
    setValue('');
    setOpen(false);
    onSearch?.('');
    onClear?.();
  }

  function moveActive(delta: number) {
    const len = options.length;
    if (len === 0) return;
    let next = activeIndex;
    for (let i = 0; i < len; i += 1) {
      next = (next + delta + len) % len;
      if (!options[next]?.disabled) {
        activeIndex = next;
        return;
      }
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    onKeyDown?.(e);
    if (disabled) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) openWithOptions();
        else moveActive(1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!isOpen) openWithOptions();
        else moveActive(-1);
        break;
      case 'Enter':
        // 对齐 Semi _handleEnterKeyDown：未展开时先展开；已展开且有高亮项时提交，否则收起。
        e.preventDefault();
        if (!isOpen) {
          openWithOptions();
        } else {
          const activeOpt = activeIndex >= 0 ? options[activeIndex] : undefined;
          if (activeOpt) commit(activeOpt);
          else setOpen(false);
        }
        break;
      case 'Escape':
        if (isOpen) {
          e.preventDefault();
          setOpen(false);
        }
        break;
      case 'Tab':
        // 对齐 Semi _handleKeyDown：Tab 收起下拉但不阻止默认的焦点移动。
        if (isOpen) setOpen(false);
        break;
      default:
        break;
    }
  }

  // autoFocus 由内部 <Input autoFocus> 承担（对齐 Semi：Input 自带 autoFocus 能力）。

  // --- useDismiss (红线 #3): open 时绑、cleanup 解绑 ---
  let rootEl = $state<HTMLDivElement | null>(null);
  // 浮层经 use:floating portal 到 body，列入 extraTargets 避免误判 outsideClick。
  let dropdownEl = $state<HTMLDivElement | null>(null);

  // 全局浮层注册（见 core registerOverlayRoot 注释）：dropdown portal 到 body 后与祖先
  // hover 浮层脱节，登记后祖先的 pointerleave 判断能识别"鼠标去了合法子浮层"。
  $effect(() => {
    if (!dropdownEl) return;
    return registerOverlayRoot(dropdownEl);
  });

  $effect(() => {
    if (!isOpen || !rootEl) return;
    const cleanup = useDismiss(rootEl, {
      onDismiss: () => setOpen(false),
      escape: true,
      outsideClick: true,
      extraTargets: [dropdownEl],
    });
    return cleanup;
  });

  // 对齐 Semi adapter.updateScrollTop：高亮项变化时（键盘导航/输入匹配）滚动到可视区域，
  // 否则候选列表超出 maxHeight 时，键盘移到列表尾部的高亮项会不可见。
  $effect(() => {
    if (activeIndex < 0 || !dropdownEl) return;
    const el = dropdownEl.querySelector(`#${listId}-opt-${activeIndex}`);
    el?.scrollIntoView({ block: 'nearest' });
  });

  const dropdownStyleStr = $derived.by(() => {
    if (!dropdownStyle) return '';
    if (typeof dropdownStyle === 'string') return dropdownStyle;
    return Object.entries(dropdownStyle).map(([k, v]) => `${k}: ${v}`).join('; ');
  });

  const dropdownPlacement = $derived(positionToPlacement(position));

  // 根 wrapper class：尺寸/校验态/禁用外观全由内部 <Input> 承担，此处只留语义状态钩子 + 用户 class。
  const cls = $derived(
    [
      'cd-autocomplete',
      disabled && 'cd-autocomplete-disabled',
      isOpen && 'cd-autocomplete-open',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );

  // 浮层最大高度：number→px，string 原样（对齐 Semi maxHeight 默认 300；Semi style.maxHeight 是物理属性）。
  const maxHeightStyle = $derived.by(() => {
    const v = typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight;
    return `max-height: ${v}`;
  });

  const zIndexStyle = $derived(zIndex === undefined ? '' : `z-index: ${zIndex}`);

  // combobox 输入框可访问名：ariaLabelledby > ariaLabel > placeholder(非空) > locale 默认
  const inputAriaLabel = $derived(
    ariaLabelledby ? undefined : (ariaLabel || placeholder || loc().t('AutoComplete.ariaLabel')),
  );

  // insetLabel 存在且有 id 时，纳入 combobox 的 aria-labelledby。
  const resolvedLabelledby = $derived(
    [ariaLabelledby, insetLabel !== undefined && insetLabelId ? insetLabelId : undefined]
      .filter(Boolean)
      .join(' ') || undefined,
  );
</script>

{#snippet prefixSlot()}
  {#if typeof prefix === 'string'}{prefix}{:else if prefix}{@render prefix()}{/if}
{/snippet}

{#snippet insetLabelSlot()}
  {#if typeof insetLabel === 'string'}{insetLabel}{:else if insetLabel}{@render insetLabel()}{/if}
{/snippet}

{#snippet suffixSlot()}
  {#if typeof suffix === 'string'}{suffix}{:else if suffix}{@render suffix()}{/if}
{/snippet}

<!--
  外层点击热区对齐 Semi outerProps（tabIndex:-1，无 role）：combobox 语义落在内部真正的
  <input>（见下方 Input role="combobox"），此处只负责点击切换浮层，键盘交互全部由内部 input 承担。
-->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class={cls} style={style || undefined} bind:this={rootEl} tabindex="-1" onclick={handleTriggerClick}>
  {#if triggerRender}
    {@render triggerRender({
      inputValue: displayText,
      placeholder,
      disabled,
      size,
      showClear,
      validateStatus,
      autoFocus,
      onChange: handleInput,
      onClear: clearAll,
      onFocus: handleFocus,
      onBlur: handleBlur,
      componentProps,
    })}
  {:else}
    <!--
      触发器整个复用 <Input>（镜像 Semi renderInput 的 <Input {...innerProps} value/>）。
      combobox role 与 aria-* 经 Input rest 透传落到内部原生 <input class="cd-input">。
      prefix 与 insetLabel 走 Input 同一前缀槽（prefix 优先，对齐 Semi prefix||insetLabel）。
      showClear/clearIcon/autoFocus 由 Input 承担。renderSelectedItem 不涉及 suffix，见 displayText/commit。
      可选 Snippet 槽仅在有内容时才注入（exactOptionalPropertyTypes 下不传 undefined）。
    -->
    {@const slotProps = {
      ...(usePrefixSlot ? { prefix: prefixSlot } : {}),
      ...(useInsetLabelSlot ? { insetLabel: insetLabelSlot } : {}),
      ...(hasSuffixSlot ? { suffix: suffixSlot } : {}),
      ...(clearIcon ? { clearIcon } : {}),
      ...(insetLabelId != null ? { insetLabelId } : {}),
      ...(inputAriaLabel != null ? { 'aria-label': inputAriaLabel } : {}),
      ...(resolvedLabelledby != null ? { ariaLabelledby: resolvedLabelledby } : {}),
      ...(activeOptionId != null ? { 'aria-activedescendant': activeOptionId } : {}),
    }}
    <Input
      value={displayText}
      {size}
      {disabled}
      {placeholder}
      {autoFocus}
      {showClear}
      {validateStatus}
      {...slotProps}
      onInput={handleInput}
      onKeyDown={handleKeydown}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onClear={clearAll}
      role="combobox"
      aria-expanded={showDropdown}
      aria-controls={listId}
      aria-autocomplete="list"
    />
  {/if}

  {#if showDropdown && rootEl}
    <!--
      listbox 有意不可聚焦（roving focus 模式，对齐 Semi/W3C combobox pattern）：
      焦点始终停留在 input 上，经 aria-activedescendant 关联高亮项，listbox 自身不参与 Tab 顺序。
    -->
    <!-- svelte-ignore a11y_interactive_supports_focus -->
    <div
      bind:this={dropdownEl}
      class={['cd-autocomplete-option-list', dropdownClassName].filter(Boolean).join(' ')}
      role="listbox"
      id={listId}
      aria-busy={loading || undefined}
      use:floating={{ trigger: rootEl, placement: dropdownPlacement, offset: 4, autoAdjust: autoAdjustOverflow, padding: 8, matchWidth: dropdownMatchSelectWidth, open: showDropdown, getContainer: getPopupContainer }}
      style={[maxHeightStyle, zIndexStyle, dropdownStyleStr].filter(Boolean).join('; ')}
    >
      {#if loading}
        <div class="cd-autocomplete-loading-wrapper">
          <Spin size="small" />
        </div>
      {:else if options.length === 0}
        {#snippet defaultEmptyText()}
          {loc().t('AutoComplete.emptyText')}
        {/snippet}
        <Option
          empty
          emptyContent={typeof emptyContent === 'string' ? emptyContent : (emptyContent ?? defaultEmptyText)}
          onSelect={() => {}}
        />
      {:else}
        {#each options as opt, i (opt.value)}
          {#if renderItem}
            <Option
              value={opt.value}
              label={opt.label}
              disabled={opt.disabled}
              selected={opt.label === displayText}
              focused={i === activeIndex}
              inputValue={displayText}
              id={`${listId}-opt-${i}`}
              onSelect={() => commit(opt)}
              onMouseEnter={() => {
                if (!opt.disabled) activeIndex = i;
              }}
            >
              {@render renderItem({ item: opt, isSelected: opt.label === displayText })}
            </Option>
          {:else}
            <Option
              value={opt.value}
              label={opt.label}
              disabled={opt.disabled}
              selected={opt.label === displayText}
              focused={i === activeIndex}
              inputValue={displayText}
              id={`${listId}-opt-${i}`}
              onSelect={() => commit(opt)}
              onMouseEnter={() => {
                if (!opt.disabled) activeIndex = i;
              }}
            />
          {/if}
        {/each}
      {/if}
    </div>
  {/if}
</div>

<style>
  /*
    根 wrapper：对齐 Semi .semi-autocomplete（cursor/display/vertical-align/box-sizing）；
    position:relative + width:100% 为 use:floating 定位锚点的本库补偿（Semi 靠 Popover trigger 处理，
    见文件头「暂缓」说明），width 用物理属性对齐 Semi 写法习惯。
  */
  .cd-autocomplete {
    cursor: text;
    display: inline-flex;
    vertical-align: middle;
    box-sizing: border-box;
    position: relative;
    width: 100%;
  }
  /*
    下拉列表：对齐 Semi .semi-autocomplete-option-list（overflow/定位）。
    Semi 的卡片背景/圆角/阴影由外层 <Popover> 提供；本库未包 Popover（见文件头注释），
    故在此自行补上等价视觉，使浮层呈现为卡片而非透明容器。
  */
  .cd-autocomplete-option-list {
    /* 定位由 use:floating 接管；此处只定义外观 + 滚动。 */
    z-index: var(--cd-z-popover);
    overflow-x: hidden;
    overflow-y: auto;
    padding-top: var(--cd-spacing-extra-tight);
    padding-bottom: var(--cd-spacing-extra-tight);
    background: var(--cd-color-bg-3);
    border-radius: var(--cd-border-radius-medium);
    box-shadow: var(--cd-shadow-elevated);
  }
  /* 加载区：对齐 Semi .semi-autocomplete-loading-wrapper（复用 Spin） */
  .cd-autocomplete-loading-wrapper {
    padding-top: var(--cd-autocomplete-loading-wrapper-padding-top);
    padding-bottom: var(--cd-autocomplete-loading-wrapper-padding-bottom);
    cursor: not-allowed;
    height: 20px;
  }
  .cd-autocomplete-loading-wrapper :global(.cd-spin) {
    width: 100%;
  }
</style>
