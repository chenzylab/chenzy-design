<!--
  Tree — see specs/components/show/Tree.spec.md
  层级展示：展开/收起、单选/多选、可勾选父子联动(含半选 mixed)、内置搜索高亮。
  受控 value/checkedKeys/expandedKeys 不回写，仅 onChange/onCheck/onExpandedChange 通知。
  键盘遵循 WAI-ARIA APG Tree View（单一 tab stop + aria-activedescendant）。
  复用 @chenzy-design/core 的纯函数树算法，不重复实现。
  loadData：展开未加载的非叶子节点时异步取子节点，结果缓存进本地 SvelteMap
  并派生合并树喂给所有 core 函数（不写回受控 treeData，红线 #1）。
  showLine：层级引导线（复用 core FlatNode.isLast/ancestorIsLast，纯 CSS ├/└/竖线）。
  virtualized：大数据树虚拟滚动。直接用 core fixedRange 纯函数自建轻量 fixed 定高虚拟化
  （非复用 VirtualList 组件——其 role=list/listitem 包裹层会破坏 role=tree→treeitem 的 ARIA
  结构），保持 role=tree 容器 + 行 role=treeitem 语义不变；只渲染视口内切片。滚动监听命令式
  + rAF 节流 + cleanup（红线 #3），可见区间 $derived 纯派生（红线 #2）。键盘移动 activeKey 时
  scrollToIndex 滚到可见。a11y 取舍：aria-activedescendant 指向的行可能因虚拟化未渲染，故键盘
  移动后命令式滚动确保目标行进入视口并被渲染，保证键盘可用。
  fieldNames：自定义节点字段名（key/label/children）映射任意后端数据；派生只读标准化（红线 #1/#2），
  默认字段名时零开销直接用原 treeData，回调回传原始节点（__orig）。
  accordion：手风琴模式，同层级最多展开一个——展开某节点时用 core 的 accordionExpand 纯函数
  计算并收起其同父级 siblings（不同层级互不影响）。受控时只 onExpandedChange 回传新集不回写（红线 #1）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import {
    useId,
    flattenVisible,
    collectExpandable,
    collectExpandableToDepth,
    conduct,
    toggleCheck,
    computeFilteredKeys,
    fixedRange,
    scrollOffsetForIndex,
    computeDropPosition,
    isAncestorOrSelf,
    accordionExpand,
    type TreeKey,
    type TreeNodeData,
    type FlatNode,
    type DropPosition,
  } from '@chenzy-design/core';
  import { SvelteMap, SvelteSet } from 'svelte/reactivity';
  import { useLocale } from '../locale-provider/index.js';

  type Size = 'small' | 'default' | 'large';
  type Status = 'default' | 'warning' | 'error';

  type ChangeInfo = { value: TreeKey | TreeKey[]; node: TreeNodeData; selected: boolean };
  type CheckInfo = { checked: TreeKey[]; node: TreeNodeData; halfChecked: TreeKey[] };
  type ExpandInfo = { expanded: TreeKey[]; node: TreeNodeData; expand: boolean };
  type DropInfo = {
    dragNode: TreeNodeData;
    dropNode: TreeNodeData;
    dropPosition: DropPosition;
  };

  /** 自定义节点字段名映射（适配任意后端数据结构）。默认 key/label/children。 */
  type FieldNames = { key?: string; label?: string; children?: string };

  /** 标准节点附带原始节点引用，用于回调时回传用户原始数据。 */
  type NormalizedNode = TreeNodeData & { __orig: Record<string, unknown> };

  interface Props {
    /**
     * 树数据源。默认节点字段为 key/label/children；
     * 用 fieldNames 自定义字段名时可传任意后端结构（如 { id, name, sub }）。
     */
    treeData?: TreeNodeData[];
    /** 自定义节点字段名映射，如 { key:'id', label:'name', children:'sub' }。默认全部为标准名。 */
    fieldNames?: FieldNames;
    value?: TreeKey | TreeKey[] | null;
    defaultValue?: TreeKey | TreeKey[] | null;
    multiple?: boolean;
    checkable?: boolean;
    checkedKeys?: TreeKey[];
    defaultCheckedKeys?: TreeKey[];
    /**
     * 父子勾选是否联动。'related'（默认）：勾选父全选子、子全选则父选中、部分选中半选；
     * 'unRelated'：父子勾选互不影响，每个节点独立勾选、无半选态。
     * 与 checkStrictly 的关系：两者都旁路 conduct 联动算法，效果上 unRelated ≡ checkStrictly 的
     * 「父子状态独立」。checkRelation 是枚举（对齐 Semi 语义），checkStrictly 是 boolean；
     * 任一开启（unRelated 或 checkStrictly=true）即关闭父子联动。默认 related + checkStrictly=false 保持联动。
     */
    checkRelation?: 'related' | 'unRelated';
    checkStrictly?: boolean;
    expandedKeys?: TreeKey[];
    defaultExpandedKeys?: TreeKey[];
    defaultExpandAll?: boolean;
    /**
     * 默认展开到第 N 层（仅初始化非受控展开集时生效，1 表示展开根层使其子节点可见）。
     * 优先级低于 defaultExpandAll；与 defaultExpandedKeys 取并集。受控 expandedKeys 时忽略（红线 #1）。
     */
    expandedDepth?: number;
    /**
     * 手风琴模式：同一层级最多展开一个节点。展开某节点时自动收起其同父级（siblings）
     * 的其它已展开节点；不同层级互不影响。受控 expandedKeys 同样生效（通过 onExpandedChange
     * 回传收起 siblings 后的新展开集，不自行回写——红线 #1）。默认 false（展开行为不变）。
     */
    accordion?: boolean;
    selectable?: boolean;
    showIcon?: boolean;
    /** 显示层级连接线（父子引导线） */
    showLine?: boolean;
    /** 虚拟滚动：仅渲染视口内的可见节点行，适合大数据树（1000+ 节点）。默认 false（行为不变） */
    virtualized?: boolean;
    /** 虚拟滚动视口高度（px）。virtualized 时生效，默认 320 */
    height?: number;
    /** 虚拟滚动行高（px）。virtualized 时生效，默认取 token 行高 32 */
    itemHeight?: number;
    filterable?: boolean;
    /**
     * 自定义搜索过滤谓词。`(input, node) => boolean` 返回该节点是否命中关键词；
     * 命中节点的祖先链自动展开（沿用内置过滤行为）。传函数即开启搜索（无需再传 filterable）；
     * 不传时回退到内置「label 包含关键词（不区分大小写）」。boolean 形态等价于 filterable 开关。
     */
    filterTreeNode?: boolean | ((input: string, node: TreeNodeData) => boolean);
    blockNode?: boolean;
    disabled?: boolean;
    size?: Size;
    status?: Status;
    emptyContent?: string;
    ariaLabel?: string;
    /** 异步加载子节点：展开未加载的非叶子节点时调用，返回该节点的子节点数组 */
    loadData?: (node: TreeNodeData) => Promise<TreeNodeData[]>;
    /** 启用 HTML5 拖拽排序：节点可拖动改变层级/顺序。默认 false（行为不变） */
    draggable?: boolean;
    /** 放下时回调（受控数据，组件不内部改 treeData，由父组件按 info 重排）。 */
    onDrop?: (info: DropInfo) => void;
    onChange?: (info: ChangeInfo) => void;
    onCheck?: (info: CheckInfo) => void;
    onExpandedChange?: (info: ExpandInfo) => void;
    label?: Snippet<
      [{ node: TreeNodeData; level: number; searchValue: string; selected: boolean; checked: boolean }]
    >;
    /** 自定义节点图标（showIcon 为真时渲染在 label 前）；参数含节点与展开态 */
    icon?: Snippet<[{ node: TreeNodeData; expanded: boolean; level: number }]>;
  }

  let {
    treeData = [],
    fieldNames,
    value,
    defaultValue = null,
    multiple = false,
    checkable = false,
    checkedKeys,
    defaultCheckedKeys = [],
    checkRelation = 'related',
    checkStrictly = false,
    expandedKeys,
    defaultExpandedKeys = [],
    defaultExpandAll = false,
    expandedDepth,
    accordion = false,
    selectable = true,
    showIcon = true,
    showLine = false,
    virtualized = false,
    height = 320,
    itemHeight = 32,
    filterable = false,
    filterTreeNode,
    blockNode = false,
    disabled = false,
    size = 'default',
    status = 'default',
    emptyContent,
    ariaLabel,
    loadData,
    draggable = false,
    onDrop,
    onChange,
    onCheck,
    onExpandedChange,
    label,
    icon,
  }: Props = $props();

  const loc = useLocale();

  const baseId = useId('cd-tree-item');

  function itemId(key: TreeKey): string {
    return `${baseId}-${String(key)}`;
  }

  // --- fieldNames 字段映射：把用户自定义字段名的数据派生为标准 {key,label,children} 结构 ---
  // 默认（全标准名）时直接返回原 treeData 引用，零额外开销（红线 #3）；映射为纯 $derived（红线 #2），
  // 不写回 treeData（红线 #1）。每个标准节点附带 __orig 指向用户原始节点，回调时回传原始数据。
  const keyField = $derived(fieldNames?.key ?? 'key');
  const labelField = $derived(fieldNames?.label ?? 'label');
  const childrenField = $derived(fieldNames?.children ?? 'children');
  const fieldNamesDefault = $derived(
    keyField === 'key' && labelField === 'label' && childrenField === 'children',
  );

  function normalizeNodes(nodes: TreeNodeData[]): NormalizedNode[] {
    const kf = keyField;
    const lf = labelField;
    const cf = childrenField;
    return nodes.map((raw) => {
      const r = raw as unknown as Record<string, unknown>;
      const kids = r[cf] as TreeNodeData[] | undefined;
      const out: NormalizedNode = {
        ...(raw as TreeNodeData),
        key: r[kf] as TreeKey,
        label: r[lf] as string,
        __orig: r,
      };
      if (kids) out.children = normalizeNodes(kids);
      else delete out.children;
      return out;
    });
  }

  // 标准化后的树：默认时即 treeData 原引用（零开销），否则递归映射字段名。
  const normalizedData = $derived<TreeNodeData[]>(
    fieldNamesDefault ? treeData : normalizeNodes(treeData),
  );

  /** 回调回传：自定义 fieldNames 时回原始节点，否则回标准节点本身。 */
  function toOrig(node: TreeNodeData): TreeNodeData {
    const orig = (node as Partial<NormalizedNode>).__orig;
    return (orig as TreeNodeData | undefined) ?? node;
  }

  // --- 异步加载：本地缓存子节点 + loading/loaded 标记（不写回受控 treeData，红线 #1）---
  const loadedChildren = new SvelteMap<TreeKey, TreeNodeData[]>();
  const loadingKeys = new SvelteSet<TreeKey>();
  const loadedKeys = new SvelteSet<TreeKey>();

  // 合并树：把已加载的子节点注入对应节点，喂给所有 core 纯函数。
  // 无加载时返回原 treeData 引用，零开销。
  const mergedData = $derived.by<TreeNodeData[]>(() => {
    if (loadedChildren.size === 0) return normalizedData;
    const inject = (nodes: TreeNodeData[]): TreeNodeData[] =>
      nodes.map((n) => {
        const loaded = loadedChildren.get(n.key);
        const kids = n.children ?? loaded;
        if (!kids) return n;
        return { ...n, children: inject(kids) };
      });
    return inject(normalizedData);
  });

  // 行是否可展开：原本有子 → 是；否则有 loadData、非叶子、尚未加载（或加载出非空）→ 是。
  function isExpandable(node: TreeNodeData, flatHasChildren: boolean): boolean {
    if (flatHasChildren) return true;
    if (!loadData || node.isLeaf === true) return false;
    // 已加载且为空 → 不可展开；未加载 → 显示箭头（异步占位）
    if (loadedKeys.has(node.key)) return (loadedChildren.get(node.key)?.length ?? 0) > 0;
    return true;
  }

  async function loadChildren(node: TreeNodeData) {
    if (!loadData || loadingKeys.has(node.key) || loadedKeys.has(node.key)) return;
    loadingKeys.add(node.key);
    try {
      // loadData 收到用户原始节点（自定义字段名形态），返回结果按 fieldNames 标准化后缓存。
      const kids = await loadData(toOrig(node));
      loadedChildren.set(node.key, fieldNamesDefault ? kids : normalizeNodes(kids));
    } finally {
      loadingKeys.delete(node.key);
      loadedKeys.add(node.key);
    }
  }

  // --- selection: 受控 value 不回写 (红线 #1) ---
  function initValue(): TreeKey | TreeKey[] | null {
    if (multiple) return Array.isArray(defaultValue) ? [...defaultValue] : [];
    return Array.isArray(defaultValue) ? (defaultValue[0] ?? null) : defaultValue;
  }
  const isValueControlled = $derived(value !== undefined);
  let innerValue = $state<TreeKey | TreeKey[] | null>(initValue());
  const currentValue = $derived(isValueControlled ? (value ?? null) : innerValue);
  const selectedSet = $derived.by(() => {
    const set = new Set<TreeKey>();
    if (Array.isArray(currentValue)) for (const k of currentValue) set.add(k);
    else if (currentValue !== null) set.add(currentValue);
    return set;
  });

  // --- check: 受控 checkedKeys 不回写 (红线 #1)。base 为叶子级显式勾选 ---
  function initCheckedBase(): Set<TreeKey> {
    return new Set(defaultCheckedKeys);
  }
  const isCheckControlled = $derived(checkedKeys !== undefined);
  let innerCheckedBase = $state<Set<TreeKey>>(initCheckedBase());
  const currentCheckedBase = $derived(
    isCheckControlled ? new Set(checkedKeys ?? []) : innerCheckedBase,
  );
  // 父子是否联动：checkStrictly 或 checkRelation==='unRelated' 任一开启即解耦（无联动、无半选）。
  const checkLinked = $derived(!checkStrictly && checkRelation !== 'unRelated');
  // 解耦时直接用 base 当 checked，无半选；联动时用 conduct 归一
  const checkState = $derived.by(() => {
    if (!checkLinked) {
      return { checked: new Set(currentCheckedBase), half: new Set<TreeKey>() };
    }
    return conduct(mergedData, currentCheckedBase);
  });

  // --- expand: 受控 expandedKeys 不回写 (红线 #1) ---
  function initExpanded(): Set<TreeKey> {
    // 需用标准化后的 key（fieldNames 自定义时 collectExpandable* 才能识别 children）。
    const base = fieldNamesDefault ? treeData : normalizeNodes(treeData);
    if (defaultExpandAll) {
      return new Set(collectExpandable(base));
    }
    // expandedDepth：展开 ≤N 层的有子节点（与 defaultExpandedKeys 取并集）。优先级低于 defaultExpandAll。
    const init = new Set<TreeKey>(defaultExpandedKeys);
    if (typeof expandedDepth === 'number' && expandedDepth > 0) {
      for (const k of collectExpandableToDepth(base, expandedDepth)) init.add(k);
    }
    return init;
  }
  const isExpandControlled = $derived(expandedKeys !== undefined);
  let innerExpanded = $state<Set<TreeKey>>(initExpanded());
  const currentExpandedSet = $derived(
    isExpandControlled ? new Set(expandedKeys ?? []) : innerExpanded,
  );

  // --- 搜索：本地状态，派生临时叠加展开集，不回写受控 expandedKeys (红线 #1) ---
  let searchValue = $state('');
  const trimmedSearch = $derived(searchValue.trim());
  // 搜索框是否渲染/启用：filterable 或 filterTreeNode（true 或自定义谓词函数）任一开启。
  const searchEnabled = $derived(filterable || filterTreeNode === true || typeof filterTreeNode === 'function');
  const searchActive = $derived(searchEnabled && trimmedSearch.length > 0);
  // 过滤谓词：传函数则用自定义 (input, node)；否则内置 label 包含（不区分大小写）。
  const matchPredicate = $derived.by(() => {
    if (typeof filterTreeNode === 'function') {
      const fn = filterTreeNode;
      // 回传原始节点（fieldNames 自定义时），与其它回调一致。
      return (node: TreeNodeData) => fn(trimmedSearch, toOrig(node));
    }
    const lower = trimmedSearch.toLowerCase();
    return (node: TreeNodeData) => node.label.toLowerCase().includes(lower);
  });
  const filterResult = $derived.by(() => {
    if (!searchActive) return { matched: new Set<TreeKey>(), expand: new Set<TreeKey>() };
    return computeFilteredKeys(mergedData, matchPredicate);
  });
  // 搜索激活时把过滤展开集并入可见展开集（派生，不写回）
  const effectiveExpanded = $derived.by(() => {
    if (!searchActive) return currentExpandedSet;
    const merged = new Set(currentExpandedSet);
    for (const k of filterResult.expand) merged.add(k);
    return merged;
  });

  // --- 可见扁平节点 ---
  const flat = $derived(flattenVisible(mergedData, effectiveExpanded));
  // 搜索时仅保留命中或其祖先链上的节点（expand 集即祖先链 + 自身有命中后代者）
  const visibleFlat = $derived.by(() => {
    if (!searchActive) return flat;
    return flat.filter(
      (f) => filterResult.matched.has(f.node.key) || filterResult.expand.has(f.node.key),
    );
  });

  const isEmpty = $derived(visibleFlat.length === 0);
  const emptyText = $derived(emptyContent ?? loc().t('Tree.emptyText'));

  // --- roving 焦点：activeKey + 派生高亮，render 不读挂载 registry (红线 #2) ---
  let activeKey = $state<TreeKey | null>(null);
  const activeDescId = $derived.by(() => {
    if (activeKey === null) return undefined;
    const exists = visibleFlat.some((f) => f.node.key === activeKey);
    return exists ? itemId(activeKey) : undefined;
  });

  // --- 虚拟滚动：复用 core 纯函数 fixedRange 自建轻量 fixed 定高虚拟化 ---
  // 选型说明：库内 VirtualList 组件会注入 role=list / role=listitem 包裹层，
  // 破坏 role=tree → role=treeitem 的 ARIA 结构（treeitem 不能是 listitem 的子），
  // 故直接用 core 的 fixedRange 纯函数在 Tree 内自建：滚动监听命令式 + cleanup（红线 #3），
  // 可见区间用 $derived 纯派生（红线 #2），保持 role=tree 容器 + 行 role=treeitem 语义不变。
  const VIRTUAL_OVERSCAN = 4;
  // viewport 元素普通引用（bind:this），不参与响应式几何读取。
  let viewportEl = $state<HTMLDivElement | null>(null);
  // 仅由命令式 scroll 回调写入的本地 scrollTop，render 期只读。
  let scrollTop = $state(0);
  // rAF 节流句柄（非响应式）。
  let rafId = 0;

  const rowHeight = $derived(itemHeight > 0 ? itemHeight : 32);
  const totalHeight = $derived(visibleFlat.length * rowHeight);
  // 可视区间：纯 $derived，仅依赖本地 $state，render-safe（不读 DOM）（红线 #2）。
  const vRange = $derived(
    virtualized
      ? fixedRange(scrollTop, height, rowHeight, visibleFlat.length, VIRTUAL_OVERSCAN)
      : { startIndex: 0, endIndex: visibleFlat.length },
  );
  // 实际喂给 #each 的行集合：virtualized 时只取视口内切片，否则全量。
  const renderFlat = $derived(
    virtualized ? visibleFlat.slice(vRange.startIndex, vRange.endIndex) : visibleFlat,
  );

  // 滚动监听（命令式 + rAF 节流 + cleanup）（红线 #3）。
  $effect(() => {
    const el = viewportEl;
    if (!el || !virtualized) return;
    function onScroll() {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        if (el) scrollTop = el.scrollTop;
      });
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

  // 命令式滚到指定行索引使其落入视口（键盘移动 activeKey 时调用）。
  function scrollIndexIntoView(index: number) {
    const el = viewportEl;
    if (!el || !virtualized || index < 0) return;
    const itemStart = index * rowHeight;
    const top = el.scrollTop;
    const bottom = top + el.clientHeight;
    // 已完整可见则不滚动，避免抖动。
    if (itemStart >= top && itemStart + rowHeight <= bottom) return;
    // 目标在视口上方对齐顶，下方对齐底。
    const align = itemStart < top ? 'start' : 'end';
    const target = scrollOffsetForIndex(itemStart, rowHeight, el.clientHeight, totalHeight, align);
    el.scrollTop = target;
    scrollTop = target;
  }

  function scrollActiveIntoView() {
    if (!virtualized || activeKey === null) return;
    const i = visibleFlat.findIndex((f) => f.node.key === activeKey);
    scrollIndexIntoView(i);
  }

  function isNodeDisabled(node: TreeNodeData): boolean {
    return disabled || !!node.disabled;
  }

  function isSelectable(node: TreeNodeData): boolean {
    return selectable && node.selectable !== false && !isNodeDisabled(node);
  }

  function isCheckableNode(node: TreeNodeData): boolean {
    return checkable && node.checkable !== false && !isNodeDisabled(node);
  }

  function isExpanded(key: TreeKey): boolean {
    return effectiveExpanded.has(key);
  }

  // --- 状态写入：仅非受控写 inner，受控只回调 (红线 #1) ---
  function emitSelect(node: TreeNodeData) {
    if (!isSelectable(node)) return;
    let next: TreeKey | TreeKey[];
    let selected: boolean;
    if (multiple) {
      const arr = Array.isArray(currentValue) ? [...currentValue] : [];
      const idx = arr.indexOf(node.key);
      if (idx >= 0) {
        arr.splice(idx, 1);
        selected = false;
      } else {
        arr.push(node.key);
        selected = true;
      }
      next = arr;
    } else {
      // 单选：点击直接选中该节点（不取消），selected 恒为 true
      next = node.key;
      selected = true;
    }
    if (!isValueControlled) innerValue = next;
    onChange?.({ value: next, node: toOrig(node), selected });
  }

  function emitCheck(node: TreeNodeData) {
    if (!isCheckableNode(node)) return;
    let nextBase: Set<TreeKey>;
    if (!checkLinked) {
      // 解耦（checkStrictly 或 unRelated）：仅翻转该节点自身，不触达父子。
      nextBase = new Set(currentCheckedBase);
      if (nextBase.has(node.key)) nextBase.delete(node.key);
      else nextBase.add(node.key);
    } else {
      nextBase = toggleCheck(mergedData, currentCheckedBase, node.key);
    }
    if (!isCheckControlled) innerCheckedBase = nextBase;
    const resolved = !checkLinked
      ? { checked: new Set(nextBase), half: new Set<TreeKey>() }
      : conduct(mergedData, nextBase);
    onCheck?.({
      checked: [...resolved.checked],
      node: toOrig(node),
      halfChecked: [...resolved.half],
    });
  }

  function emitExpand(node: TreeNodeData, expand: boolean) {
    // accordion：展开时同层级只保留一个，自动收起同父级其它已展开节点（纯函数 core，红线 #2）。
    // 不同层级互不影响；收起仅移除自身。受控时也只回调收起 siblings 后的新集，不回写（红线 #1）。
    let next: Set<TreeKey>;
    if (expand) {
      next = accordion
        ? accordionExpand(mergedData, currentExpandedSet, node.key)
        : new Set(currentExpandedSet).add(node.key);
    } else {
      next = new Set(currentExpandedSet);
      next.delete(node.key);
    }
    if (!isExpandControlled) innerExpanded = next;
    onExpandedChange?.({ expanded: [...next], node: toOrig(node), expand });
  }

  function toggleExpand(node: TreeNodeData) {
    const hasOwnKids = (node.children?.length ?? 0) > 0;
    if (!isExpandable(node, hasOwnKids)) return;
    const willExpand = !isExpanded(node.key);
    // 展开未加载的异步节点：先取数据再展开（数据到位后合并树派生即显示子节点）
    if (willExpand && !hasOwnKids && loadData && !loadedKeys.has(node.key)) {
      void loadChildren(node);
    }
    emitExpand(node, willExpand);
  }

  function onRowClick(node: TreeNodeData) {
    if (isNodeDisabled(node)) return;
    activeKey = node.key;
    if (isSelectable(node)) emitSelect(node);
    else if (isExpandable(node, (node.children?.length ?? 0) > 0)) toggleExpand(node);
  }

  // --- 键盘导航 (红线 #2: 全部基于派生 visibleFlat 与 activeKey) ---
  function activeIndex(): number {
    if (activeKey === null) return -1;
    return visibleFlat.findIndex((f) => f.node.key === activeKey);
  }

  function moveNext() {
    const cur = activeIndex();
    let i = cur < 0 ? 0 : cur + 1;
    while (i < visibleFlat.length && isNodeDisabled((visibleFlat[i] as FlatNode).node)) i++;
    if (i < visibleFlat.length) activeKey = (visibleFlat[i] as FlatNode).node.key;
  }

  function movePrev() {
    const cur = activeIndex();
    let i = cur < 0 ? visibleFlat.length - 1 : cur - 1;
    while (i >= 0 && isNodeDisabled((visibleFlat[i] as FlatNode).node)) i--;
    if (i >= 0) activeKey = (visibleFlat[i] as FlatNode).node.key;
  }

  function moveFirst() {
    let i = 0;
    while (i < visibleFlat.length && isNodeDisabled((visibleFlat[i] as FlatNode).node)) i++;
    if (i < visibleFlat.length) activeKey = (visibleFlat[i] as FlatNode).node.key;
  }

  function moveLast() {
    let i = visibleFlat.length - 1;
    while (i >= 0 && isNodeDisabled((visibleFlat[i] as FlatNode).node)) i--;
    if (i >= 0) activeKey = (visibleFlat[i] as FlatNode).node.key;
  }

  function currentFlat(): FlatNode | undefined {
    const i = activeIndex();
    return i >= 0 ? visibleFlat[i] : undefined;
  }

  function moveToParent() {
    const f = currentFlat();
    if (!f || f.parentKey === null) return;
    activeKey = f.parentKey;
  }

  function onKeydown(e: KeyboardEvent) {
    if (disabled || visibleFlat.length === 0) return;
    if (activeKey === null) {
      if (
        e.key === 'ArrowDown' ||
        e.key === 'ArrowUp' ||
        e.key === 'Home' ||
        e.key === 'End'
      ) {
        e.preventDefault();
        moveFirst();
        scrollActiveIntoView();
      }
      return;
    }
    const f = currentFlat();
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        moveNext();
        break;
      case 'ArrowUp':
        e.preventDefault();
        movePrev();
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (f && isExpandable(f.node, f.hasChildren)) {
          if (!isExpanded(f.node.key)) toggleExpand(f.node);
          else moveNext();
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (f && isExpandable(f.node, f.hasChildren) && isExpanded(f.node.key))
          emitExpand(f.node, false);
        else moveToParent();
        break;
      case 'Home':
        e.preventDefault();
        moveFirst();
        break;
      case 'End':
        e.preventDefault();
        moveLast();
        break;
      case 'Enter':
        e.preventDefault();
        if (f) emitSelect(f.node);
        break;
      case ' ':
        e.preventDefault();
        if (f) {
          if (isCheckableNode(f.node)) emitCheck(f.node);
          else emitSelect(f.node);
        }
        break;
      default:
        break;
    }
    // 移动 activeKey 后若目标行不在视口（虚拟化）则滚到可见。
    scrollActiveIntoView();
  }

  // --- 拖拽排序：HTML5 DnD（draggable + drag 事件），状态用 $state，命令式事件处理 ---
  // 受控：组件不改 treeData，仅 onDrop 通知父组件重排（红线 #1）。
  // 插入指示由 drag 事件更新 $state，render 读它显示指示线（红线 #2/#3）。
  let dragKey = $state<TreeKey | null>(null); // 当前被拖拽节点 key
  let dropKey = $state<TreeKey | null>(null); // 当前悬停目标 key
  let dropPos = $state<DropPosition | null>(null); // 放置位置 before/inside/after
  // 拖到 inside 时延时自动展开的计时器（命令式，dragleave/drop/dragend 清理）。
  let expandTimer: ReturnType<typeof setTimeout> | undefined;

  function clearExpandTimer() {
    if (expandTimer !== undefined) {
      clearTimeout(expandTimer);
      expandTimer = undefined;
    }
  }

  function resetDrag() {
    clearExpandTimer();
    dragKey = null;
    dropKey = null;
    dropPos = null;
  }

  function isDraggableNode(node: TreeNodeData): boolean {
    return draggable && !isNodeDisabled(node);
  }

  function onNodeDragStart(e: DragEvent, node: TreeNodeData) {
    if (!isDraggableNode(node)) {
      e.preventDefault();
      return;
    }
    dragKey = node.key;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      // 必须 setData 否则部分浏览器不触发 drop。
      e.dataTransfer.setData('text/plain', String(node.key));
    }
  }

  function onNodeDragOver(e: DragEvent, f: FlatNode) {
    const node = f.node;
    if (dragKey === null || isNodeDisabled(node)) return;
    // 不能放到自身或自身子树内（受控数据无意义且会丢节点）。
    if (isAncestorOrSelf(mergedData, dragKey, node.key)) return;
    // dragover 必须 preventDefault 才能触发 drop（红线 #3）。
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    // 叶子且无 loadData → 不允许 inside（不会有子节点容器）。
    const allowInside = f.hasChildren || (!!loadData && node.isLeaf !== true);
    const pos = computeDropPosition(offsetY, rect.height || rowHeight, allowInside);
    // 切换目标行时重置 inside 自动展开计时器。
    if (dropKey !== node.key) clearExpandTimer();
    dropKey = node.key;
    dropPos = pos;
    // 拖到内部时自动展开目标（便于放入），延时避免误触。
    if (pos === 'inside' && isExpandable(node, f.hasChildren) && !isExpanded(node.key)) {
      if (expandTimer === undefined) {
        expandTimer = setTimeout(() => {
          expandTimer = undefined;
          if (dropKey === node.key && dropPos === 'inside') toggleExpand(node);
        }, 500);
      }
    } else {
      clearExpandTimer();
    }
  }

  function onNodeDragLeave(e: DragEvent, node: TreeNodeData) {
    // 仅当真正离开该行（而非进入子元素）时清理目标，避免指示线闪烁。
    const related = e.relatedTarget as Node | null;
    const cur = e.currentTarget as HTMLElement;
    if (related && cur.contains(related)) return;
    if (dropKey === node.key) {
      clearExpandTimer();
      dropKey = null;
      dropPos = null;
    }
  }

  function onNodeDrop(e: DragEvent, node: TreeNodeData) {
    if (dragKey === null || dropPos === null) {
      resetDrag();
      return;
    }
    if (isNodeDisabled(node) || isAncestorOrSelf(mergedData, dragKey, node.key)) {
      resetDrag();
      return;
    }
    e.preventDefault();
    const dragNode = findFlatNode(dragKey);
    const dropNode = node;
    const position = dropPos;
    resetDrag();
    if (dragNode)
      onDrop?.({ dragNode: toOrig(dragNode), dropNode: toOrig(dropNode), dropPosition: position });
  }

  function onNodeDragEnd() {
    resetDrag();
  }

  function findFlatNode(key: TreeKey): TreeNodeData | undefined {
    const f = flat.find((x) => x.node.key === key);
    return f?.node;
  }

  // --- 搜索高亮：把命中子串包 <mark>，返回片段数组供模板渲染 ---
  type Part = { text: string; mark: boolean };
  function highlightParts(text: string): Part[] {
    if (!searchActive) return [{ text, mark: false }];
    const lower = text.toLowerCase();
    const term = trimmedSearch.toLowerCase();
    const parts: Part[] = [];
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

  function rowChecked(node: TreeNodeData): boolean {
    return checkState.checked.has(node.key);
  }
  function rowHalf(node: TreeNodeData): boolean {
    return checkState.half.has(node.key);
  }
  function ariaCheckedValue(node: TreeNodeData): boolean | 'mixed' {
    if (rowChecked(node)) return true;
    if (rowHalf(node)) return 'mixed';
    return false;
  }

  const cls = $derived(
    [
      'cd-tree',
      `cd-tree--${size}`,
      `cd-tree--${status}`,
      disabled && 'cd-tree--disabled',
      showLine && 'cd-tree--line',
    ]
      .filter(Boolean)
      .join(' '),
  );
</script>

<div class={cls}>
  {#if searchEnabled}
    <div class="cd-tree__search">
      <input
        class="cd-tree__search-input"
        type="text"
        placeholder={loc().t('Tree.searchPlaceholder')}
        aria-label={loc().t('Tree.searchPlaceholder')}
        bind:value={searchValue}
        {disabled}
      />
    </div>
  {/if}

  {#if isEmpty}
    <div class="cd-tree__empty">{emptyText}</div>
  {:else if virtualized}
    <!-- 虚拟滚动：role=tree 容器自身滚动，spacer 撑总高，行绝对定位按索引偏移。
         只渲染视口内切片 renderFlat，保持 treeitem 语义不变（a11y 取舍见下）。-->
    <div
      class="cd-tree__list cd-tree__list--virtual"
      role="tree"
      aria-label={ariaLabel}
      aria-multiselectable={multiple || checkable}
      aria-activedescendant={activeDescId}
      aria-disabled={disabled || undefined}
      tabindex={disabled ? -1 : 0}
      bind:this={viewportEl}
      style={`block-size:${height}px; overflow:auto`}
      onkeydown={onKeydown}
    >
      <div class="cd-tree__spacer" style={`block-size:${totalHeight}px`}>
        {#each renderFlat as f, i (f.node.key)}
          {@render row(f, `position:absolute; inset-inline:0; transform:translateY(${(vRange.startIndex + i) * rowHeight}px); block-size:${rowHeight}px`)}
        {/each}
      </div>
    </div>
  {:else}
    <div
      class="cd-tree__list"
      role="tree"
      aria-label={ariaLabel}
      aria-multiselectable={multiple || checkable}
      aria-activedescendant={activeDescId}
      aria-disabled={disabled || undefined}
      tabindex={disabled ? -1 : 0}
      onkeydown={onKeydown}
    >
      {#each visibleFlat as f (f.node.key)}
        {@render row(f, undefined)}
      {/each}
    </div>
  {/if}
</div>

{#snippet row(f: FlatNode, posStyle: string | undefined)}
  {@const node = f.node}
  {@const expandable = isExpandable(node, f.hasChildren)}
  {@const loading = loadingKeys.has(node.key)}
  {@const expanded = expandable && isExpanded(node.key)}
  {@const nodeDisabled = isNodeDisabled(node)}
  {@const selected = selectedSet.has(node.key)}
  {@const checked = rowChecked(node)}
  {@const active = activeKey === node.key}
  {@const dragging = dragKey === node.key}
  {@const isDropTarget = dropKey === node.key}
  {@const indentStyle = showLine ? '' : `padding-inline-start: calc(${f.level} * var(--cd-tree-indent))`}
        <!-- treeitem 焦点经容器 aria-activedescendant 漫游管理，行本身 tabindex=-1，键盘统一在 role=tree 容器处理 -->
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <div
          id={itemId(node.key)}
          class="cd-tree__node"
          class:cd-tree__node--selected={selected}
          class:cd-tree__node--disabled={nodeDisabled}
          class:cd-tree__node--active={active}
          class:cd-tree__node--block={blockNode}
          class:cd-tree__node--dragging={dragging}
          class:cd-tree__node--drop-before={isDropTarget && dropPos === 'before'}
          class:cd-tree__node--drop-inside={isDropTarget && dropPos === 'inside'}
          class:cd-tree__node--drop-after={isDropTarget && dropPos === 'after'}
          role="treeitem"
          draggable={draggable && !nodeDisabled ? true : undefined}
          tabindex={-1}
          aria-level={f.level + 1}
          aria-setsize={f.setSize}
          aria-posinset={f.posInSet}
          aria-expanded={expandable ? expanded : undefined}
          aria-selected={selectable ? selected : undefined}
          aria-checked={checkable ? ariaCheckedValue(node) : undefined}
          aria-disabled={nodeDisabled || undefined}
          style={[posStyle, indentStyle].filter(Boolean).join('; ') || undefined}
          onclick={() => onRowClick(node)}
          ondragstart={draggable ? (e) => onNodeDragStart(e, node) : undefined}
          ondragover={draggable ? (e) => onNodeDragOver(e, f) : undefined}
          ondragleave={draggable ? (e) => onNodeDragLeave(e, node) : undefined}
          ondrop={draggable ? (e) => onNodeDrop(e, node) : undefined}
          ondragend={draggable ? onNodeDragEnd : undefined}
        >
          {#if showLine && f.level > 0}
            <!-- 引导线列：每层祖先一格，祖先非末→贯穿竖线；自身连接列画拐角 -->
            {#each Array(f.level) as _, depth (depth)}
              {@const isSelfColumn = depth === f.level - 1}
              <span
                class="cd-tree__line"
                class:cd-tree__line--through={!isSelfColumn && !f.ancestorIsLast[depth]}
                class:cd-tree__line--elbow={isSelfColumn && f.isLast}
                class:cd-tree__line--tee={isSelfColumn && !f.isLast}
                aria-hidden="true"
              ></span>
            {/each}
          {/if}
          {#if loading}
            <span class="cd-tree__switcher cd-tree__switcher--loading" aria-hidden="true">
              <span class="cd-tree__spinner"></span>
            </span>
          {:else if expandable}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <span
              class="cd-tree__switcher"
              class:cd-tree__switcher--open={expanded}
              role="button"
              tabindex="-1"
              aria-label={expanded ? loc().t('Tree.collapse') : loc().t('Tree.expand')}
              onclick={(e) => {
                e.stopPropagation();
                if (!nodeDisabled) toggleExpand(node);
              }}
            >
              <svg viewBox="0 0 16 16" width="10" height="10" aria-hidden="true" focusable="false">
                <path fill="currentColor" d="M6 4l4 4-4 4V4Z" />
              </svg>
            </span>
          {:else}
            <span class="cd-tree__switcher cd-tree__switcher--leaf" aria-hidden="true"></span>
          {/if}

          {#if checkable}
            <span
              class="cd-tree__checkbox"
              class:cd-tree__checkbox--checked={checked}
              class:cd-tree__checkbox--half={!checked && rowHalf(node)}
              class:cd-tree__checkbox--disabled={!isCheckableNode(node)}
              role="button"
              tabindex="-1"
              aria-hidden="true"
              onclick={(e) => {
                e.stopPropagation();
                emitCheck(node);
              }}
            >
              {#if checked}
                <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" focusable="false">
                  <path
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M3.5 8.5l3 3 6-6.5"
                  />
                </svg>
              {:else if rowHalf(node)}
                <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" focusable="false">
                  <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M4 8h8" />
                </svg>
              {/if}
            </span>
          {/if}

          {#if showIcon}
            <span class="cd-tree__icon" aria-hidden="true">
              {#if icon}{@render icon({ node, expanded, level: f.level })}{/if}
            </span>
          {/if}

          <span class="cd-tree__label">
            {#if label}
              {@render label({ node, level: f.level, searchValue: trimmedSearch, selected, checked })}
            {:else}
              {#each highlightParts(node.label) as part, i (i)}
                {#if part.mark}
                  <mark class="cd-tree__highlight">{part.text}</mark>
                {:else}{part.text}{/if}
              {/each}
            {/if}
          </span>
        </div>
{/snippet}

<style>
  .cd-tree {
    --cd-tree-row-height: var(--cd-tree-node-height);
    display: flex;
    flex-direction: column;
    gap: var(--cd-spacing-1);
    color: var(--cd-tree-node-color);
    font-size: var(--cd-font-size-body);
  }
  .cd-tree--small {
    --cd-tree-row-height: var(--cd-tree-node-height-small);
  }
  .cd-tree--large {
    --cd-tree-row-height: var(--cd-tree-node-height-large);
  }
  .cd-tree--disabled {
    color: var(--cd-tree-node-color-disabled);
  }

  .cd-tree__search-input {
    inline-size: 100%;
    block-size: var(--cd-tree-row-height);
    padding-inline: var(--cd-spacing-2);
    color: inherit;
    background: var(--cd-color-bg-1, transparent);
    border: 1px solid var(--cd-tree-border-color);
    border-radius: var(--cd-radius-small, 4px);
    font: inherit;
  }
  .cd-tree--warning .cd-tree__search-input {
    border-color: var(--cd-tree-border-color-warning);
  }
  .cd-tree--error .cd-tree__search-input {
    border-color: var(--cd-tree-border-color-error);
  }
  .cd-tree__search-input:focus-visible {
    outline: none;
    border-color: var(--cd-tree-focus-ring);
    box-shadow: 0 0 0 2px var(--cd-tree-focus-ring);
  }

  .cd-tree__list {
    display: flex;
    flex-direction: column;
    outline: none;
  }
  .cd-tree__list:focus-visible {
    box-shadow: 0 0 0 2px var(--cd-tree-focus-ring);
    border-radius: var(--cd-radius-small, 4px);
  }
  /* 虚拟滚动：容器自身滚动，display block 以便 spacer 绝对定位行布局生效 */
  .cd-tree__list--virtual {
    display: block;
    position: relative;
  }
  .cd-tree__spacer {
    position: relative;
    inline-size: 100%;
  }

  .cd-tree__node {
    display: flex;
    align-items: center;
    gap: var(--cd-spacing-1);
    block-size: var(--cd-tree-row-height);
    padding-inline-end: var(--cd-spacing-2);
    border-radius: var(--cd-radius-small, 4px);
    cursor: pointer;
    transition: background-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-tree__node:hover {
    background: var(--cd-tree-node-bg-hover);
  }
  .cd-tree__node--selected {
    color: var(--cd-tree-node-color-selected);
    background: var(--cd-tree-node-bg-selected);
  }
  .cd-tree__node--active {
    box-shadow: inset 0 0 0 1px var(--cd-tree-focus-ring);
  }
  .cd-tree__node--disabled {
    color: var(--cd-tree-node-color-disabled);
    cursor: not-allowed;
  }
  .cd-tree__node--disabled:hover {
    background: transparent;
  }

  /* --- 拖拽排序：被拖节点半透明 + 插入指示线 / 内部高亮 --- */
  .cd-tree__node--dragging {
    opacity: 0.5;
  }
  /* before/after 用 ::after 画一条插入指示线（不影响布局，子元素不接收 drag 事件） */
  .cd-tree__node--drop-before::after,
  .cd-tree__node--drop-after::after {
    content: '';
    position: absolute;
    inset-inline: 0;
    block-size: 2px;
    background: var(--cd-tree-focus-ring, var(--cd-color-primary));
    border-radius: 1px;
    pointer-events: none;
  }
  .cd-tree__node--drop-before::after {
    inset-block-start: -1px;
  }
  .cd-tree__node--drop-after::after {
    inset-block-end: -1px;
  }
  /* inside：成为子节点 → 整行高亮框 */
  .cd-tree__node--drop-inside {
    background: var(--cd-tree-node-bg-hover);
    box-shadow: inset 0 0 0 1px var(--cd-tree-focus-ring, var(--cd-color-primary));
  }
  /* 节点需相对定位以承载绝对定位的指示线；虚拟化行已 position:absolute，非虚拟行设 relative */
  .cd-tree__node {
    position: relative;
  }

  /* --- showLine 层级引导线：每层一格，用 ::before 画竖线、::after 画横线 --- */
  .cd-tree__line {
    position: relative;
    flex: 0 0 auto;
    inline-size: var(--cd-tree-indent);
    align-self: stretch;
  }
  /* 贯穿竖线（祖先非末层） */
  .cd-tree__line--through::before {
    content: '';
    position: absolute;
    inset-block: 0;
    inset-inline-start: 50%;
    inline-size: 1px;
    background: var(--cd-tree-line-color, var(--cd-color-border));
  }
  /* ├ 形：竖线贯穿 + 横线到右 */
  .cd-tree__line--tee::before {
    content: '';
    position: absolute;
    inset-block: 0;
    inset-inline-start: 50%;
    inline-size: 1px;
    background: var(--cd-tree-line-color, var(--cd-color-border));
  }
  /* └ 形：竖线 top→中 + 横线到右 */
  .cd-tree__line--elbow::before {
    content: '';
    position: absolute;
    inset-block-start: 0;
    block-size: 50%;
    inset-inline-start: 50%;
    inline-size: 1px;
    background: var(--cd-tree-line-color, var(--cd-color-border));
  }
  .cd-tree__line--tee::after,
  .cd-tree__line--elbow::after {
    content: '';
    position: absolute;
    inset-block-start: 50%;
    inset-inline-start: 50%;
    inset-inline-end: 0;
    block-size: 1px;
    background: var(--cd-tree-line-color, var(--cd-color-border));
  }

  .cd-tree__switcher {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    inline-size: 1rem;
    block-size: 1rem;
    color: var(--cd-tree-expand-icon-color);
    cursor: pointer;
    transition: transform var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-tree__switcher--open {
    transform: rotate(90deg);
  }
  .cd-tree__switcher--leaf {
    cursor: default;
  }
  .cd-tree__switcher--loading {
    cursor: default;
  }
  .cd-tree__spinner {
    inline-size: 0.75rem;
    block-size: 0.75rem;
    border: 2px solid var(--cd-color-border, currentColor);
    border-block-start-color: var(--cd-color-primary);
    border-radius: 50%;
    animation: cd-tree-spin 0.7s linear infinite;
  }
  @keyframes cd-tree-spin {
    to {
      transform: rotate(360deg);
    }
  }

  .cd-tree__checkbox {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    inline-size: 1rem;
    block-size: 1rem;
    color: #fff;
    background: var(--cd-color-bg-1, #fff);
    border: 1px solid var(--cd-color-border);
    border-radius: var(--cd-radius-small, 3px);
    cursor: pointer;
  }
  .cd-tree__checkbox--checked,
  .cd-tree__checkbox--half {
    background: var(--cd-color-primary);
    border-color: var(--cd-color-primary);
  }
  .cd-tree__checkbox--disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .cd-tree__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    inline-size: 0;
    block-size: 1rem;
    color: var(--cd-tree-node-color);
  }
  /* 有自定义图标内容时撑开尺寸 */
  .cd-tree__icon:not(:empty) {
    inline-size: 1rem;
  }

  .cd-tree__label {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .cd-tree__highlight {
    padding: 0;
    color: var(--cd-tree-search-highlight-color);
    background: var(--cd-tree-search-highlight-bg);
  }

  .cd-tree__empty {
    padding: var(--cd-spacing-3);
    color: var(--cd-tree-node-color-disabled);
    text-align: center;
  }

  @media (prefers-reduced-motion: reduce) {
    .cd-tree__node,
    .cd-tree__switcher {
      transition: none;
    }
    .cd-tree__spinner {
      animation: none;
    }
  }
</style>
