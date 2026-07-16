<!--
  Tree — 严格对齐 Semi Design Tree。
  层级展示：展开/收起、单选/多选(multiple 驱动 checkbox 父子联动含半选 mixed)、内置搜索高亮。
  值通道统一走 value/onChange：单选为节点 key，多选为选中 key 数组（含 conduct 联动结果）。
  受控 value/expandedKeys 不回写，仅 onChange/onExpand/onSelect/onSearch 通知（红线 #1）。
  键盘遵循 WAI-ARIA APG Tree View（单一 tab stop + aria-activedescendant）。
  复用 @chenzy-design/core 的纯函数树算法，不重复实现。
  loadData：展开未加载的非叶子节点时异步取子节点，结果缓存进本地 SvelteMap
  并派生合并树喂给所有 core 函数（不写回受控 treeData，红线 #1）。
  showLine：层级引导线（复用 core FlatNode.isLast/ancestorIsLast，纯 CSS ├/└/竖线）。
  virtualize：大数据树虚拟滚动（传 { itemSize, height?, width? } 对象开启，对齐 Semi）。直接用
  core fixedRange 纯函数自建轻量 fixed 定高虚拟化（非复用 VirtualList 组件——其 role=list/listitem
  包裹层会破坏 role=tree→treeitem 的 ARIA 结构），保持 role=tree 容器 + 行 role=treeitem 语义不变；
  只渲染视口内切片。滚动监听命令式 + rAF 节流 + cleanup（红线 #3），可见区间 $derived 纯派生（红线 #2）。
  键盘移动 activeKey 时 scrollToIndex 滚到可见，确保目标行进入视口并被渲染，保证键盘可用。
  keyMaps：自定义节点字段名（key/label/children）映射任意后端数据；派生只读标准化（红线 #1/#2），
  默认字段名时零开销直接用原 treeData，回调回传原始节点（__orig）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import {
    useId,
    flattenVisible,
    collectExpandable,
    conduct,
    toggleCheck,
    collectLeafKeys,
    findNode,
    computeFilteredKeys,
    fixedRange,
    scrollOffsetForIndex,
    computeDropPosition,
    isAncestorOrSelf,
    type TreeKey,
    type TreeNodeData,
    type FlatNode,
    type DropPosition,
  } from '@chenzy-design/core';
  import { SvelteMap, SvelteSet } from 'svelte/reactivity';
  import {
    IconSearch,
    IconTreeTriangleDown,
    IconFile,
    IconFolder,
    IconFolderOpen,
  } from '@chenzy-design/icons';
  import { useLocale } from '../locale-provider/index.js';
  import Input from '../input/Input.svelte';
  import Checkbox from '../checkbox/Checkbox.svelte';
  import Spin from '../spin/Spin.svelte';
  import Highlight from '../highlight/Highlight.svelte';

  /** 值通道类型（对齐 Semi `Value`）：单选为标量或节点对象，多选为其数组。 */
  type TreeValue =
    | TreeKey
    | TreeNodeData
    | Array<TreeKey | TreeNodeData>;
  type DropInfo = {
    dragNode: TreeNodeData;
    dropNode: TreeNodeData;
    dropPosition: DropPosition;
  };

  /** 虚拟化配置对象（对齐 Semi `Virtualize`）。itemSize 必传。 */
  type Virtualize = {
    /** 每行高度（px），必传 */
    itemSize: number;
    /** 视口高度，默认 '100%'（需父节点有确定高度）或数字 px */
    height?: number | string;
    /** 视口宽度，默认 '100%' */
    width?: number | string;
  };

  /** 自定义节点字段名映射（适配任意后端数据结构）。默认 key/label/children。 */
  type KeyMaps = { key?: string; label?: string; children?: string };

  /**
   * renderFullLabel 整行接管渲染的上下文（对齐 Semi `renderFullLabel` 参数）。
   * 暴露节点数据、层级、内置计算好的 class、展开图标 snippet 与全部行为回调，
   * 让使用者完全自定义整行 option 的渲染结构（叶子分组、单选高亮子节点等高级场景）。
   */
  type FullLabelContext = {
    /** 节点数据（自定义 keyMaps 时为原始节点） */
    data: TreeNodeData;
    /** 层级，从 0 开始 */
    level: number;
    /** 虚拟化时必须赋给渲染 DOM 的定位样式（否则行错位） */
    style: string | undefined;
    /** 内置样式类名（含缩进/选中/禁用等状态类） */
    className: string;
    /**
     * 内置展开图标 snippet。可展开节点渲染可点击的箭头（点击触发展开/收起），叶子节点为占位。
     * 用法：`{@render ctx.expandIcon(ctx.expandStatus)}`（传入展开态以渲染正确朝向）。
     */
    expandIcon: Snippet<[{ expanded: boolean; loading: boolean }]>;
    /** 是否叶子节点 */
    isLeaf: boolean;
    /** 选中状态 */
    checkStatus: { checked: boolean; halfChecked: boolean };
    /** 展开状态 */
    expandStatus: { expanded: boolean; loading: boolean };
    /** 该节点是否命中当前搜索 */
    filtered: boolean;
    /** 当前搜索框输入值 */
    searchWord: string;
    /** 单选/行点击回调 */
    onClick: (e: MouseEvent) => void;
    /** 勾选回调 */
    onCheck: (e: MouseEvent) => void;
    /** 展开/收起回调 */
    onExpand: (e: MouseEvent) => void;
    /** 右键回调 */
    onContextMenu: (e: MouseEvent) => void;
    /** 双击回调 */
    onDoubleClick: (e: MouseEvent) => void;
  };

  /**
   * searchRender 自定义搜索框渲染上下文（对齐 Semi `searchRender` 收到的 inputProps）。
   * Semi 把这些 props spread 给内置 Input；本库同样透传，snippet 可原样传给我们的 `Input` 组件。
   */
  type SearchRenderContext = {
    value: string;
    placeholder: string;
    /** 值变化回调（等价 Input 的 onChange/onInput） */
    onChange: (value: string) => void;
    /** 清除回调 */
    onClear: () => void;
    /** 是否显示清除按钮（对齐 Semi showClear，映射 Input 的 clearable） */
    showClear: boolean;
    className: string | undefined;
    style: string | undefined;
    disabled: boolean;
  };

  /** 标准节点附带原始节点引用，用于回调时回传用户原始数据。 */
  type NormalizedNode = TreeNodeData & { __orig: Record<string, unknown> };

  interface Props {
    /**
     * 树数据源。默认节点字段为 key/label/children；
     * 用 keyMaps 自定义字段名时可传任意后端结构（如 { id, name, sub }）。
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
    keyMaps?: KeyMaps;
    /**
     * 受控选中值（对齐 Semi `value`）。传入即为受控（不回写，红线 #1）。
     *  - 单选（multiple=false）：选中节点的 key（或 onChangeWithObject 时为节点对象）；
     *  - 多选（multiple=true）：选中节点 key 数组（含父子联动结果；onChangeWithObject 时为对象数组）。
     */
    value?: TreeValue | null;
    /** 非受控初始选中值（对齐 Semi `defaultValue`）；形态同 value。 */
    defaultValue?: TreeValue | null;
    /**
     * 以对象形态回传/接收选中项（对齐 Semi `onChangeWithObject`）。开启后：
     *  - `onChange` 回调入参的 `value` 从 key（或 key 数组）变为**节点对象**（含 label/value/其它字段，
     *    即原始节点 `toOrig`），多选时为对象数组；
     *  - 受控 `value` 与非受控 `defaultValue` 也须传对象形态（对象须含节点标识——优先取 `value` 字段，
     *    缺省回退 `key`）。组件内部据此提取标识匹配节点。
     * 默认 false（value 收发均为 key）。
     */
    onChangeWithObject?: boolean;
    /**
     * 是否多选（对齐 Semi `multiple`）。默认 false。
     * 开启后每行渲染勾选框（checkbox），父子联动勾选（含半选 mixed），选中值经 `value`/`onChange`
     * 作为选中 key 数组收发。关闭为单选（点击整行选中，值为单个 key）。
     */
    multiple?: boolean;
    /**
     * 多选时父子勾选联动关系（对齐 Semi `checkRelation`）。默认 'related'。
     *  - 'related'：勾选父全选子、子全选则父选中、部分选中半选（默认联动）；
     *  - 'unRelated'：父子勾选互不影响，每个节点独立勾选、无半选态。
     * 仅 multiple 时有意义。
     */
    checkRelation?: 'related' | 'unRelated';
    /**
     * 严格禁用（对齐 Semi `disableStrictly`）。开启后，disabled 节点的勾选态被「严格锁定」：
     * 不能通过父级/子级联动改变——已勾选的 disabled 节点不会被父级取消，未勾选的不会被父级勾上。
     * 与普通 `disabled` 的区别：普通 disabled 仅禁止直接点击该节点，其勾选态仍可能因父级联动被改；
     * `disableStrictly` 则连联动也锁死。仅在 multiple 联动（related）下有意义。默认 false。
     */
    disableStrictly?: boolean;
    /**
     * 仅叶子回传（对齐 Semi `leafOnly`）。多选（multiple）时，`onChange` 回传的 value（选中集）
     * 只含叶子节点，不含父/半选节点。适合「父节点仅作分组、值只关心叶子」的场景。
     * 仅在 multiple 联动（related）下有意义；解耦（unRelated）下本就是各节点独立态，leafOnly 仍滤成只留叶子。
     * 默认 false（回传全部命中节点）。
     */
    leafOnly?: boolean;
    /**
     * 目录树模式（对齐 Semi `directory`）。开启后：
     *  - 默认整行块（等价 blockNode=true），点击整行即选中；
     *  - 内置目录/文件图标（可展开节点为文件夹、叶子为文件），可用 `icon` snippet 覆盖；
     *  - 默认展开触发方式为点击整行（expandAction 未显式指定时按 'click'）。
     * 默认 false。
     */
    directory?: boolean;
    /** 是否开启展开/收起动画（对齐 Semi `motion`）。默认 true；virtualize 时强制关闭。 */
    motion?: boolean;
    expandedKeys?: TreeKey[];
    defaultExpandedKeys?: TreeKey[];
    defaultExpandAll?: boolean;
    /**
     * 展开全部（对齐 Semi `expandAll`）。与 `defaultExpandAll` 的区别：defaultExpandAll 仅初始化生效，
     * 数据（treeData）后续变化不再影响；expandAll 在数据变化时**仍然生效**（每次数据变化都重新展开全部）。
     * 仅在非受控展开（未传 expandedKeys）时有意义。默认 false。
     */
    expandAll?: boolean;
    /**
     * 自动展开父节点（对齐 Semi `autoExpandParent`，默认 false）。
     *  - 初次挂载：把初始展开节点的祖先链一次性并入展开集，使其可见（非受控经 initExpanded）；
     *  - 开启后交互约束：收起某父节点时，若它仍有展开的子孙，则**阻止收起**——需先收起所有
     *    子节点才能收起父节点（对齐 Semi「需先收起子节点」）。
     * 默认 false（收起不受此约束，父节点可直接收起）。
     */
    autoExpandParent?: boolean;
    /**
     * 展开触发方式（对齐 Semi `expandAction`）。
     *  - `false`（默认）：仅点击展开箭头（switcher）才展开/收起，点击行只做选中；
     *  - `'click'`：点击整行即展开/收起；
     *  - `'doubleClick'`：双击整行才展开/收起。
     * 注意：switcher 箭头在任意模式下都可点击展开。
     */
    expandAction?: false | 'click' | 'doubleClick';
    /**
     * 多选 value 自动合并父子（对齐 Semi `autoMergeValue`）。默认 true。
     * 开启后，当某父节点被完全选中时，`onChange` 回传的 value 不再包含其子孙节点（仅保留父节点）；
     * 关闭则回传全部命中节点。仅在 `multiple` 联动（related）且 `leafOnly=false` 时有意义。
     */
    autoMergeValue?: boolean;
    /**
     * label 超长省略（对齐 Semi `labelEllipsis`）。默认 false；`virtualize` 时默认 true。
     * 开启后单行 label 超出容器宽度以省略号截断；关闭则不截断（可换行/溢出由外部控制）。
     */
    labelEllipsis?: boolean;
    /**
     * 聚焦组件内节点时是否阻止浏览器滚动文档（对齐 Semi `preventScroll`，作用于内部 focus 调用）。
     * 默认 false（聚焦时按需滚动至可见）。
     */
    preventScroll?: boolean;
    /** 显示层级连接线（父子引导线，对齐 Semi `showLine`）。默认 false。 */
    showLine?: boolean;
    /**
     * 列表虚拟化（对齐 Semi `virtualize`）。传入 `{ itemSize, height?, width? }` 对象即开启：
     * 仅渲染视口内可见节点行，适合大数据树（1000+ 节点）。`itemSize`（行高 px）必传；
     * `height` 默认 '100%'（需父节点有确定高度）；开启后强制关闭动画。默认 undefined（不虚拟化）。
     */
    virtualize?: Virtualize;
    /**
     * 是否根据输入项筛选（对齐 Semi `filterTreeNode`）。传 `true` 用内置谓词（按 `treeNodeFilterProp`
     * 字段包含关键词，不区分大小写）；传函数 `(input, node) => boolean` 自定义命中逻辑。
     * 命中节点的祖先链自动展开。默认 false（不渲染搜索框、不过滤）。
     */
    filterTreeNode?: boolean | ((input: string, node: TreeNodeData) => boolean);
    /**
     * 内置搜索过滤匹配节点的哪个字段（对齐 Semi `treeNodeFilterProp`）。默认 `'label'`。
     * 仅在使用内置谓词（未传 filterTreeNode 函数）时生效；传自定义谓词时由该函数自行决定匹配逻辑。
     * 例如设 `'value'` 则按节点 value 字段匹配关键词。
     */
    treeNodeFilterProp?: string;
    /** 搜索框占位文案（对齐 Semi `searchPlaceholder`）。不传时用内置 i18n 文案。 */
    searchPlaceholder?: string;
    /**
     * 自定义搜索框渲染（对齐 Semi `searchRender`）。
     *  - 传 snippet：用它替换内置搜索框，snippet 收到 { value, placeholder, onChange, onClear, className, style }；
     *  - 传 `false`：隐藏内置搜索框（仍可经组件实例 `search()` 方法驱动过滤）。
     * 仅在搜索开启（filterTreeNode）时有意义。
     */
    searchRender?: false | Snippet<[SearchRenderContext]>;
    /** 搜索框内联样式（对齐 Semi `searchStyle`，透传到搜索框 input 的 style）。 */
    searchStyle?: string;
    /** 搜索框附加 class（对齐 Semi `searchClassName`，追加到搜索框 input 的 class）。 */
    searchClassName?: string;
    /**
     * 搜索框是否显示清除按钮（对齐 Semi `showClear`）。默认 true。
     * 有输入内容时在搜索框尾部显示清除按钮，点击清空搜索词。
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
     * 搜索关键词变化回调（对齐 Semi `onSearch`）。参数 (value, filteredExpandedKeys)：
     *  - value：当前搜索词；
     *  - filteredExpandedKeys：因搜索而展开的节点 key（命中节点的祖先链），配合展开受控使用。
     */
    onSearch?: (value: string, filteredExpandedKeys: string[]) => void;
    blockNode?: boolean;
    disabled?: boolean;
    emptyContent?: string;
    ariaLabel?: string;
    /** 根容器内联样式（对齐 Semi `style`）。可设 width/height/border 等；设 height 时列表区自动限高滚动。 */
    style?: string;
    /** 根元素自定义类名（对齐 Semi `className`；本库/Svelte 惯例用 `class`，叠加在内置 class 之后）。 */
    class?: string;
    /** 异步加载子节点：展开未加载的非叶子节点时调用，返回该节点的子节点数组 */
    loadData?: (node: TreeNodeData) => Promise<TreeNodeData[]>;
    /**
     * 受控已加载节点 key（对齐 Semi `loadedKeys`）。传入时以此为准判断哪些节点已加载，
     * 已在集合内的节点展开时不再触发 loadData。配合 loadData 使用；不传则由组件内部维护加载态。
     */
    loadedKeys?: TreeKey[];
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
    /** 节点右键菜单回调（对齐 Semi `onContextMenu`）。 */
    onContextMenu?: (e: MouseEvent, node: TreeNodeData) => void;
    /** 开始拖拽节点 */
    onDragStart?: (node: TreeNodeData) => void;
    /** 拖拽进入候选目标节点 */
    onDragEnter?: (info: { dragNode: TreeNodeData; dropNode: TreeNodeData }) => void;
    /** 拖拽悬停在候选目标节点上（对齐 Semi `onDragOver`）。 */
    onDragOver?: (info: { dragNode: TreeNodeData; dropNode: TreeNodeData }) => void;
    /** 拖拽离开候选目标节点（对齐 Semi `onDragLeave`）。 */
    onDragLeave?: (info: { dragNode: TreeNodeData; dropNode: TreeNodeData }) => void;
    /** 拖拽结束（无论是否成功放下，对齐 Semi `onDragEnd`）。 */
    onDragEnd?: (info: { dragNode: TreeNodeData }) => void;
    /**
     * 单个节点被选中时回调（对齐 Semi `onSelect`）。参数 (key, selected, node)：
     * 选中节点时触发，早于 onChange。key 为该节点 key，selected 为选中后状态。
     */
    onSelect?: (key: TreeKey, selected: boolean, node: TreeNodeData) => void;
    /**
     * 选中变更回调（对齐 Semi `onChange`）。参数 value：
     *  - 单选：选中节点的 key（或 onChangeWithObject 时的节点对象）；
     *  - 多选：选中节点 key 数组（含父子联动 / autoMergeValue / leafOnly 处理结果）。
     */
    onChange?: (value: TreeValue) => void;
    /**
     * 展开/收起回调（对齐 Semi `onExpand`）。参数 (expandedKeys, { expanded, node })：
     * expandedKeys 为变更后的全部展开 key，第二参含本次操作的展开态与节点。
     */
    onExpand?: (
      expandedKeys: TreeKey[],
      info: { expanded: boolean; node: TreeNodeData },
    ) => void;
    /** 自定义节点内容渲染（对齐 Semi `renderLabel`）；参数含节点、层级、当前搜索词、选中/勾选态。 */
    renderLabel?: Snippet<
      [{ node: TreeNodeData; level: number; searchValue: string; selected: boolean; checked: boolean }]
    >;
    /**
     * 完全接管整行渲染（对齐 Semi `renderFullLabel`）。传入后忽略内置的 switcher/checkbox/icon/label
     * 结构，由 snippet 用 FullLabelContext 自绘整行（含 class/expandIcon/checkStatus/回调）。
     * 用于「叶子分组勾选」「单选高亮子节点」等高级场景。虚拟化时须把 ctx.style 赋给渲染根节点。
     */
    renderFullLabel?: Snippet<[FullLabelContext]>;
    /** 自定义节点图标（对齐 Semi `icon`）；参数含节点、展开态与是否叶子。传入时渲染在 label 前。 */
    icon?: Snippet<[{ node: TreeNodeData; expanded: boolean; isLeaf: boolean }]>;
    /** 自定义展开/收起箭头；参数含节点、展开态与加载态 */
    expandIcon?: Snippet<[{ node: TreeNodeData; expanded: boolean; loading: boolean }]>;
    /** 节点尾部操作区（渲染在 label 右侧） */
    suffix?: Snippet<[{ node: TreeNodeData }]>;
    /** 自定义拖拽幽灵节点 */
    dragGhost?: Snippet<[{ node: TreeNodeData }]>;
  }

  let {
    treeData = [],
    treeDataSimpleJson,
    keyMaps,
    value,
    defaultValue = null,
    onChangeWithObject = false,
    multiple = false,
    checkRelation = 'related',
    disableStrictly = false,
    leafOnly = false,
    directory = false,
    motion = true,
    expandedKeys,
    defaultExpandedKeys = [],
    defaultExpandAll = false,
    expandAll = false,
    autoExpandParent = false,
    expandAction,
    autoMergeValue = true,
    labelEllipsis,
    preventScroll = false,
    showLine = false,
    virtualize,
    filterTreeNode,
    treeNodeFilterProp = 'label',
    searchPlaceholder,
    searchRender,
    searchStyle,
    searchClassName,
    showClear = true,
    showFilteredOnly = false,
    onSearch,
    blockNode = true,
    disabled = false,
    emptyContent,
    ariaLabel,
    style: rootStyle,
    class: rootClassName,
    loadData,
    loadedKeys: loadedKeysProp,
    onLoad,
    draggable = false,
    autoExpandWhenDragEnter = true,
    hideDraggingNode = false,
    renderDraggingNode,
    onDrop,
    onDoubleClick,
    onContextMenu,
    onDragStart,
    onDragEnter,
    onDragOver,
    onDragLeave,
    onDragEnd,
    onSelect,
    onChange,
    onExpand,
    renderLabel,
    renderFullLabel,
    icon,
    expandIcon,
    suffix,
    dragGhost,
  }: Props = $props();

  // directory 目录树：默认整行块 + 点击整行展开（expandAction 未显式指定时按 'click'）。
  const effBlockNode = $derived(blockNode || directory);
  const effExpandAction = $derived(expandAction ?? (directory ? 'click' : false));
  // 虚拟化：virtualize 对象存在即开启；行高取 itemSize，视口高取 height（数字 px，字符串走 CSS）。
  const virtualized = $derived(virtualize != null);
  const virtualItemSize = $derived(virtualize?.itemSize ?? 32);
  // motion：virtualize 时强制关闭动画（对齐 Semi）。
  const motionEnabled = $derived(motion && !virtualized);

  const loc = useLocale();

  const baseId = useId('cd-tree-item');

  function itemId(key: TreeKey): string {
    return `${baseId}-${String(key)}`;
  }

  // --- keyMaps 字段映射：把用户自定义字段名的数据派生为标准 {key,label,children} 结构 ---
  // 默认（全标准名）时直接返回原 treeData 引用，零额外开销（红线 #3）；映射为纯 $derived（红线 #2），
  // 不写回 treeData（红线 #1）。每个标准节点附带 __orig 指向用户原始节点，回调时回传原始数据。
  const keyField = $derived(keyMaps?.key ?? 'key');
  const labelField = $derived(keyMaps?.label ?? 'label');
  const childrenField = $derived(keyMaps?.children ?? 'children');
  const keyMapsDefault = $derived(
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
    keyMapsDefault ? sourceData : normalizeNodes(sourceData),
  );

  /** 回调回传：自定义 keyMaps 时回原始节点，否则回标准节点本身。 */
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
  // 受控 loadedKeys（对齐 Semi）：并入内部已加载集，判断加载态时两者取并。
  const controlledLoaded = $derived(new Set<TreeKey>(loadedKeysProp ?? []));
  function isLoaded(key: TreeKey): boolean {
    return loadedKeys.has(key) || controlledLoaded.has(key);
  }

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
    if (isLoaded(node.key)) return (loadedChildren.get(node.key)?.length ?? 0) > 0;
    return true;
  }

  async function loadChildren(node: TreeNodeData) {
    if (!loadData || loadingKeys.has(node.key) || isLoaded(node.key)) return;
    loadingKeys.add(node.key);
    try {
      // loadData 收到用户原始节点（自定义字段名形态），返回结果按 keyMaps 标准化后缓存。
      const kids = await loadData(toOrig(node));
      loadedChildren.set(node.key, keyMapsDefault ? kids : normalizeNodes(kids));
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
      if (Array.isArray(dv)) return dv.map(entryToKey).filter((k): k is TreeKey => k !== null);
      return dv === null || dv === undefined ? [] : ([entryToKey(dv)].filter((k): k is TreeKey => k !== null));
    }
    if (Array.isArray(dv)) return dv.length > 0 ? entryToKey(dv[0] as ValueEntry) : null;
    return dv === null ? null : entryToKey(dv);
  }
  const isValueControlled = $derived(value !== undefined);
  let innerValue = $state<TreeKey | TreeKey[] | null>(initValue());
  // 受控 value：onChangeWithObject 时为对象形态，统一归一为内部 key 集合。
  // 单选时集合含 0/1 个 key；多选时含全部选中 key（父子联动结果的 value 侧输入）。
  const valueSet = $derived.by(() => {
    const set = new Set<TreeKey>();
    const src: TreeKey | TreeKey[] | null = isValueControlled
      ? (() => {
          const v = value as ValueEntry | ValueEntry[] | null | undefined;
          if (v === undefined || v === null) return multiple ? [] : null;
          if (Array.isArray(v))
            return v.map(entryToKey).filter((k): k is TreeKey => k !== null);
          return entryToKey(v);
        })()
      : innerValue;
    if (Array.isArray(src)) for (const k of src) set.add(k);
    else if (src !== null) set.add(src);
    return set;
  });
  // 单选高亮集：仅单选模式使用（多选无「选中高亮」，靠 checkbox 表达）。
  const selectedSet = $derived(multiple ? new Set<TreeKey>() : valueSet);

  // --- check（多选，对齐 Semi：multiple 驱动勾选，值走 value 通道）---
  // 父子是否联动：checkRelation==='related'（默认）联动含半选；'unRelated' 解耦无联动无半选。
  const checkLinked = $derived(checkRelation !== 'unRelated');
  // 勾选态由 value（valueSet）派生：related 时用 conduct 归一（value 里的 key 视为已勾选，
  // 补齐 checked/halfChecked，disableStrictly 锁定禁用节点）；unRelated 时直接用 valueSet。
  const checkState = $derived.by(() => {
    if (!multiple) return { checked: new Set<TreeKey>(), half: new Set<TreeKey>() };
    if (!checkLinked) {
      return { checked: new Set(valueSet), half: new Set<TreeKey>() };
    }
    return conduct(mergedData, valueSet, disableStrictly);
  });

  // --- expand: 受控 expandedKeys 不回写 (红线 #1) ---
  function initExpanded(): Set<TreeKey> {
    // 需用标准化后的 key（keyMaps 自定义时 collectExpandable* 才能识别 children）。
    const rawSource =
      treeData.length > 0 || !treeDataSimpleJson
        ? treeData
        : simpleJsonToTree(treeDataSimpleJson);
    const base = keyMapsDefault ? rawSource : normalizeNodes(rawSource);
    if (defaultExpandAll || expandAll) {
      return new Set(collectExpandable(base));
    }
    const init = new Set<TreeKey>(defaultExpandedKeys);
    // autoExpandParent：初次挂载时把初始展开节点的祖先链一次性并入（对齐 Semi「初次挂载为 true」）。
    // 仅初始化做一次，此后交互不再强制（否则父节点收不起）。受控 expandedKeys 由外部自行含父节点。
    if (autoExpandParent && init.size > 0) {
      for (const k of [...init]) collectAncestorsInto(base, k, init);
    }
    return init;
  }
  // 收集 targetKey 的祖先链并入 acc（DFS）。纯函数辅助，供 autoExpandParent 初始化用。
  function collectAncestorsInto(data: TreeNodeData[], targetKey: TreeKey, acc: Set<TreeKey>): boolean {
    for (const node of data) {
      if (node.key === targetKey) return true;
      if (node.children && collectAncestorsInto(node.children, targetKey, acc)) {
        acc.add(node.key);
        return true;
      }
    }
    return false;
  }
  const isExpandControlled = $derived(expandedKeys !== undefined);
  let innerExpanded = $state<Set<TreeKey>>(initExpanded());
  // expandAll（对齐 Semi）：数据（mergedData）变化时，非受控展开集重新展开全部——区别于
  // defaultExpandAll 仅初始化生效。仅在 expandAll 且非受控时挂载此 effect（红线 #3 无副作用泄漏）。
  $effect(() => {
    if (!expandAll || isExpandControlled) return;
    // 读取 mergedData 建立依赖：数据变化即重算全展开集。
    innerExpanded = new Set(collectExpandable(mergedData));
  });
  const baseExpandedSet = $derived(
    isExpandControlled ? new Set(expandedKeys ?? []) : innerExpanded,
  );
  // autoExpandParent（对齐 Semi：默认 false，「初次挂载时为 true」——仅初始化阶段把展开节点的
  // 祖先链一次性并入展开集，使其可见；此后用户交互（收起父节点）以实际展开集为准，不再强制把
  // 祖先加回，否则父节点将「收不起来」。实现：并祖先只在 initExpanded 里做一次；currentExpandedSet
  // 直接用 baseExpandedSet（受控 expandedKeys 或非受控 innerExpanded），不再持续派生强制。
  const currentExpandedSet = $derived(baseExpandedSet);

  // --- 搜索（对齐 Semi）：内部非受控 state，input 事件更新 innerSearchValue 并触发 onSearch。---
  let innerSearchValue = $state('');
  const searchValue = $derived(innerSearchValue);
  const trimmedSearch = $derived(searchValue.trim());
  // 搜索框是否渲染/启用：filterTreeNode 为 true 或自定义谓词函数即开启（对齐 Semi）。
  const searchEnabled = $derived(filterTreeNode === true || typeof filterTreeNode === 'function');
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
      // 回传原始节点（keyMaps 自定义时），与其它回调一致。
      return (node: TreeNodeData) => fn(trimmedSearch, toOrig(node));
    }
    const lower = trimmedSearch.toLowerCase();
    return (node: TreeNodeData) => nodeFilterText(node).toLowerCase().includes(lower);
  });
  const filterResult = $derived.by(() => {
    if (!searchActive) return { matched: new Set<TreeKey>(), expand: new Set<TreeKey>() };
    return computeFilteredKeys(mergedData, matchPredicate);
  });

  // 供 searchRender 自定义搜索框的 onChange 回调（直接接受值）。
  function handleSearchValue(val: string) {
    search(val);
  }

  // 清除搜索：清空内部 state 并回调 onSearch('')。
  function clearSearch() {
    innerSearchValue = '';
    onSearch?.('', []);
  }

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

  /**
   * 命令式触发搜索（对齐 Semi `search` 方法）。写入内部搜索词并触发过滤/回调。
   * 常配合 searchRender={false}（隐藏内置搜索框）使用，由外部输入框驱动。
   * onSearch 第二参回传 filteredExpandedKeys（因搜索而展开的祖先链 key，对齐 Semi）。
   */
  export function search(value: string): void {
    innerSearchValue = value;
    if (onSearch) {
      const trimmed = value.trim();
      let expandKeys: string[] = [];
      if (trimmed.length > 0 && searchEnabled) {
        let pred: (node: TreeNodeData) => boolean;
        if (typeof filterTreeNode === 'function') {
          const fn = filterTreeNode;
          pred = (n: TreeNodeData) => fn(trimmed, toOrig(n));
        } else {
          const lower = trimmed.toLowerCase();
          pred = (n: TreeNodeData) => nodeFilterText(n).toLowerCase().includes(lower);
        }
        // filteredExpandedKeys：命中节点的祖先链（computeFilteredKeys 的 expand 集），供展开受控回写。
        expandKeys = [...computeFilteredKeys(mergedData, pred).expand].map(String);
      }
      onSearch(value, expandKeys);
    }
  }
  // 仅由命令式 scroll 回调写入的本地 scrollTop，render 期只读。
  let scrollTop = $state(0);
  // rAF 节流句柄（非响应式）。
  let rafId = 0;

  // labelEllipsis：未显式传时默认跟随虚拟化（虚拟化下默认省略，对齐 Semi）。
  const ellipsis = $derived(labelEllipsis ?? virtualized);

  // 虚拟化视口高度（数字 px 用于几何计算；字符串 '100%' 走 CSS，几何回退 320）。
  const virtualHeightCss = $derived<string>(
    typeof virtualize?.height === 'number'
      ? `${virtualize.height}px`
      : (virtualize?.height as string | undefined) ?? '100%',
  );
  const virtualHeightPx = $derived(typeof virtualize?.height === 'number' ? virtualize.height : 320);
  const rowHeight = $derived(virtualItemSize > 0 ? virtualItemSize : 32);
  const totalHeight = $derived(visibleFlat.length * rowHeight);
  // 可视区间：纯 $derived，仅依赖本地 $state，render-safe（不读 DOM）（红线 #2）。
  const vRange = $derived(
    virtualized
      ? fixedRange(scrollTop, virtualHeightPx, rowHeight, visibleFlat.length, VIRTUAL_OVERSCAN)
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

  /**
   * 命令式滚动到指定节点（对齐 Semi `scrollTo` 方法）。仅虚拟化 Tree 生效，
   * 目标须为当前已展开（可见）节点。align 决定对齐位置，默认 'center'。
   */
  export function scrollTo(opts: {
    key: TreeKey;
    align?: 'center' | 'start' | 'end' | 'smart' | 'auto';
  }): void {
    const el = viewportEl;
    if (!el || !virtualized) return;
    const index = visibleFlat.findIndex((f) => f.node.key === opts.key);
    if (index < 0) return;
    const align = opts.align ?? 'center';
    const itemStart = index * rowHeight;
    if (align === 'center') {
      const target = itemStart - (el.clientHeight - rowHeight) / 2;
      const clamped = Math.max(0, Math.min(target, totalHeight - el.clientHeight));
      el.scrollTop = clamped;
      scrollTop = clamped;
      return;
    }
    if (align === 'auto' || align === 'smart') {
      scrollIndexIntoView(index);
      return;
    }
    // start / end：复用 core scrollOffsetForIndex。
    const target = scrollOffsetForIndex(itemStart, rowHeight, el.clientHeight, totalHeight, align);
    el.scrollTop = target;
    scrollTop = target;
  }

  function isNodeDisabled(node: TreeNodeData): boolean {
    return disabled || !!node.disabled;
  }

  // 单选：非多选模式下、未禁用的节点可点击选中。
  function isSelectable(node: TreeNodeData): boolean {
    return !multiple && !isNodeDisabled(node);
  }

  // 多选勾选：多选模式下、未禁用的节点可勾选。
  function isCheckableNode(node: TreeNodeData): boolean {
    return multiple && !isNodeDisabled(node);
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
        const isLeaf = !n.children || n.children.length === 0;
        // 仅当自身被选中且无已选中祖先时保留（顶层完全选中节点）。
        if (selfChecked && !ancestorChecked) out.push(n.key);
        // disableStrictly 下，被选中的 disabled 叶子必须显式保留——即便其父级已完全选中：
        // 受控回填时父级 key 经 conduct 无法把 disabled 叶子重新联动勾上（disabled 不受父级联动），
        // 若被合并剔除就会丢失该叶子的勾选态（对齐 Semi disableStrictly 语义）。
        else if (
          disableStrictly &&
          selfChecked &&
          ancestorChecked &&
          isLeaf &&
          !!n.disabled
        ) {
          out.push(n.key);
        }
        if (n.children && n.children.length > 0) {
          walk(n.children, ancestorChecked || selfChecked);
        }
      }
    };
    walk(data, false);
    return out;
  }

  // --- 状态写入：仅非受控写 inner，受控只回调 (红线 #1) ---
  // 把内部选中 key 集转成 onChange/受控所需的 value 输出形态（多选数组 / 单选标量；
  // onChangeWithObject 时元素转节点对象）。
  function toChangeValue(keys: TreeKey[], singleKey: TreeKey | null): TreeValue {
    if (multiple) return keys.map(keyToOutput) as Array<TreeKey | TreeNodeData>;
    return singleKey === null ? ('' as TreeKey) : keyToOutput(singleKey);
  }

  // 单选：点击整行选中该节点（对齐 Semi 单选，值为单个 key）。
  function emitSelect(node: TreeNodeData) {
    if (!isSelectable(node)) return;
    const nextKey = node.key;
    if (!isValueControlled) innerValue = nextKey;
    // onSelect（对齐 Semi）：早于 onChange，回传 (key, selected, node)。单选点击恒为选中。
    onSelect?.(node.key, true, toOrig(node));
    onChange?.(toChangeValue([nextKey], nextKey));
  }

  // 多选：勾选/取消勾选该节点，父子联动，值走 value 通道（对齐 Semi multiple + onChange）。
  function emitCheck(node: TreeNodeData) {
    if (!isCheckableNode(node)) return;
    // 以当前 checkState.checked 作为勾选基集切换（valueSet 经 conduct 归一后的完整勾选集）。
    let nextChecked: Set<TreeKey>;
    if (!checkLinked) {
      // 解耦（unRelated）：仅翻转该节点自身，不触达父子。
      nextChecked = new Set(checkState.checked);
      if (nextChecked.has(node.key)) nextChecked.delete(node.key);
      else nextChecked.add(node.key);
    } else {
      nextChecked = toggleCheck(mergedData, checkState.checked, node.key, disableStrictly);
    }
    const resolved = !checkLinked
      ? { checked: new Set(nextChecked), half: new Set<TreeKey>() }
      : conduct(mergedData, nextChecked, disableStrictly);
    // 是否勾选后为选中态（供 onSelect 语义）。
    const selected = resolved.checked.has(node.key);
    // 输出优先级：leafOnly（只留叶子）> autoMergeValue（合并父子、剔除已选祖先的后代）> 全量。
    let checkedOut: TreeKey[];
    if (leafOnly) {
      checkedOut = collectLeafKeys(mergedData, resolved.checked);
    } else if (autoMergeValue && checkLinked) {
      checkedOut = mergeCheckedKeys(mergedData, resolved.checked);
    } else {
      checkedOut = [...resolved.checked];
    }
    if (!isValueControlled) innerValue = checkedOut;
    // onSelect（对齐 Semi）：早于 onChange，回传 (key, selected, node)。
    onSelect?.(node.key, selected, toOrig(node));
    onChange?.(toChangeValue(checkedOut, null));
  }

  function emitExpand(node: TreeNodeData, expand: boolean) {
    let next: Set<TreeKey>;
    if (expand) {
      next = new Set(currentExpandedSet).add(node.key);
    } else {
      // autoExpandParent（对齐 Semi）：收起某节点时，若其仍有展开中的子孙，则阻止收起——
      // 需先收起所有子节点才能收起父节点。无展开子孙时正常收起。
      if (autoExpandParent && hasExpandedDescendant(node, currentExpandedSet)) {
        return;
      }
      next = new Set(currentExpandedSet);
      next.delete(node.key);
    }
    if (!isExpandControlled) innerExpanded = next;
    onExpand?.([...next], { expanded: expand, node: toOrig(node) });
  }

  // 节点是否有仍在展开集中的子孙（供 autoExpandParent 判断「父节点能否收起」）。
  function hasExpandedDescendant(node: TreeNodeData, expandedSet: ReadonlySet<TreeKey>): boolean {
    if (!node.children) return false;
    for (const child of node.children) {
      if (expandedSet.has(child.key)) return true;
      if (hasExpandedDescendant(child, expandedSet)) return true;
    }
    return false;
  }

  function toggleExpand(node: TreeNodeData) {
    const hasOwnKids = (node.children?.length ?? 0) > 0;
    if (!isExpandable(node, hasOwnKids)) return;
    const willExpand = !isExpanded(node.key);
    // 展开未加载的异步节点：先取数据再展开（数据到位后合并树派生即显示子节点）
    if (willExpand && !hasOwnKids && loadData && !isLoaded(node.key)) {
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
      if (effExpandAction === 'click' && expandable) toggleExpand(node);
    } else if (expandable) {
      // 不可选中的可展开节点：默认点击即展开（沿用原行为），expandAction='click' 语义一致，不重复触发。
      toggleExpand(node);
    }
  }

  // 节点双击：先回调 onDoubleClick；expandAction='doubleClick' 时再触发展开/收起。
  function onRowDblClick(e: MouseEvent, node: TreeNodeData) {
    if (isNodeDisabled(node)) return;
    onDoubleClick?.(e, toOrig(node));
    if (effExpandAction === 'doubleClick' && isExpandable(node, (node.children?.length ?? 0) > 0)) {
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
      if (!hasOwnKids && loadData && !isLoaded(sib.node.key)) {
        void loadChildren(sib.node);
      }
      next.add(sib.node.key);
      lastNode = sib.node;
      changed = true;
    }
    if (!changed || lastNode === null) return;
    if (!isExpandControlled) innerExpanded = next;
    // 一次性回调（node 取最后展开者，expanded=true）；受控时不回写（红线 #1）。
    onExpand?.([...next], { expanded: true, node: toOrig(lastNode) });
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
    // onDragOver（对齐 Semi）：每次悬停在候选目标上回传。
    if (onDragOver) {
      const dragNode = findFlatNode(dragKey);
      if (dragNode) onDragOver({ dragNode: toOrig(dragNode), dropNode: toOrig(node) });
    }
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
    // onDragLeave（对齐 Semi）：真正离开该行时回传。
    if (onDragLeave && dragKey !== null) {
      const dragNode = findFlatNode(dragKey);
      if (dragNode) onDragLeave({ dragNode: toOrig(dragNode), dropNode: toOrig(node) });
    }
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
    // onDragEnd（对齐 Semi）：拖拽结束无论是否成功放下都回传被拖节点。
    if (onDragEnd && dragKey !== null) {
      const dragNode = findFlatNode(dragKey);
      if (dragNode) onDragEnd({ dragNode: toOrig(dragNode) });
    }
    resetDrag();
  }

  function findFlatNode(key: TreeKey): TreeNodeData | undefined {
    const f = flat.find((x) => x.node.key === key);
    return f?.node;
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
      disabled && 'cd-tree--disabled',
      showLine && 'cd-tree--line',
      effBlockNode && 'cd-tree--block',
      directory && 'cd-tree--directory',
      motionEnabled && 'cd-tree--motion',
      rootClassName,
    ]
      .filter(Boolean)
      .join(' '),
  );

  // renderFullLabel 上下文构造：把内置计算好的状态与行为回调封装给使用者 snippet。
  // className 汇总内置状态类（缩进由 padding 处理，此处给状态类），供自定义渲染沿用内置样式。
  function fullLabelClass(f: FlatNode, selected: boolean, nodeDisabled: boolean, active: boolean): string {
    return [
      'cd-tree__node',
      `cd-tree__node--fulllabel`,
      `cd-tree__node--level-${f.level + 1}`,
      selected && 'cd-tree__node--selected',
      nodeDisabled && 'cd-tree__node--disabled',
      active && 'cd-tree__node--active',
    ]
      .filter(Boolean)
      .join(' ');
  }
</script>

<div class={cls} style={rootStyle}>
  {#if searchEnabled && searchRender !== false}
    {@const placeholder = searchPlaceholder ?? loc().t('Tree.searchPlaceholder')}
    <!-- 搜索框容器（对齐 Semi tree-search-wrapper：paddingY 8 / paddingX 12） -->
    <div
      class={['cd-tree__search', searchClassName].filter(Boolean).join(' ')}
      style={searchStyle}
    >
      {#if searchRender}
        <!-- 自定义搜索框（对齐 Semi searchRender）：透传 inputProps，使用者可原样传给 Input。 -->
        {@render searchRender({
          value: searchValue,
          placeholder,
          onChange: handleSearchValue,
          onClear: clearSearch,
          showClear,
          className: searchClassName,
          style: searchStyle,
          disabled,
        })}
      {:else}
        <!-- 内置搜索框复用库内 Input：IconSearch 前缀 + clearable（对齐 Semi 用 Input + showClear）。 -->
        <Input
          value={searchValue}
          {placeholder}
          ariaLabel={placeholder}
          {disabled}
          {showClear}
          onInput={handleSearchValue}
          onClear={clearSearch}
        >
          {#snippet prefix()}
            <IconSearch />
          {/snippet}
        </Input>
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
      aria-multiselectable={multiple}
      aria-activedescendant={activeDescId}
      aria-disabled={disabled || undefined}
      tabindex={disabled ? -1 : 0}
      bind:this={viewportEl}
      style={`block-size:${virtualHeightCss}; overflow:auto`}
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
      aria-multiselectable={multiple}
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

{#snippet fullLabelSwitcher(s: { expanded: boolean; loading: boolean })}
  {#if s.loading}
    <span class="cd-tree__switcher cd-tree__switcher--loading" aria-hidden="true">
      <Spin size="small" />
    </span>
  {:else}
    <span class="cd-tree__switcher" class:cd-tree__switcher--open={s.expanded} aria-hidden="true">
      <IconTreeTriangleDown size="small" />
    </span>
  {/if}
{/snippet}

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
  {@const indentStyle = showLine ? '' : `padding-inline-start: calc(var(--cd-spacing-tree-option-level1-padding-left) + ${f.level} * var(--cd-spacing-tree-option-level-padding-left))`}
  {#if renderFullLabel}
    <!-- renderFullLabel：整行完全由使用者接管（对齐 Semi）。提供内置状态类/图标/回调，
         使用者自绘结构；虚拟化时须把 ctx.style 赋给渲染根节点。 -->
    {@render renderFullLabel({
      data: toOrig(node),
      level: f.level,
      style: [posStyle, indentStyle].filter(Boolean).join('; ') || undefined,
      className: fullLabelClass(f, selected, nodeDisabled, active),
      expandIcon: fullLabelSwitcher,
      isLeaf: !expandable,
      checkStatus: { checked, halfChecked: rowHalf(node) },
      expandStatus: { expanded, loading },
      filtered: searchActive && filterResult.matched.has(node.key),
      searchWord: trimmedSearch,
      onClick: () => onRowClick(node),
      onCheck: () => emitCheck(node),
      onExpand: () => toggleExpand(node),
      onContextMenu: (e: MouseEvent) => { e.preventDefault(); onContextMenu?.(e, toOrig(node)); },
      onDoubleClick: (e: MouseEvent) => onRowDblClick(e, node),
    })}
  {:else}
        <!-- treeitem 焦点经容器 aria-activedescendant 漫游管理，行本身 tabindex=-1，键盘统一在 role=tree 容器处理 -->
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <div
          id={itemId(node.key)}
          class="cd-tree__node"
          class:cd-tree__node--selected={selected}
          class:cd-tree__node--disabled={nodeDisabled}
          class:cd-tree__node--active={active}
          class:cd-tree__node--block={effBlockNode}
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
          aria-selected={!multiple ? selected : undefined}
          aria-checked={multiple ? ariaCheckedValue(node) : undefined}
          aria-disabled={nodeDisabled || undefined}
          style={[posStyle, indentStyle].filter(Boolean).join('; ') || undefined}
          onclick={() => onRowClick(node)}
          ondblclick={onDoubleClick || effExpandAction === 'doubleClick'
            ? (e) => onRowDblClick(e, node)
            : undefined}
          oncontextmenu={onContextMenu ? (e) => { e.preventDefault(); onContextMenu(e, toOrig(node)); } : undefined}
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
            {#if expandIcon}
              {@render expandIcon({ node, expanded: false, loading: true })}
            {:else}
              <!-- 加载态复用 Spin 组件（对齐 Semi Tree 内部用 Spin） -->
              <span class="cd-tree__switcher cd-tree__switcher--loading" aria-hidden="true">
                <Spin size="small" />
              </span>
            {/if}
          {:else if expandable}
            {#if expandIcon}
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
                {@render expandIcon({ node, expanded, loading: false })}
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
                <IconTreeTriangleDown size="small" />
              </span>
            {/if}
          {:else}
            {#if expandIcon}
              {@render expandIcon({ node, expanded: false, loading: false })}
            {:else}
              <span class="cd-tree__switcher cd-tree__switcher--leaf" aria-hidden="true"></span>
            {/if}
          {/if}

          {#if multiple}
            <!-- 勾选框复用 Checkbox 组件（对齐 Semi Tree 内部用 Checkbox）。
                 交互由 Checkbox 自身的 onChange 触发 emitCheck（不要在外层容器加 onclick——
                 Checkbox 内部是 label+input，点 label 会双触发 click，导致 toggle 抵消）。
                 外层 span 仅阻止点击冒泡到行（避免额外触发行选中/展开）。 -->
            <!-- span 仅拦截冒泡、非交互元素（交互由内部 Checkbox 承载），故忽略静态元素交互告警 -->
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <span
              class="cd-tree__checkbox"
              onclick={(e) => e.stopPropagation()}
            >
              <Checkbox
                checked={checked}
                indeterminate={!checked && rowHalf(node)}
                disabled={!isCheckableNode(node)}
                ariaLabel={node.label}
                onChange={() => emitCheck(node)}
              />
            </span>
          {/if}

          {#if icon || directory}
            {@const isLeaf = !expandable}
            <span class="cd-tree__icon" class:cd-tree__icon--directory={directory && !icon} aria-hidden="true">
              {#if icon}
                {@render icon({ node, expanded, isLeaf })}
              {:else if directory}
                <!-- directory 模式内置目录/文件图标（对齐 Semi IconFolder/IconFolderOpen/IconFile）；可用 icon snippet 覆盖 -->
                {#if isLeaf}
                  <IconFile />
                {:else if expanded}
                  <IconFolderOpen />
                {:else}
                  <IconFolder />
                {/if}
              {/if}
            </span>
          {/if}

          <span class="cd-tree__label" class:cd-tree__label--ellipsis={ellipsis}>
            {#if renderLabel}
              {@render renderLabel({ node, level: f.level, searchValue: trimmedSearch, selected, checked })}
            {:else if searchActive}
              <!-- 搜索命中高亮复用 Highlight 组件（对齐 Semi Tree 内部用 Highlight） -->
              <Highlight
                sourceString={node.label}
                searchWords={trimmedSearch}
                highlightClassName="cd-tree__highlight"
              />
            {:else}{node.label}{/if}
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
  {/if}
{/snippet}

<style>
  .cd-tree {
    --cd-tree-row-height: var(--cd-tree-node-height);
    display: flex;
    flex-direction: column;
    gap: var(--cd-spacing-extra-tight);
    color: var(--cd-color-tree-option-text-default);
    font-size: var(--cd-tree-node-font-size);
    box-sizing: border-box;
    /* 通过 style prop 设 height 时生效：容器不溢出，由列表区自身滚动 */
    overflow: hidden;
  }
  .cd-tree--small {
    --cd-tree-row-height: var(--cd-tree-node-height-small);
  }
  .cd-tree--large {
    --cd-tree-row-height: var(--cd-tree-node-height-large);
  }
  .cd-tree--disabled {
    color: var(--cd-color-tree-option-disabled-text-default);
  }

  /* 搜索框容器：对齐 Semi tree-search-wrapper（paddingY 8 / paddingX 12）。
     内部搜索框复用 Input 组件，边框/清除/聚焦样式由 Input 自带（无需 Tree 再写）。 */
  .cd-tree__search {
    padding: var(--cd-spacing-tree-search-wrapper-padding-y)
      var(--cd-spacing-tree-search-wrapper-padding-x);
  }

  .cd-tree__list {
    display: flex;
    flex-direction: column;
    outline: none;
    /* 对齐 Semi tree-option-list（paddingY 8 / paddingX 0；flex:1 占满剩余高度，超出滚动） */
    padding: var(--cd-spacing-tree-option-list-padding-y) var(--cd-spacing-tree-option-list-padding-x);
    flex: 1 1 auto;
    min-block-size: 0;
    overflow-y: auto;
    overflow-x: hidden;
  }
  .cd-tree__list:focus-visible {
    box-shadow: 0 0 0 2px var(--cd-tree-focus-ring);
    border-radius: var(--cd-radius-tree-checkbox-addon);
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
    /* 首层左内边距 + 行右内边距（对齐 Semi $spacing-tree_option_level1-paddingLeft 8px） */
    padding-inline: var(--cd-spacing-tree-option-level1-padding-left);
    border-radius: var(--cd-radius-tree-checkbox-addon);
    cursor: pointer;
    transition: background-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-tree__node:hover {
    background: var(--cd-color-tree-option-bg-hover);
  }
  /* 按下态（对齐 Semi $color-tree_option_selected-bg-default = fill-1） */
  .cd-tree__node:active {
    background: var(--cd-color-tree-option-selected-bg-default);
  }
  .cd-tree__node--selected {
    color: var(--cd-color-tree-option-text-default);
    background: var(--cd-color-tree-option-bg-active);
  }
  .cd-tree__node--selected:hover,
  .cd-tree__node--selected:active {
    background: var(--cd-color-tree-option-bg-active);
  }
  /* 键盘 roving 焦点（当前项）：对齐 Semi 无 border，仅用背景区分；焦点可见性靠背景差异。 */
  .cd-tree__node--active:not(.cd-tree__node--selected) {
    background: var(--cd-color-tree-option-bg-hover);
  }
  /* 键盘操作时（容器 focus-visible 内）给当前项一个可见焦点环，鼠标交互不显示 border。 */
  .cd-tree__list:focus-visible .cd-tree__node--active {
    outline: 2px solid var(--cd-tree-focus-ring);
    outline-offset: -2px;
  }
  .cd-tree__node--disabled {
    color: var(--cd-color-tree-option-disabled-text-default);
    cursor: not-allowed;
  }
  .cd-tree__node--disabled:hover {
    background: transparent;
  }

  /* --- 拖拽排序：被拖节点半透明 + 插入指示线 / 内部高亮 --- */
  /* 可拖拽行的内边距（对齐 Semi $spacing-tree_option_draggable-paddingY 2 / paddingX 0） */
  .cd-tree__node[draggable='true'] {
    padding-block: var(--cd-spacing-tree-option-draggable-padding-y);
    padding-inline-end: calc(
      var(--cd-spacing-tree-option-level1-padding-left) +
        var(--cd-spacing-tree-option-draggable-padding-x)
    );
  }
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
    background: var(--cd-color-tree-option-bg-hover);
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
    inline-size: var(--cd-spacing-tree-option-level-padding-left);
    align-self: stretch;
  }
  /* 贯穿竖线（祖先非末层） */
  .cd-tree__line--through::before {
    content: '';
    position: absolute;
    inset-block: 0;
    inset-inline-start: 50%;
    inline-size: var(--cd-width-tree-option-line);
    background: var(--cd-color-tree-option-line);
  }
  /* ├ 形：竖线贯穿 + 横线到右 */
  .cd-tree__line--tee::before {
    content: '';
    position: absolute;
    inset-block: 0;
    inset-inline-start: 50%;
    inline-size: var(--cd-width-tree-option-line);
    background: var(--cd-color-tree-option-line);
  }
  /* └ 形：竖线 top→中 + 横线到右 */
  .cd-tree__line--elbow::before {
    content: '';
    position: absolute;
    inset-block-start: 0;
    block-size: 50%;
    inset-inline-start: 50%;
    inline-size: var(--cd-width-tree-option-line);
    background: var(--cd-color-tree-option-line);
  }
  .cd-tree__line--tee::after,
  .cd-tree__line--elbow::after {
    content: '';
    position: absolute;
    inset-block-start: 50%;
    inset-inline-start: 50%;
    inset-inline-end: 0;
    block-size: var(--cd-width-tree-option-line);
    background: var(--cd-color-tree-option-line);
  }

  .cd-tree__switcher {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    /* 对齐 Semi $width-tree_emptyIcon（展开图标宽 12）+ marginRight 8 */
    inline-size: var(--cd-width-tree-empty-icon);
    block-size: var(--cd-width-tree-empty-icon);
    margin-inline-end: var(--cd-spacing-tree-icon-margin-right);
    color: var(--cd-color-tree-option-icon-default);
    cursor: pointer;
    transition: transform var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
    /* IconTreeTriangleDown 默认朝下（=展开态外观，对齐 Semi）；收起态旋转 -90deg 指向右侧。 */
    transform: rotate(-90deg);
  }
  .cd-tree__switcher:hover {
    color: var(--cd-color-tree-option-icon-hover);
  }
  .cd-tree__switcher:active {
    color: var(--cd-color-tree-option-icon-active);
  }
  .cd-tree__switcher--open {
    transform: rotate(0deg);
  }
  .cd-tree__switcher--leaf {
    cursor: default;
    transform: none;
  }
  .cd-tree__switcher--loading {
    cursor: default;
    transform: none;
    /* 加载 spin 尺寸对齐 Semi $width-tree_spinIcon（12） */
    inline-size: var(--cd-width-tree-spin-icon);
    block-size: var(--cd-width-tree-spin-icon);
  }

  /* 勾选框：框体样式由 Checkbox 组件自带，此处仅负责在行内的定位与右间距（对齐 Semi label withIcon marginRight 8） */
  .cd-tree__checkbox {
    display: inline-flex;
    align-items: center;
    flex: 0 0 auto;
    margin-inline-end: var(--cd-spacing-tree-label-with-icon-margin-right);
  }

  .cd-tree__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    inline-size: 0;
    block-size: var(--cd-width-tree-empty-icon);
    color: var(--cd-color-tree-option-icon-default);
  }
  /* 有自定义图标内容时撑开尺寸 + 右间距（对齐 Semi label withIcon marginRight 8） */
  .cd-tree__icon:not(:empty) {
    inline-size: var(--cd-width-tree-empty-icon);
    margin-inline-end: var(--cd-spacing-tree-label-with-icon-margin-right);
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

  /* 搜索命中高亮：class 注入到 Highlight 子组件内部的 mark，需 :global 穿透 scoped CSS。
     对齐 Semi：primary 文字 + bold + 无独立背景（inherit）。 */
  .cd-tree__label :global(.cd-tree__highlight) {
    padding: 0;
    color: var(--cd-color-tree-option-highlight-text);
    background: inherit;
    font-weight: var(--cd-font-tree-option-highlight-weight);
  }

  .cd-tree__empty {
    padding: var(--cd-spacing-base-tight);
    color: var(--cd-color-tree-option-disabled-text-default);
    text-align: center;
  }

  /* motion 开关（对齐 Semi motion）：仅 cd-tree--motion 时启用 switcher 旋转过渡。 */
  .cd-tree:not(.cd-tree--motion) .cd-tree__switcher {
    transition: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .cd-tree__node,
    .cd-tree__switcher {
      transition: none;
    }
  }
</style>
