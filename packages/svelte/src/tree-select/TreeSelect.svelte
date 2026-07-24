<!--
  TreeSelect — 严格对齐 Semi Design treeSelect。
  基础子集: 单选、可展开/收起的单面板树、叶子或任意节点选中 (leafOnly 控制)。
  multiple: checkbox 多选 + 父子联动 (复用 core conduct/toggleCheck)，trigger 多 tag 回显可单独移除。
  filterable: 面板顶部搜索框过滤节点（复用 core computeFilteredKeys），命中 + 祖先链可见、命中文本高亮。
  Token-driven, a11y-correct, 受控/非受控。
  keyMaps：自定义节点字段名（key/label/value）映射任意后端数据；派生只读标准化，默认字段名时零开销。
  loadData：展开未加载的非叶子节点时异步取子节点，结果缓存进本地 SvelteMap 并派生合并树喂给
  所有 core 函数（不写回受控 treeData，红线 #1）；加载中显示 spinner，竞态由 loadedKeys/loadingKeys 去重。
  virtualize（对象形式，对齐 Semi）：大数据树虚拟滚动。复用 Tree 范式——直接用 core fixedRange 纯函数
  自建轻量 fixed 定高虚拟化（非复用 VirtualList 组件，其 role=list/listitem 会破坏 role=tree→treeitem
  语义），保持 role=tree 容器 + 行 role=treeitem 不变；只渲染视口内切片（flattenVisible 派生扁平节点 +
  区间纯派生，红线 #2）。滚动监听命令式 + rAF 节流 + cleanup（红线 #3）。虚拟化时与搜索 filterable 互斥
  （搜索强制展开命中链与定高虚拟化叠加复杂，故虚拟化优先静态/异步大树场景）。
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
  import {
    IconTreeTriangleDown,
    IconCheckboxTick,
    IconCheckboxIndeterminate,
    IconSearch,
    IconClear,
    IconChevronDown,
  } from '@chenzy-design/icons';
  import { useLocale } from '../locale-provider/index.js';
  import { getGlobalPopupContainer } from '../config-provider/index.js';
  import { floating } from '../_floating/use-floating.js';
  import type { Placement } from '@chenzy-design/core';
  import Tag from '../tag/Tag.svelte';
  import Popover from '../popover/Popover.svelte';
  import type { TreeNode, TreeKey } from './types.js';
  import { getInputGroupContext } from '../input/context.js';

  type Size = 'small' | 'default' | 'large';
  type Status = 'default' | 'warning' | 'error';

  interface Props {
    value?: TreeKey | TreeKey[] | null;
    defaultValue?: TreeKey | TreeKey[] | null;
    /**
     * 树数据源。默认节点字段为 key/label/children；
     * 用 keyMaps 自定义字段名时可传任意后端结构（如 { id, name }）。
     */
    treeData?: TreeNode[];
    defaultOpen?: boolean;
    /** 多选：面板节点显示 checkbox + 父子联动，trigger 多 tag 回显 */
    multiple?: boolean;
    /**
     * 多选父子是否级联联动（对齐 Semi/Tree）。'related'（默认）父子联动；
     * 'unRelated' 互不影响（勾选无半选）。
     */
    checkRelation?: 'related' | 'unRelated';
    /** 多选回填 Tag 最大展示数，超出折叠为 +N（仅影响显示，不改 value）。 */
    maxTagCount?: number;
    placeholder?: string;
    size?: Size;
    status?: Status;
    disabled?: boolean;
    /** 值不为空时 trigger 展示清除按钮（对齐 Semi showClear）。 */
    showClear?: boolean;
    leafOnly?: boolean;
    defaultExpandAll?: boolean;
    /** 默认展开的节点 key（非受控初始展开集，与 defaultExpandAll 取并集；对齐 Semi defaultExpandedKeys）。 */
    defaultExpandedKeys?: TreeKey[];
    /** 面板顶部搜索框过滤节点（命中 + 祖先链可见、高亮命中文本） */
    filterable?: boolean;
    /**
     * 是否按输入筛选节点（对齐 Semi filterTreeNode）：
     * true 开启搜索框，默认对 treeNodeFilterProp（默认 'label'）做大小写不敏感包含匹配；
     * 传函数则用作自定义匹配谓词 (inputValue, treeNodeString, data?) => boolean，
     * treeNodeString 为按 treeNodeFilterProp 取到的节点文本，data 为节点原始数据。
     * 与 filterable 二者其一为真即显示搜索框。
     */
    filterTreeNode?: boolean | ((inputValue: string, treeNodeString: string, data?: TreeNode) => boolean);
    /**
     * 远程搜索：输入仅触发 onSearch（防抖后），不本地过滤（由外部更新 treeData）。
     * 隐含 filterable 行为（显示搜索框）。默认 false。
     */
    remote?: boolean;
    /**
     * 搜索输入回调（对齐 Semi onSearch）：入参为当前输入、过滤后应展开的节点 keys、命中节点数组。
     * remote 时用于外部更新 treeData；本地过滤时可配合 expandedKeys 受控搜索展开。
     */
    onSearch?: (input: string, filteredExpandedKeys: TreeKey[], filteredNodes: TreeNode[]) => void;
    /** 异步加载子节点：展开未加载的非叶子节点时调用，返回该节点的子节点数组。与 Tree 的 loadData 对齐。 */
    loadData?: (node: TreeNode) => Promise<TreeNode[]>;
    /**
     * 列表虚拟化（对齐 Semi）：仅渲染视口内可见节点行，适合大数据树（1000+ 节点）。
     * 传入对象即显式开启；height 视口高度（默认 224）、itemSize 行高（默认 32）、width 宽度。
     */
    virtualize?: { height?: number; width?: number | string; itemSize?: number };
    /** 浮层弹出位置（对齐 Semi，参考 Tooltip position）。默认 bottomLeft。 */
    position?: string;
    /** 浮层宽度对齐触发器（min-inline-size = 触发器宽）。默认 true。 */
    dropdownMatchSelectWidth?: boolean;
    /** 浮层挂载容器，缺省 ConfigProvider 全局值再回退 document.body。 */
    getPopupContainer?: () => HTMLElement | null | undefined;
    onChange?: (value: TreeKey | TreeKey[] | null) => void;
    ariaLabel?: string;
    /** aria-labelledby：关联外部 label 元素（Form.Field 透传 labelId，对齐 Semi）。 */
    ariaLabelledby?: string;
    /** aria-describedby：关联 helpText / extraText（Form.Field 透传）。 */
    ariaDescribedby?: string;
    /** aria-errormessage：error 态关联错误信息容器（Form.Field 透传）。 */
    ariaErrormessage?: string;
    /** aria-required：必填语义（Form.Field required 透传）。 */
    ariaRequired?: boolean;
    /** 触发器点击是否阻止事件冒泡（对齐 Semi stopPropagation）。默认 true。 */
    stopPropagation?: boolean;
    /**
     * 完全自定义触发器渲染（替换默认选择框）。与 Cascader.triggerRender 对齐：
     * 参数含当前 value / placeholder / isOpen / disabled，由使用方决定如何呈现。
     */
    triggerRender?: Snippet<[{ value: TreeKey | TreeKey[] | null | undefined; placeholder: string; isOpen: boolean; disabled: boolean }]>;
    /** 触发器内嵌标签：渲染在回填值/占位符之前（Snippet 或字符串）。对齐 Semi insetLabel。 */
    insetLabel?: Snippet | string;
    /** 内嵌标签的 id（a11y 关联用），对齐 Semi insetLabelId。 */
    insetLabelId?: string;
    /** 下拉浮层开合动画（淡入）。默认 true。与 Cascader/Dropdown 的 motion 对齐。 */
    motion?: boolean;
    // 注：Semi 的 mouseEnterDelay/mouseLeaveDelay 属 hover 触发浮层的进入/离开延迟；
    // TreeSelect 为 click 触发（点击 trigger 开合），无 hover 触发路径，故此两项不适用，不提供。

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
    /**
     * 无匹配/无数据时的占位内容（对齐 Semi emptyContent）：字符串或 Snippet。
     * 未传时回退 i18n TreeSelect.emptyText。空 Snippet 场景可传 () => {} 自绘。
     */
    emptyContent?: string | Snippet;
    /**
     * 自定义搜索框渲染（渲染层扩展，非 Semi 原生 TreeSelect prop）：
     * false 隐藏搜索框（即使 filterable/filterTreeNode 开启，也不显示内置搜索输入）；
     * 传 Snippet 则完全接管搜索框渲染，参数含当前值与命令式回调，
     * 使用方需自行把输入回填给 onInput（其余过滤/高亮/roving 逻辑不变）。
     */
    searchRender?: boolean | Snippet<[{ value: string; onInput: (v: string) => void; onKeydown: (e: KeyboardEvent) => void; placeholder: string }]>;

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
     * 自动合并值：父节点全选时 value 不再包含其后代（收敛为父，对齐 Semi autoMergeValue）。
     * 默认 true。false 时 value 含全部勾选叶子与父（'all' 策略）。leafOnly 时改为仅叶子（'child'）。
     */
    autoMergeValue?: boolean;
    /** onChange 回调携带完整节点对象而非仅 key。默认 false。 */
    onChangeWithObject?: boolean;
    /** 多选 maxTagCount 折叠出 +N 时，hover +N 用本库 Popover 浮层展示折叠掉的剩余全部 Tag。默认 false（静态 +N）。 */
    showRestTagsPopover?: boolean;
    /** 透传给剩余 Tag Popover 浮层的额外 props（在默认 trigger=hover/position=top 之后展开，可覆盖）。 */
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
    /** 自定义节点字段名映射（对齐 Semi keyMaps）：适配任意后端数据结构，如 { key:'id', label:'name', children:'sub' }。 */
    keyMaps?: { key?: string; label?: string; value?: string; children?: string };
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
    /** 浮层与 trigger 的额外间距（px），数字或四方向对象。数字映射到浮层 offset；对象形态仅取 marginTop（其余方向暂未接入定位）。 */
    dropdownMargin?: number | { marginTop?: number; marginBottom?: number; marginLeft?: number; marginRight?: number };
    /** 追加到浮层根节点的自定义类名（与内置类名并存）。 */
    dropdownClassName?: string;
    /** 合并进浮层根节点的内联样式（与内置定位样式拼接，不覆盖 use:floating 写入的 transform/position）。 */
    dropdownStyle?: string | Record<string, string>;
    /** 浮层层级（z-index）。未传时由 CSS 层级控制。 */
    zIndex?: number;

    // --- Events ---
    /** 点击清除按钮回调。 */
    onClear?: (e: MouseEvent) => void;
    /** 节点选中回调 */
    onSelect?: (selectedKey: TreeKey, selected: boolean, node: unknown) => void;
    /** 异步加载完成回调（含已加载 key 集合与当前节点）。 */
    onLoad?: (loadedKeys: TreeKey[], treeNode: TreeNode) => void;
    /** 面板可见性变化回调（对齐 Semi onVisibleChange）。 */
    onVisibleChange?: (isVisible: boolean) => void;
  }

  let {
    value,
    defaultValue = null,
    treeData = [],
    defaultOpen = false,
    multiple = false,
    checkRelation = 'related',
    maxTagCount,
    placeholder = '请选择',
    size: sizeProp,
    status = 'default',
    disabled: disabledProp,
    showClear = false,
    leafOnly = false,
    defaultExpandAll = false,
    defaultExpandedKeys,
    filterable = false,
    filterTreeNode,
    remote = false,
    onSearch,
    loadData,
    virtualize,
    position = 'bottomLeft',
    dropdownMatchSelectWidth = true,
    getPopupContainer,
    onChange,
    ariaLabel,
    ariaLabelledby,
    ariaDescribedby,
    ariaErrormessage,
    ariaRequired,
    stopPropagation = true,
    triggerRender,
    insetLabel,
    insetLabelId,
    motion = true,
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
    emptyContent,
    searchRender,
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
    dropdownClassName,
    dropdownStyle,
    zIndex,
    onClear,
    onSelect,
    onLoad,
    onVisibleChange,
  }: Props = $props();

  // InputGroup 组级默认（size/disabled）：显式 prop 始终优先，否则回退组级，再回退组件默认。
  const group = getInputGroupContext();
  const size = $derived<Size>(sizeProp ?? group?.size ?? 'default');
  const disabled = $derived<boolean>(disabledProp ?? group?.disabled ?? false);

  const loc = useLocale();
  // ConfigProvider 全局浮层容器默认；自身 getPopupContainer prop 优先，未传时回退此值（再回退 body）。
  const globalPopupContainer = getGlobalPopupContainer();
  const resolvePopupContainer = $derived(getPopupContainer ?? globalPopupContainer);

  // remote 隐含可搜索（显示搜索框）；filterTreeNode（bool 或函数）亦开启搜索。
  const isFilterable = $derived(filterable || remote || filterTreeNode === true || typeof filterTreeNode === 'function');
  const isUnRelated = $derived(checkRelation === 'unRelated');

  // validateStatus 是 status 别名；效值以 validateStatus 优先（未传时回退 status）。
  const effStatus = $derived(validateStatus ?? status ?? 'default');

  const treeId = useId('cd-tree-select-panel');

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

  // treeitem 行 id 基（aria-activedescendant 指向当前高亮行）。
  const itemBaseId = useId('cd-tree-select-item');
  function itemId(key: TreeKey): string {
    return `${itemBaseId}-${String(key)}`;
  }

  // --- keyMaps 字段映射：把用户自定义字段名的数据派生为标准 {key,label,children} 结构（对齐 Semi keyMaps）---
  // 默认（全标准名）时直接返回原 treeData 引用，零额外开销；映射为纯 $derived（红线 #2），不写回（红线 #1）。
  // 节点 key 取自原始 key 字段，故 onChange 回传的 value（key）即用户原始 id，无需额外映射回原节点。
  // keyMaps.value 作为 key 字段别名（对齐 Semi）。
  const keyField = $derived(keyMaps?.key ?? keyMaps?.value ?? 'key');
  const labelField = $derived(keyMaps?.label ?? 'label');
  const childrenField = $derived(keyMaps?.children ?? 'children');
  const keyMapsDefault = $derived(
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
    keyMapsDefault ? treeData : normalizeNodes(treeData),
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
      loadedChildren.set(node.key, keyMapsDefault ? kids : normalizeNodes(kids));
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
    // defaultExpandedKeys 与 defaultExpandAll 取并集（非受控初始展开集）。
    const set = new Set<TreeKey>(defaultExpandedKeys ?? []);
    if (defaultExpandAll) {
      // defaultExpandAll 需用标准化后的 key（keyMaps 自定义时才能识别 children）。
      const base = keyMapsDefault ? treeData : normalizeNodes(treeData);
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
  // 回填值/Tag 收敛策略（对齐 Semi，由 leafOnly + autoMergeValue 组合表达，无独立 showCheckedStrategy）：
  // leafOnly → 'child'（仅叶子）；否则 autoMergeValue=true → 'parent'（父全选折叠为父，value 不含后代）；否则 'all'。
  const effectiveStrategy = $derived<CheckedStrategy>(
    leafOnly ? 'child' : autoMergeValue ? 'parent' : 'all',
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
  // showRestTagsPopover：+N hover 时浮层展示的隐藏剩余节点（折叠掉的那部分）。
  const hiddenTagNodes = $derived(
    maxTagCount !== undefined && maxTagCount >= 0
      ? checkedNodes.slice(maxTagCount)
      : [],
  );

  // --- 非受控 open（对齐 Semi：仅 defaultOpen 初始 + onVisibleChange 回调，无受控 open prop）---
  let innerOpen = $state(getInitialOpen());
  const isOpen = $derived(innerOpen);

  // --- 展开状态：受控（传入 expandedKeys）时只读派生 + onExpand 回调（红线 #1 不回写）；
  //     非受控时本地 $state Set（红线 #2，不依赖挂载 registry）。 ---
  const isExpandControlled = $derived(expandedKeysProp !== undefined);
  let innerExpanded = $state<Set<TreeKey>>(getInitialExpanded());
  const expandedKeys = $derived<Set<TreeKey>>(
    isExpandControlled ? new Set(expandedKeysProp) : innerExpanded,
  );

  const selectedNode = $derived(
    currentValue === null ? undefined : findNode(mergedTree, currentValue),
  );
  const displayLabel = $derived(selectedNode?.label ?? '');
  const hasSelection = $derived(
    multiple ? checkedNodes.length > 0 : selectedNode !== undefined,
  );
  const showClearBtn = $derived(showClear && !disabled && hasSelection);

  // position → use:floating 的 Placement（对齐 Semi，映射表照 DatePicker），缺省 bottomStart。
  const POSITION_TO_PLACEMENT: Record<string, Placement> = {
    bottomLeft: 'bottomStart',
    bottomRight: 'bottomEnd',
    bottom: 'bottom',
    topLeft: 'topStart',
    topRight: 'topEnd',
    top: 'top',
    leftTop: 'leftStart',
    leftBottom: 'leftEnd',
    rightTop: 'rightStart',
    rightBottom: 'rightEnd',
  };
  const dropdownPlacement = $derived<Placement>(POSITION_TO_PLACEMENT[position] ?? 'bottomStart');

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
      nextBase = toggleCheck(mergedTree as unknown as TreeNodeData[], currentCheckedBase, node.key, disableStrictly);
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
      setChecked(toggleCheck(mergedTree as unknown as TreeNodeData[], currentCheckedBase, node.key, disableStrictly));
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
    innerOpen = next;
    onVisibleChange?.(next);
  }

  function toggleOpen(e: MouseEvent) {
    // stopPropagation（对齐 Semi，默认 true）：阻止 trigger 点击冒泡到外层。
    if (stopPropagation) e.stopPropagation();
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
  // 按 treeNodeFilterProp 取节点用于匹配的文本（默认 label；自定义字段回退 label）。
  function nodeFilterText(node: TreeNodeData): string {
    const raw = (node as unknown as Record<string, unknown>)[treeNodeFilterProp];
    const v = raw ?? node.label;
    return v == null ? '' : String(v);
  }
  const filterResult = $derived.by(() => {
    if (!searchActive) return { matched: new Set<TreeKey>(), expand: new Set<TreeKey>() };
    const lower = trimmedSearch.toLowerCase();
    // filterTreeNode 为函数时用作自定义匹配谓词（inputValue, treeNodeString, data?）；
    // 否则默认对 treeNodeFilterProp 文本做大小写不敏感包含匹配。
    const predicate =
      typeof filterTreeNode === 'function'
        ? (node: TreeNodeData) =>
            (filterTreeNode as (i: string, s: string, d?: TreeNode) => boolean)(
              trimmedSearch,
              nodeFilterText(node),
              node as unknown as TreeNode,
            )
        : (node: TreeNodeData) => nodeFilterText(node).toLowerCase().includes(lower);
    return computeFilteredKeys(mergedTree as unknown as TreeNodeData[], predicate);
  });
  // 节点在搜索结果可见：命中本身、或在祖先链/含命中后代（expand 集）。
  // showFilteredOnly=true 时只显示精确命中节点，不显示祖先链。
  // 注意：递归 treeNodes snippet 里以 $derived 集合的 .has() 判定，而非调用普通函数——
  // 普通函数调用不进入 snippet 的响应式依赖追踪，搜索后 filterResult 变化不会触发树重渲染
  // （Svelte5 盲区，表现为搜索命中却树不展开/不过滤）。
  const visibleKeySet = $derived.by(() => {
    const s = new Set<TreeKey>();
    if (!searchActive) return s; // 空集表示「全部可见」（见 nodeVisible）
    for (const k of filterResult.matched) s.add(k);
    if (!showFilteredOnly) for (const k of filterResult.expand) s.add(k);
    return s;
  });
  function nodeVisible(key: TreeKey): boolean {
    if (!searchActive) return true;
    return visibleKeySet.has(key);
  }

  const expandedKeySet = $derived.by(() => {
    const s = new Set<TreeKey>(expandedKeys);
    // 搜索激活时强制展开命中链（对齐 Semi：展开受控时不再自动展开，完全由 expandedKeys 控制）。
    if (!isExpandControlled && searchActive) for (const k of filterResult.expand) s.add(k);
    return s;
  });
  function isExpanded(key: TreeKey): boolean {
    return expandedKeySet.has(key);
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
      // 同时并入搜索展开链（受控展开时不自动展开）。
      if (!isExpandControlled && searchActive) for (const k of filterResult.expand) set.add(k);
      return set;
    }
    // 受控展开时不并入搜索展开链（对齐 Semi），完全由 expandedKeys 控制。
    if (!searchActive || isExpandControlled) return expandedKeys;
    const merged = new Set(expandedKeys);
    for (const k of filterResult.expand) merged.add(k);
    return merged;
  });
  // virtualize 对象归一（对齐 Semi）：传入对象即显式开启（无自动阈值）；height 视口高度、itemSize 行高。
  const height = $derived(virtualize?.height ?? 224);
  const itemHeight = $derived(virtualize?.itemSize ?? 32);
  const useVirtual = $derived(virtualize !== undefined);
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
    const willExpand = !next.has(key);
    if (!willExpand) {
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
    // 受控展开（红线 #1）：只回调 onExpand，不回写本地态；非受控写本地态。
    if (!isExpandControlled) innerExpanded = next;
    onExpand?.([...next], { expanded: willExpand, node });
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

  // --- onSearch（对齐 Semi 三入参签名 (input, filteredExpandedKeys, filteredNodes)）---
  // 无内置防抖：Semi 也不做防抖，remote 场景由使用方在 onSearch 内自行节流。
  // 对任意输入即时计算过滤结果（不受 remote/searchActive gate 限制），供回调的后两参。
  function emitSearch(input: string) {
    if (!onSearch) return;
    const q = input.trim();
    if (q.length === 0) {
      onSearch(input, [], []);
      return;
    }
    const lower = q.toLowerCase();
    const predicate =
      typeof filterTreeNode === 'function'
        ? (node: TreeNodeData) =>
            (filterTreeNode as (i: string, s: string, d?: TreeNode) => boolean)(
              q,
              nodeFilterText(node),
              node as unknown as TreeNode,
            )
        : (node: TreeNodeData) => nodeFilterText(node).toLowerCase().includes(lower);
    const res = computeFilteredKeys(mergedTree as unknown as TreeNodeData[], predicate);
    // filteredExpandedKeys：命中链上应展开的祖先节点 keys（对齐 Semi filteredExpandedKeys）。
    const filteredExpandedKeys = [...res.expand];
    // filteredNodes：命中节点原始数据数组（树序）。
    const filteredNodes: TreeNode[] = [];
    const walk = (nodes: TreeNode[]) => {
      for (const n of nodes) {
        if (res.matched.has(n.key)) filteredNodes.push(n);
        if (n.children) walk(n.children);
      }
    };
    walk(mergedTree);
    onSearch(input, filteredExpandedKeys, filteredNodes);
  }
  function onSearchInput(e: Event & { currentTarget: HTMLInputElement }) {
    searchValue = e.currentTarget.value;
    emitSearch(searchValue);
  }
  // searchRender 自定义搜索框用的命令式回调（把外部输入回填给内部搜索态）。
  function setSearchValue(v: string) {
    searchValue = v;
    emitSearch(v);
  }

  /** 命令式搜索：把值置给内部搜索态并触发过滤（对齐 Semi search(sugInput)，用于外部自定义搜索框）。 */
  export function search(sugInput: string): void {
    setSearchValue(sugInput);
  }
  // 内置搜索框键盘处理（Escape 关闭，其余交给树 roving）。
  function onSearchKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      setOpen(false);
      return;
    }
    onTreeKeydown(e);
  }
  // searchRender=false 时隐藏内置搜索框（即使 filterable/filterTreeNode 开启）。
  const showBuiltinSearch = $derived(isFilterable && searchRender !== false);
  // searchPosition：'dropdown'（默认）搜索框在浮层顶部；'trigger' 搜索框内嵌触发器（对齐 Semi）。
  const searchInDropdown = $derived(showBuiltinSearch && searchPosition !== 'trigger');
  const searchInTrigger = $derived(showBuiltinSearch && searchPosition === 'trigger');
  // 搜索框占位文案：searchPlaceholder prop 优先，回退 i18n。
  const resolvedSearchPlaceholder = $derived(searchPlaceholder ?? loc().t('TreeSelect.searchPlaceholder'));

  // --- DOM 引用：触发根 + portal 面板（定位由 use:floating action 接管）---
  let rootEl = $state<HTMLDivElement | null>(null);
  let panelEl = $state<HTMLDivElement | null>(null);

  // --- 浮层 DOM：首开后保留（仅隐藏），对齐 Semi（不销毁重建）。 ---
  let hasBeenOpened = $state(false);
  $effect(() => {
    if (isOpen) hasBeenOpened = true;
  });
  const shouldRender = $derived(isOpen || hasBeenOpened);

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

  // triggerRender 的 value 参数：多选给收敛后的 key 数组，单选给单 key（对齐 onChange 语义）。
  const triggerValue = $derived<TreeKey | TreeKey[] | null>(
    multiple ? strategyKeys : currentValue,
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

{#snippet emptyBlock()}
  <div class="cd-tree-select__empty">
    {#if emptyContent !== undefined}
      {#if typeof emptyContent === 'string'}{emptyContent}{:else}{@render emptyContent()}{/if}
    {:else}
      {loc().t('TreeSelect.emptyText')}
    {/if}
  </div>
{/snippet}

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
    style={[posStyle, `padding-inline-start: calc(${level} * var(--cd-spacing-tree-option-level-padding-left))`]
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
        <IconTreeTriangleDown size="small" aria-hidden="true" />
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
          <IconCheckboxTick aria-hidden="true" />
        {:else if cs.half}
          <IconCheckboxIndeterminate aria-hidden="true" />
        {/if}
      </span>
    {/if}
    {#if node.icon != null}
      <span class="cd-tree-select__icon" aria-hidden="true">{node.icon}</span>
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

{#snippet restTagsTrigger()}
  <!-- +N 折叠触发器：aria-label 走 i18n restTagsCount（「还有 {count} 项」/「{count} more」）供屏幕阅读器朗读折叠数 -->
  <span
    class="cd-tree-select__rest-trigger"
    aria-label={loc().t('TreeSelect.restTagsCount', { count: hiddenTagCount })}
  >
    <Tag size={size === 'large' ? 'default' : 'small'}>+{hiddenTagCount}</Tag>
  </span>
{/snippet}

<!--
  内置搜索框：dropdown / trigger 两处位置复用。
  - dropdown（默认）：带灰底 + 放大镜的 field，与列表分隔清晰（对齐 Semi）。
  - trigger（bare=true）：朴素透明 input，与触发器融为一体，无额外灰底框（避免臃肿）。
-->
{#snippet builtinSearchInput(bare = false)}
  {#if typeof searchRender === 'function'}
    {@render searchRender({
      value: searchValue,
      onInput: setSearchValue,
      onKeydown: onSearchKeydown,
      placeholder: resolvedSearchPlaceholder,
    })}
  {:else if bare}
    <input
      class="cd-tree-select__search-input cd-tree-select__search-input--bare"
      type="text"
      role="combobox"
      aria-expanded={isOpen}
      aria-controls={treeId}
      aria-activedescendant={activeDescId}
      placeholder={resolvedSearchPlaceholder}
      aria-label={resolvedSearchPlaceholder}
      value={searchValue}
      oninput={onSearchInput}
      onkeydown={onSearchKeydown}
    />
  {:else}
    <span class="cd-tree-select__search-field">
      <IconSearch class="cd-tree-select__search-icon" aria-hidden="true" />
      <input
        class="cd-tree-select__search-input"
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={treeId}
        aria-activedescendant={activeDescId}
        placeholder={resolvedSearchPlaceholder}
        aria-label={resolvedSearchPlaceholder}
        value={searchValue}
        oninput={onSearchInput}
        onkeydown={onSearchKeydown}
      />
    </span>
  {/if}
{/snippet}

{#snippet treeNodes(nodes: TreeNode[], level: number)}
  {@const setSize = nodes.length}
  {#each nodes as node, i (node.key)}
    <!-- 直接读 $derived 集合（!searchActive 时全可见），使搜索改动进入 snippet 响应式追踪 -->
    {@const visible = !searchActive || visibleKeySet.has(node.key)}
    {#if visible}
      {@const nodeOpen = isExpandable(node) && expandedKeySet.has(node.key)}
      {@render nodeRow(node, level, undefined, setSize, i + 1)}
      {#if nodeOpen}
        {@render treeNodes(node.children ?? [], level + 1)}
      {/if}
    {/if}
  {/each}
{/snippet}

<div class={cls} bind:this={rootEl} {style}>
  <!-- combobox 容器用 div 以合法承载多选 tags / clear 等内部交互元素 -->
  {#if triggerRender}
    {@render triggerRender({ value: triggerValue, placeholder, isOpen, disabled })}
  {:else}
  <div
    class="cd-tree-select__trigger"
    role="combobox"
    aria-haspopup="tree"
    aria-expanded={isOpen}
    aria-controls={treeId}
    aria-activedescendant={isOpen && !searchActive ? activeDescId : undefined}
    aria-label={ariaLabel}
    aria-labelledby={ariaLabelledby}
    aria-describedby={ariaDescribedby}
    aria-errormessage={ariaErrormessage}
    aria-required={ariaRequired || undefined}
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
    {#if insetLabel}
      <span class="cd-tree-select__inset-label" id={insetLabelId}>
        {#if typeof insetLabel === 'string'}{insetLabel}{:else}{@render insetLabel()}{/if}
      </span>
    {/if}
    <span class="cd-tree-select__content" class:cd-tree-select__content--search-trigger={searchInTrigger}>
      {#if searchInTrigger}
        <!-- searchPosition='trigger'：朴素 input 内嵌触发器，与触发器融为一体（bare 模式，无灰底框）。 -->
        <span class="cd-tree-select__trigger-search">{@render builtinSearchInput(true)}</span>
      {/if}
      {#if multiple}
        {#if checkedNodes.length > 0}
          <span class="cd-tree-select__tags">
            {#each visibleTagNodes as node (node.key)}
              {#if renderSelectedItem}
                {@render renderSelectedItem({ node, onRemove: () => removeChecked(node) })}
              {:else}
                <Tag
                  size={size === 'large' ? 'default' : 'small'}
                  closable={!disabled}
                  onClose={() => removeChecked(node)}
                >
                  {node.label}
                </Tag>
              {/if}
            {/each}
            {#if hiddenTagCount > 0}
              {#if showRestTagsPopover}
                <!-- showRestTagsPopover：hover +N 用本库 Popover 展示折叠掉的剩余 Tag（restTagsPopoverProps 可覆盖默认 props） -->
                <Popover trigger="hover" position="top" {...(restTagsPopoverProps ?? {})}>
                  {@render restTagsTrigger()}
                  {#snippet content()}
                    <span class="cd-tree-select__rest-tags">
                      {#each hiddenTagNodes as node (node.key)}
                        <Tag
                          size={size === 'large' ? 'default' : 'small'}
                          closable={!disabled}
                          onClose={() => removeChecked(node)}
                        >
                          {node.label}
                        </Tag>
                      {/each}
                    </span>
                  {/snippet}
                </Popover>
              {:else}
                {@render restTagsTrigger()}
              {/if}
            {/if}
          </span>
        {:else}
          <span class="cd-tree-select__placeholder">{placeholder}</span>
        {/if}
      {:else if hasSelection}
        {#if renderSelectedItem && selectedNode}
          {@render renderSelectedItem({ node: selectedNode, onRemove: () => setValue(null) })}
        {:else}
          <span class="cd-tree-select__value">{displayLabel}</span>
        {/if}
      {:else}
        <span class="cd-tree-select__placeholder">{placeholder}</span>
      {/if}
    </span>

    {#if showClearBtn}
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
        <IconClear aria-hidden="true" />
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
        <IconChevronDown aria-hidden="true" />
      {/if}
    </span>
  </div>
  {/if}

  {#if shouldRender}
    <div
      class={['cd-tree-select__panel', dropdownClassName].filter(Boolean).join(' ')}
      class:cd-tree-select__panel--hidden={!isOpen}
      class:cd-tree-select__panel--motion={motion && isOpen}
      bind:this={panelEl}
      use:floating={{
        trigger: rootEl,
        placement: dropdownPlacement,
        autoAdjust: true,
        offset: dropdownOffset,
        matchWidth: dropdownMatchSelectWidth,
        getContainer: resolvePopupContainer,
        open: isOpen,
      }}
      id={treeId}
      style={dropdownStyleStr}
    >
      {#if searchInDropdown}
        <div class="cd-tree-select__search">
          {@render builtinSearchInput()}
        </div>
      {/if}
      {#if mergedTree.length === 0}
        <div class="cd-tree-select__tree" role="tree">
          {@render emptyBlock()}
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
            {@render emptyBlock()}
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
            {@render emptyBlock()}
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
  .cd-tree-select--small .cd-tree-select__trigger {
    min-block-size: var(--cd-select-height-small);
  }
  .cd-tree-select--large .cd-tree-select__trigger {
    min-block-size: var(--cd-select-height-large);
  }
  /* 对齐 Semi 填充式：悬浮加深底色 fill-1（非展开/禁用态） */
  .cd-tree-select:not(.cd-tree-select--open):not(.cd-tree-select--disabled) .cd-tree-select__trigger:hover {
    background: var(--cd-select-bg-hover);
  }
  .cd-tree-select__trigger:focus-visible {
    outline: none;
    background: var(--cd-select-bg);
    border-color: var(--cd-select-border-active);
    box-shadow: var(--cd-focus-ring);
  }
  .cd-tree-select--open .cd-tree-select__trigger {
    background: var(--cd-select-bg);
    border-color: var(--cd-select-border-active);
  }
  /* warning 校验态：light-bg + 分态 border（对齐 Semi treeSelect warning，same as Input）。 */
  .cd-tree-select--warning .cd-tree-select__trigger {
    background: var(--cd-color-tree-select-warning-bg-default);
    border-color: var(--cd-color-tree-select-warning-border-default);
  }
  .cd-tree-select--warning:not(.cd-tree-select--open):not(.cd-tree-select--disabled)
    .cd-tree-select__trigger:hover {
    background: var(--cd-color-tree-select-warning-bg-hover);
    border-color: var(--cd-color-tree-select-warning-border-hover);
  }
  .cd-tree-select--warning .cd-tree-select__trigger:focus-visible,
  .cd-tree-select--warning.cd-tree-select--open .cd-tree-select__trigger {
    background: var(--cd-color-tree-select-warning-bg-focus);
    border-color: var(--cd-color-tree-select-warning-border-focus);
  }
  .cd-tree-select--warning .cd-tree-select__trigger:active {
    background: var(--cd-color-tree-select-warning-bg-active);
    border-color: var(--cd-color-tree-select-warning-border-active);
  }
  /* error 校验态：light-bg + 分态 border（对齐 Semi treeSelect danger，same as Input）。 */
  .cd-tree-select--error .cd-tree-select__trigger {
    background: var(--cd-color-tree-select-danger-bg-default);
    border-color: var(--cd-color-tree-select-danger-border-default);
  }
  .cd-tree-select--error:not(.cd-tree-select--open):not(.cd-tree-select--disabled)
    .cd-tree-select__trigger:hover {
    background: var(--cd-color-tree-select-danger-bg-hover);
    border-color: var(--cd-color-tree-select-danger-border-hover);
  }
  .cd-tree-select--error .cd-tree-select__trigger:focus-visible,
  .cd-tree-select--error.cd-tree-select--open .cd-tree-select__trigger {
    background: var(--cd-color-tree-select-danger-bg-focus);
    border-color: var(--cd-color-tree-select-danger-border-focus);
  }
  .cd-tree-select--error .cd-tree-select__trigger:active {
    background: var(--cd-color-tree-select-danger-bg-active);
    border-color: var(--cd-color-tree-select-danger-border-active);
  }
  .cd-tree-select__trigger[aria-disabled='true'] {
    background: var(--cd-color-tree-select-input-disabled-bg-default, var(--cd-color-fill-0));
    color: var(--cd-color-tree-select-input-disabled-text-default);
    cursor: not-allowed;
  }
  .cd-tree-select__content {
    display: flex;
    flex: 1 1 auto;
    align-items: center;
    min-inline-size: 0;
  }
  /* searchPosition='trigger'：搜索输入占据触发器主区，与已选值/占位并存。 */
  .cd-tree-select__trigger-search {
    display: flex;
    flex: 1 1 auto;
    min-inline-size: 0;
  }
  /* bare 搜索 input：透明、无边框，与触发器融为一体（避免臃肿的灰底框）。 */
  .cd-tree-select__search-input--bare {
    inline-size: 100%;
    min-inline-size: 0;
    block-size: auto;
    padding: 0;
    background: transparent;
    border: none;
    color: inherit;
    font: inherit;
    outline: none;
  }
  .cd-tree-select__search-input--bare::placeholder {
    color: var(--cd-color-text-2);
  }
  .cd-tree-select__value {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .cd-tree-select__placeholder {
    /* 对齐 Semi treeSelect 占位符 input-placeholder-text-default = text-2 */
    color: var(--cd-color-tree-select-input-placeholder-text-default);
  }
  .cd-tree-select__clear,
  .cd-tree-select__arrow {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    /* 对齐 Semi treeSelect default-icon-default = text-2 */
    color: var(--cd-color-tree-select-default-icon-default);
  }
  .cd-tree-select__clear {
    cursor: pointer;
  }
  .cd-tree-select__clear:hover {
    color: var(--cd-color-tree-select-default-icon-hover);
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
    padding-block: var(--cd-spacing-extra-tight);
    background: var(--cd-select-dropdown-bg);
    border-radius: var(--cd-select-dropdown-radius);
    box-shadow: var(--cd-select-dropdown-shadow);
  }
  /* 关闭后保留 DOM 但不可见、不可交互、不占位（对齐 Semi，不销毁重建） */
  .cd-tree-select__panel--hidden {
    display: none;
  }
  /* motion：下拉浮层开合进场淡入；reduced-motion 退化。
     注意：定位 transform 由 use:floating 写入 inline style，动画 keyframe
     绝不能设 transform（CSS animation 优先级高于 inline style，会把 floating 的
     translate(x,y) 覆盖成 0，浮层飘到容器左上角）。故仅动 opacity（与 Dropdown 一致）。 */
  .cd-tree-select__panel--motion {
    animation: cd-tree-select-in var(--cd-dropdown-motion-duration, 120ms)
      var(--cd-dropdown-motion-easing, ease) both;
  }
  @keyframes cd-tree-select-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  /* insetLabel 内嵌标签：回填值前的标签文本，消费 tree-select label token */
  .cd-tree-select__inset-label {
    display: inline-flex;
    align-items: center;
    flex: 0 0 auto;
    margin-inline-end: var(--cd-spacing-tight);
    color: var(--cd-color-tree-select-label);
    font-weight: var(--cd-font-tree-select-label);
    white-space: nowrap;
    user-select: none;
  }
  .cd-tree-select__search {
    padding: var(--cd-spacing-tight);
    padding-block-end: var(--cd-spacing-extra-tight);
  }
  /* 搜索字段：灰底圆角 + 左侧放大镜图标（对齐 Semi 的和谐观感，与列表分隔清晰）。 */
  .cd-tree-select__search-field {
    display: flex;
    align-items: center;
    gap: var(--cd-spacing-extra-tight);
    inline-size: 100%;
    block-size: var(--cd-height-input-default);
    padding-inline: var(--cd-spacing-input-paddingleft);
    background: var(--cd-color-fill-0);
    border: 1px solid transparent;
    border-radius: var(--cd-radius-input-wrapper);
    transition:
      background-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard),
      border-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-tree-select__search-field:hover {
    background: var(--cd-color-fill-1);
  }
  .cd-tree-select__search-field:focus-within {
    background: var(--cd-color-bg-0);
    border-color: var(--cd-color-input-default-border-focus);
    box-shadow: var(--cd-focus-ring);
  }
  .cd-tree-select__search-icon {
    flex: 0 0 auto;
    color: var(--cd-color-text-2);
  }
  .cd-tree-select__search-input {
    flex: 1 1 auto;
    inline-size: 100%;
    min-inline-size: 0;
    block-size: 100%;
    padding: 0;
    background: transparent;
    color: inherit;
    border: none;
    font: inherit;
    font-size: var(--cd-font-size-small);
    outline: none;
  }
  .cd-tree-select__search-input::placeholder {
    color: var(--cd-color-text-2);
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
    color: var(--cd-color-tree-option-highlight-text);
    background: inherit;
  }
  .cd-tree-select__node {
    display: flex;
    align-items: center;
    gap: var(--cd-spacing-extra-tight);
    block-size: var(--cd-tree-node-height);
    padding-inline-end: var(--cd-tree-node-padding-x);
    cursor: pointer;
  }
  .cd-tree-select__node:hover {
    background: var(--cd-color-tree-option-bg-hover);
  }
  .cd-tree-select__node--selected {
    color: var(--cd-color-tree-option-text-default);
    background: var(--cd-color-tree-option-bg-active);
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
    color: var(--cd-color-tree-option-icon-default);
    cursor: pointer;
    transition: transform var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
    /* IconTreeTriangleDown 默认朝下（展开态）；折叠态旋转 -90deg 朝右，对齐 Semi。 */
    transform: rotate(-90deg);
  }
  .cd-tree-select__expand--open {
    transform: rotate(0deg);
  }
  .cd-tree-select__expand--placeholder {
    cursor: default;
    transform: none;
  }
  .cd-tree-select__expand--loading {
    cursor: default;
    transition: none;
    transform: none;
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
    color: var(--cd-color-tree-option-text-default);
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
    color: var(--cd-color-white);
    background: var(--cd-color-bg-1, #fff);
    border: 1px solid var(--cd-color-border);
    border-radius: var(--cd-border-radius-small);
  }
  .cd-tree-select__checkbox--checked,
  .cd-tree-select__checkbox--half {
    background: var(--cd-color-primary);
    border-color: var(--cd-color-primary);
  }
  .cd-tree-select__tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--cd-spacing-extra-tight);
    align-items: center;
    min-inline-size: 0;
  }
  .cd-tree-select__empty {
    padding: var(--cd-tree-node-padding-x);
    color: var(--cd-color-text-3);
    text-align: center;
  }
  /* +N 折叠触发器：内联包裹 Tag，承载 aria-label（Popover trigger 宿主） */
  .cd-tree-select__rest-trigger {
    display: inline-flex;
    align-items: center;
  }
  /* showRestTagsPopover 浮层内剩余 Tag 列表：换行铺排，限制最大宽避免过宽 */
  .cd-tree-select__rest-tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--cd-spacing-extra-tight);
    align-items: center;
    max-inline-size: 240px;
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-tree-select__trigger,
    .cd-tree-select__arrow,
    .cd-tree-select__expand {
      transition: none;
    }
    .cd-tree-select__spinner,
    .cd-tree-select__panel--motion {
      animation: none;
    }
  }
</style>
