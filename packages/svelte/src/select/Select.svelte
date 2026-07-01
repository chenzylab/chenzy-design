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
    /** 用作回显的字段名（默认 'label'）；当选项含自定义字段时取对应值作显示文本 */
    optionLabelProp?: string;
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
    /** 浮层顶部固定区 */
    dropdownHeader?: Snippet;
    /** 浮层底部固定区 */
    dropdownFooter?: Snippet;
    /** 自定义单项渲染 */
    option?: Snippet<[{ option: OptionData; selected: boolean; active: boolean }]>;
    /** 自定义选中值/Tag 渲染 */
    label?: Snippet<[{ option: OptionData }]>;
    /** 自定义"创建xxx"项渲染 */
    renderCreateItem?: Snippet<[string]>;
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
    destroyOnClose = false,
    getPopupContainer,
    borderless = false,
    autoFocus = false,
    autoClearSearchValue = true,
    showRestTagsPopover = false,
    restTagsPopoverProps,
    optionLabelProp = 'label',
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
    option: optionSnippet,
    label: labelSnippet,
    renderCreateItem,
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
    }
  }

  // 挂载自动聚焦（autoFocus）。
  $effect(() => {
    if (!autoFocus || !rootEl) return;
    const trigger = rootEl.querySelector<HTMLElement>('[role="combobox"]');
    trigger?.focus();
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
  const visibleTags = $derived(
    (maxTagCount > 0 ? selectedOptions.slice(0, maxTagCount) : selectedOptions).map(
      (opt) => {
        const raw = getOptionLabel(opt);
        const display = truncate(raw, maxTagTextLength);
        return { opt, display, truncated: display !== raw };
      },
    ),
  );
  const hiddenTagCount = $derived(
    maxTagCount > 0 ? Math.max(0, selectedOptions.length - maxTagCount) : 0,
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

  // --- DOM 引用：触发根 + portal 下拉（定位由 use:floating action 接管）---
  let rootEl = $state<HTMLDivElement | null>(null);
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
    function onScroll() {
      if (isVirtual) {
        if (rafId) return;
        rafId = requestAnimationFrame(() => {
          rafId = 0;
          if (el) scrollTop = el.scrollTop;
        });
      }
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
      extraTargets: [dropdownEl],
    });
    return cleanup;
  });

  const cls = $derived(
    [
      'cd-select',
      `cd-select--${size}`,
      `cd-select--${status}`,
      disabled && 'cd-select--disabled',
      isOpen && 'cd-select--open',
      multiple && 'cd-select--multiple',
      borderless && 'cd-select--borderless',
    ]
      .filter(Boolean)
      .join(' '),
  );

  // combobox 可访问名：ariaLabelledby > ariaLabel > placeholder > locale 默认
  const triggerAriaLabel = $derived(
    ariaLabelledby ? undefined : (ariaLabel || placeholder || loc().t('Select.ariaLabel')),
  );
</script>

<div class={cls} bind:this={rootEl}>
  <div
    class="cd-select__trigger"
    role="combobox"
    {id}
    aria-label={triggerAriaLabel}
    aria-labelledby={ariaLabelledby}
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
          <span
            class="cd-select__tag cd-select__tag--rest"
            title={showRestTagsPopover ? hiddenOpts.map((o) => getOptionLabel(o)).join(', ') : undefined}
          >+{hiddenTagCount}</span>
        {/if}
        {#if filter}
          <input
            class="cd-select__search"
            type="text"
            value={query}
            aria-label={loc().t('Select.searchPlaceholder')}
            oninput={onSearchInput}
            onkeydown={onTriggerKeydown}
            onclick={(e) => e.stopPropagation()}
          />
        {/if}
      {:else if filter}
        <input
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
    {:else}
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

  {#if isOpen || !destroyOnClose}
    <div
      class="cd-select__dropdown"
      bind:this={dropdownEl}
      use:floating={{ trigger: rootEl, placement, autoAdjust: true, offset: 4, matchWidth: dropdownMatchSelectWidth }}
      role="listbox"
      id={listId}
      aria-multiselectable={multiple}
      aria-busy={loading || undefined}
      style={`max-block-size:${maxHeight}px`}
      hidden={!isOpen || undefined}
    >
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
    transition:
      border-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard),
      background-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
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
    background: var(--cd-color-disabled-fill, var(--cd-color-fill-0));
    color: var(--cd-color-text-3);
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
    color: var(--cd-input-color-placeholder);
  }
  .cd-select__value {
    overflow: hidden;
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
    color: var(--cd-input-color-placeholder);
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
    color: var(--cd-color-text-2);
  }
  .cd-select__option--create {
    color: var(--cd-color-primary);
  }
  .cd-select__tag-close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--cd-color-text-2);
    cursor: pointer;
  }
  .cd-select__tag-close:hover {
    color: var(--cd-color-text-0);
  }
  .cd-select__clear,
  .cd-select__arrow {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    color: var(--cd-color-text-2);
  }
  .cd-select__clear {
    padding: 0;
    border: none;
    background: transparent;
    cursor: pointer;
  }
  .cd-select__clear:hover {
    color: var(--cd-color-text-0);
  }
  .cd-select__arrow {
    transition: transform var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-select--open .cd-select__arrow {
    transform: rotate(180deg);
  }
  /* 下拉 portal 到 body，由 JS 写 position:fixed + transform + matchWidth */
  .cd-select__dropdown {
    z-index: var(--cd-select-dropdown-z);
    max-block-size: 16rem;
    overflow-y: auto;
    padding-block: var(--cd-spacing-extra-tight);
    background: var(--cd-select-dropdown-bg);
    border-radius: var(--cd-select-dropdown-radius);
    box-shadow: var(--cd-select-dropdown-shadow);
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
    color: var(--cd-color-text-3);
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
  }
  .cd-select__option--active {
    background: var(--cd-select-option-bg-hover);
  }
  .cd-select__option--selected {
    color: var(--cd-select-option-color-selected);
    background: var(--cd-select-option-bg-active);
  }
  .cd-select__option[aria-disabled='true'] {
    color: var(--cd-color-text-3);
    cursor: not-allowed;
  }
  .cd-select__check {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: 1rem;
    flex: 0 0 auto;
    color: var(--cd-select-option-color-selected);
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
    border: 2px solid var(--cd-color-border);
    border-block-start-color: var(--cd-color-primary);
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
    color: var(--cd-color-text-2);
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
    border-block-color: var(--cd-color-border);
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
