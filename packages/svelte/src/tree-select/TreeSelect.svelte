<!--
  TreeSelect — 严格对齐 Semi Design treeSelect。
  基础子集: 单选、可展开/收起的单面板树、叶子或任意节点选中 (leafOnly 控制)。
  multiple: checkbox 多选 + 父子联动 (复用 core conduct/toggleCheck)，trigger 多 tag 回显可单独移除。
  filterTreeNode：面板顶部搜索框过滤节点（复用 core computeFilteredKeys），命中 + 祖先链可见、命中文本高亮。
  Token-driven, a11y-correct, 受控/非受控。
  keyMaps：自定义节点字段名（key/label/value/children）映射任意后端数据；派生只读标准化，默认字段名时零开销。
  loadData：展开未加载的非叶子节点时异步取子节点，结果缓存进本地 SvelteMap 并派生合并树喂给
  所有 core 函数（不写回受控 treeData，红线 #1）；加载中显示 spinner，竞态由 loadedKeys/loadingKeys 去重。
  virtualize（对象形式，对齐 Semi）：大数据树虚拟滚动。复用 Tree 范式——直接用 core fixedRange 纯函数
  自建轻量 fixed 定高虚拟化（非复用 VirtualList 组件，其 role=list/listitem 会破坏 role=tree→treeitem
  语义），保持 role=tree 容器 + 行 role=treeitem 不变；只渲染视口内切片（flattenVisible 派生扁平节点 +
  区间纯派生，红线 #2）。滚动监听命令式 + rAF 节流 + cleanup（红线 #3）。

  架构对齐说明（第二阶段：严格对齐 Semi treeSelect/index.tsx + treeContext.tsx）：
  Semi TreeSelect 并非整体嵌入 <Tree> 组件，而是复用 Tree 拆分出的内部构件
  （TreeContext / TreeNode / NodeList / treeUtil）自行组装一套"迷你渲染层"。
  面板内节点 DOM 类名前缀仍是 tree（非 tree-select），因为渲染出来的就是 Tree 自己的组件。
  本库同构：面板节点复用 ../tree/treeNode.svelte（TreeNodeRow）+ ../tree/nodeList.svelte（NodeList）
  + ../tree/treeContext.js（setTreeContext），渲染出 .cd-tree-option 结构（非自建 .cd-tree-select-node）。
  这些是 Tree 的内部实现细节（相对路径 import，不导出为公开 API），对齐 Semi `import TreeNode from
  '../tree/treeNode'` 的做法。renderLabel/renderFullLabel 签名统一为 Tree.svelte 的签名——Semi 的
  treeNode.tsx 是 Tree/TreeSelect 共用同一份组件，`renderLabel(label, data, keyword)` 调用点唯一，
  两侧签名本就相同。无拖拽（Semi TreeSelect 无 draggable 等 prop）、无 directory 模式。

  值通道（对齐 Semi getValueOrKey）：内部选中态（innerValue/innerChecked/activeKey 等）恒存 key；
  对外 onChange 抛出值、受控 value/defaultValue 归一、单选展示 label、triggerRender 收到的 value，
  统一经 keyToOutput/entryToKey 转换（value 字段优先，缺省回退 key），与 Tree.svelte 同构。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { tick } from 'svelte';
  import {
    useId,
    useDismiss,
    registerOverlayRoot,
    conduct,
    toggleCheck,
    computeFilteredKeys,
    collectCheckedByStrategy,
    flattenVisible,
    fixedRange,
    scrollOffsetForIndex,
    rovingKeyFromEvent,
    findNode,
    collectExpandable,
    getMotionKeys,
    getValueOrKey,
    buildValueKeyIndex,
    type TreeNodeData,
    type FlatNode,
    type TreeKey,
    type CheckedStrategy,
  } from '@chenzy-design/core';
  import { SvelteMap, SvelteSet } from 'svelte/reactivity';
  import { IconSearch, IconClear, IconChevronDown } from '@chenzy-design/icons';
  import { useLocale } from '../locale-provider/index.js';
  import { getGlobalPopupContainer } from '../config-provider/index.js';
  import { floating } from '../_floating/use-floating.js';
  import type { Placement } from '@chenzy-design/core';
  import Tag from '../tag/Tag.svelte';
  import Popover from '../popover/Popover.svelte';
  import type { TreeNode } from './types.js';
  import { getInputGroupContext } from '../input/context.js';
  import { setTreeContext, type FullLabelContext } from '../tree/treeContext.js';
  import TreeNodeRow from '../tree/treeNode.svelte';
  import NodeList from '../tree/nodeList.svelte';

  type Size = 'small' | 'default' | 'large';
  type Status = 'default' | 'warning' | 'error';

  /** 值通道类型（对齐 Semi getValueOrKey）：单选为标量或节点对象，多选为其数组。 */
  type ValueEntry = TreeKey | TreeNode;
  type TreeSelectValue = TreeKey | TreeNode | Array<TreeKey | TreeNode>;

  interface Props {
    value?: TreeSelectValue | null;
    defaultValue?: TreeSelectValue | null;
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
    /**
     * 是否按输入筛选节点（对齐 Semi filterTreeNode）：
     * true 开启搜索框，默认对 treeNodeFilterProp（默认 'label'）做大小写不敏感包含匹配；
     * 传函数则用作自定义匹配谓词 (inputValue, treeNodeString, data?) => boolean，
     * treeNodeString 为按 treeNodeFilterProp 取到的节点文本，data 为节点原始数据。
     */
    filterTreeNode?: boolean | ((inputValue: string, treeNodeString: string, data?: TreeNode) => boolean);
    /**
     * 远程搜索：输入仅触发 onSearch（防抖后），不本地过滤（由外部更新 treeData）。
     * 隐含可搜索行为（显示搜索框）。默认 false。
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
    /** 浮层宽度对齐触发器（min-width = 触发器宽）。默认 true。 */
    dropdownMatchSelectWidth?: boolean;
    /** 浮层挂载容器，缺省 ConfigProvider 全局值再回退 document.body。 */
    getPopupContainer?: () => HTMLElement | null | undefined;
    onChange?: (value: TreeSelectValue) => void;
    'aria-label'?: string;
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
     * 完全自定义触发器渲染（替换默认选择框），对齐 Semi triggerRender/BasicTriggerRenderProps：
     * value 为当前选中节点对象数组（多选每项一个节点，单选 0/1 项，与 Semi 一致，非收敛后的
     * 输出值）；inputValue/onSearch/onRemove/onClear 用于在自定义 trigger 内部接入内置搜索、
     * 标签删除、清空能力；componentProps 为用户传给 TreeSelect 的全部 props 原样转发（对齐 Semi
     * componentProps={{ ...this.props }}）。isOpen 为本库在 Semi 清单之外新增的便利字段（展开态
     * 由使用方自行判断箭头朝向等视觉），不影响与 Semi 的协议兼容。
     */
    triggerRender?: Snippet<
      [
        {
          value: TreeNode[];
          placeholder: string;
          isOpen: boolean;
          disabled: boolean;
          inputValue: string;
          onSearch: (input: string) => void;
          onRemove: (key: TreeKey) => void;
          onClear: (e: MouseEvent) => void;
          componentProps: { [K in keyof Props]?: Props[K] | undefined };
        },
      ]
    >;
    /** 触发器内嵌标签：渲染在回填值/占位符之前（Snippet 或字符串）。对齐 Semi insetLabel。 */
    insetLabel?: Snippet | string;
    /** 内嵌标签的 id（a11y 关联用），对齐 Semi insetLabelId。 */
    insetLabelId?: string;
    /** 下拉浮层进出场动画（对齐 Semi zoomIn/zoomOut：scale+opacity）。默认 true。 */
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
    /** 自定义清除按钮图标 Snippet（对齐 Semi clearIcon）。 */
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
     * false 隐藏搜索框（即使 filterTreeNode 开启，也不显示内置搜索输入）；
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
    onExpand?: (expandedKeys: TreeKey[], info: { expanded: boolean; node: TreeNode }) => void;

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
    /**
     * 自定义节点内容渲染（对齐 Semi renderLabel；与 Tree.svelte 签名统一——Semi treeNode.tsx
     * 是 Tree/TreeSelect 共用同一份组件，两侧调用签名本就相同）。
     */
    renderLabel?: Snippet<
      [{ node: TreeNodeData; level: number; searchValue: string; selected: boolean; checked: boolean }]
    >;
    /**
     * 完全接管整行渲染（对齐 Semi renderFullLabel；与 Tree.svelte 签名统一）。
     * 虚拟化时须把 ctx.style 赋给渲染根节点。
     */
    renderFullLabel?: Snippet<[FullLabelContext]>;
    /**
     * 自定义 trigger 已选项渲染（单选替换整个已选展示，多选时每个 tag 独立渲染）。
     * 对齐 Semi renderSelectedItem 的 { isRenderInTag, content } 双返回协议：Semi 用返回值
     * 告知框架是否需要外层包一层 Tag；Svelte Snippet 直接接管渲染（无框架二次包裹），
     * 使用者想要 Tag 外壳就自己在 Snippet 内渲染 `<Tag>`，不想要则渲染任意内容——
     * 表达能力等价，只是用 Snippet「完全接管」取代 React「返回值驱动二次渲染」的模式。
     */
    renderSelectedItem?: Snippet<[{ node: TreeNode; onRemove: () => void }]>;
    /** 节点数据中用作显示 label 的字段名（默认 'label'）。 */
    treeNodeLabelProp?: string;
    /**
     * 自定义节点字段名映射（对齐 Semi keyMaps）：适配任意后端数据结构，如 { key:'id', label:'name', children:'sub' }。
     * `value` 为节点 value 字段名（默认 'value'，对齐 Semi KeyMapProps.value；不是 key 的别名）。
     */
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
    onSelect?: (selectedKey: TreeKey, selected: boolean, node: TreeNode) => void;
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
    filterTreeNode,
    remote = false,
    onSearch,
    loadData,
    virtualize,
    position = 'bottomLeft',
    dropdownMatchSelectWidth = true,
    getPopupContainer,
    onChange,
    'aria-label': ariaLabel,
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

  // triggerRender 的 componentProps（对齐 Semi componentProps={{ ...this.props }}）：把用户
  // 传入的全部 props 原样转发给自定义 trigger，供其读取未单独暴露的字段（如 size/status）。
  // Svelte 5 禁止同一组件二次调用 $props()，故用已解构出的局部变量按原 prop 名重新打包
  // （size/disabled 用未经组级默认回退的 *Prop 原始值，与用户实际传入的保持一致）。
  const componentProps = $derived<{ [K in keyof Props]?: Props[K] | undefined }>({
    value,
    defaultValue,
    treeData,
    defaultOpen,
    multiple,
    checkRelation,
    maxTagCount,
    placeholder,
    size: sizeProp,
    status,
    disabled: disabledProp,
    showClear,
    leafOnly,
    defaultExpandAll,
    defaultExpandedKeys,
    filterTreeNode,
    remote,
    onSearch,
    loadData,
    virtualize,
    position,
    dropdownMatchSelectWidth,
    getPopupContainer,
    onChange,
    'aria-label': ariaLabel,
    ariaLabelledby,
    ariaDescribedby,
    ariaErrormessage,
    ariaRequired,
    stopPropagation,
    triggerRender,
    insetLabel,
    insetLabelId,
    motion,
    borderless,
    prefix,
    suffix,
    clearIcon,
    expandIcon,
    arrowIcon,
    showLine,
    labelEllipsis,
    style,
    autoAdjustOverflow,
    validateStatus,
    onBlur,
    onFocus,
    preventScroll,
    outerTopSlot,
    outerBottomSlot,
    searchAutoFocus,
    searchPosition,
    searchPlaceholder,
    treeNodeFilterProp,
    showSearchClear,
    showFilteredOnly,
    emptyContent,
    searchRender,
    expandedKeys: expandedKeysProp,
    expandAll,
    expandAction,
    autoExpandParent,
    motionExpand,
    onExpand,
    autoMergeValue,
    onChangeWithObject,
    showRestTagsPopover,
    restTagsPopoverProps,
    triggerTagWrap,
    renderLabel,
    renderFullLabel,
    renderSelectedItem,
    treeNodeLabelProp,
    keyMaps,
    optionListStyle,
    loadedKeys: loadedKeysProp,
    clickToHide,
    clickTriggerToHide,
    disableStrictly,
    dropdownMargin,
    dropdownClassName,
    dropdownStyle,
    zIndex,
    onClear,
    onSelect,
    onLoad,
    onVisibleChange,
  });

  // InputGroup 组级默认（size/disabled）：显式 prop 始终优先，否则回退组级，再回退组件默认。
  const group = getInputGroupContext();
  const size = $derived<Size>(sizeProp ?? group?.size ?? 'default');
  const disabled = $derived<boolean>(disabledProp ?? group?.disabled ?? false);

  const loc = useLocale();
  // ConfigProvider 全局浮层容器默认；自身 getPopupContainer prop 优先，未传时回退此值（再回退 body）。
  const globalPopupContainer = getGlobalPopupContainer();
  const resolvePopupContainer = $derived(getPopupContainer ?? globalPopupContainer);

  // remote 隐含可搜索（显示搜索框）；filterTreeNode（bool 或函数）亦开启搜索（对齐 Semi，无 filterable 自造 prop）。
  const isFilterable = $derived(remote || filterTreeNode === true || typeof filterTreeNode === 'function');
  const isUnRelated = $derived(checkRelation === 'unRelated');

  // validateStatus 是 status 别名；效值以 validateStatus 优先（未传时回退 status）。
  const effStatus = $derived(validateStatus ?? status ?? 'default');

  const treeId = useId('cd-tree-select-panel');
  const baseId = useId('cd-tree-select-item');

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

  function itemId(key: TreeKey): string {
    return `${baseId}-${String(key)}`;
  }

  // --- keyMaps 字段映射：把用户自定义字段名的数据派生为标准 TreeNodeData 结构（对齐 Semi keyMaps）---
  // 默认（全标准名）时直接返回原 treeData 引用，零额外开销；映射为纯 $derived（红线 #2），不写回（红线 #1）。
  // keyMaps.value 是节点 value 字段名（对齐 Semi KeyMapProps.value），不是 key 的别名。
  const keyField = $derived(keyMaps?.key ?? 'key');
  const labelField = $derived(keyMaps?.label ?? 'label');
  const valueField = $derived(keyMaps?.value ?? 'value');
  const childrenField = $derived(keyMaps?.children ?? 'children');
  const keyMapsDefault = $derived(
    keyField === 'key' && labelField === 'label' && valueField === 'value' && childrenField === 'children',
  );

  /** 标准化节点附带原始节点引用，用于回调时回传原始数据（对齐 Tree.svelte NormalizedNode）。 */
  type NormalizedNode = TreeNodeData & { __orig: TreeNode };

  function normalizeNodes(nodes: TreeNode[]): NormalizedNode[] {
    const kf = keyField;
    const lf = labelField;
    const vf = valueField;
    const cf = childrenField;
    const tnlp = treeNodeLabelProp;
    return nodes.map((raw) => {
      const r = raw as unknown as Record<string, unknown>;
      const kids = r[cf] as TreeNode[] | undefined;
      const nodeValue = r[vf] as string | number | undefined;
      const out: NormalizedNode = {
        ...(raw as unknown as TreeNodeData),
        key: r[kf] as TreeKey,
        label: r[lf] as string,
        __orig: raw,
      };
      if (nodeValue !== undefined) out.value = nodeValue;
      else delete out.value;
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
  const normalizedTree = $derived<TreeNodeData[]>(
    keyMapsDefault ? (treeData as unknown as TreeNodeData[]) : normalizeNodes(treeData),
  );

  /** 回调回传：自定义 keyMaps 时回原始节点，否则回标准节点本身（as TreeNode）。 */
  function toOrig(node: TreeNodeData): TreeNode {
    const orig = (node as Partial<NormalizedNode>).__orig;
    return (orig as TreeNode | undefined) ?? (node as unknown as TreeNode);
  }

  // --- 异步加载（对齐 Tree）：本地缓存子节点 + loading/loaded 标记（不写回受控 treeData，红线 #1）---
  const loadedChildren = new SvelteMap<TreeKey, TreeNodeData[]>();
  const loadingKeys = new SvelteSet<TreeKey>();
  const localLoadedKeys = new SvelteSet<TreeKey>();
  // 受控 loadedKeys（对齐 Semi）：并入内部已加载集，判断加载态时两者取并。
  const controlledLoaded = $derived(new Set<TreeKey>(loadedKeysProp ?? []));
  function isLoaded(key: TreeKey): boolean {
    return localLoadedKeys.has(key) || controlledLoaded.has(key);
  }

  // 合并树：把已加载的子节点注入对应节点，喂给所有 core 纯函数与渲染。
  // 无加载时返回 normalizedTree 原引用，零开销（红线 #2 纯派生）。
  const mergedTree = $derived.by<TreeNodeData[]>(() => {
    if (loadedChildren.size === 0) return normalizedTree;
    const inject = (nodes: TreeNodeData[]): TreeNodeData[] =>
      nodes.map((n) => {
        const loaded = loadedChildren.get(n.key);
        const kids = n.children ?? loaded;
        if (!kids) return n;
        return { ...n, children: inject(kids) };
      });
    return inject(normalizedTree);
  });

  /**
   * value → key 反查表（对齐 Semi getValueOrKey：值通道优先用节点 value 字段标识，
   * 缺失时才 fallback key）。仅收录声明了 value 字段的节点。
   */
  const keyByNodeValue = $derived(buildValueKeyIndex(mergedTree));

  /** 在合并树中按 key 查标准化节点（供 onChangeWithObject 还原节点对象等使用）。 */
  function findMerged(key: TreeKey): TreeNodeData | undefined {
    return findNode(mergedTree, key);
  }

  /**
   * 从一个 value 项（原始标量或对象）提取内部节点标识 key（对齐 Semi getValueOrKey：
   * 节点声明了 value 字段时值通道走 value，否则回退 key）。
   * 对象形态（onChangeWithObject）：优先取 key，缺省回退 value。
   * 标量形态：先按 value 反查表命中节点 value，未命中则原样当 key 使用。
   */
  function entryToKey(entry: ValueEntry): TreeKey | null {
    if (entry !== null && typeof entry === 'object') {
      const obj = entry as unknown as Record<string, unknown>;
      const id = (obj.key ?? obj.value) as TreeKey | undefined;
      return id ?? null;
    }
    return keyByNodeValue.get(entry) ?? entry;
  }

  /** 把内部 key 转成回调/受控所需的输出形态：onChangeWithObject 时回原始节点对象；
   * 否则优先回节点声明的 value 字段，缺省回退 key（对齐 Semi getValueOrKey）。 */
  function keyToOutput(key: TreeKey): TreeKey | TreeNode {
    if (onChangeWithObject) {
      const node = findMerged(key);
      return node ? toOrig(node) : key;
    }
    const node = findMerged(key);
    return node ? getValueOrKey(node) : key;
  }

  // 异步加载某节点子树（竞态：loadingKeys/loadedKeys 去重；快速展开/折叠不重复请求）。
  async function loadChildren(node: TreeNodeData) {
    if (!loadData || loadingKeys.has(node.key) || isLoaded(node.key)) return;
    loadingKeys.add(node.key);
    try {
      const kids = await loadData(toOrig(node));
      loadedChildren.set(node.key, keyMapsDefault ? (kids as unknown as TreeNodeData[]) : normalizeNodes(kids));
    } finally {
      loadingKeys.delete(node.key);
      localLoadedKeys.add(node.key);
      onLoad?.([...localLoadedKeys], toOrig(node));
    }
  }

  function asKeyArray(v: ValueEntry | ValueEntry[] | null | undefined): TreeKey[] {
    if (v === null || v === undefined) return [];
    const arr = Array.isArray(v) ? v : [v];
    return arr.map(entryToKey).filter((k): k is TreeKey => k !== null);
  }

  function getInitialSingle(): TreeKey | null {
    const dv = defaultValue as ValueEntry | ValueEntry[] | null;
    if (Array.isArray(dv)) return dv.length > 0 ? entryToKey(dv[0] as ValueEntry) : null;
    return dv === null || dv === undefined ? null : entryToKey(dv);
  }
  function getInitialChecked(): Set<TreeKey> {
    return new Set(asKeyArray(defaultValue as ValueEntry | ValueEntry[] | null));
  }
  function getInitialOpen(): boolean {
    return defaultOpen;
  }
  function getInitialExpanded(): Set<TreeKey> {
    // defaultExpandedKeys 与 defaultExpandAll 取并集（非受控初始展开集）。
    const set = new Set<TreeKey>(defaultExpandedKeys ?? []);
    if (defaultExpandAll) {
      // defaultExpandAll 需用标准化后的 key（keyMaps 自定义时才能识别 children）。
      const base = keyMapsDefault ? (treeData as unknown as TreeNodeData[]) : normalizeNodes(treeData);
      for (const k of collectExpandable(base)) set.add(k);
    } else {
      // 对齐 Semi getDerivedStateFromProps：首次渲染若有 value/defaultValue，把选中值的祖先链
      // 并入初始展开集（否则首次打开面板需手动展开才能看到已选中节点所在路径，第二次才正常，
      // 因为 exitSearch 等交互路径事后才补算祖先链）。value 优先于 defaultValue（对齐受控优先）。
      const initialEntry = (value ?? defaultValue) as ValueEntry | ValueEntry[] | null | undefined;
      const singleKey =
        initialEntry === null || initialEntry === undefined
          ? null
          : entryToKey(Array.isArray(initialEntry) ? (initialEntry[0] as ValueEntry) : initialEntry);
      const initialTargets = multiple ? asKeyArray(initialEntry ?? null) : singleKey === null ? [] : [singleKey];
      for (const target of initialTargets) collectAncestorsInto(mergedTree, target, set);
    }
    return set;
  }

  // --- 受控 value (红线 #1): 不无条件回写 value，仅 onChange ---
  const isValueControlled = $derived(value !== undefined);

  // 单选：当前选中 key
  let innerValue = $state<TreeKey | null>(getInitialSingle());
  const currentValue = $derived<TreeKey | null>(
    isValueControlled
      ? (() => {
          const v = value as ValueEntry | ValueEntry[] | null | undefined;
          if (v === undefined || v === null) return null;
          return Array.isArray(v) ? (v.length > 0 ? entryToKey(v[0] as ValueEntry) : null) : entryToKey(v);
        })()
      : innerValue,
  );

  // 多选：叶子级显式勾选 base + conduct 归一（含半选）
  let innerChecked = $state<Set<TreeKey>>(getInitialChecked());
  const currentCheckedBase = $derived<Set<TreeKey>>(
    isValueControlled ? new Set(asKeyArray(value as ValueEntry | ValueEntry[] | null)) : innerChecked,
  );
  const checkState = $derived.by(() => {
    if (!multiple) return { checked: new Set<TreeKey>(), half: new Set<TreeKey>() };
    if (isUnRelated) return { checked: new Set(currentCheckedBase), half: new Set<TreeKey>() };
    return conduct(mergedTree, currentCheckedBase, disableStrictly);
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
    return collectCheckedByStrategy(mergedTree, checkState.checked, effectiveStrategy);
  });
  // trigger 回显的已选节点（按收敛策略，树序）
  const checkedNodes = $derived.by<TreeNodeData[]>(() => {
    if (!multiple) return [];
    const keep = new Set(strategyKeys);
    const out: TreeNodeData[] = [];
    const walk = (nodes: TreeNodeData[]) => {
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
    maxTagCount !== undefined && maxTagCount >= 0 ? checkedNodes.slice(maxTagCount) : [],
  );

  // --- 非受控 open（对齐 Semi：仅 defaultOpen 初始 + onVisibleChange 回调，无受控 open prop）---
  let innerOpen = $state(getInitialOpen());
  const isOpen = $derived(innerOpen);
  // dropdown 内置搜索框 DOM 引用（供 searchAutoFocus 命令式聚焦，对齐 Semi
  // handlePopoverVisibleChange 里 focusInput(true) 的做法——不是 HTML autofocus 属性透传，
  // 因为浮层内容随 isOpen 每次重新挂载，需要在「面板刚打开」这个时机主动 focus）。
  let searchInputEl: HTMLInputElement | undefined = $state();

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
  // 单选展示文案（对齐 Semi getValueOrKey：优先节点 value，缺省回退 key，非固定 label —— 但
  // trigger 展示恒用 label 呈现给用户，value/key 仅供值通道；此处保留 label 展示不变）。
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
    onChange?.(next === null ? ('' as TreeKey) : keyToOutput(next));
  }

  // 多选：勾选 base 变更 → conduct 归一 → 按 effectiveStrategy 收敛后回调
  function setChecked(nextBase: Set<TreeKey>) {
    if (!isValueControlled) innerChecked = nextBase;
    if (isUnRelated) {
      onChange?.([...nextBase].map(keyToOutput) as Array<TreeKey | TreeNode>);
      return;
    }
    const resolved = conduct(mergedTree, nextBase, disableStrictly).checked;
    const out = collectCheckedByStrategy(mergedTree, resolved, effectiveStrategy);
    onChange?.(out.map(keyToOutput) as Array<TreeKey | TreeNode>);
  }

  function toggleCheckNode(node: TreeNodeData) {
    if (node.disabled || disabled) return;
    let nextBase: Set<TreeKey>;
    if (isUnRelated) {
      nextBase = new Set(currentCheckedBase);
      if (nextBase.has(node.key)) nextBase.delete(node.key);
      else nextBase.add(node.key);
    } else {
      nextBase = toggleCheck(mergedTree, currentCheckedBase, node.key, disableStrictly);
    }
    setChecked(nextBase);
    // 对齐 Semi handleMultipleSelect：searchPosition='trigger' 场景下，每次勾选/取消勾选都清空
    // 搜索框文字（而非保留到下次手动清空），避免选中后输入框里残留刚才用来过滤的关键字。
    if (searchInTrigger && searchValue !== '') searchValue = '';
  }

  // 移除某 tag：把该节点（及其子树，related）从勾选中去掉
  function removeChecked(node: TreeNodeData) {
    if (disabled) return;
    const isChecked = checkState.checked.has(node.key);
    if (isUnRelated) {
      const next = new Set(currentCheckedBase);
      next.delete(node.key);
      setChecked(next);
    } else if (isChecked) {
      // 复用 toggleCheck：已选 → 取消（含子树联动）
      setChecked(toggleCheck(mergedTree, currentCheckedBase, node.key, disableStrictly));
    }
  }

  function nodeCheckState(node: TreeNodeData): { checked: boolean; half: boolean } {
    return {
      checked: checkState.checked.has(node.key),
      half: !checkState.checked.has(node.key) && checkState.half.has(node.key),
    };
  }

  /**
   * 面板关闭时立即 exitSearch（对齐 Semi handleAfterClose 语义，但时序不同）：
   * Semi 等 Popover 退场动画结束才 clearInput，为的是避免收起过程中 flattenNode
   * 数量变化导致面板高度跳动的视觉闪烁。本库浮层（Select/Cascader/TreeSelect 统一）
   * 只有 `motion && isOpen` 驱动的进场动画，没有退场过渡——isOpen=false 时
   * `.cd-tree-select-hidden{display:none}` 瞬间隐藏，没有"退场动画窗口"可等，
   * 故不存在 Semi 要规避的高度跳动闪烁，立即清空即是等价的正确实现。
   */
  function setOpen(next: boolean) {
    if (next === isOpen) return;
    if (!next) exitSearch();
    innerOpen = next;
    onVisibleChange?.(next);
    // searchAutoFocus（对齐 Semi handlePopoverVisibleChange）：仅 dropdown 搜索框 + 面板打开时
    // 主动聚焦；等 tick() 让 {#if searchInDropdown} 内的 input 完成本次挂载再聚焦。
    if (next && isFilterable && searchPosition === 'dropdown' && searchAutoFocus) {
      void tick().then(() => searchInputEl?.focus());
    }
  }

  function toggleOpen(e: MouseEvent) {
    // stopPropagation（对齐 Semi，默认 true）：阻止 trigger 点击冒泡到外层。
    if (stopPropagation) e.stopPropagation();
    if (disabled) return;
    // 对齐 Semi handleClick：trigger 搜索态且已有输入内容时，点击 trigger（含点击搜索框本身）
    // 不触发开合——否则用户在 searchInTrigger 输入框里点击/连续输入会被误判成"点击 trigger
    // 关闭面板"，尤其是自定义 triggerRender 内嵌的搜索输入框（无独立 stopPropagation）。
    if (isOpen && searchInTrigger && searchValue) return;
    if (isOpen && !clickTriggerToHide) return;
    setOpen(!isOpen);
  }

  // 行是否可展开（含异步占位，对齐 Tree.isExpandable）：
  // 有真实子节点 → 是；否则有 loadData、非叶子、且（未加载 → 显示箭头占位 / 已加载非空 → 是）。
  function isExpandable(node: TreeNodeData, flatHasChildren: boolean): boolean {
    if (flatHasChildren) return true;
    if (!loadData || node.isLeaf === true) return false;
    if (isLoaded(node.key)) return (loadedChildren.get(node.key)?.length ?? 0) > 0;
    return true;
  }

  // --- 搜索过滤（本地 state，复用 core computeFilteredKeys）---
  let searchValue = $state('');
  const trimmedSearch = $derived(searchValue.trim());
  // remote 模式不本地过滤（外部更新 treeData），仅本地过滤时高亮/收敛命中链。
  const searchActive = $derived(!remote && isFilterable && trimmedSearch.length > 0);
  // 按 treeNodeFilterProp 取节点用于匹配的文本（默认 label；自定义字段回退 label）。
  function nodeFilterText(node: TreeNodeData): string {
    const raw = (node as unknown as Record<string, unknown>)[treeNodeFilterProp];
    const v = raw ?? node.label;
    return v == null ? '' : String(v);
  }
  const matchPredicate = $derived.by(() => {
    if (typeof filterTreeNode === 'function') {
      const fn = filterTreeNode;
      return (node: TreeNodeData) => fn(trimmedSearch, nodeFilterText(node), toOrig(node));
    }
    const lower = trimmedSearch.toLowerCase();
    return (node: TreeNodeData) => nodeFilterText(node).toLowerCase().includes(lower);
  });
  const filterResult = $derived.by(() => {
    if (!searchActive)
      return { matched: new Set<TreeKey>(), expand: new Set<TreeKey>(), descendants: new Set<TreeKey>() };
    return computeFilteredKeys(mergedTree, matchPredicate);
  });

  /**
   * 搜索态双展开集（对齐 Semi expandedKeys / filteredExpandedKeys 两套 state）：
   * 搜索期间实际生效的展开集是 currentExpandedSet（主展开集）与命中祖先链的纯派生并集
   * （effectiveExpanded），不写回主展开集——用户在搜索期间对某行手动展开/折叠只影响
   * 本次渲染（通过 emitExpand 的 next 计算，短暂体现在 innerExpanded，但 UI 呈现的是
   * effectiveExpanded 的并集，语义与 Semi filteredExpandedKeys 独立于 expandedKeys 等价）。
   *
   * 退出搜索时（对齐 Semi clearInput）：Semi 把 expandedKeys 与"当前选中值的祖先链"取并集
   * 写回主 expandedKeys（不含 filteredExpandedKeys 里因搜索命中而展开、但已被用户手动折叠的
   * 节点——clearInput 无条件重算，不保留 filteredExpandedKeys 的残留态）。exitSearch() 落地
   * 这一步：显式把"选中节点的祖先链"并入 innerExpanded（受控展开时不回写，仅这里对齐语义），
   * 其余因搜索而临时展开、未被选中的节点则随 searchActive=false 一起消失（对齐 Semi 丢弃语义）。
   */
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
  function exitSearch() {
    searchValue = '';
    if (isExpandControlled) return; // 受控展开：语义交由外部 expandedKeys 决定，不回写（红线 #1）。
    const next = new Set(innerExpanded);
    const selectedTargets = multiple ? [...checkState.checked] : currentValue !== null ? [currentValue] : [];
    for (const target of selectedTargets) collectAncestorsInto(mergedTree, target, next);
    innerExpanded = next;
  }

  // 搜索激活时把过滤展开集并入可见展开集（纯派生，不写回，红线 #1/#2）。
  const effectiveExpanded = $derived.by(() => {
    if (expandAll) {
      const set = new Set<TreeKey>(collectExpandable(mergedTree));
      if (!isExpandControlled && searchActive) for (const k of filterResult.expand) set.add(k);
      return set;
    }
    // 受控展开时不并入搜索展开链（对齐 Semi），完全由 expandedKeys 控制。
    if (!searchActive || isExpandControlled) return expandedKeys;
    const merged = new Set(expandedKeys);
    for (const k of filterResult.expand) merged.add(k);
    return merged;
  });
  function isExpanded(key: TreeKey): boolean {
    return effectiveExpanded.has(key);
  }

  // 搜索时仅保留命中/祖先链/命中节点后代（对齐 Semi findDescendantKeys，使手动展开命中节点时
  // 其子孙仍可见）；showFilteredOnly=false（默认）时全树可见（仅高亮命中）。
  const flat = $derived(flattenVisible(mergedTree, effectiveExpanded));
  const visibleFlat = $derived.by<FlatNode[]>(() => {
    if (!searchActive || !showFilteredOnly) return flat;
    return flat.filter(
      (f) =>
        filterResult.matched.has(f.node.key) ||
        filterResult.expand.has(f.node.key) ||
        filterResult.descendants.has(f.node.key),
    );
  });
  const isEmpty = $derived(
    visibleFlat.length === 0 || (searchActive && showFilteredOnly && filterResult.matched.size === 0),
  );

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

  // --- 展开/收起过渡动画状态（对齐 Semi setExpandedStatus + NodeList transitionNodes，与 Tree.svelte 同构） ---
  let motionKeys = $state<Set<TreeKey>>(new Set());
  let motionType = $state<'show' | 'hide' | ''>('');
  let flattenListSnapshot = $state<FlatNode[]>([]);
  // virtualize 时强制关闭动画（对齐 Semi/Tree.svelte）。
  const motionEnabled = $derived(motionExpand && !virtualize);

  function onNodeListMotionEnd(): void {
    motionKeys = new Set();
    motionType = '';
  }

  const VIRTUAL_OVERSCAN = 4;
  let viewportEl = $state<HTMLDivElement | null>(null);
  let scrollTop = $state(0);
  let rafId = 0;
  const useVirtual = $derived(virtualize !== undefined);
  const height = $derived(virtualize?.height ?? 224);
  const itemHeight = $derived(virtualize?.itemSize ?? 32);
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
  // labelEllipsis：未显式传时默认跟随虚拟化（对齐 Tree/Semi）。TreeSelect 默认值本身即 true。
  const ellipsis = $derived(labelEllipsis ?? useVirtual);

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

  function toggleExpand(node: TreeNodeData) {
    const key = node.key;
    const hasOwnKids = (node.children?.length ?? 0) > 0;
    if (!isExpandable(node, hasOwnKids)) return;
    const next = new Set(currentExpandedBase());
    const willExpand = !isExpanded(key);
    if (!willExpand) {
      next.delete(key);
    } else {
      next.add(key);
      // autoExpandParent：展开时同时展开所有祖先链。
      if (autoExpandParent) collectAncestorsInto(mergedTree, key, next);
      // 展开未加载的异步节点：先取数据（数据到位后合并树派生即显示子节点）。
      if (!hasOwnKids && loadData && !isLoaded(key)) void loadChildren(node);
    }
    // 过渡动画状态（对齐 Semi setExpandedStatus）：收起前先用旧态快照 visibleFlat 定位 hide 动画
    // 目标行（必须是 showFilteredOnly 过滤后的可见态，否则搜索态收起会把本应隐藏的同级节点带出来）。
    if (motionEnabled) {
      flattenListSnapshot = visibleFlat;
      motionKeys = new Set(getMotionKeys(key, next, mergedTree));
      motionType = willExpand ? 'show' : 'hide';
    }
    // 受控展开（红线 #1）：只回调 onExpand，不回写本地态；非受控写本地态。
    if (!isExpandControlled) innerExpanded = next;
    onExpand?.([...next], { expanded: willExpand, node: toOrig(node) });
  }

  /** 当前作为展开操作基集的 Set（搜索态用 effectiveExpanded 使操作在命中派生集上叠加）。 */
  function currentExpandedBase(): Set<TreeKey> {
    return searchActive ? effectiveExpanded : expandedKeys;
  }

  function selectNode(node: TreeNodeData) {
    if (node.disabled || disabled) return;
    if (multiple) {
      // 多选：父节点也可勾选（联动子树），不关面板
      toggleCheckNode(node);
      onSelect?.(node.key, checkState.checked.has(node.key) === false, toOrig(node));
      return;
    }
    if (leafOnly && isExpandable(node, (node.children?.length ?? 0) > 0)) {
      toggleExpand(node);
      return;
    }
    setValue(node.key);
    onSelect?.(node.key, true, toOrig(node));
    if (clickToHide) setOpen(false);
  }

  // 行点击处理器：expandAction 控制行点击是否展开。
  function handleRowClick(node: TreeNodeData) {
    if (node.disabled || disabled) return;
    if (multiple) {
      toggleCheckNode(node);
      return;
    }
    const expandable = isExpandable(node, (node.children?.length ?? 0) > 0);
    if (leafOnly && expandable) {
      if (expandAction !== false) toggleExpand(node);
      return;
    }
    // expandAction='click' 时行点击也展开。
    if (expandAction === 'click' && expandable) {
      toggleExpand(node);
    }
    setValue(node.key);
    onSelect?.(node.key, true, toOrig(node));
    if (clickToHide) setOpen(false);
  }

  // 行双击处理器：expandAction='doubleClick' 时双击展开/折叠。
  function handleRowDoubleClick(node: TreeNodeData) {
    if (expandAction === 'doubleClick' && isExpandable(node, (node.children?.length ?? 0) > 0)) {
      toggleExpand(node);
    }
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
  function isRowDisabled(node: TreeNodeData): boolean {
    return disabled || !!node.disabled;
  }
  function activeIndex(): number {
    if (activeKey === null) return -1;
    return visibleFlat.findIndex((f) => f.node.key === activeKey);
  }
  function moveNext() {
    const cur = activeIndex();
    let i = cur < 0 ? 0 : cur + 1;
    while (i < visibleFlat.length && isRowDisabled((visibleFlat[i] as FlatNode).node)) i++;
    if (i < visibleFlat.length) activeKey = (visibleFlat[i] as FlatNode).node.key;
  }
  function movePrev() {
    const cur = activeIndex();
    let i = cur < 0 ? visibleFlat.length - 1 : cur - 1;
    while (i >= 0 && isRowDisabled((visibleFlat[i] as FlatNode).node)) i--;
    if (i >= 0) activeKey = (visibleFlat[i] as FlatNode).node.key;
  }
  function moveFirst() {
    let i = 0;
    while (i < visibleFlat.length && isRowDisabled((visibleFlat[i] as FlatNode).node)) i++;
    if (i < visibleFlat.length) activeKey = (visibleFlat[i] as FlatNode).node.key;
  }
  function moveLast() {
    let i = visibleFlat.length - 1;
    while (i >= 0 && isRowDisabled((visibleFlat[i] as FlatNode).node)) i--;
    if (i >= 0) activeKey = (visibleFlat[i] as FlatNode).node.key;
  }
  function currentFlat(): FlatNode | undefined {
    const i = activeIndex();
    return i >= 0 ? visibleFlat[i] : undefined;
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
        if (f && isExpandable(f.node, f.hasChildren)) {
          if (!isExpanded(f.node.key)) toggleExpand(f.node);
          else moveNext();
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (f && isExpandable(f.node, f.hasChildren) && isExpanded(f.node.key)) {
          toggleExpand(f.node);
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
        if (f) selectNode(f.node);
        break;
      case ' ':
        e.preventDefault();
        if (f) selectNode(f.node);
        break;
      default:
        return;
    }
    scrollActiveIntoView();
  }

  // --- onSearch（对齐 Semi 三入参签名 (input, filteredExpandedKeys, filteredNodes)）---
  // 无内置防抖：Semi 也不做防抖，remote 场景由使用方在 onSearch 内自行节流。
  function emitSearch(input: string) {
    if (!onSearch) return;
    const q = input.trim();
    if (q.length === 0) {
      onSearch(input, [], []);
      return;
    }
    const res = computeFilteredKeys(mergedTree, matchPredicate);
    const filteredExpandedKeys = [...res.expand];
    const filteredNodes: TreeNode[] = [];
    const walk = (nodes: TreeNodeData[]) => {
      for (const n of nodes) {
        if (res.matched.has(n.key)) filteredNodes.push(toOrig(n));
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
  // searchRender=false 时隐藏内置搜索框（即使 filterTreeNode 开启）。
  const showBuiltinSearch = $derived(isFilterable && searchRender !== false);
  // searchPosition：'dropdown'（默认）搜索框在浮层顶部；'trigger' 搜索框内嵌触发器（对齐 Semi）。
  const searchInDropdown = $derived(showBuiltinSearch && searchPosition !== 'trigger');
  const searchInTrigger = $derived(showBuiltinSearch && searchPosition === 'trigger');
  // 搜索框占位文案：searchPlaceholder prop 优先，回退 i18n。
  const resolvedSearchPlaceholder = $derived(searchPlaceholder ?? loc().t('TreeSelect.searchPlaceholder'));
  // searchPosition='trigger' 单选 bare input 的原生 placeholder（对齐 Semi renderSingleTriggerSearchItem
  // 的 renderText || placeholder）：displayLabel 可能非字符串（label: unknown，对齐 Semi ReactNode），
  // 非字符串时不参与拼接，直接回退 TreeSelect placeholder。
  const bareSingleInputPlaceholder = $derived(
    typeof displayLabel === 'string' && displayLabel ? displayLabel : (placeholder ?? ''),
  );

  // --- DOM 引用：触发根 + portal 面板（定位由 use:floating action 接管）---
  let rootEl = $state<HTMLDivElement | null>(null);
  let panelEl = $state<HTMLDivElement | null>(null);

  // 全局浮层注册（见 core registerOverlayRoot 注释）：panel portal 到 body 后与祖先
  // hover 浮层脱节，登记后祖先的 pointerleave 判断能识别"鼠标去了合法子浮层"。
  $effect(() => {
    if (!panelEl) return;
    return registerOverlayRoot(panelEl);
  });

  // --- 浮层 DOM：首开后保留（仅隐藏），对齐 Semi（不销毁重建）。 ---
  let hasBeenOpened = $state(false);
  $effect(() => {
    if (isOpen) hasBeenOpened = true;
  });
  const shouldRender = $derived(isOpen || hasBeenOpened);

  /**
   * 进/退场动画对齐 Semi CSSAnimation（transitionState: 'enter'|'leave' + onAnimationEnd）：
   * Semi 关闭时先播放 zoomOut（scale 1→0.8 + opacity 1→0），动画结束后 didLeave() 才真正
   * display:none。与 Toast 两段式动画同构（leaving 标记 + animationend 真隐藏）：
   * isOpen=false 时先进入 panelLeaving=true（播放 hide 动画），animationend 触发
   * finalizeClose 才把 panelHidden 设 true（display:none）。isOpen=true 时立即撤销
   * 隐藏与 leaving 态（重新打开不等旧的 leave 动画）。
   * motion=false 时跳过动画：isOpen 变化立即同步 panelHidden，无中间态。
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
      `cd-tree-select-${size}`,
      `cd-tree-select-${effStatus}`,
      disabled && 'cd-tree-select-disabled',
      isOpen && 'cd-tree-select-open',
      borderless && 'cd-tree-select-borderless',
      showLine && 'cd-tree-select-show-line',
      !motionEnabled && 'cd-tree-select-no-motion-expand',
      triggerTagWrap && 'cd-tree-select-tag-wrap',
    ]
      .filter(Boolean)
      .join(' '),
  );

  // triggerRender 的 value 参数（对齐 Semi triggerRenderKeys.map(key => keyEntities[key].data)）：
  // 选中节点的原始节点对象数组，非收敛后的输出值——多选每个 strategyKeys 项还原一个节点；
  // 单选 0 或 1 项。找不到节点（如 key 已从 treeData 移除）时过滤掉，不产生空洞。
  const triggerValue = $derived<TreeNode[]>(
    multiple
      ? strategyKeys.map(findMerged).filter((n): n is TreeNodeData => n !== undefined).map(toOrig)
      : currentValue === null
        ? []
        : ((): TreeNode[] => {
            const n = findMerged(currentValue);
            return n === undefined ? [] : [toOrig(n)];
          })(),
  );
  // triggerRender 的 onRemove（对齐 Semi TreeSelectFoundation.removeTag）：Semi 该方法只处理
  // 多选 checkRelation 分支，单选态不涉及；本库同样只在 multiple 时按 key 找节点复用
  // removeChecked（含子树联动）。
  function triggerRenderOnRemove(key: TreeKey): void {
    if (!multiple) return;
    const n = findMerged(key);
    if (n) removeChecked(n);
  }

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

  // --- TreeNode 共享上下文（对齐 Semi TreeContext，与 Tree.svelte 同构）：树级配置与事件回调下发给每行。 ---
  setTreeContext({
    get multiple() {
      return multiple;
    },
    directory: false,
    get showLine() {
      return showLine;
    },
    blockNode: true,
    draggable: false,
    get wantsDoubleClick() {
      return expandAction === 'doubleClick';
    },
    wantsContextMenu: false,
    get renderLabel() {
      return renderLabel;
    },
    get renderFullLabel() {
      return renderFullLabel;
    },
    toOrig: (node: TreeNodeData) => toOrig(node) as unknown as TreeNodeData,
    icon: undefined,
    get expandIcon() {
      return expandIcon
        ? ((ctx: { node: TreeNodeData; expanded: boolean; loading: boolean }) =>
            expandIcon({ node: toOrig(ctx.node), expanded: ctx.expanded, level: 0 })) as unknown as Snippet<
            [{ node: TreeNodeData; expanded: boolean; loading: boolean }]
          >
        : undefined;
    },
    suffix: undefined,
    dragGhost: undefined,
    onNodeClick: (node) => handleRowClick(node),
    onNodeExpand: (node) => toggleExpand(node),
    onNodeCheck: (node) => toggleCheckNode(node),
    onNodeRightClick: () => {},
    onNodeDoubleClick: (node) => handleRowDoubleClick(node),
    onNodeDragStart: () => {},
    onNodeDragOver: () => {},
    onNodeDragLeave: () => {},
    onNodeDragEnd: () => {},
    onNodeDrop: () => {},
  });
</script>

{#snippet emptyBlock()}
  <div class="cd-tree-select-empty">
    {#if emptyContent !== undefined}
      {#if typeof emptyContent === 'string'}{emptyContent}{:else}{@render emptyContent()}{/if}
    {:else}
      {loc().t('TreeSelect.emptyText')}
    {/if}
  </div>
{/snippet}

{#snippet restTagsTrigger()}
  <!-- +N 折叠触发器：aria-label 走 i18n restTagsCount（「还有 {count} 项」/「{count} more」）供屏幕阅读器朗读折叠数。
       style="background-color: transparent"：对齐 Semi TagGroup.renderNTag——"+N" Tag 用
       color="grey" 但内联强制透明背景（实测 Semi 官网 semi-tag-grey-light 根节点
       background-color: rgba(0,0,0,0)，非 mixin 默认的 15% 灰底）。 -->
  <span
    class="cd-tree-select-rest-trigger"
    aria-label={loc().t('TreeSelect.restTagsCount', { count: hiddenTagCount })}
  >
    <Tag size={size === 'large' ? 'default' : 'small'} style="background-color: transparent">
      +{hiddenTagCount}
    </Tag>
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
    <!-- searchPosition='trigger'（对齐 Semi renderSingleTriggerSearch/renderTagInput）：input 本身
         不用 searchPlaceholder（Semi 该场景 placeholder 恒为 ''），而是显示"已选值文本 || TreeSelect
         placeholder"——单选用 displayLabel，多选交给外层 tag 列表判断是否已有选中项。 -->
    <input
      bind:this={searchInputEl}
      class="cd-tree-select-search-input cd-tree-select-search-input-bare"
      type="text"
      role="combobox"
      aria-expanded={isOpen}
      aria-controls={treeId}
      aria-activedescendant={activeDescId}
      placeholder={multiple
        ? checkedNodes.length === 0
          ? (placeholder ?? '')
          : ''
        : bareSingleInputPlaceholder}
      aria-label={resolvedSearchPlaceholder}
      value={searchValue}
      oninput={onSearchInput}
      onkeydown={onSearchKeydown}
    />
  {:else}
    <span class="cd-tree-select-search-field">
      <IconSearch class="cd-tree-select-search-icon" aria-hidden="true" />
      <input
        bind:this={searchInputEl}
        class="cd-tree-select-search-input"
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
      {#if showSearchClear && searchValue}
        <!-- 搜索框清除按钮（对齐 Semi Input showClear + TreeSelect baseInputProps.onChange）：
             有值时渲染，聚焦/hover 态才可见（CSS :focus-within / :hover，语义等价 Semi
             isAllowClear 的 isFocus || isHovering）。onMouseDown 而非 onclick（对齐 Semi
             Input「fix issue 1203」注释）：先于 input 的 blur 触发，避免点击瞬间因失焦导致
             按钮先被隐藏而点不到；不手动 preventDefault/focus——Semi 也未强制 re-focus，
             mousedown 早于 blur 触发，原生焦点已留在 input 上，无需干预。 -->
        <span
          class="cd-tree-select-search-clearbtn"
          role="button"
          tabindex="-1"
          aria-label={loc().t('TreeSelect.clear')}
          onmousedown={() => setSearchValue('')}
        >
          <IconClear aria-hidden="true" />
        </span>
      {/if}
    </span>
  {/if}
{/snippet}

{#snippet treeNodeRow(f: FlatNode, posStyle: string | undefined)}
  {@const node = f.node}
  {@const expandable = isExpandable(node, f.hasChildren)}
  {@const loading = loadingKeys.has(node.key)}
  {@const expanded = expandable && isExpanded(node.key)}
  {@const nodeDisabled = disabled || !!node.disabled}
  {@const cs = nodeCheckState(node)}
  {@const selected = multiple ? cs.checked : currentValue === node.key}
  <TreeNodeRow
    flat={f}
    {baseId}
    {expandable}
    {loading}
    {expanded}
    disabled={nodeDisabled}
    {selected}
    checked={cs.checked}
    halfChecked={cs.half}
    checkable={multiple && !nodeDisabled}
    active={activeKey === node.key}
    dragging={false}
    isDropTarget={false}
    dropPos={null}
    filtered={searchActive && filterResult.matched.has(node.key)}
    searchWord={trimmedSearch}
    {ellipsis}
    {posStyle}
  />
{/snippet}

<div class={cls} bind:this={rootEl} {style}>
  <!-- combobox 容器用 div 以合法承载多选 tags / clear 等内部交互元素 -->
  {#if triggerRender}
    <!-- 自定义 trigger 同样需要 role=combobox + onclick=toggleOpen 外壳（对齐 Semi：
         useCustomTrigger 时 inner 替换的只是容器内容，外层 <div role='combobox'
         onClick={this.handleClick}> 无条件保留）。此前直接裸渲染 triggerRender 导致
         点击自定义内容完全不会触发面板开合。
         真机实测 Semi 官网这个 combobox 就是根节点本身（用户 style="width:300px" 直接
         打在它上面），不带任何库内置 class/背景/边框——本库始终多一层 .cd-tree-select
         外壳（承载 isOpen class、rootEl、面板定位锚点），故这里不能完全裸奔：father
         是 inline-flex 但子元素默认不会自动撑满，需要显式 flex:1 撑满外壳宽度，视觉上
         等价于 Semi 单层结构（无背景/边框，仅占满宽度）。 -->
    <div
      style="flex: 1; min-width: 0;"
      role="combobox"
      aria-haspopup="tree"
      aria-expanded={isOpen}
      aria-controls={treeId}
      aria-disabled={disabled || undefined}
      tabindex={disabled ? -1 : 0}
      onclick={toggleOpen}
      onfocus={(e) => onFocus?.(e)}
      onblur={(e) => onBlur?.(e)}
      onkeydown={(e) => {
        if (disabled) return;
        if (!isOpen) {
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
        if (!searchActive) onTreeKeydown(e);
      }}
    >
      {@render triggerRender({
        value: triggerValue,
        placeholder,
        isOpen,
        disabled,
        inputValue: searchValue,
        onSearch: search,
        onRemove: triggerRenderOnRemove,
        onClear: clearAll,
        componentProps,
      })}
    </div>
  {:else}
  <div
    class="cd-tree-select-trigger"
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
      <span class="cd-tree-select-prefix">
        {#if typeof prefix === 'string'}{prefix}{:else}{@render prefix()}{/if}
      </span>
    {/if}
    {#if insetLabel}
      <span class="cd-tree-select-inset-label" id={insetLabelId}>
        {#if typeof insetLabel === 'string'}{insetLabel}{:else}{@render insetLabel()}{/if}
      </span>
    {/if}
    <span class="cd-tree-select-content" class:cd-tree-select-content-search-trigger={searchInTrigger}>
      {#if multiple && checkedNodes.length > 0}
        <!-- 多选已有选中项：searchInTrigger 态 tag 列表先于 search input 渲染（对齐 Semi TagInput
             —— tag 紧贴左侧，input 跟在 tag 之后填充剩余空间；DOM 顺序颠倒会导致 flex:1 的 input
             把 tag 挤到最右）。 -->
        <span class="cd-tree-select-tags">
          {#each visibleTagNodes as node (node.key)}
            {#if renderSelectedItem}
              {@render renderSelectedItem({ node: toOrig(node), onRemove: () => removeChecked(node) })}
            {:else}
              <!-- color="white"：对齐 Semi renderTagList/renderTagItem 统一 color:'white'（不分
                   searchInTrigger 与否，TreeSelect 多选 tag 恒白底）。 -->
              <Tag
                size={size === 'large' ? 'default' : 'small'}
                color="white"
                closable={!disabled}
                onClose={() => removeChecked(node)}
              >
                {node.label}
              </Tag>
            {/if}
          {/each}
          {#if hiddenTagCount > 0}
            {#if showRestTagsPopover}
              <!-- showRestTagsPopover：hover +N 用本库 Popover 展示折叠掉的剩余 Tag（对齐 Semi
                   TagInput 内置 Popover 的 showArrow，restTagsPopoverProps 可覆盖默认 props）。
                   forwardClickToTrigger：popover 内容 portal 到 body，点击其中的 tag 不会真实
                   冒泡到 trigger；React/Semi 靠虚拟树冒泡天然不受影响，本库需显式补上，让点击
                   popover 里的 tag 跟点击容器空白区域一样冒泡触发 toggleOpen（同 TagInput.svelte
                   同名场景）。 -->
              <Popover trigger="hover" position="top" showArrow forwardClickToTrigger {...(restTagsPopoverProps ?? {})}>
                {@render restTagsTrigger()}
                {#snippet content()}
                  <!-- color="white"：对齐 Semi TagInput.renderTag 里 <Tag color="white">——trigger 内
                       可见 tag 与 Popover 内折叠 tag 共用同一份渲染逻辑，颜色统一为白底。 -->
                  <span class="cd-tree-select-rest-tags">
                    {#each hiddenTagNodes as node (node.key)}
                      <Tag
                        size={size === 'large' ? 'default' : 'small'}
                        color="white"
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
      {:else if !searchInTrigger}
        <!-- searchInTrigger 态：占位符/已选值文本已交给 builtinSearchInput 的 bare input 原生
             placeholder 显示（对齐 Semi renderSingleTriggerSearch/renderTagInput），此处不重复渲染。 -->
        {#if multiple}
          <span class="cd-tree-select-placeholder">{placeholder}</span>
        {:else if hasSelection}
          {#if renderSelectedItem && selectedNode}
            {@render renderSelectedItem({ node: toOrig(selectedNode), onRemove: () => setValue(null) })}
          {:else}
            <span class="cd-tree-select-text">{displayLabel}</span>
          {/if}
        {:else}
          <span class="cd-tree-select-placeholder">{placeholder}</span>
        {/if}
      {/if}
      {#if searchInTrigger}
        <!-- searchPosition='trigger'：朴素 input 内嵌触发器，与触发器融为一体（bare 模式，无灰底框）。
             渲染在 tag 列表之后，填充剩余空间（对齐 Semi TagInput 的 tag+input 布局）。 -->
        <span class="cd-tree-select-trigger-search">{@render builtinSearchInput(true)}</span>
      {/if}
    </span>

    {#if showClearBtn}
      <span
        class="cd-tree-select-clearbtn"
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
        {#if clearIcon}
          {@render clearIcon()}
        {:else}
          <IconClear aria-hidden="true" />
        {/if}
      </span>
    {/if}

    {#if suffix}
      <span class="cd-tree-select-suffix">
        {#if typeof suffix === 'string'}{suffix}{:else}{@render suffix()}{/if}
      </span>
    {/if}
    <span class="cd-tree-select-arrow" aria-hidden="true">
      {#if arrowIcon}
        {@render arrowIcon()}
      {:else}
        <IconChevronDown aria-hidden="true" />
      {/if}
    </span>
  </div>
  {/if}

  {#if shouldRender}
    <!--
      进/退场动画（对齐 Select/Tooltip 既有模式，见 floating-animation-guard.test.ts 架构约束）：
      use:floating 用 transform:translate(x,y) 定位（写 inline style）；动画缩放用独立的
      CSS `scale` 属性（非 transform:scale()）——scale 与 transform 是两个正交属性，
      同一元素上二者互不覆盖，无需拆双层 DOM。淡入用 opacity 配合。
    -->
    <div
      class={[
        'cd-tree-select-panel',
        dropdownClassName,
        motion && isOpen && 'cd-tree-select-panel-motion-show',
        motion && panelLeaving && 'cd-tree-select-panel-motion-hide',
      ]
        .filter(Boolean)
        .join(' ')}
      class:cd-tree-select-hidden={panelHidden}
      onanimationend={finalizeClose}
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
      {#if outerTopSlot}
        {@render outerTopSlot()}
      {/if}
      {#if searchInDropdown}
        <div class="cd-tree-select-search-wrapper">
          {@render builtinSearchInput()}
        </div>
      {/if}
      {#if mergedTree.length === 0 || isEmpty}
        <div class="cd-tree-select-tree" role="tree" aria-label={ariaLabel}>
          {@render emptyBlock()}
        </div>
      {:else if useVirtual}
        <!-- 虚拟滚动（复用 Tree 范式）：role=tree 容器自身滚动，spacer 撑总高，行绝对定位按索引偏移。
             只渲染视口内切片 renderFlat，保持 role=tree → role=treeitem 语义不变。虚拟化下强制关闭动画。 -->
        <div
          class="cd-tree-select-tree cd-tree-select-tree-virtual"
          role="tree"
          aria-label={ariaLabel}
          aria-multiselectable={multiple || undefined}
          aria-activedescendant={activeDescId}
          aria-disabled={disabled || undefined}
          tabindex={disabled ? -1 : 0}
          bind:this={viewportEl}
          style={`height:${height}px`}
          onkeydown={onTreeKeydown}
        >
          <div class="cd-tree-select-spacer" style={`height:${totalHeight}px`}>
            {#each renderFlat as f, i (f.node.key)}
              {@render treeNodeRow(f, `position:absolute; left:0; right:0; transform:translateY(${(vRange.startIndex + i) * rowHeight}px); height:${rowHeight}px`)}
            {/each}
          </div>
        </div>
      {:else}
        <div
          class="cd-tree-select-tree"
          role="tree"
          aria-label={ariaLabel}
          aria-multiselectable={multiple || undefined}
          aria-activedescendant={activeDescId}
          aria-disabled={disabled || undefined}
          tabindex={disabled ? -1 : 0}
          style={optionListStyleStr}
          onkeydown={onTreeKeydown}
        >
          <NodeList
            flattenNodes={visibleFlat}
            {motionKeys}
            {motionType}
            flattenList={flattenListSnapshot}
            motion={motionEnabled}
            onMotionEnd={onNodeListMotionEnd}
            renderTreeNode={treeNodeRow}
          />
        </div>
      {/if}
      {#if outerBottomSlot}
        {@render outerBottomSlot()}
      {/if}
    </div>
  {/if}
</div>

<style>
  .cd-tree-select {
    position: relative;
    display: inline-flex;
    width: 100%;
    font-size: var(--cd-select-font-size);
  }
  .cd-tree-select-trigger {
    display: flex;
    align-items: center;
    gap: var(--cd-spacing-tight);
    width: 100%;
    min-height: var(--cd-select-height-default);
    padding-left: var(--cd-select-padding-x);
    padding-right: var(--cd-select-padding-x);
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
  .cd-tree-select-small .cd-tree-select-trigger {
    min-height: var(--cd-select-height-small);
  }
  .cd-tree-select-large .cd-tree-select-trigger {
    min-height: var(--cd-select-height-large);
  }
  /* 对齐 Semi 填充式：悬浮加深底色 fill-1（非展开/禁用态） */
  .cd-tree-select:not(.cd-tree-select-open):not(.cd-tree-select-disabled) .cd-tree-select-trigger:hover {
    background: var(--cd-select-bg-hover);
  }
  .cd-tree-select-trigger:focus-visible {
    outline: none;
    background: var(--cd-select-bg);
    border-color: var(--cd-select-border-active);
    box-shadow: var(--cd-focus-ring);
  }
  .cd-tree-select-open .cd-tree-select-trigger {
    background: var(--cd-select-bg);
    border-color: var(--cd-select-border-active);
  }
  /* warning 校验态：light-bg + 分态 border（对齐 Semi treeSelect warning，same as Input）。 */
  .cd-tree-select-warning .cd-tree-select-trigger {
    background: var(--cd-color-tree-select-warning-bg-default);
    border-color: var(--cd-color-tree-select-warning-border-default);
  }
  .cd-tree-select-warning:not(.cd-tree-select-open):not(.cd-tree-select-disabled)
    .cd-tree-select-trigger:hover {
    background: var(--cd-color-tree-select-warning-bg-hover);
    border-color: var(--cd-color-tree-select-warning-border-hover);
  }
  .cd-tree-select-warning .cd-tree-select-trigger:focus-visible,
  .cd-tree-select-warning.cd-tree-select-open .cd-tree-select-trigger {
    background: var(--cd-color-tree-select-warning-bg-focus);
    border-color: var(--cd-color-tree-select-warning-border-focus);
  }
  .cd-tree-select-warning .cd-tree-select-trigger:active {
    background: var(--cd-color-tree-select-warning-bg-active);
    border-color: var(--cd-color-tree-select-warning-border-active);
  }
  /* error 校验态：light-bg + 分态 border（对齐 Semi treeSelect danger，same as Input）。 */
  .cd-tree-select-error .cd-tree-select-trigger {
    background: var(--cd-color-tree-select-danger-bg-default);
    border-color: var(--cd-color-tree-select-danger-border-default);
  }
  .cd-tree-select-error:not(.cd-tree-select-open):not(.cd-tree-select-disabled)
    .cd-tree-select-trigger:hover {
    background: var(--cd-color-tree-select-danger-bg-hover);
    border-color: var(--cd-color-tree-select-danger-border-hover);
  }
  .cd-tree-select-error .cd-tree-select-trigger:focus-visible,
  .cd-tree-select-error.cd-tree-select-open .cd-tree-select-trigger {
    background: var(--cd-color-tree-select-danger-bg-focus);
    border-color: var(--cd-color-tree-select-danger-border-focus);
  }
  .cd-tree-select-error .cd-tree-select-trigger:active {
    background: var(--cd-color-tree-select-danger-bg-active);
    border-color: var(--cd-color-tree-select-danger-border-active);
  }
  .cd-tree-select-trigger[aria-disabled='true'] {
    background: var(--cd-color-tree-select-input-disabled-bg-default, var(--cd-color-fill-0));
    color: var(--cd-color-tree-select-input-disabled-text-default);
    cursor: not-allowed;
  }
  /* disabled 态多选 tag 降级为透明底 + 灰字（对齐 Semi treeSelect.scss &-disabled .semi-tag：
     不再是各 tag 自身的 white/light 底色，而是统一透出 trigger 的禁用底色）。 */
  .cd-tree-select-trigger[aria-disabled='true'] :global(.cd-tag) {
    background-color: transparent;
    color: var(--cd-color-tree-select-input-disabled-text-default);
  }
  /* disabled 态 placeholder / arrow 覆盖（对齐 Semi treeSelect.scss &-disabled 里
     .semi-tree-select-selection-placeholder 与 .semi-tree-select-arrow 都单独覆盖 color 为
     disabled 禁用色）：两者自身都显式设了 color，比继承自 trigger[aria-disabled] 的 color
     优先级更高，不会自动降级为更浅的禁用色，需要单独覆盖。 */
  .cd-tree-select-trigger[aria-disabled='true'] .cd-tree-select-placeholder,
  .cd-tree-select-trigger[aria-disabled='true'] .cd-tree-select-arrow {
    color: var(--cd-color-tree-select-input-disabled-text-default);
  }
  .cd-tree-select-content {
    display: flex;
    flex: 1 1 auto;
    align-items: center;
    min-width: 0;
  }
  /* multiple 有已选 tag（对齐 Semi treeSelect.scss &-multiple .semi-treeSelect-selection
     { padding-left: $spacing-treeSelect_selection_multiple-paddingLeft }，值为 4px）：
     普通 dropdown 搜索场景的多选 tag 组同样要收窄左边距，不能沿用单选/无 tag 时的
     trigger 通用 padding（12px），否则 tag 组整体比 Semi 明显靠右。 */
  .cd-tree-select-content:has(.cd-tree-select-tags) {
    margin-left: calc(-1 * var(--cd-select-padding-x) + var(--cd-spacing-extra-tight));
  }
  /* searchPosition='trigger' + multiple 有已选 tag（对齐 Semi treeSelect.scss
     $spacing-treeSelect_selection_tagInput_notEmpty-marginLeft: -$spacing-extra-tight）：
     用负 margin 抵消 trigger 自身 padding-left，让 tag 组更贴近触发器左边缘，
     不再是「trigger padding + tag 自身间距」的双重内边距。 */
  .cd-tree-select-content-search-trigger:has(.cd-tree-select-tags) {
    margin-left: calc(-1 * var(--cd-select-padding-x) + var(--cd-spacing-extra-tight));
  }
  /* searchPosition='trigger' 多选有 tag 时：content 允许换行（对齐 Semi TagInput —— tag 与 input
     同属一个 wrap 流，宽度不够时先在这一行内换行展示更多 tag，而非 input 独占一大块固定宽度
     把 tags 挤进更窄的子区间）。单选/无 tag 时保持 nowrap（trigger 恒单行，未开 triggerTagWrap
     不换行的默认行为不受影响）。 */
  .cd-tree-select-content-search-trigger:has(.cd-tree-select-tags) {
    flex-wrap: wrap;
  }
  /* searchPosition='trigger'：搜索输入占据触发器主区，与已选值/占位并存。
     有 tag 时不再强占剩余空间（flex:0 1 auto + 小 min-width，对齐 Semi TagInput 内置 input
     只占实际内容宽度，不挤压 tag 换行判断的可用宽度）；无 tag 时占满整行显示 placeholder。 */
  .cd-tree-select-trigger-search {
    display: flex;
    flex: 1 1 auto;
    min-width: 0;
  }
  .cd-tree-select-content-search-trigger:has(.cd-tree-select-tags) .cd-tree-select-trigger-search {
    /* flex-basis 用具体像素值（非 auto）：auto 会按 input 的 intrinsic 宽度（浏览器默认较宽，
       实测撑到 136px）计算初始尺寸，即使视觉上 tag+input 明明能放进一行，也会把 content 撑到
       触发 flex-wrap 换行。20px 起步，有剩余空间时 flex-grow:1 再伸展。 */
    flex: 1 1 20px;
    min-width: 20px;
  }
  /* bare 搜索 input：透明、无边框，与触发器融为一体（避免臃肿的灰底框）。 */
  .cd-tree-select-search-input-bare {
    width: 100%;
    min-width: 0;
    height: auto;
    padding: 0;
    background: transparent;
    border: none;
    color: inherit;
    font: inherit;
    outline: none;
  }
  /* line-height 显式收窄到 tag 内容区高度（tag 总高 20px 减去上下各 2px padding = 16px，
     对齐 Semi Input line-height: $height-input_small 绑定组件自身尺寸而非继承父级 font 行高
     的做法）：font:inherit 会带入外层偏大的默认行高，在 flex-wrap 容器内把这一行的实际占用
     高度撑到超过 tag 整体高度（20px），进而顶高整个 trigger（实测偏差 36.5px vs 32px）。
     用复合选择器（两个类名，特异性 0,0,2,0）确保不管 .cd-tree-select-search-input 通用规则
     写在前面还是后面，这条都能稳定覆盖其 font:inherit 带来的 line-height。 */
  .cd-tree-select-search-input.cd-tree-select-search-input-bare {
    line-height: calc(var(--cd-tag-height-small) - 2 * var(--cd-tag-small-padding-y));
  }
  .cd-tree-select-search-input-bare::placeholder {
    color: var(--cd-color-text-2);
  }
  .cd-tree-select-text {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .cd-tree-select-placeholder {
    /* 对齐 Semi treeSelect 占位符 input-placeholder-text-default = text-2 */
    color: var(--cd-color-tree-select-input-placeholder-text-default);
  }
  .cd-tree-select-clearbtn,
  .cd-tree-select-arrow {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    /* 对齐 Semi treeSelect default-icon-default = text-2 */
    color: var(--cd-color-tree-select-default-icon-default);
  }
  .cd-tree-select-clearbtn {
    cursor: pointer;
  }
  .cd-tree-select-clearbtn:hover {
    color: var(--cd-color-tree-select-default-icon-hover);
  }
  .cd-tree-select-arrow {
    transition: transform var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-tree-select-open .cd-tree-select-arrow {
    transform: rotate(180deg);
  }
  /* 面板 portal 到容器，由 use:floating action 写 position:fixed + transform 定位 */
  .cd-tree-select-panel {
    z-index: var(--cd-select-dropdown-z);
    padding-top: var(--cd-spacing-extra-tight);
    padding-bottom: var(--cd-spacing-extra-tight);
    background: var(--cd-select-dropdown-bg);
    border-radius: var(--cd-select-dropdown-radius);
    box-shadow: var(--cd-select-dropdown-shadow);
  }
  /* 关闭后保留 DOM 但不可见、不可交互、不占位（对齐 Semi，不销毁重建） */
  .cd-tree-select-hidden {
    display: none;
  }
  /*
   * 进/退场动画对齐 Semi zoomIn/zoomOut（tooltip.scss `-animation-show`/`-animation-hide`
   * + $motion-zoom_scale-from:0.8），与本库 Select/Tooltip 既有模式一致：scale(0.8→1) +
   * opacity(0→1)，进退场曲线相同（token 缺省回退 100ms cubic-bezier(0.215,0.61,0.355,1)）。
   *
   * 用独立 CSS `scale` 属性（非 transform:scale()）：use:floating 把定位写在
   * transform:translate(x,y)（inline style）；scale 与 transform 是两个正交属性，
   * 同一元素上二者互不覆盖，无需拆双层 DOM（见 floating-animation-guard.test.ts
   * 架构约束测试——它扫描全部 use:floating 组件，禁止 @keyframes 里出现 transform:scale）。
   */
  .cd-tree-select-panel-motion-show {
    animation: cd-tree-select-zoom-in var(--cd-dropdown-motion-duration, 100ms)
      cubic-bezier(0.215, 0.61, 0.355, 1);
  }
  .cd-tree-select-panel-motion-hide {
    animation: cd-tree-select-zoom-out var(--cd-dropdown-motion-duration, 100ms)
      cubic-bezier(0.215, 0.61, 0.355, 1);
  }
  @keyframes cd-tree-select-zoom-in {
    from {
      opacity: 0;
      scale: 0.8;
    }
    50% {
      opacity: 1;
    }
    to {
      scale: 1;
    }
  }
  @keyframes cd-tree-select-zoom-out {
    from {
      opacity: 1;
      scale: 1;
    }
    60% {
      opacity: 0;
      scale: 0.8;
    }
    to {
      opacity: 0;
      scale: 0.8;
    }
  }
  /* insetLabel 内嵌标签：回填值前的标签文本，消费 tree-select label token */
  .cd-tree-select-inset-label {
    display: inline-flex;
    align-items: center;
    flex: 0 0 auto;
    margin-right: var(--cd-spacing-tight);
    color: var(--cd-color-tree-select-label);
    font-weight: var(--cd-font-tree-select-label);
    white-space: nowrap;
    user-select: none;
  }
  .cd-tree-select-search-wrapper {
    padding: var(--cd-spacing-tight);
    padding-bottom: var(--cd-spacing-extra-tight);
  }
  /* 搜索字段：灰底圆角 + 左侧放大镜图标（对齐 Semi 的和谐观感，与列表分隔清晰）。 */
  .cd-tree-select-search-field {
    display: flex;
    align-items: center;
    gap: var(--cd-spacing-extra-tight);
    width: 100%;
    height: var(--cd-height-input-default);
    padding-left: var(--cd-spacing-input-paddingleft);
    padding-right: var(--cd-spacing-input-paddingleft);
    background: var(--cd-color-fill-0);
    border: 1px solid transparent;
    border-radius: var(--cd-radius-input-wrapper);
    transition:
      background-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard),
      border-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-tree-select-search-field:hover {
    background: var(--cd-color-fill-1);
  }
  .cd-tree-select-search-field:focus-within {
    background: var(--cd-color-bg-0);
    border-color: var(--cd-color-input-default-border-focus);
    box-shadow: var(--cd-focus-ring);
  }
  .cd-tree-select-search-icon {
    flex: 0 0 auto;
    color: var(--cd-color-text-2);
  }
  .cd-tree-select-search-input {
    flex: 1 1 auto;
    width: 100%;
    min-width: 0;
    height: 100%;
    padding: 0;
    background: transparent;
    color: inherit;
    border: none;
    font: inherit;
    font-size: var(--cd-font-size-small);
    outline: none;
  }
  .cd-tree-select-search-input::placeholder {
    color: var(--cd-color-text-2);
  }
  /* 搜索框清除按钮（对齐 Semi Input isAllowClear：有值 + 聚焦/hover 态才可见），
     默认 visibility:hidden 占位保留布局宽度，避免 hover 进出时输入框宽度跳动。 */
  .cd-tree-select-search-clearbtn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    color: var(--cd-color-tree-select-default-icon-default);
    cursor: pointer;
    visibility: hidden;
  }
  .cd-tree-select-search-field:hover .cd-tree-select-search-clearbtn,
  .cd-tree-select-search-field:focus-within .cd-tree-select-search-clearbtn {
    visibility: visible;
  }
  .cd-tree-select-search-clearbtn:hover {
    color: var(--cd-color-tree-select-default-icon-hover);
  }
  .cd-tree-select-tree {
    display: flex;
    flex-direction: column;
    max-height: 14rem;
    overflow-y: auto;
  }
  /* 虚拟滚动：容器自身定高滚动，spacer 绝对定位行布局，max-height 让位给固定 height */
  .cd-tree-select-tree-virtual {
    display: block;
    position: relative;
    max-height: none;
    overflow-y: auto;
  }
  .cd-tree-select-spacer {
    position: relative;
    width: 100%;
  }
  .cd-tree-select-tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--cd-spacing-extra-tight);
    align-items: center;
    min-width: 0;
  }
  .cd-tree-select-empty {
    padding: var(--cd-tree-node-padding-x);
    color: var(--cd-color-text-3);
    text-align: center;
  }
  /* +N 折叠触发器：内联包裹 Tag，承载 aria-label（Popover trigger 宿主） */
  .cd-tree-select-rest-trigger {
    display: inline-flex;
    align-items: center;
  }
  /* showRestTagsPopover 浮层内剩余 Tag 列表：换行铺排，限制最大宽避免过宽 */
  .cd-tree-select-rest-tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--cd-spacing-extra-tight);
    align-items: center;
    max-width: 240px;
  }
  /* 减少动效：动画时长归零而非 animation:none——后者不触发 animationend，
     会让 finalizeClose 永远不被调用，面板卡在展开态无法真正隐藏（对齐 Toast 同类处理）。 */
  @media (prefers-reduced-motion: reduce) {
    .cd-tree-select-trigger,
    .cd-tree-select-arrow {
      transition: none;
    }
    .cd-tree-select-panel-motion-show,
    .cd-tree-select-panel-motion-hide {
      animation-duration: 0.01ms;
    }
  }
</style>
