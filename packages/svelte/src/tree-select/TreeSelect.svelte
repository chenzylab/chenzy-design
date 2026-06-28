<!--
  TreeSelect — see specs/components/input/TreeSelect.spec.md
  基础子集: 单选、可展开/收起的单面板树、叶子或任意节点选中 (leafOnly 控制)。
  multiple: checkbox 多选 + 父子联动 (复用 core conduct/toggleCheck)，trigger 多 tag 回显可单独移除。
  filterable: 面板顶部搜索框过滤节点（复用 core computeFilteredKeys），命中 + 祖先链可见、命中文本高亮。
  Token-driven, a11y-correct, 受控/非受控。
  fieldNames：自定义节点字段名（key/label/children）映射任意后端数据；派生只读标准化，默认字段名时零开销。
  icon：自定义节点图标 snippet（showIcon 为真时渲染在 label 前），API 与 Tree 的 icon 对齐
  （参数 { node, expanded, level }）。渲染层特性，不改 treeData（红线 #1）。
  loadData：展开未加载的非叶子节点时异步取子节点，结果缓存进本地 SvelteMap 并派生合并树喂给
  所有 core 函数（不写回受控 treeData，红线 #1）；加载中显示 spinner，竞态由 loadedKeys/loadingKeys 去重。
  virtualized：大数据树虚拟滚动。复用 Tree 范式——直接用 core fixedRange 纯函数自建轻量 fixed 定高
  虚拟化（非复用 VirtualList 组件，其 role=list/listitem 会破坏 role=tree→treeitem 语义），保持
  role=tree 容器 + 行 role=treeitem 不变；只渲染视口内切片（flattenVisible 派生扁平节点 + 区间纯派生，
  红线 #2）。滚动监听命令式 + rAF 节流 + cleanup（红线 #3）。virtualized 时与搜索 filterable 互斥
  （搜索强制展开命中链与定高虚拟化叠加复杂，故 virtualized 优先静态/异步大树场景）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import {
    useId,
    useDismiss,
    conduct,
    toggleCheck,
    computeFilteredKeys,
    collectCheckedByStrategy,
    flattenVisible,
    fixedRange,
    scrollOffsetForIndex,
    rovingKeyFromEvent,
    type TreeNodeData,
    type FlatNode,
    type CheckedStrategy,
  } from '@chenzy-design/core';
  import { SvelteMap, SvelteSet } from 'svelte/reactivity';
  import { useLocale } from '../locale-provider/index.js';
  import { getGlobalPopupContainer } from '../config-provider/index.js';
  import { floating } from '../_floating/use-floating.js';
  import Tag from '../tag/Tag.svelte';
  import type { TreeNode, TreeKey } from './types.js';

  type Size = 'small' | 'default' | 'large';
  type Status = 'default' | 'warning' | 'error';

  /** 自定义节点字段名映射（适配任意后端数据结构）。默认 key/label/children。 */
  type FieldNames = { key?: string; label?: string; children?: string };

  interface Props {
    value?: TreeKey | TreeKey[] | null;
    defaultValue?: TreeKey | TreeKey[] | null;
    /**
     * 树数据源。默认节点字段为 key/label/children；
     * 用 fieldNames 自定义字段名时可传任意后端结构（如 { id, name, sub }）。
     */
    treeData?: TreeNode[];
    /** 自定义节点字段名映射，如 { key:'id', label:'name', children:'sub' }。默认全部为标准名。 */
    fieldNames?: FieldNames;
    open?: boolean;
    defaultOpen?: boolean;
    /** 多选：面板节点显示 checkbox + 父子联动，trigger 多 tag 回显 */
    multiple?: boolean;
    /** 多选时父子勾选互不影响（无半选） */
    checkStrictly?: boolean;
    /**
     * 多选父子是否级联联动（对齐 Tree）。'related'（默认）父子联动；
     * 'unRelated' 互不影响（等价 checkStrictly）。checkStrictly=true 强制 unRelated（向后兼容）。
     */
    checkRelation?: 'related' | 'unRelated';
    /**
     * 多选回填值 / Tag 的收敛策略：'all'（默认，全部勾选节点）、
     * 'parent'（完全勾选父级折叠为父）、'child'（仅叶子）。仅 related 级联时生效。
     */
    showCheckedStrategy?: CheckedStrategy;
    /** 多选回填 Tag 最大展示数，超出折叠为 +N（仅影响显示，不改 value）。 */
    maxTagCount?: number;
    placeholder?: string;
    size?: Size;
    status?: Status;
    disabled?: boolean;
    clearable?: boolean;
    leafOnly?: boolean;
    defaultExpandAll?: boolean;
    /** 默认展开的节点 key（非受控初始展开集，与 defaultExpandAll 取并集）。 */
    treeDefaultExpandedKeys?: TreeKey[];
    /** 面板顶部搜索框过滤节点（命中 + 祖先链可见、高亮命中文本） */
    filterable?: boolean;
    /**
     * 远程搜索：输入仅触发 onSearch（防抖后），不本地过滤（由外部更新 treeData）。
     * 隐含 filterable 行为（显示搜索框）。默认 false。
     */
    remote?: boolean;
    /** onSearch 防抖毫秒（remote 时生效，默认 300）。 */
    searchDebounce?: number;
    /** 远程搜索输入回调（防抖后）。 */
    onSearch?: (query: string) => void;
    /** 是否预留节点图标位（icon 提供时渲染在 label 前）。默认 true，与 Tree 对齐。 */
    showIcon?: boolean;
    /** 异步加载子节点：展开未加载的非叶子节点时调用，返回该节点的子节点数组。与 Tree 的 loadData 对齐。 */
    loadData?: (node: TreeNode) => Promise<TreeNode[]>;
    /** 虚拟滚动：仅渲染视口内的可见节点行，适合大数据树（1000+ 节点）。默认 false（行为不变）。 */
    virtualized?: boolean;
    /**
     * 自动启用虚拟化的可见节点数阈值：可见扁平行数 ≥ 此值时自动开启虚拟化。
     * 默认 100。virtualized 显式为 true 时强制开启（不看阈值）。
     */
    virtualizeThreshold?: number;
    /** 浮层宽度对齐触发器（min-inline-size = 触发器宽）。默认 true。 */
    dropdownMatchSelectWidth?: boolean;
    /** 浮层挂载容器，缺省 ConfigProvider 全局值再回退 document.body。 */
    getPopupContainer?: () => HTMLElement | null | undefined;
    /** 关闭即从 DOM 卸载浮层（重开重建）。默认 false：首开后保留 DOM 仅隐藏。 */
    destroyOnClose?: boolean;
    /** 虚拟滚动视口高度（px）。virtualized 时生效，默认 224（与默认面板 max-height 一致）。 */
    height?: number;
    /** 虚拟滚动行高（px）。virtualized 时生效，默认取 token 行高 32。 */
    itemHeight?: number;
    onChange?: (value: TreeKey | TreeKey[] | null) => void;
    onOpenChange?: (open: boolean) => void;
    ariaLabel?: string;
    /** 自定义节点图标（showIcon 为真时渲染在 label 前）；参数含节点与展开态，与 Tree 的 icon 对齐。 */
    icon?: Snippet<[{ node: TreeNode; expanded: boolean; level: number }]>;

    // --- Appearance ---
    /** 无边框模式：trigger 边框透明。默认 false。 */
    borderless?: boolean;
    /** trigger 前缀（Snippet 或字符串）。 */
    prefix?: Snippet | string;
    /** trigger 后缀（Snippet 或字符串）。 */
    suffix?: Snippet | string;
    /** 自定义清除按钮图标 Snippet。 */
    clearIcon?: Snippet;
    /**
     * 自定义展开图标 Snippet（参数 { node, expanded, level }）。
     * 也可传普通 Snippet（无参数），此时统一渲染同一图标。
     */
    expandIcon?: Snippet<[{ node: TreeNode; expanded: boolean; level: number }]>;
    /** 自定义右侧下拉箭头（expandIcon 的别名） */
    arrowIcon?: Snippet;
    /** 显示节点连接线（垂直导引线）。默认 false。 */
    showLine?: boolean;
    /** 节点 label 单行省略截断。默认 true（保持原有行为，可关闭以允许换行）。 */
    labelEllipsis?: boolean;
    /** 选择框样式 */
    style?: string;
    /** 浮层遮挡时自动调整方向（默认 true） */
    autoAdjustOverflow?: boolean;
    /** status 的别名 */
    validateStatus?: 'default' | 'error' | 'warning';
    /** 失焦回调 */
    onBlur?: (e: FocusEvent) => void;
    /** 聚焦回调 */
    onFocus?: (e: FocusEvent) => void;
    /** 聚焦时阻止滚动 */
    preventScroll?: boolean;

    // --- Slots ---
    /** 面板顶部外层 slot（在搜索框之上）。 */
    outerTopSlot?: Snippet;
    /** 面板底部外层 slot（在树之下）。 */
    outerBottomSlot?: Snippet;

    // --- Search enhancements ---
    /** 面板打开时搜索框自动获焦。默认 false。 */
    searchAutoFocus?: boolean;
    /** 搜索框位置：'dropdown'（面板内，默认）或 'trigger'（trigger 内）。 */
    searchPosition?: 'dropdown' | 'trigger';
    /** 搜索框占位文字 */
    searchPlaceholder?: string;
    /** 搜索过滤属性（默认 'label'） */
    treeNodeFilterProp?: string;
    /** 搜索框右侧显示清除按钮（有内容时）。默认 true。 */
    showSearchClear?: boolean;
    /** 搜索激活时仅显示命中节点，不显示祖先链。默认 false。 */
    showFilteredOnly?: boolean;

    // --- Expand control ---
    /** 受控展开的节点 keys */
    expandedKeys?: TreeKey[];
    /** 动态全部展开（与 defaultExpandAll 不同，此为受控/动态）。默认 false。 */
    expandAll?: boolean;
    /** 行点击展开方式：false（仅展开按钮触发）、'click'（单击行）、'doubleClick'（双击行）。默认 false。 */
    expandAction?: false | 'click' | 'doubleClick';
    /** 展开节点时自动展开其所有祖先链。默认 false。 */
    autoExpandParent?: boolean;
    /** 展开/折叠动画。默认 true。 */
    motionExpand?: boolean;
    /** 节点展开回调 */
    onExpand?: (expandedKeys: TreeKey[], info: { expanded: boolean; node: unknown }) => void;

    // --- Multi-select enhancements ---
    /**
     * 自动合并值：父节点全选时 value 不再包含其后代（等价 showCheckedStrategy='parent'）。
     * 默认 true。autoMergeValue=false 时 showCheckedStrategy 原始生效。
     */
    autoMergeValue?: boolean;
    /** onChange 回调携带完整节点对象而非仅 key。默认 false。 */
    onChangeWithObject?: boolean;
    /** 超出 maxTagCount 折叠的 tag 以 popover 形式展示剩余项。默认 false。 */
    showRestTagsPopover?: boolean;
    /** 传给剩余 tags popover 的额外 props。 */
    restTagsPopoverProps?: Record<string, unknown>;
    /** trigger 多选 tags 换行显示（默认单行截断折叠）。默认 false。 */
    triggerTagWrap?: boolean;

    // --- Node rendering ---
    /** 自定义节点 label 渲染（仅替换文字部分，保留 checkbox/icon/expand 等）。 */
    renderLabel?: Snippet<[{ label: string; data: TreeNode; searchWord: string }]>;
    /** 完全自定义节点行渲染（替换整行内容）。 */
    renderFullLabel?: Snippet<[{ node: TreeNode; expanded: boolean; level: number; checked: boolean; halfChecked: boolean; selected: boolean }]>;
    /** 自定义 trigger 已选 tag 渲染（多选时每个 tag 独立渲染）。 */
    renderSelectedItem?: Snippet<[{ node: TreeNode; onRemove: () => void }]>;
    /** 节点数据中用作显示 label 的字段名（默认 'label'）。 */
    treeNodeLabelProp?: string;
    /** 自定义 key/label/value 字段映射（优先级高于 fieldNames 的 key/label 部分）。 */
    keyMaps?: { key?: string; label?: string; value?: string };
    /** 选项列表容器的内联 style（字符串或对象形式）。 */
    optionListStyle?: string | Record<string, string>;
    /** 受控已加载的节点 keys */
    loadedKeys?: Set<TreeKey>;

    // --- Behavior ---
    /** 单选选中后自动关闭面板。默认 true。 */
    clickToHide?: boolean;
    /** 面板开启时点击 trigger 关闭面板。默认 true。 */
    clickTriggerToHide?: boolean;
    /**
     * 严格禁用：disabled 节点不因父节点联动而影响，禁用态独立（不传播给子节点）。
     * 默认 false（父禁用 conduct 不检查子）。
     */
    disableStrictly?: boolean;
    /** 浮层与 trigger 的额外间距（px），数字或四方向对象。 */
    dropdownMargin?: number | { marginTop?: number; marginBottom?: number; marginLeft?: number; marginRight?: number };

    // --- Events ---
    /** 点击清除按钮回调。 */
    onClear?: (e: MouseEvent) => void;
    /** 节点选中回调 */
    onSelect?: (selectedKey: TreeKey, selected: boolean, node: unknown) => void;
    /** 异步加载完成回调（含已加载 key 集合与当前节点）。 */
    onLoad?: (loadedKeys: TreeKey[], treeNode: TreeNode) => void;
    /** 面板可见性变化回调（与 onOpenChange 语义相同，Semi 风格别名）。 */
    onVisibleChange?: (isVisible: boolean) => void;
  }

  let {
    value,
    defaultValue = null,
    treeData = [],
    fieldNames,
    open,
    defaultOpen = false,
    multiple = false,
    checkStrictly = false,
    checkRelation = 'related',
    showCheckedStrategy = 'all',
    maxTagCount,
    placeholder = '请选择',
    size = 'default',
    status = 'default',
    disabled = false,
    clearable = false,
    leafOnly = false,
    defaultExpandAll = false,
    treeDefaultExpandedKeys,
    filterable = false,
    remote = false,
    searchDebounce = 300,
    onSearch,
    showIcon = true,
    loadData,
    virtualized = false,
    virtualizeThreshold = 100,
    dropdownMatchSelectWidth = true,
    getPopupContainer,
    destroyOnClose = false,
    height = 224,
    itemHeight = 32,
    onChange,
    onOpenChange,
    ariaLabel,
    icon,
    borderless = false,
    prefix,
    suffix,
    clearIcon,
    expandIcon,
    arrowIcon,
    showLine = false,
    labelEllipsis = true,
    style,
    autoAdjustOverflow = true,
    validateStatus,
    onBlur,
    onFocus,
    preventScroll = false,
    outerTopSlot,
    outerBottomSlot,
    searchAutoFocus = false,
    searchPosition = 'dropdown',
    searchPlaceholder,
    treeNodeFilterProp = 'label',
    showSearchClear = true,
    showFilteredOnly = false,
    expandedKeys: expandedKeysProp,
    expandAll = false,
    expandAction = false,
    autoExpandParent = false,
    motionExpand = true,
    onExpand,
    autoMergeValue = true,
    onChangeWithObject = false,
    showRestTagsPopover = false,
    restTagsPopoverProps,
    triggerTagWrap = false,
    renderLabel,
    renderFullLabel,
    renderSelectedItem,
    treeNodeLabelProp = 'label',
    keyMaps,
    optionListStyle,
    loadedKeys: loadedKeysProp,
    clickToHide = true,
    clickTriggerToHide = true,
    disableStrictly = false,
    dropdownMargin,
    onClear,
    onSelect,
    onLoad,
    onVisibleChange,
  }: Props = $props();

  const loc = useLocale();
  // ConfigProvider 全局浮层容器默认；自身 getPopupContainer prop 优先，未传时回退此值（再回退 body）。
  const globalPopupContainer = getGlobalPopupContainer();
  const resolvePopupContainer = $derived(getPopupContainer ?? globalPopupContainer);

  // remote 隐含可搜索（显示搜索框）；checkRelation 归一：checkStrictly=true 强制 unRelated（向后兼容）。
  const isFilterable = $derived(filterable || remote);
  const isUnRelated = $derived(checkStrictly || checkRelation === 'unRelated');

  // validateStatus 是 status 别名；效值以 validateStatus 优先（未传时回退 status）。
  const effStatus = $derived(validateStatus ?? status ?? 'default');

  const treeId = useId('cd-tree-select-panel');
  // treeitem 行 id 基（aria-activedescendant 指向当前高亮行）。
  const itemBaseId = useId('cd-tree-select-item');
  function itemId(key: TreeKey): string {
    return `${itemBaseId}-${String(key)}`;
  }

  // --- fieldNames 字段映射：把用户自定义字段名的数据派生为标准 {key,label,children} 结构 ---
  // 默认（全标准名）时直接返回原 treeData 引用，零额外开销；映射为纯 $derived（红线 #2），不写回（红线 #1）。
  // 节点 key 取自原始 key 字段，故 onChange 回传的 value（key）即用户原始 id，无需额外映射回原节点。
  // keyMaps 优先级高于 fieldNames（key/label 部分）；keyMaps.value 作为 key 字段别名。
  const keyField = $derived(keyMaps?.key ?? keyMaps?.value ?? fieldNames?.key ?? 'key');
  const labelField = $derived(keyMaps?.label ?? fieldNames?.label ?? 'label');
  const childrenField = $derived(fieldNames?.children ?? 'children');
  const fieldNamesDefault = $derived(
    keyField === 'key' && labelField === 'label' && childrenField === 'children',
  );

  function normalizeNodes(nodes: TreeNode[]): TreeNode[] {
    const kf = keyField;
    const lf = labelField;
    const cf = childrenField;
    const tnlp = treeNodeLabelProp;
    return nodes.map((raw) => {
      const r = raw as unknown as Record<string, unknown>;
      const kids = r[cf] as TreeNode[] | undefined;
      const out: TreeNode = {
        ...raw,
        key: r[kf] as TreeKey,
        label: r[lf] as string,
      };
      // treeNodeLabelProp 优先覆盖 label（当与 labelField 不同时）。
      if (tnlp !== 'label' && tnlp !== lf && r[tnlp] !== undefined) {
        out.label = r[tnlp] as string;
      }
      if (kids) out.children = normalizeNodes(kids);
      else delete out.children;
      return out;
    });
  }

  // 标准化后的树：默认时即 treeData 原引用（零开销），否则递归映射字段名。
  const normalizedTree = $derived<TreeNode[]>(
    fieldNamesDefault ? treeData : normalizeNodes(treeData),
  );

  // --- 异步加载（对齐 Tree）：本地缓存子节点 + loading/loaded 标记（不写回受控 treeData，红线 #1）---
  // loadedChildren 缓存已加载子树；loadingKeys 加载中（防重入/竞态）；loadedKeys 已完成（防重复请求）。
  const loadedChildren = new SvelteMap<TreeKey, TreeNode[]>();
  const loadingKeys = new SvelteSet<TreeKey>();
  const loadedKeys = new SvelteSet<TreeKey>();

  // 合并树：把已加载的子节点注入对应节点，喂给所有 core 纯函数与渲染。
  // 无加载时返回 normalizedTree 原引用，零开销（红线 #2 纯派生）。
  const mergedTree = $derived.by<TreeNode[]>(() => {
    if (loadedChildren.size === 0) return normalizedTree;
    const inject = (nodes: TreeNode[]): TreeNode[] =>
      nodes.map((n) => {
        const loaded = loadedChildren.get(n.key);
        const kids = n.children ?? loaded;
        if (!kids) return n;
        return { ...n, children: inject(kids) };
      });
    return inject(normalizedTree);
  });

  // 异步加载某节点子树（竞态：loadingKeys/loadedKeys 去重；快速展开/折叠不重复请求）。
  async function loadChildren(node: TreeNode) {
    if (!loadData || loadingKeys.has(node.key) || loadedKeys.has(node.key)) return;
    loadingKeys.add(node.key);
    try {
      const kids = await loadData(node);
      loadedChildren.set(node.key, fieldNamesDefault ? kids : normalizeNodes(kids));
    } finally {
      loadingKeys.delete(node.key);
      loadedKeys.add(node.key);
      onLoad?.([...loadedKeys], node);
    }
  }

  // --- 纯函数: 递归查找节点 (用于回显 label) ---
  function findNode(data: TreeNode[], key: TreeKey): TreeNode | undefined {
    for (const node of data) {
      if (node.key === key) return node;
      if (node.children) {
        const found = findNode(node.children, key);
        if (found) return found;
      }
    }
    return undefined;
  }

  // --- 纯函数: 收集全部有 children 的节点 key (defaultExpandAll 用) ---
  function collectExpandable(data: TreeNode[], acc: TreeKey[]): TreeKey[] {
    for (const node of data) {
      if (node.children && node.children.length > 0) {
        acc.push(node.key);
        collectExpandable(node.children, acc);
      }
    }
    return acc;
  }

  function asKeyArray(v: TreeKey | TreeKey[] | null | undefined): TreeKey[] {
    if (v === null || v === undefined) return [];
    return Array.isArray(v) ? [...v] : [v];
  }

  function getInitialSingle(): TreeKey | null {
    if (Array.isArray(defaultValue)) return defaultValue[0] ?? null;
    return defaultValue ?? null;
  }
  function getInitialChecked(): Set<TreeKey> {
    return new Set(asKeyArray(defaultValue));
  }
  function getInitialOpen(): boolean {
    return defaultOpen;
  }
  function getInitialExpanded(): Set<TreeKey> {
    // treeDefaultExpandedKeys 与 defaultExpandAll 取并集（非受控初始展开集）。
    const set = new Set<TreeKey>(treeDefaultExpandedKeys ?? []);
    if (defaultExpandAll) {
      // defaultExpandAll 需用标准化后的 key（fieldNames 自定义时才能识别 children）。
      const base = fieldNamesDefault ? treeData : normalizeNodes(treeData);
      for (const k of collectExpandable(base, [])) set.add(k);
    }
    return set;
  }

  // --- 受控 value (红线 #1): 不无条件回写 value，仅 onChange ---
  const isValueControlled = $derived(value !== undefined);

  // 单选：当前选中 key
  let innerValue = $state<TreeKey | null>(getInitialSingle());
  const currentValue = $derived<TreeKey | null>(
    isValueControlled
      ? (Array.isArray(value) ? (value[0] ?? null) : (value ?? null))
      : innerValue,
  );

  // 多选：叶子级显式勾选 base + conduct 归一（含半选）
  let innerChecked = $state<Set<TreeKey>>(getInitialChecked());
  const currentCheckedBase = $derived<Set<TreeKey>>(
    isValueControlled ? new Set(asKeyArray(value)) : innerChecked,
  );
  const checkState = $derived.by(() => {
    if (!multiple) return { checked: new Set<TreeKey>(), half: new Set<TreeKey>() };
    if (isUnRelated) return { checked: new Set(currentCheckedBase), half: new Set<TreeKey>() };
    return conduct(mergedTree as unknown as TreeNodeData[], currentCheckedBase);
  });
  // autoMergeValue=true 时把 showCheckedStrategy='all' 升级为 'parent'（父选不含后代）。
  const effectiveStrategy = $derived<CheckedStrategy>(
    !autoMergeValue
      ? showCheckedStrategy
      : showCheckedStrategy === 'all'
        ? 'parent'
        : showCheckedStrategy,
  );

  // 回填值/Tag 收敛集（effectiveStrategy）：unRelated 无父子关系故策略不生效（取全 checked）。
  const strategyKeys = $derived.by<TreeKey[]>(() => {
    if (!multiple) return [];
    if (isUnRelated) return [...checkState.checked];
    return collectCheckedByStrategy(
      mergedTree as unknown as TreeNodeData[],
      checkState.checked,
      effectiveStrategy,
    );
  });
  // trigger 回显的已选节点（按收敛策略，树序）
  const checkedNodes = $derived.by<TreeNode[]>(() => {
    if (!multiple) return [];
    const keep = new Set(strategyKeys);
    const out: TreeNode[] = [];
    const walk = (nodes: TreeNode[]) => {
      for (const n of nodes) {
        if (keep.has(n.key)) out.push(n);
        if (n.children) walk(n.children);
      }
    };
    walk(mergedTree);
    return out;
  });
  // maxTagCount 折叠：显示前 N 个 tag + 隐藏数（仅影响显示，不改 value，红线 #1/#2）。
  const visibleTagNodes = $derived(
    maxTagCount !== undefined && maxTagCount >= 0
      ? checkedNodes.slice(0, maxTagCount)
      : checkedNodes,
  );
  const hiddenTagCount = $derived(
    maxTagCount !== undefined && maxTagCount >= 0
      ? Math.max(0, checkedNodes.length - maxTagCount)
      : 0,
  );

  // --- 受控 open (红线 #1): 不无条件回写 open，仅 onOpenChange ---
  const isOpenControlled = $derived(open !== undefined);
  let innerOpen = $state(getInitialOpen());
  const isOpen = $derived(isOpenControlled ? !!open : innerOpen);

  // onVisibleChange 是 onOpenChange 别名：isOpen 变化时同步触发。
  $effect(() => {
    onVisibleChange?.(isOpen);
  });

  // --- 本地展开状态 (红线 #2): expandedKeys 本地 $state Set，不依赖挂载 registry ---
  let expandedKeys = $state<Set<TreeKey>>(getInitialExpanded());

  const selectedNode = $derived(
    currentValue === null ? undefined : findNode(mergedTree, currentValue),
  );
  const displayLabel = $derived(selectedNode?.label ?? '');
  const hasSelection = $derived(
    multiple ? checkedNodes.length > 0 : selectedNode !== undefined,
  );
  const showClear = $derived(clearable && !disabled && hasSelection);

  function setValue(next: TreeKey | null) {
    if (!isValueControlled) innerValue = next;
    onChange?.(next);
  }

  // 多选：勾选 base 变更 → conduct 归一 → 按 effectiveStrategy 收敛后回调
  function setChecked(nextBase: Set<TreeKey>) {
    if (!isValueControlled) innerChecked = nextBase;
    if (isUnRelated) {
      onChange?.([...nextBase]);
      return;
    }
    const resolved = conduct(mergedTree as unknown as TreeNodeData[], nextBase).checked;
    onChange?.(
      collectCheckedByStrategy(
        mergedTree as unknown as TreeNodeData[],
        resolved,
        effectiveStrategy,
      ),
    );
  }

  function toggleCheckNode(node: TreeNode) {
    if (node.disabled || disabled) return;
    let nextBase: Set<TreeKey>;
    if (isUnRelated) {
      nextBase = new Set(currentCheckedBase);
      if (nextBase.has(node.key)) nextBase.delete(node.key);
      else nextBase.add(node.key);
    } else {
      nextBase = toggleCheck(mergedTree as unknown as TreeNodeData[], currentCheckedBase, node.key);
    }
    setChecked(nextBase);
  }

  // 移除某 tag：把该节点（及其子树，related）从勾选中去掉
  function removeChecked(node: TreeNode) {
    if (disabled) return;
    const isChecked = checkState.checked.has(node.key);
    if (isUnRelated) {
      const next = new Set(currentCheckedBase);
      next.delete(node.key);
      setChecked(next);
    } else if (isChecked) {
      // 复用 toggleCheck：已选 → 取消（含子树联动）
      setChecked(toggleCheck(mergedTree as unknown as TreeNodeData[], currentCheckedBase, node.key));
    }
  }

  function nodeCheckState(node: TreeNode): { checked: boolean; half: boolean } {
    return {
      checked: checkState.checked.has(node.key),
      half: !checkState.checked.has(node.key) && checkState.half.has(node.key),
    };
  }

  function setOpen(next: boolean) {
    if (next === isOpen) return;
    if (!next) searchValue = '';
    if (!isOpenControlled) innerOpen = next;
    onOpenChange?.(next);
    onVisibleChange?.(next);
  }

  function toggleOpen() {
    if (disabled) return;
    if (isOpen && !clickTriggerToHide) return;
    setOpen(!isOpen);
  }

  function hasChildren(node: TreeNode): boolean {
    return !!node.children && node.children.length > 0;
  }

  // 行是否可展开（含异步占位，对齐 Tree.isExpandable）：
  // 有真实子节点 → 是；否则有 loadData、非叶子、且（未加载 → 显示箭头占位 / 已加载非空 → 是）。
  function isExpandable(node: TreeNode): boolean {
    if (hasChildren(node)) return true;
    if (!loadData || node.isLeaf === true) return false;
    if (loadedKeys.has(node.key)) return (loadedChildren.get(node.key)?.length ?? 0) > 0;
    return true;
  }

  // --- 搜索过滤（本地 state，复用 core computeFilteredKeys）---
  let searchValue = $state('');
  const trimmedSearch = $derived(searchValue.trim());
  // remote 模式不本地过滤（外部更新 treeData），仅本地 filterable 时高亮/收敛命中链。
  const searchActive = $derived(!remote && isFilterable && trimmedSearch.length > 0);
  const filterResult = $derived.by(() => {
    if (!searchActive) return { matched: new Set<TreeKey>(), expand: new Set<TreeKey>() };
    const lower = trimmedSearch.toLowerCase();
    return computeFilteredKeys(
      mergedTree as unknown as TreeNodeData[],
      (node) => node.label.toLowerCase().includes(lower),
    );
  });
  // 节点在搜索结果可见：命中本身、或在祖先链/含命中后代（expand 集）。
  // showFilteredOnly=true 时只显示精确命中节点，不显示祖先链。
  function nodeVisible(key: TreeKey): boolean {
    if (!searchActive) return true;
    if (showFilteredOnly) return filterResult.matched.has(key);
    return filterResult.matched.has(key) || filterResult.expand.has(key);
  }

  function isExpanded(key: TreeKey): boolean {
    // 搜索激活时强制展开命中链
    if (searchActive && filterResult.expand.has(key)) return true;
    return expandedKeys.has(key);
  }

  // --- 虚拟滚动（复用 Tree 范式）：派生展开集 → flattenVisible 扁平可见行 → fixedRange 视口切片 ---
  // 搜索激活时把过滤展开集并入可见展开集（派生，不写回受控 expandedKeys，红线 #1/#2）。
  // expandAll=true 时动态收集所有可展开节点 key。
  const effectiveExpanded = $derived.by(() => {
    if (expandAll) {
      const set = new Set<TreeKey>();
      const walk = (nodes: TreeNode[]) => {
        for (const n of nodes) {
          if (n.children && n.children.length > 0) {
            set.add(n.key);
            walk(n.children);
          }
        }
      };
      walk(mergedTree);
      // 同时并入搜索展开链。
      if (searchActive) for (const k of filterResult.expand) set.add(k);
      return set;
    }
    if (!searchActive) return expandedKeys;
    const merged = new Set(expandedKeys);
    for (const k of filterResult.expand) merged.add(k);
    return merged;
  });
  // virtualizeThreshold：节点总数 ≥ 阈值时自动启用虚拟化（virtualized=true 时强制启用）。
  const totalNodeCount = $derived.by(() => {
    let n = 0;
    const walk = (nodes: TreeNode[]) => {
      for (const node of nodes) {
        n++;
        if (node.children) walk(node.children);
      }
    };
    walk(mergedTree);
    return n;
  });
  const useVirtual = $derived(virtualized || totalNodeCount >= virtualizeThreshold);
  // 可见扁平节点：虚拟化用于视口切片，非虚拟化也用于键盘 roving 导航（红线 #2 纯派生）。
  const flat = $derived(
    flattenVisible(mergedTree as unknown as TreeNodeData[], effectiveExpanded),
  );
  // 搜索时仅保留命中或祖先链上的行（与递归 snippet 的 nodeVisible 一致）。
  const visibleFlat = $derived.by<FlatNode[]>(() => {
    if (!searchActive) return flat;
    return flat.filter(
      (f) => filterResult.matched.has(f.node.key) || filterResult.expand.has(f.node.key),
    );
  });

  // --- roving 焦点：activeKey + 派生高亮（aria-activedescendant）；render 不读 DOM（红线 #2）---
  let activeKey = $state<TreeKey | null>(null);
  const activeDescId = $derived.by(() => {
    if (activeKey === null) return undefined;
    const exists = visibleFlat.some((f) => f.node.key === activeKey);
    return exists ? itemId(activeKey) : undefined;
  });

  // 面板关闭时复位高亮，避免下次打开停在旧项。
  $effect(() => {
    if (!isOpen) activeKey = null;
  });

  const VIRTUAL_OVERSCAN = 4;
  let viewportEl = $state<HTMLDivElement | null>(null);
  let scrollTop = $state(0);
  let rafId = 0;
  const rowHeight = $derived(itemHeight > 0 ? itemHeight : 32);
  const totalHeight = $derived(visibleFlat.length * rowHeight);
  // 可视区间：纯 $derived，仅依赖本地 $state，render-safe 不读 DOM（红线 #2）。
  const vRange = $derived(
    useVirtual
      ? fixedRange(scrollTop, height, rowHeight, visibleFlat.length, VIRTUAL_OVERSCAN)
      : { startIndex: 0, endIndex: visibleFlat.length },
  );
  const renderFlat = $derived(
    useVirtual ? visibleFlat.slice(vRange.startIndex, vRange.endIndex) : visibleFlat,
  );

  // 滚动监听（命令式 + rAF 节流 + cleanup，红线 #3）。
  $effect(() => {
    const el = viewportEl;
    if (!el || !useVirtual) return;
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

  // 面板关闭时复位 scrollTop，避免下次打开停在旧位置（命令式 viewport 也随之卸载/重建）。
  $effect(() => {
    if (!isOpen) scrollTop = 0;
  });

  // --- 命中文本高亮：拆成片段供模板渲染 ---
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

  function toggleExpand(node: TreeNode) {
    const key = node.key;
    const next = new Set(expandedKeys);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
      // autoExpandParent：展开时同时展开所有祖先链。
      if (autoExpandParent) {
        const findAncestors = (nodes: TreeNode[], target: TreeKey, path: TreeKey[]): TreeKey[] | null => {
          for (const n of nodes) {
            if (n.key === target) return path;
            if (n.children) {
              const found = findAncestors(n.children, target, [...path, n.key]);
              if (found) return found;
            }
          }
          return null;
        };
        const ancestors = findAncestors(mergedTree, key, []);
        if (ancestors) for (const ak of ancestors) next.add(ak);
      }
      // 展开未加载的异步节点：先取数据（数据到位后合并树派生即显示子节点）。
      if (!hasChildren(node) && loadData && !loadedKeys.has(key)) void loadChildren(node);
    }
    expandedKeys = next;
  }

  function selectNode(node: TreeNode) {
    if (node.disabled || disabled) return;
    if (multiple) {
      // 多选：父节点也可勾选（联动子树），不关面板
      toggleCheckNode(node);
      return;
    }
    if (leafOnly && isExpandable(node)) {
      toggleExpand(node);
      return;
    }
    setValue(node.key);
    if (clickToHide) setOpen(false);
  }

  // 行点击处理器：expandAction 控制行点击是否展开。
  function handleRowClick(node: TreeNode) {
    if (node.disabled || disabled) return;
    if (multiple) {
      toggleCheckNode(node);
      return;
    }
    if (leafOnly && isExpandable(node)) {
      if (expandAction !== false) toggleExpand(node);
      return;
    }
    // expandAction='click' 时行点击也展开。
    if (expandAction === 'click' && isExpandable(node)) {
      toggleExpand(node);
    }
    setValue(node.key);
    if (clickToHide) setOpen(false);
  }

  // 行双击处理器：expandAction='doubleClick' 时双击展开/折叠。
  function handleRowDoubleClick(node: TreeNode) {
    if (expandAction === 'doubleClick' && isExpandable(node)) toggleExpand(node);
  }

  function clearAll(e: MouseEvent) {
    e.stopPropagation();
    if (disabled) return;
    if (multiple) {
      setChecked(new Set());
    } else {
      setValue(null);
    }
    onClear?.(e);
  }

  // --- 键盘 roving 导航（aria-activedescendant 模型）：焦点留 role=tree 容器，
  //     方向键移动 activeKey 高亮，全部基于派生 visibleFlat 与 activeKey（红线 #2）---
  function isRowDisabled(node: TreeNode): boolean {
    return disabled || !!node.disabled;
  }
  function activeIndex(): number {
    if (activeKey === null) return -1;
    return visibleFlat.findIndex((f) => f.node.key === activeKey);
  }
  function moveNext() {
    const cur = activeIndex();
    let i = cur < 0 ? 0 : cur + 1;
    while (i < visibleFlat.length && isRowDisabled((visibleFlat[i] as FlatNode).node as unknown as TreeNode)) i++;
    if (i < visibleFlat.length) activeKey = (visibleFlat[i] as FlatNode).node.key;
  }
  function movePrev() {
    const cur = activeIndex();
    let i = cur < 0 ? visibleFlat.length - 1 : cur - 1;
    while (i >= 0 && isRowDisabled((visibleFlat[i] as FlatNode).node as unknown as TreeNode)) i--;
    if (i >= 0) activeKey = (visibleFlat[i] as FlatNode).node.key;
  }
  function moveFirst() {
    let i = 0;
    while (i < visibleFlat.length && isRowDisabled((visibleFlat[i] as FlatNode).node as unknown as TreeNode)) i++;
    if (i < visibleFlat.length) activeKey = (visibleFlat[i] as FlatNode).node.key;
  }
  function moveLast() {
    let i = visibleFlat.length - 1;
    while (i >= 0 && isRowDisabled((visibleFlat[i] as FlatNode).node as unknown as TreeNode)) i--;
    if (i >= 0) activeKey = (visibleFlat[i] as FlatNode).node.key;
  }
  function currentFlat(): FlatNode | undefined {
    const i = activeIndex();
    return i >= 0 ? visibleFlat[i] : undefined;
  }

  // 命令式滚到指定行索引使其落入视口（虚拟化时键盘移动 activeKey 后调用）。
  function scrollIndexIntoView(index: number) {
    const el = viewportEl;
    if (!el || !useVirtual || index < 0) return;
    const itemStart = index * rowHeight;
    const top = el.scrollTop;
    const bottom = top + el.clientHeight;
    if (itemStart >= top && itemStart + rowHeight <= bottom) return;
    const align = itemStart < top ? 'start' : 'end';
    const target = scrollOffsetForIndex(itemStart, rowHeight, el.clientHeight, totalHeight, align);
    el.scrollTop = target;
    scrollTop = target;
  }
  function scrollActiveIntoView() {
    if (!useVirtual || activeKey === null) return;
    scrollIndexIntoView(visibleFlat.findIndex((f) => f.node.key === activeKey));
  }

  function onTreeKeydown(e: KeyboardEvent) {
    if (disabled || visibleFlat.length === 0) return;
    const intent = rovingKeyFromEvent(e.key);
    // 首次方向键：从首项起步。
    if (activeKey === null && intent) {
      e.preventDefault();
      moveFirst();
      scrollActiveIntoView();
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
        if (f && isExpandable(f.node as unknown as TreeNode)) {
          if (!isExpanded(f.node.key)) toggleExpand(f.node as unknown as TreeNode);
          else moveNext();
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (f && isExpandable(f.node as unknown as TreeNode) && isExpanded(f.node.key)) {
          toggleExpand(f.node as unknown as TreeNode);
        } else if (f && f.parentKey !== null) {
          activeKey = f.parentKey;
        }
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
        if (f) selectNode(f.node as unknown as TreeNode);
        break;
      case ' ':
        e.preventDefault();
        if (f) selectNode(f.node as unknown as TreeNode);
        break;
      default:
        return;
    }
    scrollActiveIntoView();
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
    searchValue = e.currentTarget.value;
    if (remote) scheduleSearch(searchValue.trim());
  }

  // --- DOM 引用：触发根 + portal 面板（定位由 use:floating action 接管）---
  let rootEl = $state<HTMLDivElement | null>(null);
  let panelEl = $state<HTMLDivElement | null>(null);

  // --- destroyOnClose：默认 false 时首开后保留浮层 DOM（仅隐藏），true 时关闭即卸载，重开重建。 ---
  let hasBeenOpened = $state(false);
  $effect(() => {
    if (isOpen) hasBeenOpened = true;
  });
  const shouldRender = $derived(destroyOnClose ? isOpen : isOpen || hasBeenOpened);

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
      'cd-tree-select',
      `cd-tree-select--${size}`,
      `cd-tree-select--${effStatus}`,
      disabled && 'cd-tree-select--disabled',
      isOpen && 'cd-tree-select--open',
      borderless && 'cd-tree-select--borderless',
      showLine && 'cd-tree-select--show-line',
      !motionExpand && 'cd-tree-select--no-motion-expand',
      triggerTagWrap && 'cd-tree-select--tag-wrap',
    ]
      .filter(Boolean)
      .join(' '),
  );

  // optionListStyle 规范化为 style 字符串。
  const optionListStyleStr = $derived(
    typeof optionListStyle === 'string'
      ? optionListStyle
      : optionListStyle
        ? Object.entries(optionListStyle)
            .map(([k, v]) => `${k}:${v}`)
            .join(';')
        : undefined,
  );
</script>

{#snippet nodeRow(
  node: TreeNode,
  level: number,
  posStyle: string | undefined,
  setSize: number,
  posInSet: number,
)}
  {@const expandable = isExpandable(node)}
  {@const loading = loadingKeys.has(node.key)}
  {@const nodeOpen = expandable && isExpanded(node.key)}
  {@const cs = nodeCheckState(node)}
  {@const selected = multiple ? cs.checked : currentValue === node.key}
  {@const active = activeKey === node.key}
  <!-- treeitem 焦点经容器 aria-activedescendant 漫游管理，行本身 tabindex=-1，键盘统一在 role=tree 容器处理 -->
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div
    id={itemId(node.key)}
    class="cd-tree-select__node"
    class:cd-tree-select__node--selected={!multiple && selected}
    class:cd-tree-select__node--active={active}
    role="treeitem"
    aria-level={level + 1}
    aria-setsize={setSize}
    aria-posinset={posInSet}
    aria-selected={selected}
    aria-checked={multiple ? (cs.checked ? true : cs.half ? 'mixed' : false) : undefined}
    aria-expanded={expandable ? nodeOpen : undefined}
    aria-disabled={node.disabled || undefined}
    style={[posStyle, `padding-inline-start: calc(${level} * var(--cd-tree-indent))`]
      .filter(Boolean)
      .join('; ')}
    onclick={() => selectNode(node)}
    tabindex={-1}
  >
    {#if loading}
      <span class="cd-tree-select__expand cd-tree-select__expand--loading" aria-hidden="true">
        <span class="cd-tree-select__spinner"></span>
      </span>
    {:else if expandable}
      <span
        class="cd-tree-select__expand"
        class:cd-tree-select__expand--open={nodeOpen}
        role="button"
        tabindex="-1"
        aria-label={nodeOpen ? loc().t('Tree.collapse') : loc().t('Tree.expand')}
        onclick={(e) => {
          e.stopPropagation();
          toggleExpand(node);
        }}
        onkeydown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            toggleExpand(node);
          }
        }}
      >
        <svg viewBox="0 0 16 16" width="10" height="10" aria-hidden="true" focusable="false">
          <path fill="currentColor" d="M6 4l4 4-4 4V4Z" />
        </svg>
      </span>
    {:else}
      <span class="cd-tree-select__expand cd-tree-select__expand--placeholder" aria-hidden="true"></span>
    {/if}
    {#if multiple}
      <span
        class="cd-tree-select__checkbox"
        class:cd-tree-select__checkbox--checked={cs.checked}
        class:cd-tree-select__checkbox--half={cs.half}
        aria-hidden="true"
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
    {#if showIcon}
      <span class="cd-tree-select__icon" aria-hidden="true">
        {#if icon}{@render icon({ node, expanded: nodeOpen, level })}{/if}
      </span>
    {/if}
    <span class="cd-tree-select__node-label">
      {#if searchActive}
        {#each highlightParts(node.label) as part, i (i)}
          {#if part.mark}<mark class="cd-tree-select__highlight">{part.text}</mark>{:else}{part.text}{/if}
        {/each}
      {:else}
        {node.label}
      {/if}
    </span>
  </div>
{/snippet}

{#snippet treeNodes(nodes: TreeNode[], level: number)}
  {@const setSize = nodes.length}
  {#each nodes as node, i (node.key)}
    {#if nodeVisible(node.key)}
      {@const nodeOpen = isExpandable(node) && isExpanded(node.key)}
      {@render nodeRow(node, level, undefined, setSize, i + 1)}
      {#if nodeOpen}
        {@render treeNodes(node.children ?? [], level + 1)}
      {/if}
    {/if}
  {/each}
{/snippet}

<div class={cls} bind:this={rootEl} {style}>
  <!-- combobox 容器用 div 以合法承载多选 tags / clear 等内部交互元素 -->
  <div
    class="cd-tree-select__trigger"
    role="combobox"
    aria-haspopup="tree"
    aria-expanded={isOpen}
    aria-controls={treeId}
    aria-activedescendant={isOpen && !searchActive ? activeDescId : undefined}
    aria-label={ariaLabel}
    aria-invalid={effStatus === 'error' || undefined}
    aria-disabled={disabled || undefined}
    tabindex={disabled ? -1 : 0}
    onclick={toggleOpen}
    onfocus={(e) => onFocus?.(e)}
    onblur={(e) => onBlur?.(e)}
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
      if (e.key === 'Escape') {
        setOpen(false);
        return;
      }
      // 打开态：搜索激活时焦点在搜索框，由其处理；否则触发器（焦点宿主）驱动树 roving。
      if (!searchActive) onTreeKeydown(e);
    }}
  >
    {#if prefix}
      <span class="cd-tree-select__prefix">
        {#if typeof prefix === 'string'}{prefix}{:else}{@render prefix()}{/if}
      </span>
    {/if}
    <span class="cd-tree-select__content">
      {#if multiple}
        {#if checkedNodes.length > 0}
          <span class="cd-tree-select__tags">
            {#each visibleTagNodes as node (node.key)}
              <Tag
                size={size === 'large' ? 'default' : 'small'}
                closable={!disabled}
                onClose={() => removeChecked(node)}
              >
                {node.label}
              </Tag>
            {/each}
            {#if hiddenTagCount > 0}
              <Tag size={size === 'large' ? 'default' : 'small'}>+{hiddenTagCount}</Tag>
            {/if}
          </span>
        {:else}
          <span class="cd-tree-select__placeholder">{placeholder}</span>
        {/if}
      {:else if hasSelection}
        <span class="cd-tree-select__value">{displayLabel}</span>
      {:else}
        <span class="cd-tree-select__placeholder">{placeholder}</span>
      {/if}
    </span>

    {#if showClear}
      <span
        class="cd-tree-select__clear"
        role="button"
        tabindex="-1"
        aria-label={loc().t('TreeSelect.clear')}
        onclick={(e) => { onClear?.(e); clearAll(e); }}
        onkeydown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClear?.(e as unknown as MouseEvent);
            clearAll(e as unknown as MouseEvent);
          }
        }}
      >
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
          <path
            fill="currentColor"
            d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm2.5 9.1-1.4 1.4L8 9.4 6.5 11l-1.4-1.4L6.6 8 5.1 6.5 6.5 5.1 8 6.6 9.5 5.1l1.4 1.4L9.4 8l1.1 1.1Z"
          />
        </svg>
      </span>
    {/if}

    {#if suffix}
      <span class="cd-tree-select__suffix">
        {#if typeof suffix === 'string'}{suffix}{:else}{@render suffix()}{/if}
      </span>
    {/if}
    <span class="cd-tree-select__arrow" aria-hidden="true">
      {#if arrowIcon}
        {@render arrowIcon()}
      {:else}
        <svg viewBox="0 0 16 16" width="12" height="12" focusable="false">
          <path fill="currentColor" d="M3.5 6 8 10.5 12.5 6l-1-1L8 8.5 4.5 5l-1 1Z" />
        </svg>
      {/if}
    </span>
  </div>

  {#if shouldRender}
    <div
      class="cd-tree-select__panel"
      class:cd-tree-select__panel--hidden={!isOpen}
      bind:this={panelEl}
      use:floating={{
        trigger: rootEl,
        placement: 'bottomStart',
        autoAdjust: true,
        offset: 4,
        matchWidth: dropdownMatchSelectWidth,
        getContainer: resolvePopupContainer,
        open: isOpen,
      }}
      id={treeId}
    >
      {#if isFilterable}
        <div class="cd-tree-select__search">
          <input
            class="cd-tree-select__search-input"
            type="text"
            role="combobox"
            aria-expanded={isOpen}
            aria-controls={treeId}
            aria-activedescendant={activeDescId}
            placeholder={loc().t('TreeSelect.searchPlaceholder')}
            aria-label={loc().t('TreeSelect.searchPlaceholder')}
            value={searchValue}
            oninput={onSearchInput}
            onkeydown={(e) => {
              if (e.key === 'Escape') {
                setOpen(false);
                return;
              }
              // 搜索框聚焦时方向键/Home/End/Enter 在过滤后的可见树上 roving。
              onTreeKeydown(e);
            }}
          />
        </div>
      {/if}
      {#if mergedTree.length === 0}
        <div class="cd-tree-select__tree" role="tree">
          <div class="cd-tree-select__empty">{loc().t('TreeSelect.emptyText')}</div>
        </div>
      {:else if useVirtual}
        <!-- 虚拟滚动（复用 Tree 范式）：role=tree 容器自身滚动，spacer 撑总高，行绝对定位按索引偏移。
             只渲染视口内切片 renderFlat，保持 role=tree → role=treeitem 语义不变。 -->
        <div
          class="cd-tree-select__tree cd-tree-select__tree--virtual"
          role="tree"
          aria-multiselectable={multiple || undefined}
          aria-activedescendant={activeDescId}
          aria-disabled={disabled || undefined}
          tabindex={disabled ? -1 : 0}
          bind:this={viewportEl}
          style={`block-size:${height}px`}
          onkeydown={onTreeKeydown}
        >
          {#if visibleFlat.length === 0}
            <div class="cd-tree-select__empty">{loc().t('TreeSelect.emptyText')}</div>
          {:else}
            <div class="cd-tree-select__spacer" style={`block-size:${totalHeight}px`}>
              {#each renderFlat as f, i (f.node.key)}
                {@render nodeRow(
                  f.node as unknown as TreeNode,
                  f.level,
                  `position:absolute; inset-inline:0; transform:translateY(${(vRange.startIndex + i) * rowHeight}px); block-size:${rowHeight}px`,
                  f.setSize,
                  f.posInSet,
                )}
              {/each}
            </div>
          {/if}
        </div>
      {:else}
        <div
          class="cd-tree-select__tree"
          role="tree"
          aria-multiselectable={multiple || undefined}
          aria-activedescendant={activeDescId}
          aria-disabled={disabled || undefined}
          tabindex={disabled ? -1 : 0}
          onkeydown={onTreeKeydown}
        >
          {@render treeNodes(mergedTree, 0)}
          {#if searchActive && filterResult.matched.size === 0}
            <div class="cd-tree-select__empty">{loc().t('TreeSelect.emptyText')}</div>
          {/if}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .cd-tree-select {
    position: relative;
    display: inline-flex;
    inline-size: 100%;
    font-size: var(--cd-select-font-size);
  }
  .cd-tree-select__trigger {
    display: flex;
    align-items: center;
    gap: var(--cd-spacing-2);
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
    transition: border-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-tree-select--small .cd-tree-select__trigger {
    min-block-size: var(--cd-select-height-small);
  }
  .cd-tree-select--large .cd-tree-select__trigger {
    min-block-size: var(--cd-select-height-large);
  }
  .cd-tree-select__trigger:focus-visible {
    outline: none;
    border-color: var(--cd-select-border-active);
    box-shadow: var(--cd-focus-ring);
  }
  .cd-tree-select--open .cd-tree-select__trigger {
    border-color: var(--cd-select-border-active);
  }
  .cd-tree-select--error .cd-tree-select__trigger {
    border-color: var(--cd-select-border-error);
  }
  .cd-tree-select__trigger[aria-disabled='true'] {
    background: var(--cd-color-fill-0);
    color: var(--cd-color-text-3);
    cursor: not-allowed;
  }
  .cd-tree-select__content {
    display: flex;
    flex: 1 1 auto;
    align-items: center;
    min-inline-size: 0;
  }
  .cd-tree-select__value {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .cd-tree-select__placeholder {
    color: var(--cd-input-color-placeholder);
  }
  .cd-tree-select__clear,
  .cd-tree-select__arrow {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    color: var(--cd-color-text-2);
  }
  .cd-tree-select__clear {
    cursor: pointer;
  }
  .cd-tree-select__clear:hover {
    color: var(--cd-color-text-0);
  }
  .cd-tree-select__arrow {
    transition: transform var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-tree-select--open .cd-tree-select__arrow {
    transform: rotate(180deg);
  }
  /* 面板 portal 到容器，由 use:floating action 写 position:fixed + transform 定位 */
  .cd-tree-select__panel {
    z-index: var(--cd-select-dropdown-z);
    padding-block: var(--cd-spacing-1);
    background: var(--cd-select-dropdown-bg);
    border-radius: var(--cd-select-dropdown-radius);
    box-shadow: var(--cd-select-dropdown-shadow);
  }
  /* destroyOnClose=false 关闭后保留 DOM 但不可见、不可交互、不占位 */
  .cd-tree-select__panel--hidden {
    display: none;
  }
  .cd-tree-select__search {
    padding-block-end: var(--cd-spacing-1);
    padding-inline: var(--cd-spacing-2);
  }
  .cd-tree-select__search-input {
    inline-size: 100%;
    block-size: var(--cd-input-height-small);
    padding-inline: var(--cd-input-padding-x);
    background: var(--cd-input-bg, transparent);
    color: inherit;
    border: 1px solid var(--cd-input-border);
    border-radius: var(--cd-input-radius);
    font: inherit;
    font-size: var(--cd-font-size-1);
  }
  .cd-tree-select__search-input:focus-visible {
    outline: none;
    border-color: var(--cd-input-border-active);
    box-shadow: var(--cd-focus-ring);
  }
  .cd-tree-select__tree {
    max-block-size: 14rem;
    overflow-y: auto;
  }
  /* 虚拟滚动：容器自身定高滚动，spacer 绝对定位行布局，max-block-size 让位给固定 height */
  .cd-tree-select__tree--virtual {
    position: relative;
    max-block-size: none;
    overflow-y: auto;
  }
  .cd-tree-select__spacer {
    position: relative;
    inline-size: 100%;
  }
  .cd-tree-select__highlight {
    padding: 0;
    color: var(--cd-tree-search-highlight-color);
    background: var(--cd-tree-search-highlight-bg);
  }
  .cd-tree-select__node {
    display: flex;
    align-items: center;
    gap: var(--cd-spacing-1);
    block-size: var(--cd-tree-node-height);
    padding-inline-end: var(--cd-tree-node-padding-x);
    cursor: pointer;
  }
  .cd-tree-select__node:hover {
    background: var(--cd-tree-node-bg-hover);
  }
  .cd-tree-select__node--selected {
    color: var(--cd-tree-node-color-selected);
    background: var(--cd-tree-node-bg-active);
  }
  /* 键盘 roving 高亮（aria-activedescendant 当前项），焦点环不依赖真实 DOM 焦点 */
  .cd-tree-select__node--active {
    box-shadow: var(--cd-focus-ring);
  }
  .cd-tree-select__node:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-tree-select__node[aria-disabled='true'] {
    color: var(--cd-color-text-3);
    cursor: not-allowed;
  }
  .cd-tree-select__expand {
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
  .cd-tree-select__expand--open {
    transform: rotate(90deg);
  }
  .cd-tree-select__expand--placeholder {
    cursor: default;
  }
  .cd-tree-select__expand--loading {
    cursor: default;
    transition: none;
  }
  .cd-tree-select__spinner {
    inline-size: 0.75rem;
    block-size: 0.75rem;
    border: 2px solid var(--cd-color-border, currentColor);
    border-block-start-color: var(--cd-color-primary);
    border-radius: 50%;
    animation: cd-tree-select-spin 0.7s linear infinite;
  }
  @keyframes cd-tree-select-spin {
    to {
      transform: rotate(360deg);
    }
  }
  .cd-tree-select__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    inline-size: 0;
    block-size: 1rem;
    color: var(--cd-tree-node-color);
  }
  /* 有自定义图标内容时撑开尺寸（对齐 Tree 的 .cd-tree__icon） */
  .cd-tree-select__icon:not(:empty) {
    inline-size: 1rem;
  }
  .cd-tree-select__node-label {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .cd-tree-select__checkbox {
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
  }
  .cd-tree-select__checkbox--checked,
  .cd-tree-select__checkbox--half {
    background: var(--cd-color-primary);
    border-color: var(--cd-color-primary);
  }
  .cd-tree-select__tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--cd-spacing-1);
    align-items: center;
    min-inline-size: 0;
  }
  .cd-tree-select__empty {
    padding: var(--cd-tree-node-padding-x);
    color: var(--cd-color-text-3);
    text-align: center;
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-tree-select__trigger,
    .cd-tree-select__arrow,
    .cd-tree-select__expand {
      transition: none;
    }
    .cd-tree-select__spinner {
      animation: none;
    }
  }
</style>
