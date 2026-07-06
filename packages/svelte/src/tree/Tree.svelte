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
    collectLeafKeys,
    findNode,
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

  type ChangeInfo = {
    value: TreeKey | TreeKey[] | TreeNodeData | TreeNodeData[];
    node: TreeNodeData;
    selected: boolean;
  };
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
    /**
     * 简单 JSON 形式的树数据（对齐 Semi `treeDataSimpleJson`）。传入扁平 `{ key: value }` 键值对，
     * key 同时作为 `TreeNodeData` 的 `key` 与 `label`，value 作为节点的 `value`；
     * 嵌套对象自动转为子树。与 `treeData` 二选一，`treeData` 非空时优先，忽略此项。
     * 例如 `{ 中国: { 北京: 'beijing', 上海: 'shanghai' } }` → 一层「中国」含两个叶子。
     */
    treeDataSimpleJson?: Record<string, unknown>;
    /** 自定义节点字段名映射，如 { key:'id', label:'name', children:'sub' }。默认全部为标准名。 */
    fieldNames?: FieldNames;
    value?: TreeKey | TreeKey[] | TreeNodeData | TreeNodeData[] | null;
    defaultValue?: TreeKey | TreeKey[] | TreeNodeData | TreeNodeData[] | null;
    /**
     * 以对象形态回传/接收选中项（对齐 Semi `onChangeWithObject`）。开启后：
     *  - `onChange` 回调 payload 的 `value` 从 key（或 key 数组）变为**节点对象**（含 label/value/其它字段，
     *    即原始节点 `toOrig`），多选时为对象数组；
     *  - 受控 `value` 与非受控 `defaultValue` 也须传对象形态（对象须含节点标识——优先取 `value` 字段，
     *    缺省回退 `key`）。组件内部据此提取标识匹配节点。
     * 默认 false（value 收发均为 key）。
     */
    onChangeWithObject?: boolean;
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
    /**
     * 严格禁用（对齐 Semi `disableStrictly`）。开启后，disabled 节点的勾选态被「严格锁定」：
     * 不能通过父级/子级联动改变——已勾选的 disabled 节点不会被父级取消，未勾选的不会被父级勾上。
     * 与普通 `disabled` 的区别：普通 disabled 仅禁止直接点击该节点，其勾选态仍可能因父级联动被改；
     * `disableStrictly` 则连联动也锁死。仅在 checkable 多选联动（related）下有意义。默认 false。
     */
    disableStrictly?: boolean;
    /**
     * 仅叶子回传（对齐 Semi `leafOnly`）。多选勾选（checkable）时，`onCheck` 回传的 `checked`
     * 及 `halfChecked` 只含叶子节点 key，不含父/半选节点。适合「父节点仅作分组、值只关心叶子」的场景。
     * 仅在 checkable 联动（related）下有意义；解耦（checkStrictly/unRelated）下 checked 本就是各节点独立态，
     * leafOnly 仍会滤成只留叶子。默认 false（回传全部命中节点）。
     */
    leafOnly?: boolean;
    expandedKeys?: TreeKey[];
    defaultExpandedKeys?: TreeKey[];
    defaultExpandAll?: boolean;
    /**
     * 默认展开到第 N 层（仅初始化非受控展开集时生效，1 表示展开根层使其子节点可见）。
     * 优先级低于 defaultExpandAll；与 defaultExpandedKeys 取并集。受控 expandedKeys 时忽略（红线 #1）。
     */
    expandedDepth?: number;
    /**
     * 受控展开时自动展开父节点：expandedKeys 更新时若 autoExpandParent=true，
     * 自动把所有展开节点的祖先链也加入展开集（派生，不写回受控 expandedKeys，红线 #1）。
     * 默认 true，与 Semi Design 行为一致。
     */
    autoExpandParent?: boolean;
    /**
     * 手风琴模式：同一层级最多展开一个节点。展开某节点时自动收起其同父级（siblings）
     * 的其它已展开节点；不同层级互不影响。受控 expandedKeys 同样生效（通过 onExpandedChange
     * 回传收起 siblings 后的新展开集，不自行回写——红线 #1）。默认 false（展开行为不变）。
     */
    accordion?: boolean;
    selectable?: boolean;
    /**
     * 展开触发方式（对齐 Semi `expandAction`）。
     *  - `false`（默认）：仅点击展开箭头（switcher）才展开/收起，点击行只做选中；
     *  - `'click'`：点击整行即展开/收起；
     *  - `'doubleClick'`：双击整行才展开/收起。
     * 注意：switcher 箭头在任意模式下都可点击展开。
     */
    expandAction?: false | 'click' | 'doubleClick';
    /**
     * 多选受控 value 自动合并父子（对齐 Semi `autoMergeValue`）。默认 true。
     * 开启后，当某父节点被完全选中时，`onChange` 回传的 value 不再包含其子孙节点（仅保留父节点）；
     * 关闭则回传全部命中节点。仅在 `multiple` + `checkable` 联动（related）且 `leafOnly=false` 时有意义。
     */
    autoMergeValue?: boolean;
    /**
     * label 超长省略（对齐 Semi `labelEllipsis`）。默认 false；`virtualized` 时默认 true。
     * 开启后单行 label 超出容器宽度以省略号截断；关闭则不截断（可换行/溢出由外部控制）。
     */
    labelEllipsis?: boolean;
    /**
     * 聚焦组件内节点时是否阻止浏览器滚动文档（对齐 Semi `preventScroll`，作用于内部 focus 调用）。
     * 默认 false（聚焦时按需滚动至可见）。
     */
    preventScroll?: boolean;
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
     * 不传时回退到内置「按 treeNodeFilterProp 字段包含关键词（不区分大小写）」。boolean 形态等价于 filterable 开关。
     */
    filterTreeNode?: boolean | ((input: string, node: TreeNodeData) => boolean);
    /**
     * 内置搜索过滤匹配节点的哪个字段（对齐 Semi `treeNodeFilterProp`）。默认 `'label'`。
     * 仅在使用内置谓词（未传 filterTreeNode 函数）时生效；传自定义谓词时由该函数自行决定匹配逻辑。
     * 例如设 `'value'` 则按节点 value 字段匹配关键词。
     */
    treeNodeFilterProp?: string;
    /** 搜索框内联样式（对齐 Semi `searchStyle`，透传到搜索框 input 的 style）。 */
    searchStyle?: string;
    /** 搜索框附加 class（对齐 Semi `searchClassName`，追加到搜索框 input 的 class）。 */
    searchClassName?: string;
    /**
     * 搜索框是否显示清除按钮（对齐 Semi `showClear`）。默认 true。
     * 有输入内容时在搜索框尾部显示清除按钮，点击清空搜索词（受控时仅回调 onSearch 不写回，红线 #1）。
     */
    showClear?: boolean;
    /**
     * 搜索状态下是否只展示过滤后的结果（对齐 Semi `showFilteredOnly`）。
     * 默认 false：命中节点的祖先链自动展开，全树可见（未命中节点也渲染，仅命中项高亮）。
     * true：搜索激活时只渲染命中节点及其祖先链，隐藏其它未命中且无命中后代的节点；
     * 配合虚拟化可减少大数据树的多余渲染。默认 false（行为不变）。
     */
    showFilteredOnly?: boolean;
    /**
     * 受控搜索关键词。传入时走受控模式：搜索框 value 绑定到此 prop，
     * 输入变化仅触发 onSearch 回调，不更新内部 state。不传则保留内部非受控 state。
     */
    searchValue?: string;
    /**
     * 搜索关键词变化回调。参数 (value, filteredKeys)：
     *  - value：当前搜索词；
     *  - filteredKeys：所有命中节点（matched）的 key 列表，供受控外层决定渲染。
     */
    onSearch?: (value: string, filteredKeys: string[]) => void;
    blockNode?: boolean;
    disabled?: boolean;
    size?: Size;
    status?: Status;
    emptyContent?: string;
    ariaLabel?: string;
    /** 异步加载子节点：展开未加载的非叶子节点时调用，返回该节点的子节点数组 */
    loadData?: (node: TreeNodeData) => Promise<TreeNodeData[]>;
    /** 异步加载完成回调 */
    onLoad?: (loadedKeys: string[], info: { event: 'load'; node: TreeNodeData }) => void;
    /** 启用 HTML5 拖拽排序：节点可拖动改变层级/顺序。默认 false（行为不变） */
    draggable?: boolean;
    /**
     * 拖拽到节点上（inside）时是否自动展开该节点（对齐 Semi `autoExpandWhenDragEnter`）。默认 true。
     * 关闭后拖到可展开节点内部时不再延时自动展开（需手动展开后再拖入）。仅 draggable 时有意义。
     */
    autoExpandWhenDragEnter?: boolean;
    /**
     * 是否隐藏拖拽时跟随光标的拖拽影像 dragImg（对齐 Semi `hideDraggingNode`）。默认 false。
     * 开启后设置透明 drag image，只保留组件内的插入指示线/高亮，不显示浏览器默认幽灵。仅 draggable 时有意义。
     */
    hideDraggingNode?: boolean;
    /**
     * 自定义拖拽影像 dragImg 的 DOM 元素（对齐 Semi `renderDraggingNode`）。
     * `(nodeInstance, node) => HTMLElement`：传入被拖拽行的 DOM 元素与节点数据，返回用作 drag image 的 HTML 元素。
     * 优先级高于 `hideDraggingNode`；返回的元素须已在文档中（或离屏挂载）以便浏览器拾取。仅 draggable 时有意义。
     */
    renderDraggingNode?: (nodeInstance: HTMLElement, node: TreeNodeData) => HTMLElement;
    /** 放下时回调（受控数据，组件不内部改 treeData，由父组件按 info 重排）。 */
    onDrop?: (info: DropInfo) => void;
    /** 节点双击回调（对齐 Semi `onDoubleClick`）。 */
    onDoubleClick?: (e: MouseEvent, node: TreeNodeData) => void;
    /** 节点右键菜单回调 */
    onRightClick?: (e: MouseEvent, node: TreeNodeData) => void;
    /** 开始拖拽节点 */
    onDragStart?: (node: TreeNodeData) => void;
    /** 拖拽进入候选目标节点 */
    onDragEnter?: (info: { dragNode: TreeNodeData; dropNode: TreeNodeData }) => void;
    onChange?: (info: ChangeInfo) => void;
    onCheck?: (info: CheckInfo) => void;
    onExpandedChange?: (info: ExpandInfo) => void;
    label?: Snippet<
      [{ node: TreeNodeData; level: number; searchValue: string; selected: boolean; checked: boolean }]
    >;
    /** 自定义节点图标（showIcon 为真时渲染在 label 前）；参数含节点、展开态与是否叶子 */
    icon?: Snippet<[{ node: TreeNodeData; expanded: boolean; isLeaf: boolean }]>;
    /** 自定义展开/收起箭头；参数含节点、展开态与加载态 */
    switcher?: Snippet<[{ node: TreeNodeData; expanded: boolean; loading: boolean }]>;
    /** 节点尾部操作区（渲染在 label 右侧） */
    suffix?: Snippet<[{ node: TreeNodeData }]>;
    /** 自定义拖拽幽灵节点 */
    dragGhost?: Snippet<[{ node: TreeNodeData }]>;
  }

  let {
    treeData = [],
    treeDataSimpleJson,
    fieldNames,
    value,
    defaultValue = null,
    onChangeWithObject = false,
    multiple = false,
    checkable = false,
    checkedKeys,
    defaultCheckedKeys = [],
    checkRelation = 'related',
    checkStrictly = false,
    disableStrictly = false,
    leafOnly = false,
    expandedKeys,
    defaultExpandedKeys = [],
    defaultExpandAll = false,
    expandedDepth,
    autoExpandParent = true,
    accordion = false,
    selectable = true,
    expandAction = false,
    autoMergeValue = true,
    labelEllipsis,
    preventScroll = false,
    showIcon = true,
    showLine = false,
    virtualized = false,
    height = 320,
    itemHeight = 32,
    filterable = false,
    filterTreeNode,
    treeNodeFilterProp = 'label',
    searchStyle,
    searchClassName,
    showClear = true,
    showFilteredOnly = false,
    searchValue: searchValueProp,
    onSearch,
    blockNode = false,
    disabled = false,
    size = 'default',
    status = 'default',
    emptyContent,
    ariaLabel,
    loadData,
    onLoad,
    draggable = false,
    autoExpandWhenDragEnter = true,
    hideDraggingNode = false,
    renderDraggingNode,
    onDrop,
    onDoubleClick,
    onRightClick,
    onDragStart,
    onDragEnter,
    onChange,
    onCheck,
    onExpandedChange,
    label,
    icon,
    switcher,
    suffix,
    dragGhost,
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

  // treeDataSimpleJson → TreeNodeData[]：扁平 { key: value } 转树（对齐 Semi）。
  // key 同时作 key/label；原始值为对象则递归成子树，否则作叶子的 value。纯函数、不依赖响应式。
  function simpleJsonToTree(json: Record<string, unknown>): TreeNodeData[] {
    return Object.entries(json).map(([k, v]) => {
      if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
        return {
          key: k,
          label: k,
          children: simpleJsonToTree(v as Record<string, unknown>),
        } as TreeNodeData;
      }
      return { key: k, label: k, value: v } as unknown as TreeNodeData;
    });
  }

  // 实际数据源：treeData 非空时优先用它；否则若传了 treeDataSimpleJson 则转换之。
  const sourceData = $derived<TreeNodeData[]>(
    treeData.length > 0 || !treeDataSimpleJson ? treeData : simpleJsonToTree(treeDataSimpleJson),
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

  // 标准化后的树：默认时即数据源原引用（零开销），否则递归映射字段名。
  const normalizedData = $derived<TreeNodeData[]>(
    fieldNamesDefault ? sourceData : normalizeNodes(sourceData),
  );

  /** 回调回传：自定义 fieldNames 时回原始节点，否则回标准节点本身。 */
  function toOrig(node: TreeNodeData): TreeNodeData {
    const orig = (node as Partial<NormalizedNode>).__orig;
    return (orig as TreeNodeData | undefined) ?? node;
  }

  /** 在合并树中按 key 查标准化节点（供 onChangeWithObject 还原节点对象等使用）。 */
  function findMerged(key: TreeKey): TreeNodeData | undefined {
    return findNode(mergedData, key);
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
      onLoad?.([...loadedKeys].map(String), { event: 'load', node: toOrig(node) });
    }
  }

  // --- selection: 受控 value 不回写 (红线 #1) ---
  // onChangeWithObject 时 value/defaultValue 为节点对象（或对象数组）；内部 state 统一按 key 存储，
  // 收发对象时用下面的 helper 在「对象 ↔ key」间转换。对象标识优先取 value 字段，缺省回退 key。
  type ValueEntry = TreeKey | TreeNodeData;
  /**
   * 从一个 value 项（原始 key 或对象）提取内部节点标识 key。
   * 本库节点身份为 key：对象优先取 `key`，缺省回退 `value`（对齐 Semi 对象含 value 键的约定）。
   */
  function entryToKey(entry: ValueEntry): TreeKey | null {
    if (entry !== null && typeof entry === 'object') {
      const obj = entry as unknown as Record<string, unknown>;
      const id = (obj.key ?? obj.value) as TreeKey | undefined;
      return id ?? null;
    }
    return entry as TreeKey;
  }
  /** 把内部 key 转成回调/受控所需的输出形态：onChangeWithObject 时回原始节点对象，否则回 key。 */
  function keyToOutput(key: TreeKey): TreeKey | TreeNodeData {
    if (!onChangeWithObject) return key;
    const node = findMerged(key);
    return node ? toOrig(node) : key;
  }
  function initValue(): TreeKey | TreeKey[] | null {
    const dv = defaultValue as ValueEntry | ValueEntry[] | null;
    if (multiple) {
      return Array.isArray(dv) ? dv.map(entryToKey).filter((k): k is TreeKey => k !== null) : [];
    }
    if (Array.isArray(dv)) return dv.length > 0 ? entryToKey(dv[0] as ValueEntry) : null;
    return dv === null ? null : entryToKey(dv);
  }
  const isValueControlled = $derived(value !== undefined);
  let innerValue = $state<TreeKey | TreeKey[] | null>(initValue());
  // 受控 value：onChangeWithObject 时为对象形态，统一归一为内部 key 集合。
  const selectedSet = $derived.by(() => {
    const set = new Set<TreeKey>();
    const src: TreeKey | TreeKey[] | null = isValueControlled
      ? (() => {
          const v = value as ValueEntry | ValueEntry[] | null | undefined;
          if (v === undefined || v === null) return null;
          if (Array.isArray(v))
            return v.map(entryToKey).filter((k): k is TreeKey => k !== null);
          return entryToKey(v);
        })()
      : innerValue;
    if (Array.isArray(src)) for (const k of src) set.add(k);
    else if (src !== null) set.add(src);
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
  // 解耦时直接用 base 当 checked，无半选；联动时用 conduct 归一（disableStrictly 传入以锁定禁用节点）。
  const checkState = $derived.by(() => {
    if (!checkLinked) {
      return { checked: new Set(currentCheckedBase), half: new Set<TreeKey>() };
    }
    return conduct(mergedData, currentCheckedBase, disableStrictly);
  });

  // --- expand: 受控 expandedKeys 不回写 (红线 #1) ---
  function initExpanded(): Set<TreeKey> {
    // 需用标准化后的 key（fieldNames 自定义时 collectExpandable* 才能识别 children）。
    const rawSource =
      treeData.length > 0 || !treeDataSimpleJson
        ? treeData
        : simpleJsonToTree(treeDataSimpleJson);
    const base = fieldNamesDefault ? rawSource : normalizeNodes(rawSource);
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
  const baseExpandedSet = $derived(
    isExpandControlled ? new Set(expandedKeys ?? []) : innerExpanded,
  );
  // autoExpandParent：展开节点的所有祖先也纳入展开集（派生，不写回，红线 #1）。
  // 实现：对 baseExpandedSet 中每个 key，递归向上收集祖先 key（深度优先搜索）。
  function collectAncestors(data: TreeNodeData[], targetKey: TreeKey, acc: Set<TreeKey>): boolean {
    for (const node of data) {
      if (node.key === targetKey) return true;
      if (node.children && collectAncestors(node.children, targetKey, acc)) {
        acc.add(node.key);
        return true;
      }
    }
    return false;
  }
  const currentExpandedSet = $derived.by(() => {
    if (!autoExpandParent || baseExpandedSet.size === 0) return baseExpandedSet;
    const withAncestors = new Set(baseExpandedSet);
    for (const key of baseExpandedSet) {
      collectAncestors(mergedData, key, withAncestors);
    }
    return withAncestors;
  });

  // --- 搜索：支持受控（searchValueProp）和非受控（内部 state）两种模式 ---
  // 受控：searchValueProp 传入时直接用，input 事件仅触发 onSearch 回调，不更新内部 state（红线 #1）。
  // 非受控：用内部 state，input 事件更新 innerSearchValue 并触发 onSearch。
  const isSearchControlled = $derived(searchValueProp !== undefined);
  let innerSearchValue = $state('');
  const searchValue = $derived(isSearchControlled ? (searchValueProp ?? '') : innerSearchValue);
  const trimmedSearch = $derived(searchValue.trim());
  // 搜索框是否渲染/启用：filterable 或 filterTreeNode（true 或自定义谓词函数）任一开启。
  const searchEnabled = $derived(filterable || filterTreeNode === true || typeof filterTreeNode === 'function');
  const searchActive = $derived(searchEnabled && trimmedSearch.length > 0);
  // 过滤谓词：传函数则用自定义 (input, node)；否则内置 label 包含（不区分大小写）。
  // 内置谓词按 treeNodeFilterProp 指定字段匹配（默认 label）；字段缺省回退 label。
  function nodeFilterText(node: TreeNodeData): string {
    const raw = (node as unknown as Record<string, unknown>)[treeNodeFilterProp];
    const v = raw ?? node.label;
    return v == null ? '' : String(v);
  }
  const matchPredicate = $derived.by(() => {
    if (typeof filterTreeNode === 'function') {
      const fn = filterTreeNode;
      // 回传原始节点（fieldNames 自定义时），与其它回调一致。
      return (node: TreeNodeData) => fn(trimmedSearch, toOrig(node));
    }
    const lower = trimmedSearch.toLowerCase();
    return (node: TreeNodeData) => nodeFilterText(node).toLowerCase().includes(lower);
  });
  const filterResult = $derived.by(() => {
    if (!searchActive) return { matched: new Set<TreeKey>(), expand: new Set<TreeKey>() };
    return computeFilteredKeys(mergedData, matchPredicate);
  });

  // 搜索输入处理：受控时只触发 onSearch，非受控时同时更新 innerSearchValue。
  function handleSearchInput(e: Event) {
    const val = (e.target as HTMLInputElement).value;
    if (!isSearchControlled) innerSearchValue = val;
    // 计算 filteredKeys 并回调（基于当前 filterResult，但此时 val 可能还未更新到 derived）。
    // 为使 filteredKeys 与新 val 同步，临时基于新 val 计算一次。
    if (onSearch) {
      const trimmed = val.trim();
      let fKeys: string[] = [];
      if (trimmed.length > 0 && searchEnabled) {
        let pred: (node: TreeNodeData) => boolean;
        if (typeof filterTreeNode === 'function') {
          const fn = filterTreeNode;
          pred = (node: TreeNodeData) => fn(trimmed, toOrig(node));
        } else {
          const lower = trimmed.toLowerCase();
          pred = (node: TreeNodeData) => nodeFilterText(node).toLowerCase().includes(lower);
        }
        const result = computeFilteredKeys(mergedData, pred);
        fKeys = [...result.matched].map(String);
      }
      onSearch(val, fKeys);
    }
  }

  // 清除搜索：非受控时清空内部 state；受控时仅回调 onSearch('') 让外层清（红线 #1）。
  function clearSearch() {
    if (!isSearchControlled) innerSearchValue = '';
    onSearch?.('', []);
  }
  const showClearBtn = $derived(showClear && searchValue.length > 0 && !disabled);

  // 搜索激活时把过滤展开集并入可见展开集（派生，不写回）
  const effectiveExpanded = $derived.by(() => {
    if (!searchActive) return currentExpandedSet;
    const merged = new Set(currentExpandedSet);
    for (const k of filterResult.expand) merged.add(k);
    return merged;
  });

  // --- 可见扁平节点 ---
  const flat = $derived(flattenVisible(mergedData, effectiveExpanded));
  // showFilteredOnly（对齐 Semi）：搜索激活时仅保留命中节点及其祖先链（expand 集即祖先链 +
  // 自身有命中后代者），隐藏其它未命中节点。默认 false 时展示全树（命中项高亮、祖先自动展开）。
  const visibleFlat = $derived.by(() => {
    if (!searchActive || !showFilteredOnly) return flat;
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
  // 非虚拟化时的 role=tree 容器引用，供命令式 focus() 使用（preventScroll 传递给此处）。
  let listEl = $state<HTMLDivElement | null>(null);

  /**
   * 命令式聚焦树容器（对齐 Semi 组件内 focus 方法）。
   * 尊重 preventScroll：为 true 时聚焦不触发浏览器滚动文档。可经组件实例调用。
   */
  export function focus(): void {
    const el = viewportEl ?? listEl;
    el?.focus({ preventScroll });
  }
  // 仅由命令式 scroll 回调写入的本地 scrollTop，render 期只读。
  let scrollTop = $state(0);
  // rAF 节流句柄（非响应式）。
  let rafId = 0;

  // labelEllipsis：未显式传时默认跟随 virtualized（虚拟化下默认省略，对齐 Semi）。
  const ellipsis = $derived(labelEllipsis ?? virtualized);

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

  // autoMergeValue（对齐 Semi）：从 checked 集中剔除「有已选中祖先」的后代 key，
  // 使某父节点被完全选中时输出仅保留该父节点，不含其子孙。纯函数，不修改入参。
  function mergeCheckedKeys(data: TreeNodeData[], checked: Set<TreeKey>): TreeKey[] {
    const out: TreeKey[] = [];
    const walk = (nodes: TreeNodeData[], ancestorChecked: boolean) => {
      for (const n of nodes) {
        const selfChecked = checked.has(n.key);
        // 仅当自身被选中且无已选中祖先时保留（顶层完全选中节点）。
        if (selfChecked && !ancestorChecked) out.push(n.key);
        if (n.children && n.children.length > 0) {
          walk(n.children, ancestorChecked || selfChecked);
        }
      }
    };
    walk(data, false);
    return out;
  }

  // --- 状态写入：仅非受控写 inner，受控只回调 (红线 #1) ---
  function emitSelect(node: TreeNodeData) {
    if (!isSelectable(node)) return;
    // 内部始终以 key 计算下一态（selectedSet 已把受控对象/key 归一为 key 集）。
    let nextKeys: TreeKey | TreeKey[];
    let selected: boolean;
    if (multiple) {
      // 从当前选中 key 集派生数组，保持文档序不敏感（沿用原「切换」语义）。
      const arr = [...selectedSet];
      const idx = arr.indexOf(node.key);
      if (idx >= 0) {
        arr.splice(idx, 1);
        selected = false;
      } else {
        arr.push(node.key);
        selected = true;
      }
      nextKeys = arr;
    } else {
      // 单选：点击直接选中该节点（不取消），selected 恒为 true
      nextKeys = node.key;
      selected = true;
    }
    if (!isValueControlled) innerValue = nextKeys;
    // onChangeWithObject 时把 key 形态转成节点对象形态输出（数组内元素同型，非混合）。
    const outValue: ChangeInfo['value'] = Array.isArray(nextKeys)
      ? (nextKeys.map(keyToOutput) as TreeKey[] | TreeNodeData[])
      : keyToOutput(nextKeys);
    onChange?.({ value: outValue, node: toOrig(node), selected });
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
      : conduct(mergedData, nextBase, disableStrictly);
    // 输出优先级：leafOnly（只留叶子）> autoMergeValue（合并父子、剔除已选祖先的后代）> 全量。
    // autoMergeValue 仅在联动（related）且非 leafOnly 下有意义（对齐 Semi）。
    let checkedOut: TreeKey[];
    if (leafOnly) {
      checkedOut = collectLeafKeys(mergedData, resolved.checked);
    } else if (autoMergeValue && checkLinked) {
      checkedOut = mergeCheckedKeys(mergedData, resolved.checked);
    } else {
      checkedOut = [...resolved.checked];
    }
    const halfOut = leafOnly ? [] : [...resolved.half];
    onCheck?.({
      checked: checkedOut,
      node: toOrig(node),
      halfChecked: halfOut,
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
    const expandable = isExpandable(node, (node.children?.length ?? 0) > 0);
    if (isSelectable(node)) {
      emitSelect(node);
      // expandAction='click'：可选中节点点击整行时，选中与展开同时发生（对齐 Semi）。
      if (expandAction === 'click' && expandable) toggleExpand(node);
    } else if (expandable) {
      // 不可选中的可展开节点：默认点击即展开（沿用原行为），expandAction='click' 语义一致，不重复触发。
      toggleExpand(node);
    }
  }

  // 节点双击：先回调 onDoubleClick；expandAction='doubleClick' 时再触发展开/收起。
  function onRowDblClick(e: MouseEvent, node: TreeNodeData) {
    if (isNodeDisabled(node)) return;
    onDoubleClick?.(e, toOrig(node));
    if (expandAction === 'doubleClick' && isExpandable(node, (node.children?.length ?? 0) > 0)) {
      toggleExpand(node);
    }
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

  // `*`：展开当前层级（与活动节点同 parentKey）的全部可展开同级节点（APG 推荐，spec §6）。
  // 基于可见扁平节点定位同级，逐个展开未展开者（不收起已展开），合并为一次状态写入。
  function expandSiblings() {
    const f = currentFlat();
    if (!f) return;
    const targetParent = f.parentKey;
    const siblings = visibleFlat.filter(
      (x) => x.parentKey === targetParent && isExpandable(x.node, x.hasChildren),
    );
    let changed = false;
    let next = new Set(currentExpandedSet);
    let lastNode: TreeNodeData | null = null;
    for (const sib of siblings) {
      if (next.has(sib.node.key)) continue;
      // 触发未加载异步节点的子节点拉取（数据到位后合并树派生显示）。
      const hasOwnKids = (sib.node.children?.length ?? 0) > 0;
      if (!hasOwnKids && loadData && !loadedKeys.has(sib.node.key)) {
        void loadChildren(sib.node);
      }
      next.add(sib.node.key);
      lastNode = sib.node;
      changed = true;
    }
    if (!changed || lastNode === null) return;
    if (!isExpandControlled) innerExpanded = next;
    // 一次性回调（node 取最后展开者，expand=true）；受控时不回写（红线 #1）。
    onExpandedChange?.({ expanded: [...next], node: toOrig(lastNode), expand: true });
  }

  // typeahead：连续输入字符在可见节点间按 label 前缀跳转（APG，spec §6）。
  // 缓冲命令式（非响应式），超时清空；同字符重复则在匹配项间循环。
  let typeaheadBuffer = '';
  let typeaheadTimer: ReturnType<typeof setTimeout> | undefined;
  const TYPEAHEAD_TIMEOUT = 600;

  function clearTypeahead() {
    typeaheadBuffer = '';
    typeaheadTimer = undefined;
  }

  // 卸载兜底清理 typeahead 计时器（红线 #3）。
  $effect(() => () => {
    if (typeaheadTimer !== undefined) clearTimeout(typeaheadTimer);
  });

  function typeahead(char: string) {
    if (typeaheadTimer !== undefined) clearTimeout(typeaheadTimer);
    typeaheadTimer = setTimeout(clearTypeahead, TYPEAHEAD_TIMEOUT);
    // 同一字符重复输入：从当前项之后开始找下一个该字母开头者（在匹配项间循环）。
    const repeat = typeaheadBuffer.length === 1 && typeaheadBuffer === char.toLowerCase();
    typeaheadBuffer = repeat ? typeaheadBuffer : typeaheadBuffer + char.toLowerCase();
    const prefix = typeaheadBuffer;
    const len = visibleFlat.length;
    if (len === 0) return;
    const cur = activeIndex();
    const start = cur < 0 ? 0 : (repeat ? cur + 1 : cur);
    for (let n = 0; n < len; n += 1) {
      const i = (start + n) % len;
      const fn = visibleFlat[i] as FlatNode;
      if (isNodeDisabled(fn.node)) continue;
      if (fn.node.label.toLowerCase().startsWith(prefix)) {
        activeKey = fn.node.key;
        return;
      }
    }
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
        return;
      }
      // 无活动项时也支持 typeahead：从首项起按前缀跳转（activeIndex() 返回 -1 时从 0 开始）。
      if (
        e.key.length === 1 &&
        e.key !== ' ' &&
        e.key !== '*' &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey
      ) {
        e.preventDefault();
        typeahead(e.key);
        scrollActiveIntoView();
      }
      // 其它键（含 `*`：无活动项无明确层级）不处理。
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
      case '*':
        e.preventDefault();
        expandSiblings();
        break;
      default:
        // typeahead：单个可打印字符（非修饰键）→ 按 label 前缀跳转。
        if (
          e.key.length === 1 &&
          e.key !== ' ' &&
          !e.ctrlKey &&
          !e.metaKey &&
          !e.altKey
        ) {
          e.preventDefault();
          typeahead(e.key);
        }
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
      // 自定义拖拽影像：renderDraggingNode 优先，其次 hideDraggingNode 用透明图隐藏默认幽灵。
      const rowEl = e.currentTarget as HTMLElement;
      if (renderDraggingNode) {
        const custom = renderDraggingNode(rowEl, toOrig(node));
        if (custom) e.dataTransfer.setDragImage(custom, 0, 0);
      } else if (hideDraggingNode) {
        // 1x1 透明图片：绝大多数浏览器据此隐藏默认 dragImg。
        const img = new Image();
        img.src =
          'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        e.dataTransfer.setDragImage(img, 0, 0);
      }
    }
    onDragStart?.(toOrig(node));
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
    // 切换目标行时重置 inside 自动展开计时器，并触发 onDragEnter。
    if (dropKey !== node.key) {
      clearExpandTimer();
      // 通知拖拽进入新目标节点
      if (dragKey !== null) {
        const dragNode = findFlatNode(dragKey);
        if (dragNode) onDragEnter?.({ dragNode: toOrig(dragNode), dropNode: toOrig(node) });
      }
    }
    dropKey = node.key;
    dropPos = pos;
    // 拖到内部时自动展开目标（便于放入），延时避免误触。autoExpandWhenDragEnter=false 时关闭。
    if (
      autoExpandWhenDragEnter &&
      pos === 'inside' &&
      isExpandable(node, f.hasChildren) &&
      !isExpanded(node.key)
    ) {
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
    <div class="cd-tree__search" class:cd-tree__search--clearable={showClearBtn}>
      <input
        class={['cd-tree__search-input', searchClassName].filter(Boolean).join(' ')}
        type="text"
        placeholder={loc().t('Tree.searchPlaceholder')}
        aria-label={loc().t('Tree.searchPlaceholder')}
        value={searchValue}
        oninput={handleSearchInput}
        style={searchStyle}
        {disabled}
      />
      {#if showClearBtn}
        <button
          type="button"
          class="cd-tree__search-clear"
          aria-label={loc().t('Tree.clear')}
          onclick={clearSearch}
        >
          <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" focusable="false">
            <path
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              d="M4 4l8 8M12 4l-8 8"
            />
          </svg>
        </button>
      {/if}
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
      bind:this={listEl}
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
          ondblclick={onDoubleClick || expandAction === 'doubleClick'
            ? (e) => onRowDblClick(e, node)
            : undefined}
          oncontextmenu={onRightClick ? (e) => { e.preventDefault(); onRightClick(e, toOrig(node)); } : undefined}
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
            {#if switcher}
              {@render switcher({ node, expanded: false, loading: true })}
            {:else}
              <span class="cd-tree__switcher cd-tree__switcher--loading" aria-hidden="true">
                <span class="cd-tree__spinner"></span>
              </span>
            {/if}
          {:else if expandable}
            {#if switcher}
              <!-- svelte-ignore a11y_click_events_have_key_events -->
              <span
                role="button"
                tabindex="-1"
                aria-label={expanded ? loc().t('Tree.collapse') : loc().t('Tree.expand')}
                onclick={(e) => {
                  e.stopPropagation();
                  if (!nodeDisabled) toggleExpand(node);
                }}
              >
                {@render switcher({ node, expanded, loading: false })}
              </span>
            {:else}
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
            {/if}
          {:else}
            {#if switcher}
              {@render switcher({ node, expanded: false, loading: false })}
            {:else}
              <span class="cd-tree__switcher cd-tree__switcher--leaf" aria-hidden="true"></span>
            {/if}
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
            {@const isLeaf = !expandable}
            <span class="cd-tree__icon" aria-hidden="true">
              {#if icon}{@render icon({ node, expanded, isLeaf })}{/if}
            </span>
          {/if}

          <span class="cd-tree__label" class:cd-tree__label--ellipsis={ellipsis}>
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

          {#if suffix}
            <span class="cd-tree__suffix">
              {@render suffix({ node })}
            </span>
          {/if}

          {#if dragGhost && dragging}
            <span class="cd-tree__drag-ghost" aria-hidden="true">
              {@render dragGhost({ node })}
            </span>
          {/if}
        </div>
{/snippet}

<style>
  .cd-tree {
    --cd-tree-row-height: var(--cd-tree-node-height);
    display: flex;
    flex-direction: column;
    gap: var(--cd-spacing-extra-tight);
    color: var(--cd-tree-node-color);
    font-size: var(--cd-tree-node-font-size);
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

  .cd-tree__search {
    position: relative;
  }
  .cd-tree__search-input {
    inline-size: 100%;
    block-size: var(--cd-tree-row-height);
    padding-inline: var(--cd-spacing-tight);
    color: inherit;
    background: var(--cd-color-bg-1, transparent);
    border: 1px solid var(--cd-tree-border-color);
    border-radius: var(--cd-tree-radius);
    font: inherit;
  }
  /* 显示清除按钮时给输入框尾部留出空间（RTL 自适应 padding-inline-end） */
  .cd-tree__search--clearable .cd-tree__search-input {
    padding-inline-end: calc(var(--cd-spacing-tight) + 1.25rem);
  }
  .cd-tree__search-clear {
    position: absolute;
    inset-block-start: 50%;
    inset-inline-end: var(--cd-spacing-extra-tight);
    transform: translateY(-50%);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: 1.25rem;
    block-size: 1.25rem;
    padding: 0;
    color: var(--cd-tree-node-color-disabled);
    background: transparent;
    border: none;
    border-radius: 50%;
    cursor: pointer;
  }
  .cd-tree__search-clear:hover {
    color: var(--cd-tree-node-color);
    background: var(--cd-tree-node-bg-hover);
  }
  .cd-tree__search-clear:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px var(--cd-tree-focus-ring);
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
    border-radius: var(--cd-tree-radius);
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
    gap: var(--cd-spacing-extra-tight);
    block-size: var(--cd-tree-row-height);
    padding-inline-end: var(--cd-spacing-tight);
    border-radius: var(--cd-tree-radius);
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
    block-size: var(--cd-width-tree-option-draggable-border);
    background: var(--cd-color-tree-option-draggable-insert-border-default);
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
    box-shadow: inset 0 0 0 1px var(--cd-color-tree-option-draggable-insert-border-default);
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
    background: var(--cd-tree-line-color);
  }
  /* ├ 形：竖线贯穿 + 横线到右 */
  .cd-tree__line--tee::before {
    content: '';
    position: absolute;
    inset-block: 0;
    inset-inline-start: 50%;
    inline-size: 1px;
    background: var(--cd-tree-line-color);
  }
  /* └ 形：竖线 top→中 + 横线到右 */
  .cd-tree__line--elbow::before {
    content: '';
    position: absolute;
    inset-block-start: 0;
    block-size: 50%;
    inset-inline-start: 50%;
    inline-size: 1px;
    background: var(--cd-tree-line-color);
  }
  .cd-tree__line--tee::after,
  .cd-tree__line--elbow::after {
    content: '';
    position: absolute;
    inset-block-start: 50%;
    inset-inline-start: 50%;
    inset-inline-end: 0;
    block-size: 1px;
    background: var(--cd-tree-line-color);
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
    border: 2px solid var(--cd-tree-border-color);
    border-block-start-color: var(--cd-color-tree-option-loading-icon-default);
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
    color: var(--cd-color-text-inverse);
    background: var(--cd-color-bg-1, #fff);
    border: 1px solid var(--cd-tree-border-color);
    border-radius: var(--cd-radius-tree-checkbox-addon);
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
    flex: 1 1 auto;
    min-inline-size: 0;
  }
  /* labelEllipsis：超长单行省略（默认关闭；虚拟化下默认开启） */
  .cd-tree__label--ellipsis {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .cd-tree__suffix {
    display: inline-flex;
    align-items: center;
    flex: 0 0 auto;
    margin-inline-start: var(--cd-spacing-extra-tight);
  }

  /* 拖拽幽灵节点：绝对定位在节点外屏幕外，由浏览器 setDragImage 拾取（或 CSS 隐藏） */
  .cd-tree__drag-ghost {
    position: absolute;
    inset-inline-start: -9999px;
    inset-block-start: 0;
    pointer-events: none;
  }

  .cd-tree__highlight {
    padding: 0;
    color: var(--cd-tree-search-highlight-color);
    background: var(--cd-tree-search-highlight-bg);
    font-weight: var(--cd-tree-search-highlight-weight); /* 对齐 Semi 高亮字重 bold */
  }

  .cd-tree__empty {
    padding: var(--cd-spacing-base-tight);
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
