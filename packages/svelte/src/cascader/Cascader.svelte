<!--
  Cascader — see specs/components/input/Cascader.spec.md
  基础子集: 单选、点击逐级展开级联列、叶子选中。Token-driven, a11y-correct, 受控/非受控。
  面板 portal 到 body + position:fixed（脱离 overflow:hidden 裁剪），flip 避让。
  异步 loadData：点击非叶子且无 children 的节点时调 loadData 动态加载，
  加载中显示 spinner，结果缓存到本地 extraChildren（不改 treeData prop）。
  multiple：每列 checkbox 多选 + 父子联动（复用 core conduct/toggleCheck，以 value 为 key），
  trigger 按选中叶子路径多 tag 回显可单独移除；value 为 Key[][]（多条路径）。
  filterable：搜索时切换为扁平路径列表，按 label 链过滤 + 高亮命中，点击直接选中整条路径。
  expandTrigger='hover'：悬停非叶子节点即展开子级列（pointerenter 设 activePath，选中仍用点击）。
  displayRender：自定义触发器选中路径回显（单选 + 多选每个 tag 共用）。
  changeOnSelect（单选）：点击任一层级节点（含中间非叶子）立即提交从根到该
  节点的路径并触发 onChange；非叶子同时展开子列、不关闭面板（可停在任意层级
  或继续深入），叶子提交并关闭。关闭时仅叶子提交并关闭，非叶子仅展开（默认）。
  spec §4 补齐：separator（分隔符）、displayProp（回显字段 label/value）、
  maxTagCount（多选 tag 折叠 +N）、leafOnly（多选完全勾选父级折叠为父路径）、
  filterTreeNode（filterable 的超集：true=默认子串匹配，函数=自定义谓词）、
  filterLeafOnly（搜索是否仅到叶子）、emptyContent（空态 string|Snippet）、
  destroyOnClose（关闭保留/卸载浮层 DOM）、zIndex、getPopupContainer（浮层容器）、
  columnWidth（列宽 number|number[]）。
  新增：borderless/prefix/suffix/clearIcon/expandIcon/motion/keyMaps/remote/
  checkRelation/autoMergeValue/showNext/triggerRender/filterRender/filterSorter/
  topSlot/bottomSlot/onClear/onLoad/onSelect/onDropdownVisibleChange/onListScroll 等。
-->
<script lang="ts">
  import {
    useId,
    useDismiss,
    conduct,
    toggleCheck,
    resolveColumnWidth,
    rovingKeyFromEvent,
    nextRovingIndex,
    type TreeNodeData,
    type CascaderFlatPath,
  } from '@chenzy-design/core';
  import { SvelteMap, SvelteSet } from 'svelte/reactivity';
  import type { Snippet } from 'svelte';
  import { useLocale } from '../locale-provider/index.js';
  import { getGlobalPopupContainer } from '../config-provider/index.js';
  import { floating } from '../_floating/use-floating.js';
  import Tag from '../tag/Tag.svelte';
  import Popover from '../popover/Popover.svelte';
  import { VirtualList } from '../virtual-list/index.js';
  import type { CascaderNode } from './types.js';

  type Key = string | number;
  type Size = 'small' | 'default' | 'large';
  type Status = 'default' | 'warning' | 'error';

  interface Props {
    /** 单选为单条路径 Key[]；多选为多条路径 Key[][] */
    value?: Key[] | Key[][];
    defaultValue?: Key[] | Key[][];
    treeData?: CascaderNode[];
    open?: boolean;
    defaultOpen?: boolean;
    /** 多选：每列 checkbox + 父子联动，trigger 多 tag 回显 */
    multiple?: boolean;
    size?: Size;
    status?: Status;
    placeholder?: string;
    disabled?: boolean;
    clearable?: boolean;
    changeOnSelect?: boolean;
    /** 展开触发方式：'click' 点击展开（默认）；'hover' 悬停非叶子节点即展开子级列（legacy alias，推荐用 showNext） */
    expandTrigger?: 'click' | 'hover';
    /** 多选时只回传/计数叶子节点（父节点不进 value、tag、计数） */
    leafOnly?: boolean;
    /** 搜索时切换为扁平路径列表，按 label 链过滤 + 高亮命中（向后兼容别名，等价 filterTreeNode=true） */
    filterable?: boolean;
    /** 是否可搜索及自定义匹配：false 关闭；true 默认按 label 链子串匹配；函数自定义谓词 */
    filterTreeNode?: boolean | ((query: string, path: CascaderFlatPath<CascaderNode>) => boolean);
    /** 搜索结果是否仅展示到叶子路径（默认 true；false 时含中间层级路径） */
    filterLeafOnly?: boolean;
    /** 触发器回显使用的字段：'label'（默认）或 'value' */
    displayProp?: 'label' | 'value';
    /** 路径分隔符（回显 / 搜索 label 链拼接） */
    separator?: string;
    /** 多选 Tag 溢出折叠阈值：超出显示前 N 个 + +M */
    maxTagCount?: number;
    /** 列为空（无可选项）时内容；缺省走 i18n */
    emptyContent?: string | Snippet;
    /** 关闭即卸载浮层内容（{#if}），重开重建。默认 false：首开后保留 DOM 仅隐藏。 */
    destroyOnClose?: boolean;
    /** 浮层层级 */
    zIndex?: number;
    /** 浮层挂载容器，缺省 document.body。非 body 容器时改 absolute 定位相对该容器。 */
    getPopupContainer?: () => HTMLElement | null | undefined;
    /** 列宽：统一（number）或逐列（number[]，超出取末项） */
    columnWidth?: number | number[];
    /** 动态加载子节点；点击非叶子且无 children 的节点时调用 */
    loadData?: (node: CascaderNode) => Promise<CascaderNode[]>;
    /** 自定义触发器选中路径的回显文本（单选 + 多选每个 tag 均走此函数） */
    displayRender?: (labels: string[], selectedNodes: CascaderNode[]) => string;
    /** 单选回调单条路径；多选回调多条叶子路径。onChangeWithObject=true 时改为回传节点对象（单选节点链 CascaderNode[]，多选每条路径节点链 CascaderNode[][]） */
    onChange?: (value: Key[] | Key[][] | CascaderNode[] | CascaderNode[][]) => void;
    onOpenChange?: (open: boolean) => void;
    ariaLabel?: string;

    // --- 外观 ---
    /** 附加到根节点的自定义 class */
    class?: string;
    /** 无边框模式 */
    borderless?: boolean;
    /** 前置内容（Snippet 或 string） */
    prefix?: Snippet | string;
    /** 内嵌标签：触发器在值前渲染的标签（如「地区：」），Semi 中为 prefix 的别名 */
    insetLabel?: Snippet | string;
    /** 内嵌标签的 DOM id（供外部 aria-labelledby 引用） */
    insetLabelId?: string;
    /** 后置内容（Snippet 或 string） */
    suffix?: Snippet | string;
    /** 自定义清除图标 */
    clearIcon?: Snippet;
    /** 自定义展开图标（expandIcon / arrowIcon 均可，expandIcon 优先） */
    expandIcon?: Snippet;
    /** 自定义右侧下拉箭头（expandIcon 的别名） */
    arrowIcon?: Snippet;
    /** 下拉框展开动画（默认 true） */
    motion?: boolean;
    /** 鼠标移入延迟（ms），默认 50 */
    mouseEnterDelay?: number;
    /** 鼠标移出延迟（ms），默认 50 */
    mouseLeaveDelay?: number;
    /** 下拉框自动调整方向（默认 true） */
    autoAdjustOverflow?: boolean;
    /** 下拉框方向（默认 'bottomStart'） */
    position?: string;
    /** 选择框样式 */
    style?: string;
    /** 下拉菜单样式（合并进浮层根节点，不覆盖 use:floating 写入的定位样式） */
    dropdownStyle?: string | Record<string, string>;
    /** 追加到浮层根节点的自定义类名（与内置类名并存） */
    dropdownClassName?: string;
    /** 浮层与 trigger 的额外间距（px），映射到浮层 offset；对象形态仅取 marginTop（其余方向暂未接入定位）。 */
    dropdownMargin?: number | { marginTop?: number; marginBottom?: number; marginLeft?: number; marginRight?: number };
    /** 失焦回调 */
    onBlur?: (e: MouseEvent) => void;
    /** 聚焦回调 */
    onFocus?: (e: MouseEvent) => void;
    /** 聚焦时阻止滚动 */
    preventScroll?: boolean;
    /** 阻止下拉框点击冒泡（默认 true） */
    stopPropagation?: boolean;

    // --- 插槽 ---
    /** 面板顶部插槽 */
    topSlot?: Snippet;
    /** 面板底部插槽 */
    bottomSlot?: Snippet;

    // --- 搜索增强 ---
    /** 搜索框位置：'trigger'（默认，内置）；'custom'（自定义，不渲染内置搜索框） */
    searchPosition?: 'trigger' | 'custom';
    /** 搜索框占位文字 */
    searchPlaceholder?: string;
    /** 搜索时过滤的属性（默认 'label'） */
    treeNodeFilterProp?: string;
    /** 自定义搜索结果项渲染 */
    filterRender?: Snippet<[{ path: FlatPath }]>;
    /** 搜索结果自定义排序 */
    filterSorter?: (a: FlatPath, b: FlatPath, input: string) => number;
    /** 搜索输入回调 */
    onSearch?: (value: string) => void;
    /** 远程搜索模式：跳过本地过滤，只触发 onSearch */
    remote?: boolean;
    /** 搜索结果虚拟滚动配置 */
    virtualizeInSearch?: { height: number; width: number; itemSize: number };

    // --- 多选增强 ---
    /** 选中父节点时 value 不包含后代（默认 true） */
    autoMergeValue?: boolean;
    /** 勾选关系：'related' 父子联动（默认）；'unRelated' 独立 */
    checkRelation?: 'related' | 'unRelated';
    /** onChange 回调是否返回完整 option 对象 */
    onChangeWithObject?: boolean;
    /** 多选可勾选数量上限；超出时不选入并触发 onExceed（减少始终允许） */
    max?: number;
    /** 超出 max 时回调，传当前（含超出项）勾选的节点集合 */
    onExceed?: (items: CascaderNode[]) => void;
    /** 超出 maxTagCount 折叠的 tag 以 Popover 悬浮展示剩余项（hover +N）。默认 false。 */
    showRestTagsPopover?: boolean;
    /** 传给剩余 tags Popover 的额外 props（透传，可覆盖默认）。 */
    restTagsPopoverProps?: Record<string, unknown>;
    /** 是否显示清除按钮（clearable 的别名） */
    showClear?: boolean;

    // --- 节点配置 ---
    /** 自定义字段名映射 */
    keyMaps?: { value?: string; label?: string; children?: string; disabled?: string; isLeaf?: string };
    /** 点击任意节点即选中（含非叶子） */
    clickToSelect?: boolean;
    /** 多选模式下点击叶子节点触发勾选 */
    enableLeafClick?: boolean;
    /** 禁用不从父节点继承（严格禁用） */
    disableStrictly?: boolean;
    /** 展开触发方式（新版 canonical prop，优先于 expandTrigger） */
    showNext?: 'click' | 'hover';

    // --- 事件 ---
    /** 清空回调 */
    onClear?: () => void;
    /** 异步加载完成回调 */
    onLoad?: (loadedKeys: Key[], data: CascaderNode) => void;
    /** 节点选中回调（单选叶子选中时） */
    onSelect?: (value: Key) => void;
    /** 下拉面板显隐回调 */
    onDropdownVisibleChange?: (visible: boolean) => void;
    /** 列滚动回调 */
    onListScroll?: (e: Event, info: { panelIndex: number; activeNode: CascaderNode | null }) => void;

    // --- 自定义渲染 ---
    /** 完全自定义触发器渲染 */
    triggerRender?: Snippet<[{ value: Key[] | Key[][] | undefined; placeholder: string; isOpen: boolean; disabled: boolean }]>;
  }

  let {
    value,
    defaultValue,
    treeData = [],
    open: openProp,
    defaultOpen = false,
    multiple = false,
    size = 'default',
    status = 'default',
    placeholder = '请选择',
    disabled = false,
    clearable = false,
    changeOnSelect = false,
    expandTrigger = 'click',
    leafOnly = false,
    filterable = false,
    filterTreeNode,
    filterLeafOnly = true,
    displayProp = 'label',
    separator = ' / ',
    maxTagCount,
    emptyContent,
    destroyOnClose = false,
    zIndex = 1030,
    getPopupContainer,
    columnWidth = 180,
    loadData,
    displayRender,
    onChange,
    onOpenChange,
    ariaLabel,
    class: className = '',
    borderless = false,
    prefix,
    insetLabel,
    insetLabelId,
    suffix,
    clearIcon,
    expandIcon,
    arrowIcon,
    motion = true,
    mouseEnterDelay = 50,
    mouseLeaveDelay = 50,
    autoAdjustOverflow = true,
    position,
    style,
    dropdownStyle,
    dropdownClassName,
    dropdownMargin,
    onBlur,
    onFocus,
    preventScroll = false,
    stopPropagation = true,
    topSlot,
    bottomSlot,
    searchPosition = 'trigger',
    searchPlaceholder,
    treeNodeFilterProp = 'label',
    filterRender,
    filterSorter,
    onSearch,
    remote = false,
    virtualizeInSearch,
    autoMergeValue = true,
    checkRelation = 'related',
    onChangeWithObject = false,
    max,
    onExceed,
    showRestTagsPopover = false,
    restTagsPopoverProps,
    showClear: showClearProp,
    keyMaps,
    clickToSelect = false,
    enableLeafClick = false,
    disableStrictly = false,
    showNext = 'click',
    onClear,
    onLoad,
    onSelect,
    onDropdownVisibleChange,
    onListScroll,
    triggerRender,
  }: Props = $props();

  const loc = useLocale();
  // ConfigProvider 全局浮层容器默认；自身 getPopupContainer prop 优先，未传时回退此值（再回退 body）。
  const globalPopupContainer = getGlobalPopupContainer();
  const resolvePopupContainer = $derived(getPopupContainer ?? globalPopupContainer);

  // 浮层与触发器间距：dropdownMargin 数字直接作 offset；对象形态取 marginTop（其余方向暂未接入）；未传回退默认 4。
  const dropdownOffset = $derived.by(() => {
    if (dropdownMargin == null) return 4;
    if (typeof dropdownMargin === 'number') return dropdownMargin;
    return dropdownMargin.marginTop ?? 4;
  });

  // 浮层自定义样式：合并 dropdownStyle（字符串或对象）与 zIndex，供拼接到浮层 inline style。
  const dropdownStyleStr = $derived.by(() => {
    const parts: string[] = [];
    if (dropdownStyle) {
      if (typeof dropdownStyle === 'string') parts.push(dropdownStyle);
      else parts.push(Object.entries(dropdownStyle).map(([k, v]) => `${k}: ${v}`).join('; '));
    }
    if (zIndex != null) parts.push(`z-index: ${zIndex}`);
    return parts.filter(Boolean).join('; ');
  });

  // --- keyMaps: 字段名映射，规整 treeData ---
  const kmValue = $derived(keyMaps?.value ?? 'value');
  const kmLabel = $derived(keyMaps?.label ?? 'label');
  const kmChildren = $derived(keyMaps?.children ?? 'children');
  const kmDisabled = $derived(keyMaps?.disabled ?? 'disabled');
  const kmIsLeaf = $derived(keyMaps?.isLeaf ?? 'isLeaf');
  const keyMapsDefault = $derived(
    kmValue === 'value' &&
    kmLabel === 'label' &&
    kmChildren === 'children' &&
    kmDisabled === 'disabled' &&
    kmIsLeaf === 'isLeaf',
  );
  function normalizeNodes(nodes: CascaderNode[]): CascaderNode[] {
    if (keyMapsDefault) return nodes;
    return nodes.map((raw) => {
      const r = raw as unknown as Record<string, unknown>;
      const kids = r[kmChildren] as CascaderNode[] | undefined;
      const rawDisabled = r[kmDisabled];
      const rawIsLeaf = r[kmIsLeaf];
      const out = {
        ...raw,
        value: r[kmValue] as Key,
        label: r[kmLabel] as string,
      } as CascaderNode;
      if (rawDisabled !== undefined) out.disabled = rawDisabled as boolean;
      if (rawIsLeaf !== undefined) out.isLeaf = rawIsLeaf as boolean;
      if (kids) out.children = normalizeNodes(kids);
      else delete out.children;
      return out;
    });
  }
  const normalizedTreeData = $derived(keyMapsDefault ? treeData : normalizeNodes(treeData));

  // showNext 是 canonical prop；expandTrigger 是 legacy alias。showNext 优先。
  const effectiveExpandTrigger = $derived(
    showNext === 'hover' || expandTrigger === 'hover' ? 'hover' : 'click',
  );

  // filterTreeNode 优先；未显式传时回退 filterable 别名（向后兼容）。
  // 归一为：是否可搜索 + 实际谓词（true=默认子串匹配，函数=自定义）。
  const filterSpec = $derived<boolean | ((q: string, p: CascaderFlatPath<CascaderNode>) => boolean)>(
    remote ? true : (filterTreeNode !== undefined ? filterTreeNode : filterable),
  );
  const isFilterable = $derived(filterSpec !== false || remote);
  const showBuiltinSearch = $derived(isFilterable && searchPosition !== 'custom');

  // unRelated 勾选模式
  const isUnRelated = $derived(checkRelation === 'unRelated');

  // 异步加载：已加载子节点缓存（node.value → children）+ 加载中节点集合。
  // 不写回 treeData prop（红线 #1：不改受控数据源）。
  const extraChildren = new SvelteMap<Key, CascaderNode[]>();
  const loadingKeys = new SvelteSet<Key>();

  // 取节点的有效子节点：优先 node.children，否则查 extraChildren 缓存。
  function childrenOf(node: CascaderNode): CascaderNode[] | undefined {
    if (node.children && node.children.length > 0) return node.children;
    return extraChildren.get(node.value);
  }

  const listId = useId('cd-cascader-panel');
  const flatListId = useId('cd-cascader-flat');
  // 列项 / 扁平结果项 id 基（aria-activedescendant 指向当前键盘高亮项）。
  const itemBaseId = useId('cd-cascader-item');
  function colItemId(colIndex: number, value: Key): string {
    return `${itemBaseId}-c${colIndex}-${String(value)}`;
  }
  function flatItemId(values: Key[]): string {
    return `${itemBaseId}-f-${values.join('-')}`;
  }

  // --- 纯函数: 按 key 路径取节点链 (用于回显 label) ---
  function findPath(data: CascaderNode[], valuePath: Key[]): CascaderNode[] {
    const chain: CascaderNode[] = [];
    let level = data;
    for (const key of valuePath) {
      const node = level.find((n) => n.value === key);
      if (!node) break;
      chain.push(node);
      level = node.children ?? [];
    }
    return chain;
  }

  // --- 由 activePath 生成各列数据（含异步加载的子节点缓存）---
  function columnsFor(data: CascaderNode[], path: Key[]): CascaderNode[][] {
    const columns: CascaderNode[][] = [data];
    let level = data;
    for (const key of path) {
      const node = level.find((n) => n.value === key);
      const kids = node ? childrenOf(node) : undefined;
      if (!node || !kids || kids.length === 0) break;
      columns.push(kids);
      level = kids;
    }
    return columns;
  }

  // 联合 value 规整：单选取单条路径，多选取多条路径
  function asSinglePath(v: Key[] | Key[][] | undefined): Key[] {
    if (!v || v.length === 0) return [];
    return Array.isArray(v[0]) ? ((v[0] as Key[]) ?? []) : (v as Key[]);
  }
  function asMultiPaths(v: Key[] | Key[][] | undefined): Key[][] {
    if (!v || v.length === 0) return [];
    return Array.isArray(v[0]) ? (v as Key[][]) : [v as Key[]];
  }

  function getInitialValue(): Key[] {
    return asSinglePath(defaultValue);
  }
  function getInitialPaths(): Key[][] {
    return asMultiPaths(defaultValue).map((p) => p.slice());
  }
  function getInitialOpen(): boolean {
    return defaultOpen;
  }
  function getInitialPath(): Key[] {
    return asSinglePath(defaultValue).slice();
  }

  // --- 受控 value (红线 #1): 不无条件回写 value，仅 onChange ---
  const isValueControlled = $derived(value !== undefined);
  // 单选：当前路径
  let innerValue = $state<Key[]>(getInitialValue());
  const currentValue = $derived<Key[]>(
    isValueControlled ? asSinglePath(value) : innerValue,
  );
  // 多选：选中的多条叶子路径
  let innerPaths = $state<Key[][]>(getInitialPaths());
  const currentPaths = $derived<Key[][]>(
    isValueControlled ? asMultiPaths(value) : innerPaths,
  );

  // --- 受控 open (红线 #1): 不无条件回写 open，仅 onOpenChange ---
  const isOpenControlled = $derived(openProp !== undefined);
  let innerOpen = $state(getInitialOpen());
  const isOpen = $derived(isOpenControlled ? !!openProp : innerOpen);

  // --- 本地展开状态 (红线 #2): activePath 本地 $state，不依赖挂载 registry ---
  let activePath = $state<Key[]>(getInitialPath());

  const columns = $derived(columnsFor(normalizedTreeData, activePath));

  // --- 键盘 roving 高亮（aria-activedescendant 模型）：焦点留触发器，方向键移动高亮 ---
  // kbCol：当前高亮所在列；kbValue：该列内高亮节点 value。render 不读 DOM（红线 #2）。
  let kbCol = $state(0);
  let kbValue = $state<Key | null>(null);
  // 扁平搜索结果高亮索引。
  let kbFlatIndex = $state(-1);
  const activeDescId = $derived.by(() => {
    if (searchActive) {
      if (kbFlatIndex < 0 || kbFlatIndex >= filteredPaths.length) return undefined;
      return flatItemId((filteredPaths[kbFlatIndex] as FlatPath).values);
    }
    if (kbValue === null) return undefined;
    const col = columns[kbCol];
    if (!col || !col.some((n) => n.value === kbValue)) return undefined;
    return colItemId(kbCol, kbValue);
  });
  function isKbActive(colIndex: number, node: CascaderNode): boolean {
    return !searchActive && kbCol === colIndex && kbValue === node.value;
  }

  // --- 多选：合并树（含异步缓存）转 core TreeNodeData（以 value 为 key），跑 conduct ---
  function toTreeData(nodes: CascaderNode[]): TreeNodeData[] {
    return nodes.map((n) => {
      const kids = childrenOf(n);
      const td: TreeNodeData = { key: n.value, label: n.label };
      if (n.disabled) td.disabled = true;
      if (kids && kids.length > 0) td.children = toTreeData(kids);
      return td;
    });
  }
  const mergedTreeData = $derived(toTreeData(normalizedTreeData));

  // --- filterable：扁平路径列表 + 搜索过滤 ---
  let searchValue = $state('');
  const trimmedSearch = $derived(searchValue.trim());
  const searchActive = $derived(isFilterable && trimmedSearch.length > 0);

  // onSearch 回调：搜索值变化时触发
  $effect(() => {
    if (isFilterable && trimmedSearch) {
      onSearch?.(trimmedSearch);
    }
  });

  interface FlatPath {
    values: Key[];
    labels: string[];
    nodes: CascaderNode[];
    isLeaf: boolean;
    disabled: boolean;
  }
  // 收集所有可选路径：叶子路径；filterLeafOnly=false 或 changeOnSelect 时含非叶子路径。
  // （含非叶子时由 filteredPaths 按 filterLeafOnly 再裁剪。）
  const flatPaths = $derived.by<FlatPath[]>(() => {
    const out: FlatPath[] = [];
    const walk = (
      nodes: CascaderNode[],
      vals: Key[],
      labels: string[],
      chain: CascaderNode[],
      parentDisabled: boolean,
    ) => {
      for (const n of nodes) {
        const kids = childrenOf(n);
        const isLeaf = !kids || kids.length === 0;
        const nv = [...vals, n.value];
        const nl = [...labels, n.label];
        const nc = [...chain, n];
        const dis = disableStrictly ? !!n.disabled : (parentDisabled || !!n.disabled);
        if (isLeaf || changeOnSelect || !filterLeafOnly)
          out.push({ values: nv, labels: nl, nodes: nc, isLeaf, disabled: dis });
        if (!isLeaf) walk(kids, nv, nl, nc, dis);
      }
    };
    walk(normalizedTreeData, [], [], [], false);
    return out;
  });

  const filteredPaths = $derived.by<FlatPath[]>(() => {
    if (!searchActive) return [];
    if (remote) return flatPaths; // remote: 显示全部，onSearch 负责外部更新
    const spec = filterSpec;
    if (spec === false) return [];
    let results: FlatPath[];
    if (typeof spec === 'function') {
      results = flatPaths.filter((p) => spec(trimmedSearch, p));
    } else {
      const lower = trimmedSearch.toLowerCase();
      results = flatPaths.filter((p) => {
        if (filterLeafOnly && !p.isLeaf) return false;
        // treeNodeFilterProp==='label'（默认）：按整条 label 链匹配（既有行为）。
        // 其它字段：取路径末节点（目标节点）该字段值转字符串做子串匹配。
        if (treeNodeFilterProp === 'label') {
          return p.labels.join(separator).toLowerCase().includes(lower);
        }
        const lastNode = p.nodes[p.nodes.length - 1] as unknown as Record<string, unknown>;
        const field = lastNode?.[treeNodeFilterProp];
        return field != null && String(field).toLowerCase().includes(lower);
      });
    }
    if (filterSorter) {
      results = [...results].sort((a, b) => filterSorter(a, b, trimmedSearch));
    }
    return results;
  });

  // 命中文本高亮（作用于整条 label 链字符串）
  type HlPart = { text: string; mark: boolean };
  function highlightParts(text: string): HlPart[] {
    if (!searchActive) return [{ text, mark: false }];
    const lower = text.toLowerCase();
    const term = trimmedSearch.toLowerCase();
    const parts: HlPart[] = [];
    let from = 0;
    let idx = lower.indexOf(term, from);
    while (idx !== -1) {
      if (idx > from) parts.push({ text: text.slice(from, idx), mark: false });
      parts.push({ text: text.slice(idx, idx + term.length), mark: true });
      from = idx + term.length;
      idx = lower.indexOf(term, from);
    }
    if (from < text.length) parts.push({ text: text.slice(from), mark: false });
    return parts;
  }

  // 点击扁平路径：单选选中关闭；多选切换勾选（取末端节点）
  function selectFlatPath(p: FlatPath) {
    if (p.disabled || disabled) return;
    if (multiple) {
      const leaf = p.values[p.values.length - 1] as Key;
      const nextBase = toggleCheck(mergedTreeData, checkedBase, leaf);
      const resolved = conduct(mergedTreeData, nextBase);
      const nextPaths = leafBaseToPaths(resolved.checked);
      if (exceedsMax(currentPaths.length, nextPaths.length, resolved.checked)) return;
      setPaths(nextPaths);
      searchValue = '';
    } else {
      setValue(p.values.slice());
      setOpen(false);
    }
  }

  // 多选勾选 base：把每条选中路径的叶子 value 作为显式勾选项
  function pathsToLeafBase(paths: Key[][]): Set<Key> {
    const set = new Set<Key>();
    for (const p of paths) {
      if (p.length > 0) set.add(p[p.length - 1] as Key);
    }
    return set;
  }
  const checkedBase = $derived(pathsToLeafBase(currentPaths));
  const checkState = $derived.by(() =>
    multiple
      ? conduct(mergedTreeData, checkedBase)
      : { checked: new Set<Key>(), half: new Set<Key>() },
  );

  // 选中路径链（用于多 tag 回显）。遍历合并树收集 checked 路径：
  //   leafOnly=false（默认）：仅叶子（现状不变）。
  //   leafOnly=true：完全勾选的父级折叠为父路径并停止下钻（父 tag 代表整子树）。
  const checkedLeafPaths = $derived.by<{ path: Key[]; labels: string[]; nodes: CascaderNode[] }[]>(() => {
    if (!multiple) return [];
    const out: { path: Key[]; labels: string[]; nodes: CascaderNode[] }[] = [];
    const walk = (nodes: CascaderNode[], path: Key[], labels: string[], chain: CascaderNode[]) => {
      for (const n of nodes) {
        const kids = childrenOf(n);
        const np = [...path, n.value];
        const nl = [...labels, n.label];
        const nc = [...chain, n];
        const isLeaf = !kids || kids.length === 0;
        if (isLeaf) {
          if (checkState.checked.has(n.value)) out.push({ path: np, labels: nl, nodes: nc });
        } else if (leafOnly && checkState.checked.has(n.value)) {
          // 父级完全勾选 → 折叠为父路径
          out.push({ path: np, labels: nl, nodes: nc });
        } else {
          walk(kids, np, nl, nc);
        }
      }
    };
    walk(normalizedTreeData, [], [], []);
    return out;
  });

  // maxTagCount 折叠：显示前 N 个 tag + 隐藏数（仅影响显示，不改 value，红线 #1/#2）。
  const visibleTagPaths = $derived(
    maxTagCount !== undefined && maxTagCount >= 0
      ? checkedLeafPaths.slice(0, maxTagCount)
      : checkedLeafPaths,
  );
  const hiddenTagCount = $derived(
    maxTagCount !== undefined && maxTagCount >= 0
      ? Math.max(0, checkedLeafPaths.length - maxTagCount)
      : 0,
  );
  // 折叠隐藏的剩余项（showRestTagsPopover 时在 +N 浮层内列出，与可见 tag 相同的 label 取法）。
  const hiddenTagPaths = $derived(
    maxTagCount !== undefined && maxTagCount >= 0
      ? checkedLeafPaths.slice(maxTagCount)
      : [],
  );

  // clearable / showClear 别名归一（showClear prop 优先 clearable）
  const effClearable = $derived(showClearProp ?? clearable ?? false);
  // expandIcon / arrowIcon 别名归一
  const effExpandIcon = $derived(expandIcon ?? arrowIcon);

  const selectedChain = $derived(findPath(normalizedTreeData, currentValue));
  const displayLabel = $derived(renderPath(selectedChain.map((n) => n.label), selectedChain));
  const hasSelection = $derived(
    multiple ? checkedLeafPaths.length > 0 : selectedChain.length > 0,
  );
  const showClear = $derived(effClearable && !disabled && hasSelection);

  // 单条路径回显文本：有 displayRender 走自定义（仍传 label 链 + 节点链）；
  // 否则按 displayProp 取 label 或 value 链，用 separator 连接。
  // 多选每个 tag 与单选回显共用此逻辑。
  function renderPath(labels: string[], nodes: CascaderNode[]): string {
    if (displayRender) return displayRender(labels, nodes);
    const fields = displayProp === 'value' ? nodes.map((n) => String(n.value)) : labels;
    return fields.join(separator);
  }

  function setValue(next: Key[]) {
    if (!isValueControlled) innerValue = next;
    // onChangeWithObject=true：回传选中路径上每个节点的完整对象链，而非 value 数组。
    if (onChangeWithObject) {
      onChange?.(findPath(normalizedTreeData, next));
    } else {
      onChange?.(next);
    }
  }

  // 多选：由 conduct 解析后的 checked 全集生成多条路径回调。
  //   autoMergeValue=true（默认）：选中父节点时 value 不包含后代。
  //   autoMergeValue=false：包含父节点 AND 所有后代路径。
  //   leafOnly=true：完全勾选的父级折叠为父路径并停止下钻。
  function leafBaseToPaths(checkedSet: Set<Key>): Key[][] {
    const out: Key[][] = [];
    const walk = (nodes: CascaderNode[], path: Key[]) => {
      for (const n of nodes) {
        const kids = childrenOf(n);
        const np = [...path, n.value];
        const isLeaf = !kids || kids.length === 0;
        if (isLeaf) {
          if (checkedSet.has(n.value)) out.push(np);
        } else if (autoMergeValue && checkedSet.has(n.value)) {
          // 父级完全勾选，不展开后代（合并）
          out.push(np);
        } else if (!autoMergeValue && checkedSet.has(n.value)) {
          // 包含父节点 + 继续下钻后代
          out.push(np);
          walk(kids ?? [], np);
        } else if (leafOnly && checkedSet.has(n.value)) {
          out.push(np);
        } else {
          walk(kids ?? [], np);
        }
      }
    };
    walk(normalizedTreeData, []);
    return out;
  }

  function setPaths(nextPaths: Key[][]) {
    if (!isValueControlled) innerPaths = nextPaths;
    // onChangeWithObject=true：每条选中路径回传其完整节点链（CascaderNode[]），而非 value 链。
    if (onChangeWithObject) {
      onChange?.(nextPaths.map((p) => findPath(normalizedTreeData, p)));
    } else {
      onChange?.(nextPaths);
    }
  }

  // 由 value 集合收集对应节点对象（用于 onExceed 回调）。
  function nodesForKeys(keys: Set<Key>): CascaderNode[] {
    const out: CascaderNode[] = [];
    const walk = (nodes: CascaderNode[]) => {
      for (const n of nodes) {
        if (keys.has(n.value)) out.push(n);
        const kids = childrenOf(n);
        if (kids && kids.length > 0) walk(kids);
      }
    };
    walk(normalizedTreeData);
    return out;
  }

  // max 数量上限（对齐 Semi）：仅在「增加勾选」且结果超出 max 时拦截并调 onExceed；
  // 减少勾选始终放行。prevSize/nextSize 为归一后的对外 value 计数（related=已解析集，
  // unRelated=显式勾选集），保持与 Semi「resolved/checked size」一致。
  function exceedsMax(prevSize: number, nextSize: number, nextKeys: Set<Key>): boolean {
    if (max === undefined || max < 0) return false;
    if (nextSize > prevSize && nextSize > max) {
      onExceed?.(nodesForKeys(nextKeys));
      return true;
    }
    return false;
  }

  // 切换某节点勾选（支持 related/unRelated 两种模式）
  function toggleCheckNode(node: CascaderNode) {
    if (node.disabled || disabled) return;
    if (isUnRelated) {
      // unRelated: 独立切换，不联动父子
      const nextPaths = currentPaths.slice();
      const nodeVal = node.value;
      const idx = nextPaths.findIndex((p) => p.length > 0 && p[p.length - 1] === nodeVal);
      if (idx >= 0) {
        nextPaths.splice(idx, 1);
      } else {
        // 从 activePath 构建完整路径
        const colIdx = activePath.indexOf(nodeVal);
        if (colIdx >= 0) {
          nextPaths.push(activePath.slice(0, colIdx + 1));
        } else {
          nextPaths.push([nodeVal]);
        }
      }
      const nextKeys = pathsToLeafBase(nextPaths);
      if (exceedsMax(currentPaths.length, nextPaths.length, nextKeys)) return;
      setPaths(nextPaths);
      return;
    }
    const nextBase = toggleCheck(mergedTreeData, checkedBase, node.value);
    const resolved = conduct(mergedTreeData, nextBase);
    const nextPaths = leafBaseToPaths(resolved.checked);
    if (exceedsMax(currentPaths.length, nextPaths.length, resolved.checked)) return;
    setPaths(nextPaths);
  }

  // 移除某 tag（按叶子 value 取消勾选，联动祖先半选更新）
  function removeLeaf(leafValue: Key) {
    if (disabled) return;
    if (isUnRelated) {
      const nextPaths = currentPaths.filter((p) => p.length === 0 || p[p.length - 1] !== leafValue);
      setPaths(nextPaths);
      return;
    }
    const nextBase = new Set(checkedBase);
    nextBase.delete(leafValue);
    const resolved = conduct(mergedTreeData, nextBase);
    setPaths(leafBaseToPaths(resolved.checked));
  }

  function nodeCheck(node: CascaderNode): { checked: boolean; half: boolean } {
    if (isUnRelated) {
      const checked = currentPaths.some((p) => p.length > 0 && p[p.length - 1] === node.value);
      return { checked, half: false };
    }
    return {
      checked: checkState.checked.has(node.value),
      half: !checkState.checked.has(node.value) && checkState.half.has(node.value),
    };
  }

  function setOpen(next: boolean) {
    if (next === isOpen) return;
    if (!next) searchValue = '';
    if (!isOpenControlled) innerOpen = next;
    onOpenChange?.(next);
    onDropdownVisibleChange?.(next);
    if (next) {
      // 打开时同步 activePath 到当前选中路径
      activePath = currentValue.slice();
      // 复位键盘高亮（首次方向键再起步）。
      kbCol = 0;
      kbValue = null;
      kbFlatIndex = -1;
    } else {
      kbCol = 0;
      kbValue = null;
      kbFlatIndex = -1;
    }
  }

  function toggleOpen() {
    if (disabled) return;
    setOpen(!isOpen);
  }

  // --- 命令式 Methods（经 bind:this 组件实例调用）---
  // 复用现成 setOpen（尊重受控/非受控 + onOpenChange/onDropdownVisibleChange 副作用）。
  /** 打开下拉面板。 */
  export function open() {
    setOpen(true);
  }
  /** 关闭下拉面板。 */
  export function close() {
    setOpen(false);
  }
  /** 聚焦触发器可聚焦元素（消费 preventScroll）。 */
  export function focus() {
    (triggerEl ?? rootEl)?.focus({ preventScroll });
  }
  /** 触发器失焦。 */
  export function blur() {
    (triggerEl ?? rootEl)?.blur();
  }
  /** 以编程方式设置搜索值并触发搜索流程（等价用户在搜索框输入）。 */
  export function search(value: string) {
    searchValue = value;
  }

  function isActiveAt(colIndex: number, node: CascaderNode): boolean {
    return activePath[colIndex] === node.value;
  }

  function isSelectedLeaf(colIndex: number, node: CascaderNode): boolean {
    return (
      currentValue.length === colIndex + 1 &&
      currentValue[colIndex] === node.value
    );
  }

  function hasChildren(node: CascaderNode): boolean {
    const kids = childrenOf(node);
    return !!kids && kids.length > 0;
  }

  // 节点是否可展开：已有子节点，或非叶子且配置了 loadData（可异步加载）。
  function canExpand(node: CascaderNode): boolean {
    if (hasChildren(node)) return true;
    return !node.isLeaf && loadData !== undefined;
  }

  function isLoading(node: CascaderNode): boolean {
    return loadingKeys.has(node.value);
  }

  // 异步加载子节点：标记 loading → await loadData → 缓存结果 → 清 loading。
  async function loadChildren(node: CascaderNode): Promise<boolean> {
    if (!loadData || loadingKeys.has(node.value)) return false;
    loadingKeys.add(node.value);
    try {
      const kids = await loadData(node);
      extraChildren.set(node.value, kids);
      onLoad?.(Array.from(extraChildren.keys()), node);
      return kids.length > 0;
    } catch {
      return false;
    } finally {
      loadingKeys.delete(node.value);
    }
  }

  function selectNode(colIndex: number, node: CascaderNode) {
    if (node.disabled || disabled) return;
    const nextPath = activePath.slice(0, colIndex);
    nextPath.push(node.value);
    activePath = nextPath;

    // 多选：非叶子展开列 / 异步加载；叶子切换勾选且不关面板
    if (multiple) {
      if (hasChildren(node)) {
        return;
      }
      if (!node.isLeaf && loadData) {
        void loadChildren(node);
        return;
      }
      // enableLeafClick: 只有 true 时叶子点击触发勾选
      if (enableLeafClick || !node.isLeaf) {
        toggleCheckNode(node);
      }
      return;
    }

    // clickToSelect：点击任意节点（含非叶子）立即选中
    if (clickToSelect) {
      setValue(nextPath.slice());
      onSelect?.(node.value);
      if (!hasChildren(node)) setOpen(false);
      return;
    }

    // changeOnSelect 完整语义（单选）：点击任一层级（含中间非叶子）立即提交
    // 从根到该节点的路径并触发 onChange。非叶子同时展开其子列且不关闭面板
    // （让用户「停在任意层级」或继续深入）；叶子提交并关闭。
    if (hasChildren(node)) {
      // 非叶子: 展开下一列；changeOnSelect 时同时提交当前路径、保持面板
      if (changeOnSelect) setValue(nextPath.slice());
    } else if (!node.isLeaf && loadData) {
      // 可异步加载的非叶子：changeOnSelect 时先提交本路径，再加载子节点
      // （加载完成后子节点经 extraChildren 进列，activePath 已指向本节点）。
      if (changeOnSelect) setValue(nextPath.slice());
      void loadChildren(node);
    } else {
      // 叶子: 提交完整路径并关闭
      setValue(nextPath.slice());
      onSelect?.(node.value);
      setOpen(false);
    }
  }

  // effectiveExpandTrigger='hover'：悬停非叶子（或可异步加载）节点即展开其子级列。
  // 仅设 activePath + 触发 loadData，不做选中（选中仍走 click）。
  function hoverExpand(colIndex: number, node: CascaderNode) {
    if (effectiveExpandTrigger !== 'hover' || disabled || node.disabled) return;
    if (!canExpand(node)) return;
    const nextPath = activePath.slice(0, colIndex);
    nextPath.push(node.value);
    activePath = nextPath;
    if (!hasChildren(node) && !node.isLeaf && loadData) {
      void loadChildren(node);
    }
  }

  // hover 展开延迟：enter 延迟 mouseEnterDelay 后展开；leave 清除 pending enter
  // 定时器（延迟 mouseLeaveDelay），避免鼠标划过瞬间抖动展开。timer 用普通变量。
  let hoverTimer: ReturnType<typeof setTimeout> | undefined;
  function clearHoverTimer() {
    if (hoverTimer !== undefined) {
      clearTimeout(hoverTimer);
      hoverTimer = undefined;
    }
  }
  function scheduleHoverExpand(colIndex: number, node: CascaderNode) {
    if (effectiveExpandTrigger !== 'hover') return;
    clearHoverTimer();
    hoverTimer = setTimeout(() => {
      hoverTimer = undefined;
      hoverExpand(colIndex, node);
    }, mouseEnterDelay);
  }
  function scheduleHoverLeave() {
    if (effectiveExpandTrigger !== 'hover') return;
    // 移出：仅清除 pending 的 enter 展开（延迟 mouseLeaveDelay），不主动收起已展开列。
    if (hoverTimer === undefined) return;
    const pending = hoverTimer;
    hoverTimer = undefined;
    setTimeout(() => clearTimeout(pending), mouseLeaveDelay);
  }
  $effect(() => () => clearHoverTimer());

  function clearAll(e: MouseEvent) {
    e.stopPropagation();
    if (disabled) return;
    if (multiple) {
      setPaths([]);
    } else {
      setValue([]);
    }
    activePath = [];
    onClear?.();
  }

  // --- 键盘 roving 导航（aria-activedescendant 模型）---
  // 列内 ↑↓ 移动、→ 进下一列、← 回上一列、Home/End 跳列首尾；
  // Enter 在叶子（或 changeOnSelect 任意级）确认，多选 Space 切换勾选；焦点留触发器。
  function colNodes(colIndex: number): CascaderNode[] {
    return columns[colIndex] ?? [];
  }
  function indexInCol(colIndex: number, value: Key | null): number {
    if (value === null) return -1;
    return colNodes(colIndex).findIndex((n) => n.value === value);
  }
  function moveInCol(colIndex: number, intent: 'prev' | 'next' | 'first' | 'last') {
    const nodes = colNodes(colIndex);
    if (nodes.length === 0) return;
    let i = nextRovingIndex(indexInCol(colIndex, kbValue), nodes.length, intent);
    // 跳过禁用项，朝移动方向继续。
    const step = intent === 'prev' || intent === 'last' ? -1 : 1;
    while (i >= 0 && i < nodes.length && (nodes[i] as CascaderNode).disabled) i += step;
    if (i < 0 || i >= nodes.length) return;
    kbCol = colIndex;
    kbValue = (nodes[i] as CascaderNode).value;
  }
  // 进入某列：高亮该列首个未禁用项（若该列已有 activePath 选中项则高亮它）。
  function enterCol(colIndex: number) {
    const nodes = colNodes(colIndex);
    if (nodes.length === 0) return;
    kbCol = colIndex;
    const fromPath = activePath[colIndex];
    if (fromPath !== undefined && nodes.some((n) => n.value === fromPath)) {
      kbValue = fromPath;
    } else {
      kbValue = null;
      moveInCol(colIndex, 'first');
    }
  }
  function kbCurrentNode(): CascaderNode | undefined {
    return colNodes(kbCol).find((n) => n.value === kbValue);
  }

  function onFlatKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      setOpen(false);
      return;
    }
    const count = filteredPaths.length;
    if (count === 0) return;
    const intent = rovingKeyFromEvent(e.key);
    if (intent === 'prev' || intent === 'next' || intent === 'first' || intent === 'last') {
      e.preventDefault();
      let i = nextRovingIndex(kbFlatIndex, count, intent);
      const step = intent === 'prev' || intent === 'last' ? -1 : 1;
      while (i >= 0 && i < count && (filteredPaths[i] as FlatPath).disabled) i += step;
      if (i >= 0 && i < count) kbFlatIndex = i;
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (kbFlatIndex >= 0 && kbFlatIndex < count) selectFlatPath(filteredPaths[kbFlatIndex] as FlatPath);
    }
  }

  function onPanelKeydown(e: KeyboardEvent) {
    if (disabled) return;
    if (e.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (searchActive) {
      onFlatKeydown(e);
      return;
    }
    // 列模式：首次方向键从首列首项起步。
    if (kbValue === null && rovingKeyFromEvent(e.key)) {
      e.preventDefault();
      enterCol(0);
      return;
    }
    const node = kbCurrentNode();
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        moveInCol(kbCol, 'prev');
        break;
      case 'ArrowDown':
        e.preventDefault();
        moveInCol(kbCol, 'next');
        break;
      case 'Home':
        e.preventDefault();
        moveInCol(kbCol, 'first');
        break;
      case 'End':
        e.preventDefault();
        moveInCol(kbCol, 'last');
        break;
      case 'ArrowRight':
        e.preventDefault();
        // 展开高亮节点的下一列并进入它。
        if (node && canExpand(node)) {
          selectNode(kbCol, node);
          enterCol(kbCol + 1);
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (kbCol > 0) enterCol(kbCol - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (node) selectNode(kbCol, node);
        break;
      case ' ':
        e.preventDefault();
        if (node) {
          if (multiple) toggleCheckNode(node);
          else selectNode(kbCol, node);
        }
        break;
      default:
        break;
    }
  }

  // --- DOM 引用：触发根 + portal 面板（定位由 use:floating action 接管）---
  let rootEl = $state<HTMLDivElement | null>(null);
  let panelEl = $state<HTMLDivElement | null>(null);
  // 触发器可聚焦元素（combobox div / 自定义 triggerRender 时回退 rootEl）
  let triggerEl = $state<HTMLDivElement | null>(null);

  // --- destroyOnClose：默认 false 时首开后保留浮层 DOM（仅 --hidden 切显隐），
  //     true 时关闭即从 DOM 卸载（{#if shouldRender}），重开重建。 ---
  let hasBeenOpened = $state(false);
  $effect(() => {
    if (isOpen) hasBeenOpened = true;
  });
  const shouldRender = $derived(destroyOnClose ? isOpen : isOpen || hasBeenOpened);

  // 空态文本（emptyContent 为 string 时用，Snippet 时模板直接渲染）。
  const emptyText = $derived(
    typeof emptyContent === 'string' ? emptyContent : loc().t('Cascader.emptyText'),
  );
  const isEmptySnippet = $derived(typeof emptyContent === 'function');

  // --- useDismiss (红线 #3): panel portal 出 root 子树后列入 extraTargets ---
  $effect(() => {
    if (!isOpen || !rootEl) return;
    return useDismiss(rootEl, {
      onDismiss: () => setOpen(false),
      escape: true,
      outsideClick: true,
      extraTargets: [panelEl],
    });
  });

  const cls = $derived(
    [
      'cd-cascader',
      `cd-cascader--${size}`,
      `cd-cascader--${status}`,
      disabled && 'cd-cascader--disabled',
      isOpen && 'cd-cascader--open',
      position && `cd-cascader--${position}`,
      borderless && 'cd-cascader--borderless',
      motion === false && 'cd-cascader--no-motion',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );
</script>

<div class={cls} bind:this={rootEl} {style}>
  <!-- combobox 容器用 div 以合法承载多选 tags / clear 等内部交互元素 -->
  {#if triggerRender}
    {@render triggerRender({ value, placeholder, isOpen, disabled })}
  {:else}
  <div
    bind:this={triggerEl}
    class="cd-cascader__trigger"
    role="combobox"
    aria-haspopup="listbox"
    aria-expanded={isOpen}
    aria-controls={listId}
    aria-activedescendant={isOpen && !searchActive ? activeDescId : undefined}
    aria-label={ariaLabel}
    aria-invalid={status === 'error' || undefined}
    aria-disabled={disabled || undefined}
    tabindex={disabled ? -1 : 0}
    onclick={toggleOpen}
    onfocus={(e) => onFocus?.(e as unknown as MouseEvent)}
    onblur={(e) => onBlur?.(e as unknown as MouseEvent)}
    onkeydown={(e) => {
      if (disabled) return;
      if (!isOpen) {
        // 关闭态：Enter/Space/Down 打开浮层。
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
          e.preventDefault();
          setOpen(true);
        }
        return;
      }
      // 打开态：搜索激活时由搜索框处理 roving，焦点不在触发器；
      // 否则触发器（焦点宿主）驱动列 roving（aria-activedescendant 模型）。
      if (!searchActive) onPanelKeydown(e);
      else if (e.key === 'Escape') setOpen(false);
    }}
  >
    {#if prefix}
      <span class="cd-cascader__prefix" aria-hidden="true">
        {#if typeof prefix === 'string'}{prefix}{:else}{@render (prefix as Snippet)()}{/if}
      </span>
    {/if}

    {#if insetLabel}
      <span class="cd-cascader__inset-label" id={insetLabelId}>
        {#if typeof insetLabel === 'string'}{insetLabel}{:else}{@render (insetLabel as Snippet)()}{/if}
      </span>
    {/if}

    <span class="cd-cascader__content">
      {#if multiple}
        {#if checkedLeafPaths.length > 0}
          <span class="cd-cascader__tags">
            {#each visibleTagPaths as leaf (leaf.path.join('/'))}
              <Tag
                size={size === 'large' ? 'default' : 'small'}
                closable={!disabled}
                onClose={() => removeLeaf(leaf.path[leaf.path.length - 1] as Key)}
              >
                {renderPath(leaf.labels, leaf.nodes)}
              </Tag>
            {/each}
            {#if hiddenTagCount > 0}
              {#if showRestTagsPopover}
                <Popover trigger="hover" position="top" {...(restTagsPopoverProps ?? {})}>
                  <span
                    class="cd-cascader__rest-tags-trigger"
                    aria-label={loc().t('Cascader.restTagsCount', { count: hiddenTagCount })}
                  >
                    <Tag size={size === 'large' ? 'default' : 'small'}>+{hiddenTagCount}</Tag>
                  </span>
                  {#snippet contentSlot()}
                    <div class="cd-cascader__rest-tags">
                      {#each hiddenTagPaths as leaf (leaf.path.join('/'))}
                        <Tag
                          size={size === 'large' ? 'default' : 'small'}
                          closable={!disabled}
                          onClose={() => removeLeaf(leaf.path[leaf.path.length - 1] as Key)}
                        >
                          {renderPath(leaf.labels, leaf.nodes)}
                        </Tag>
                      {/each}
                    </div>
                  {/snippet}
                </Popover>
              {:else}
                <Tag size={size === 'large' ? 'default' : 'small'}>+{hiddenTagCount}</Tag>
              {/if}
            {/if}
          </span>
        {:else}
          <span class="cd-cascader__placeholder">{placeholder}</span>
        {/if}
      {:else if hasSelection}
        <span class="cd-cascader__value">{displayLabel}</span>
      {:else}
        <span class="cd-cascader__placeholder">{placeholder}</span>
      {/if}
    </span>

    {#if suffix}
      <span class="cd-cascader__suffix" aria-hidden="true">
        {#if typeof suffix === 'string'}{suffix}{:else}{@render (suffix as Snippet)()}{/if}
      </span>
    {/if}

    {#if showClear}
      <span
        class="cd-cascader__clear"
        role="button"
        tabindex="-1"
        aria-label={loc().t('Cascader.clear')}
        onclick={clearAll}
        onkeydown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            clearAll(e as unknown as MouseEvent);
          }
        }}
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
      </span>
    {/if}

    <span class="cd-cascader__arrow" aria-hidden="true">
      {#if effExpandIcon}
        {@render effExpandIcon()}
      {:else}
        <svg viewBox="0 0 16 16" width="12" height="12" focusable="false">
          <path fill="currentColor" d="M3.5 6 8 10.5 12.5 6l-1-1L8 8.5 4.5 5l-1 1Z" />
        </svg>
      {/if}
    </span>
  </div>
  {/if}

  {#if shouldRender}
    <div
      class={['cd-cascader__panel', dropdownClassName].filter(Boolean).join(' ')}
      class:cd-cascader__panel--hidden={!isOpen}
      bind:this={panelEl}
      use:floating={{
        trigger: rootEl,
        placement: 'bottomStart',
        autoAdjust: autoAdjustOverflow,
        offset: dropdownOffset,
        getContainer: resolvePopupContainer,
        open: isOpen,
      }}
      id={listId}
      style={dropdownStyleStr}
    >
      {#if topSlot}{@render topSlot()}{/if}

      {#if showBuiltinSearch}
        <div class="cd-cascader__search">
          <input
            class="cd-cascader__search-input"
            type="text"
            role="combobox"
            aria-expanded={searchActive}
            aria-controls={flatListId}
            aria-activedescendant={searchActive ? activeDescId : undefined}
            placeholder={loc().t('Cascader.searchPlaceholder')}
            aria-label={loc().t('Cascader.searchPlaceholder')}
            bind:value={searchValue}
            onkeydown={onFlatKeydown}
          />
        </div>
      {/if}
      {#if searchActive}
        <!-- 单条搜索结果项：virtualize 与非 virtualize 两路共用同一渲染，行为一致 -->
        {#snippet flatOption(p: FlatPath, fi: number)}
          <!-- 键盘经搜索框 aria-activedescendant 漫游管理，选项 tabindex=-1 click-only -->
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <li
            id={flatItemId(p.values)}
            class="cd-cascader__option cd-cascader__flat-option"
            class:cd-cascader__option--active={kbFlatIndex === fi}
            role="option"
            aria-selected={kbFlatIndex === fi}
            aria-disabled={p.disabled || undefined}
            onclick={() => selectFlatPath(p)}
            tabindex={-1}
          >
            {#if filterRender}
              {@render filterRender({ path: p })}
            {:else}
              <span class="cd-cascader__option-label">
                {#each highlightParts(p.labels.join(separator)) as part, i (i)}
                  {#if part.mark}<mark class="cd-cascader__highlight">{part.text}</mark>{:else}{part.text}{/if}
                {/each}
              </span>
            {/if}
          </li>
        {/snippet}
        {#if virtualizeInSearch && filteredPaths.length > 0}
          <!-- 搜索结果虚拟滚动：仅在传入 virtualizeInSearch 且有命中时启用 -->
          <div
            class="cd-cascader__flat cd-cascader__flat--virtual"
            role="listbox"
            id={flatListId}
            aria-label={loc().t('Cascader.searchResults')}
            style:inline-size="{virtualizeInSearch.width}px"
          >
            <VirtualList
              data={filteredPaths}
              getKey={(p: FlatPath) => p.values.join('/')}
              itemSize={virtualizeInSearch.itemSize}
              height={virtualizeInSearch.height}
            >
              {#snippet renderItem(p: FlatPath, fi: number)}
                {@render flatOption(p, fi)}
              {/snippet}
            </VirtualList>
          </div>
        {:else}
          <ul
            class="cd-cascader__flat"
            role="listbox"
            id={flatListId}
            aria-label={loc().t('Cascader.searchResults')}
          >
            {#if filteredPaths.length === 0}
              {#if isEmptySnippet}
                <li class="cd-cascader__empty">{@render (emptyContent as Snippet)()}</li>
              {:else}
                <li class="cd-cascader__empty">{emptyText}</li>
              {/if}
            {:else}
              {#each filteredPaths as p, fi (p.values.join('/'))}
                {@render flatOption(p, fi)}
              {/each}
            {/if}
          </ul>
        {/if}
      {:else}
      <div class="cd-cascader__columns">
      {#each columns as column, colIndex (colIndex)}
        <ul
          class="cd-cascader__column"
          role="listbox"
          aria-label={loc().t('Cascader.columnLabel', { level: colIndex + 1 })}
          style:inline-size="{resolveColumnWidth(columnWidth, colIndex, 180)}px"
          onscroll={(e) => onListScroll?.(e, {
            panelIndex: colIndex,
            activeNode: columns[colIndex]?.find((n) => isActiveAt(colIndex, n)) ?? null,
          })}
        >
          {#if column.length === 0}
            {#if isEmptySnippet}
              <li class="cd-cascader__empty">{@render (emptyContent as Snippet)()}</li>
            {:else}
              <li class="cd-cascader__empty">{emptyText}</li>
            {/if}
          {/if}
          {#each column as node (node.value)}
            <!-- 键盘经触发器 aria-activedescendant 漫游管理，选项 tabindex=-1 click-only -->
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <li
              id={colItemId(colIndex, node.value)}
              class="cd-cascader__option"
              class:cd-cascader__option--active={isActiveAt(colIndex, node)}
              class:cd-cascader__option--kbactive={isKbActive(colIndex, node)}
              class:cd-cascader__option--selected={isSelectedLeaf(colIndex, node)}
              role="option"
              aria-selected={isActiveAt(colIndex, node)}
              aria-disabled={node.disabled || undefined}
              onclick={() => selectNode(colIndex, node)}
              onpointerenter={() => scheduleHoverExpand(colIndex, node)}
              onpointerleave={scheduleHoverLeave}
              tabindex={-1}
            >
              {#if multiple}
                {@const cs = nodeCheck(node)}
                <span
                  class="cd-cascader__checkbox"
                  class:cd-cascader__checkbox--checked={cs.checked}
                  class:cd-cascader__checkbox--half={cs.half}
                  role="button"
                  tabindex="-1"
                  aria-hidden="true"
                  onclick={(e) => {
                    e.stopPropagation();
                    toggleCheckNode(node);
                  }}
                >
                  {#if cs.checked}
                    <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" focusable="false">
                      <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M3.5 8.5l3 3 6-6.5" />
                    </svg>
                  {:else if cs.half}
                    <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" focusable="false">
                      <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M4 8h8" />
                    </svg>
                  {/if}
                </span>
              {/if}
              <span class="cd-cascader__option-label">{node.label}</span>
              {#if isLoading(node)}
                <span class="cd-cascader__option-loading" aria-label={loc().t('Cascader.loading')}></span>
              {:else if canExpand(node)}
                <span class="cd-cascader__option-expand" aria-hidden="true">
                  {#if expandIcon}{@render expandIcon()}{:else}›{/if}
                </span>
              {/if}
            </li>
          {/each}
        </ul>
      {/each}
      </div>
      {/if}

      {#if bottomSlot}{@render bottomSlot()}{/if}
    </div>
  {/if}
</div>

<style>
  .cd-cascader {
    position: relative;
    display: inline-flex;
    inline-size: 100%;
    font-size: var(--cd-select-font-size);
  }
  .cd-cascader__trigger {
    display: flex;
    align-items: center;
    gap: var(--cd-spacing-tight);
    inline-size: 100%;
    min-block-size: var(--cd-select-height-default);
    padding-inline: var(--cd-select-padding-x);
    background: var(--cd-select-bg);
    border: 1px solid var(--cd-select-border);
    border-radius: var(--cd-select-radius);
    color: inherit;
    font: inherit;
    text-align: start;
    cursor: pointer;
    transition:
      border-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard),
      background-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-cascader--small .cd-cascader__trigger {
    min-block-size: var(--cd-select-height-small);
  }
  .cd-cascader--large .cd-cascader__trigger {
    min-block-size: var(--cd-select-height-large);
  }
  /* 对齐 Semi 填充式：悬浮加深底色（非展开/禁用态） */
  .cd-cascader:not(.cd-cascader--open):not(.cd-cascader--disabled) .cd-cascader__trigger:hover {
    background: var(--cd-select-bg-hover);
  }
  .cd-cascader__trigger:focus-visible {
    outline: none;
    background: var(--cd-select-bg);
    border-color: var(--cd-select-border-active);
    box-shadow: var(--cd-focus-ring);
  }
  .cd-cascader--open .cd-cascader__trigger {
    background: var(--cd-select-bg);
    border-color: var(--cd-select-border-active);
  }
  .cd-cascader--error .cd-cascader__trigger {
    border-color: var(--cd-select-border-error);
  }
  .cd-cascader__trigger[aria-disabled='true'] {
    background: var(--cd-color-disabled-fill, var(--cd-color-fill-0));
    color: var(--cd-color-text-3);
    cursor: not-allowed;
  }
  .cd-cascader__content {
    display: flex;
    flex: 1 1 auto;
    align-items: center;
    min-inline-size: 0;
  }
  .cd-cascader__value {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .cd-cascader__placeholder {
    color: var(--cd-input-color-placeholder);
  }
  .cd-cascader__clear,
  .cd-cascader__arrow {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    color: var(--cd-color-cascader-icon-default);
  }
  .cd-cascader__clear {
    cursor: pointer;
  }
  .cd-cascader__clear:hover {
    color: var(--cd-color-text-0);
  }
  .cd-cascader__arrow {
    transition: transform var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-cascader--open .cd-cascader__arrow {
    transform: rotate(180deg);
  }
  /* 面板 portal 到 body，由 JS 写 position:fixed + transform 定位 */
  .cd-cascader__panel {
    z-index: var(--cd-select-dropdown-z);
    display: flex;
    flex-direction: column;
    padding: 0;
    background: var(--cd-select-dropdown-bg);
    border-radius: var(--cd-select-dropdown-radius);
    box-shadow: var(--cd-select-dropdown-shadow);
  }
  /* destroyOnClose=false 关闭后保留 DOM 但不可见、不可交互、不占位 */
  .cd-cascader__panel--hidden {
    display: none;
  }
  /* 级联列容器：横向排列各列 */
  .cd-cascader__columns {
    display: flex;
    max-block-size: 16rem;
  }
  .cd-cascader__search {
    padding: var(--cd-spacing-extra-tight) var(--cd-spacing-tight);
    border-block-end: 1px solid var(--cd-cascader-column-border);
  }
  .cd-cascader__search-input {
    inline-size: 100%;
    block-size: var(--cd-height-input-small);
    padding-inline: var(--cd-input-padding-x);
    background: var(--cd-input-color-bg);
    color: inherit;
    border: 1px solid var(--cd-input-border);
    border-radius: var(--cd-input-radius);
    font: inherit;
    font-size: var(--cd-font-size-small);
  }
  .cd-cascader__search-input:focus-visible {
    outline: none;
    border-color: var(--cd-input-border-active);
    box-shadow: var(--cd-focus-ring);
  }
  /* 搜索结果：扁平路径列表（单列纵向滚动） */
  .cd-cascader__flat {
    margin: 0;
    padding-block: var(--cd-spacing-extra-tight);
    padding-inline: 0;
    list-style: none;
    max-block-size: 16rem;
    min-inline-size: var(--cd-cascader-column-width);
    overflow-y: auto;
  }
  .cd-cascader__flat-option {
    justify-content: flex-start;
  }
  .cd-cascader__empty {
    padding: var(--cd-tree-node-padding-x);
    color: var(--cd-color-text-3);
    text-align: center;
  }
  .cd-cascader__highlight {
    padding: 0;
    color: var(--cd-color-cascader-select-highlight);
    background: transparent;
  }
  .cd-cascader__column {
    margin: 0;
    padding-block: var(--cd-spacing-extra-tight);
    padding-inline: 0;
    list-style: none;
    overflow-y: auto;
    inline-size: var(--cd-cascader-column-width);
    border-inline-end: 1px solid var(--cd-cascader-column-border);
  }
  .cd-cascader__column:last-child {
    border-inline-end: none;
  }
  .cd-cascader__option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--cd-spacing-tight);
    block-size: var(--cd-tree-node-height);
    padding-inline: var(--cd-tree-node-padding-x);
    cursor: pointer;
  }
  .cd-cascader__option:hover {
    background: var(--cd-color-cascader-option-bg-hover);
  }
  .cd-cascader__option--active {
    background: var(--cd-color-cascader-option-bg-active);
  }
  /* 键盘 roving 高亮（aria-activedescendant 当前项），焦点环不依赖真实 DOM 焦点 */
  .cd-cascader__option--kbactive {
    box-shadow: var(--cd-focus-ring);
  }
  .cd-cascader__option--selected {
    color: var(--cd-color-cascader-option-main-text-default);
  }
  .cd-cascader__option:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-cascader__option[aria-disabled='true'] {
    color: var(--cd-color-text-3);
    cursor: not-allowed;
  }
  .cd-cascader__option-label {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    flex: 1 1 auto;
  }
  .cd-cascader__checkbox {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    inline-size: 1rem;
    block-size: 1rem;
    color: var(--cd-color-white);
    background: var(--cd-color-bg-1, #fff);
    border: 1px solid var(--cd-color-border);
    border-radius: var(--cd-border-radius-small, 3px);
    cursor: pointer;
  }
  .cd-cascader__checkbox--checked,
  .cd-cascader__checkbox--half {
    background: var(--cd-color-primary);
    border-color: var(--cd-color-primary);
  }
  .cd-cascader__tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--cd-spacing-extra-tight);
    align-items: center;
    min-inline-size: 0;
  }
  .cd-cascader__rest-tags-trigger {
    display: inline-flex;
    align-items: center;
  }
  .cd-cascader__rest-tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--cd-spacing-extra-tight);
    align-items: center;
    max-inline-size: 240px;
  }
  .cd-cascader__option-expand {
    flex: 0 0 auto;
    color: var(--cd-color-cascader-option-icon-default);
  }
  .cd-cascader__option-loading {
    flex: 0 0 auto;
    inline-size: 12px;
    block-size: 12px;
    border: 2px solid var(--cd-color-cascader-option-icon-default, currentColor);
    border-block-start-color: transparent;
    border-radius: var(--cd-border-radius-full);
    animation: cd-cascader-spin 0.7s linear infinite;
  }
  @keyframes cd-cascader-spin {
    to {
      transform: rotate(360deg);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-cascader__option-loading {
      animation: none;
    }
    .cd-cascader__trigger,
    .cd-cascader__arrow {
      transition: none;
    }
  }
  /* --- 新增样式 --- */
  .cd-cascader--borderless .cd-cascader__trigger {
    border-color: transparent;
    background: transparent;
  }
  .cd-cascader--borderless .cd-cascader__trigger:focus-visible {
    border-color: var(--cd-select-border-active);
    background: var(--cd-select-bg);
  }
  .cd-cascader--no-motion .cd-cascader__trigger,
  .cd-cascader--no-motion .cd-cascader__arrow {
    transition: none;
  }
  .cd-cascader__prefix,
  .cd-cascader__suffix {
    display: inline-flex;
    align-items: center;
    flex: 0 0 auto;
    color: var(--cd-color-cascader-prefix-suffix-text-default);
  }
  /* insetLabel：值前内嵌标签，消费 cascader label token */
  .cd-cascader__inset-label {
    display: inline-flex;
    align-items: center;
    flex: 0 0 auto;
    color: var(--cd-color-cascader-label-text-default);
    font-weight: var(--cd-font-cascader-label-fontweight);
  }
</style>
