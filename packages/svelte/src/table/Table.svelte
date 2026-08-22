<!--
  Table — see specs/components/show/Table.spec.md
  列定义驱动渲染：三态排序、客户端分页、行选择(含半选)，受控/非受控双轨。
  受控 sortState / rowSelection.selectedRowKeys / pagination.currentPage 不回写，
  仅通过 onSortChange / rowSelection.onChange / pagination.onChange 通知 (红线 #1)。
  复用 @chenzy-design/core 纯函数算法与 Pagination 组件，不重复实现。
  固定列：column.fixed='left'|'right'，横滚时 sticky 锁定 + 逐列像素偏移 + 边界阴影。
  列筛选：column.filters + onFilter，列头漏斗弹浮层多选过滤（复用 _floating + useDismiss）。
  列宽拖拽：column.resize，列头右侧拖拽手柄，指针几何命令式管理(红线 #3)；
  覆盖宽度存本地 SvelteMap 不写回 columns prop(红线 #1)，进 cellStyle 宽度计算。
  树形数据：tree=true 时行含 childrenRecordName（默认 'children'）字段自动嵌套渲染，
  第一列内展开三角 + 逐级缩进（indentSize）；排序/分页/筛选作用于顶层行，可见行经 core
  flattenTreeRows 纯函数扁平化驱动 tbody (红线 #2)。展开状态收敛到单一顶层架构（对齐 Semi
  Table.tsx：expandedRowKeys/defaultExpandedRowKeys/onExpand/onExpandedRowsChange 均为
  顶层 prop，无 expandable/tree 嵌套状态对象），同一份 expandedRowKeys 同时驱动
  expandedRowRender 展开行渲染与树形 children 渲染，二者可同时生效、互不排斥（对齐 Semi
  Body/index.tsx renderBodyRows）；受控 expandedRowKeys 不回写，仅经 onExpand(单行)/
  onExpandedRowsChange(全量展开记录数组) 通知 (红线 #1)。tree 本身仍是显式 opt-in
  （不像 Semi 靠 dataSource 是否含 children 字段自动判定，见项目记忆
  table-tree-needs-explicit-tree-and-row-key，避免恰好带 children 字段的普通表被误判）。
  树形行选择父子联动：rowSelection.checkStrictly 默认 false=联动（勾父连带勾全部后代，
  后代部分选中父行半选 indeterminate），true=父子独立(向后兼容)。联动 {checked,half} 经 core
  conductRows/toggleRowCheck 纯函数据整棵可见行树派生 (红线 #2)；内部存叶子级 base，
  onChange 回传含父行的完整 checked 集；半选写 input.indeterminate 复用 attachment (红线 #3)。
  行虚拟滚动：virtualized=true 时 .cd-table-body 自身纵向滚动(固定 height)，thead sticky 固定顶部，
  tbody 仅渲染视口内行切片(复用 core fixedRange 算可见区间)，首尾各一个 padding spacer tr 撑出
  未渲染行总高(保持原生 <table>/<tr>/<td> 语义与 a11y)。scrollTop 命令式 scroll 回调 + rAF 节流写入
  本地 $state，可见区间纯 $derived render 期只读(红线 #2/#3)。virtualized 与 pagination 互斥(虚拟时
  忽略分页全量滚动)；排序/筛选/行选择/树形/固定列均正常协同。假定行等高，不建议与 expandedRowRender 混用。
-->
<script lang="ts" generics="T extends Record<string, unknown>">
  import {
    toggleSort,
    applySort,
    paginate,
    selectAllState,
    toggleSelectAll,
    toggleRow,
    flattenTreeRows,
    conductRows,
    toggleRowCheck,
    fixedRange,
    useLiveAnnouncer,
    useId,
    createResizeDrag,
    type RowKey,
    type SortState,
    type FlatRow,
    type ResizeDragController,
  } from '@chenzy-design/core';
  import { tick } from 'svelte';
  import type { Snippet } from 'svelte';
  import { SvelteMap } from 'svelte/reactivity';
  import { createColumnCollector, setColumnsContext } from './getColumns.js';
  import { getCellWidths, headWidthsEqual, arrayAdd, type HeadWidthEntry } from './table-context.js';
  import TablePagination from './TablePagination.svelte';
  import { Spin } from '../spin/index.js';
  import { floating } from '../_floating/use-floating.js';
  import { useDismiss, registerOverlayRoot } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';
  import type {
    ColumnDef,
    RowSelection,
    ResizableConfig,
    RowAttrs,
    Align,
    TableSize,
    TableChangeInfo,
    TableChangeAction,
    TableScrollInfo,
    ScrollConfig,
  } from './types.js';
  import FilterDropdownHost from './FilterDropdownHost.svelte';
  import ColGroup from './ColGroup.svelte';
  import HeadTable from './HeadTable.svelte';
  import Body from './Body.svelte';
  import ColumnSelection from './ColumnSelection.svelte';
  import CustomExpandIcon from './CustomExpandIcon.svelte';
  import BaseRow from './BaseRow.svelte';
  import TableHeaderRow from './TableHeaderRow.svelte';
  import ExpandedRow from './ExpandedRow.svelte';
  import SectionRow from './SectionRow.svelte';

  // 泛型组件 props 用内联类型而非具名 interface Props：在 declaration:true 下，
  // 引用泛型参数 T 的具名 interface 会被当作私有名泄漏进生成的 .d.ts 公共签名而报错。
  let {
    columns = [],
    children,
    dataSource = [],
    rowKey = 'key',
    size = 'default',
    tableLayout = '',
    bordered = false,
    stripe = false,
    loading = false,
    sortState,
    defaultSortState = { key: null, order: null },
    onSortChange,
    pagination,
    rowSelection,
    tree,
    expandedRowRender,
    rowExpandable,
    expandedRowKeys,
    defaultExpandedRowKeys,
    onExpand,
    onExpandedRowsChange,
    rowClassName,
    empty,
    'aria-label': ariaLabel,
    onRowClick,
    onChange,
    onFilterChange,
    onPaginationChange,
    onSelectChange,
    onExpandChange,
    onScroll,
    onReachBottom,
    reachBottomThreshold = 0,
    virtualized = false,
    height = 400,
    rowHeight = 48,
    scroll,
    sticky = false,
    showHeader = true,
    defaultExpandAllRows = false,
    expandAllRows,
    resizable = false,
    getPopupContainer,
    onRow,
    onHeaderRow,
    expandRowByClick = false,
    expandCellFixed,
    keepDOM = false,
    indentSize: indentSizeProp = 20,
    groupBy,
    renderGroupSection,
    clickGroupedRowToExpand = false,
    defaultExpandAllGroupRows,
    expandAllGroupRows,
    onGroupExpandChange,
    onGroupedRow,
    titleSnippet,
    footerSnippet,
    emptySnippet,
    renderPagination,
    expandIcon,
    hideExpandedColumn = true,
    rowSpanHover = false,
    headerStyle,
    direction = 'ltr',
    title,
    footer,
    childrenRecordName,
    class: className,
    style,
    components,
    getVirtualizedListRef,
  }: {
    columns?: ColumnDef<T>[];
    /**
     * 组合式列定义容器（对齐 Semi Table.Column）：放 <Column> 子组件，Table 经 context
     * 收集成与配置式等价的列树。与 `columns` prop 并存——传了 `columns` 用配置式，
     * 否则用收集的组合式列树。
     */
    children?: Snippet;
    dataSource?: T[];
    rowKey?: string | ((record: T) => RowKey);
    size?: TableSize;
    /**
     * 控制 `<table>` 的 table-layout（对齐 Semi tableLayout）。缺省 `''`：沿用本库既有
     * 行为（存在 fixed 列或双 table 架构时固定为 fixed，`.cd-table-fixed` class）；
     * 显式传 `'auto'` 强制浏览器按内容自动分配列宽（不加 `.cd-table-fixed`）；
     * 显式传 `'fixed'` 强制固定布局（等效当前默认对 fixed 场景的行为）。
     */
    tableLayout?: '' | 'auto' | 'fixed';
    bordered?: boolean;
    stripe?: boolean;
    loading?: boolean;
    sortState?: SortState;
    defaultSortState?: SortState;
    onSortChange?: (state: SortState) => void;
    pagination?:
      | false
      | {
          pageSize?: number;
          /** 受控当前页（对齐 Semi currentPage） */
          currentPage?: number;
          /** 非受控默认当前页（对齐 Semi defaultCurrentPage） */
          defaultCurrentPage?: number;
          /** 数据总数：受控远程分页时覆盖本地数据长度（对齐 Semi total） */
          total?: number;
          /** 分页器位置：底部/顶部/上下都有（对齐 Semi position），默认 bottom */
          position?: 'bottom' | 'top' | 'both';
          /** 翻页区域左侧文案自定义格式化；false 关闭（对齐 Semi formatPageText） */
          formatPageText?:
            | boolean
            | ((info: { currentStart: number; currentEnd: number; total: number }) => string);
          /** 页码变化（对齐 Semi onPageChange） */
          onPageChange?: (page: number) => void;
          /** 页码变化（本库旧名，与 onPageChange 等效） */
          onChange?: (page: number) => void;
        };
    rowSelection?: RowSelection<T>;
    /**
     * 树形数据开关（对齐 Semi 语义，但本库有意保留显式 opt-in：Semi 靠 dataSource
     * 含 childrenRecordName 字段自动判定树形，本库要求显式传 `tree` 才启用树形渲染
     * ——避免恰好带 children 字段的普通表被误当树形，见 table-tree-needs-explicit-
     * tree-and-row-key 记忆）。展开状态/展开行渲染已收敛到顶层 expandedRowKeys 等
     * props（对齐 Semi Table.tsx：expandedRowKeys/onExpand/onExpandedRowsChange 等
     * 均为顶层 prop，无 tree 嵌套对象），tree 自身仅剩布尔开关语义。
     */
    tree?: boolean;
    /**
     * 展开行内容渲染（对齐 Semi 顶层 expandedRowRender）。传入即视为该表启用「展开行」
     * 能力；与 tree（树形）共用同一份 expandedRowKeys 状态与展开图标机制，
     * 二者可同时生效（对齐 Semi Body/index.tsx renderBodyRows：hasExpandedRowRender
     * 与 recordHasChildren 各自独立判定，互不排斥）。
     */
    expandedRowRender?: Snippet<[{ record: T; index: number }]>;
    /** 该行是否可展开，默认全部可展开（对齐 Semi 顶层 rowExpandable，同时作用于展开行图标与树形展开图标） */
    rowExpandable?: (record: T) => boolean;
    /**
     * 受控展开行 key 列表（对齐 Semi 顶层 expandedRowKeys）：同时驱动 expandedRowRender
     * 展开行渲染与树形 children 展开渲染（同一份状态，对齐 Semi handleRowExpanded 单一
     * expandedRowKeys 数组同时服务两种渲染路径）。受控时不回写，仅经 onExpand /
     * onExpandedRowsChange 通知（红线 #1）。
     */
    expandedRowKeys?: RowKey[];
    /** 非受控初始展开行 key 列表（对齐 Semi 顶层 defaultExpandedRowKeys） */
    defaultExpandedRowKeys?: RowKey[];
    /** 单行展开/收起时触发（对齐 Semi 顶层 onExpand，入参 (expanded, record)） */
    onExpand?: (expanded: boolean, record: T) => void;
    /**
     * 展开行 key 集合变化时触发，入参为完整展开行记录数组（非 key 数组，对齐 Semi
     * 顶层 onExpandedRowsChange：`(expandedRows?: RecordType[]) => void`，实测于 Semi
     * 官方「行可交换的树形数据」demo `onExpandedRowsChange={rows => setExpandedRowKeys(rows.map(item => item[rowKey]))}`）。
     */
    onExpandedRowsChange?: (records: T[]) => void;
    rowClassName?: (record: T, index: number) => string;
    empty?: string;
    /** 空数据占位自定义渲染（富内容，如 Empty 组件；优先于 empty 文案，对齐 Semi empty: ReactNode） */
    emptySnippet?: Snippet;
    'aria-label'?: string;
    onRowClick?: (info: { record: T; index: number }) => void;
    /** 聚合事件：排序/筛选/分页任一变化的主入口（受控数据回流）。spec §4 */
    onChange?: (info: TableChangeInfo) => void;
    /** 筛选状态变化（含重置）。spec §4 */
    onFilterChange?: (info: { dataIndex: string; values: (string | number)[] }) => void;
    /** 分页变化。spec §4 */
    onPaginationChange?: (info: { current: number; pageSize: number }) => void;
    /** 选择集变化（与 rowSelection.onChange 同时触发）。spec §4 */
    onSelectChange?: (info: { selectedRowKeys: RowKey[]; selectedRows: T[] }) => void;
    /** 行展开/收起（展开行与树形行均触发）。spec §4 */
    onExpandChange?: (info: {
      expanded: boolean;
      record: T;
      expandedRowKeys: RowKey[];
    }) => void;
    /** 滚动位置（含触底，用于无限加载）。命令式监听滚动容器。spec §4 */
    onScroll?: (info: TableScrollInfo) => void;
    /** 纵向触底（懒加载触发）。距底 reachBottomThreshold 像素内触发一次。spec §4 */
    onReachBottom?: () => void;
    /** onReachBottom 触发阈值（距底像素），默认 0（精确触底） */
    reachBottomThreshold?: number;
    /** 行虚拟滚动：仅渲染视口内行，适合大数据（1000+ 行）。默认 false（行为不变）。
     *  启用时忽略 pagination（全量滚动），表头 sticky 固定于滚动容器顶部。
     *  假定行等高（rowHeight）；与 expandedRowRender 同用时展开内容行不计入高度，故不建议混用。 */
    virtualized?: boolean;
    /** 虚拟滚动视口高度（px）。virtualized 时生效，默认 400 */
    height?: number;
    /** 虚拟滚动行高（px）。virtualized 时生效，默认 48 */
    rowHeight?: number;
    /** 横/纵向滚动配置，x 设最小宽度并横向溢出，y 设最大高度并纵向溢出 */
    scroll?: ScrollConfig;
    /** 表头吸顶：true 时表头 sticky 定位；对象时可指定 top（距滚动容器顶部偏移 px，对齐 Semi Sticky）。v2.21+ 语义：开启后 Table 自动切换 fixed 布局 */
    sticky?: boolean | { top?: number };
    /** 是否显示表头，默认 true */
    showHeader?: boolean;
    /** 默认展开全部行（包含树形行），默认 false */
    defaultExpandAllRows?: boolean;
    /** 是否展开所有行（对齐 Semi expandAllRows；受控语义弱化为初始态同 defaultExpandAllRows） */
    expandAllRows?: boolean;
    /**
     * Table 级列伸缩开关（对齐 Semi resizable）。true 时所有带 width 的列可拖拽伸缩
     * （column.resize=false 单列关闭）；对象态提供 onResize/onResizeStart/onResizeStop
     * 事件（返回的对象与该列合并，如 className）。
     */
    resizable?: boolean | ResizableConfig<T>;
    /** 筛选浮层挂载容器，默认跟随触发按钮 */
    getPopupContainer?: () => HTMLElement;
    /** 行级事件与属性（返回 onClick/onDoubleClick/className/style） */
    onRow?: (record: T, index: number, rowStatus?: { disabled?: boolean; selected?: boolean }) => RowAttrs;
    /** 表头行级事件与属性 */
    onHeaderRow?: (columns: ColumnDef<T>[], index: number) => { onClick?: (e: MouseEvent) => void; onMouseEnter?: (e: MouseEvent) => void; onMouseLeave?: (e: MouseEvent) => void; className?: string; style?: string };
    /** 点击行体时触发展开/收起，默认 false */
    expandRowByClick?: boolean;
    /** 展开图标列固定方向 */
    expandCellFixed?: boolean | 'left' | 'right';
    /** keepDOM=true 时保留已展开行 DOM 但隐藏（display:none），默认 false */
    keepDOM?: boolean;
    /** 树形缩进像素，默认 20（对齐 Semi 顶层 indentSize） */
    indentSize?: number;
    /** 按字段名或函数对数据行分组，插入分组标题行 */
    groupBy?: string | ((record: T) => string);
    /** 自定义分组标题渲染 */
    renderGroupSection?: Snippet<[{ groupKey: string; group: T[] }]>;
    /** 点击分组标题行时折叠/展开该组内的数据行，默认 false（groupBy 时生效） */
    clickGroupedRowToExpand?: boolean;
    /** 非受控：初始默认展开全部分组。缺省（未配置任一分组展开 props）时向后兼容为全展开；
     *  显式传 false 则初始全部折叠。动态加载数据时不生效。 */
    defaultExpandAllGroupRows?: boolean;
    /** 受控：为 true 展开全部分组、false 折叠全部分组。受控时不回写，仅经 onGroupExpandChange 通知（红线 #1） */
    expandAllGroupRows?: boolean;
    /**
     * 分组展开/收起变化回调（点击分组标题行触发），回传当前展开的分组 key 集合。
     * Semi 无此专属回调（Semi 分组仅有 expandAllGroupRows/clickGroupedRowToExpand 等展开控制
     * props，无逐组变化通知），本库参照 Semi 展开行 onExpand 的模式补充，属合理扩展。
     */
    onGroupExpandChange?: (info: { groupKey: string; expanded: boolean; expandedGroupKeys: string[] }) => void;
    /** 分组标题行的自定义属性回调（类似 onRow，仅作用于分组头行），返回值合并进分组头行 tr。groupBy 时生效 */
    onGroupedRow?: (group: T[], index: number) => { onClick?: (e: MouseEvent) => void; onDoubleClick?: (e: MouseEvent) => void; onMouseEnter?: (e: MouseEvent) => void; onMouseLeave?: (e: MouseEvent) => void; className?: string; style?: string };
    /** 表格顶部标题区域 */
    titleSnippet?: Snippet;
    /** 表格底部内容区域（接收 currentData） */
    footerSnippet?: Snippet<[{ currentData: T[] }]>;
    /**
     * 自定义分页器渲染，替换内置 Pagination UI。入参含分页状态与翻页回调（调用 onChange(page) 触发内部翻页，
     * 受控 current 仍不回写，红线 #1）。仅在 paginationEnabled 且有数据时消费。
     */
    renderPagination?: Snippet<[{ total: number; currentPage: number; pageSize: number; onChange: (page: number) => void }]>;
    /**
     * 自定义展开行的展开/收起图标（替换默认三角）。入参 { expanded, record }。
     * 仅在 expandedRowRender 展开列生效（树形行的展开三角另有渲染，不受此影响）。
     */
    expandIcon?: Snippet<[{ expanded: boolean; record: T }]>;
    /**
     * 展开按钮是否与首列文案渲染在同一单元格。默认 true（并入首列，对齐 Semi）；
     * 传 false 时展开按钮单独作为一列渲染（首列前的独立 expand 列）。仅 expandedRowRender 时生效。
     */
    hideExpandedColumn?: boolean;
    /** 合并单元格（column.render 返回 rowSpan）时 hover 是否高亮整个合并区。默认 false */
    rowSpanHover?: boolean;
    /** 表头单元格（所有 th，含 fixed 表头）的自定义内联样式。字符串或键值对象 */
    headerStyle?: string | Record<string, string>;
    /** RTL/LTR 方向，默认 ltr（对齐 Semi direction） */
    direction?: 'ltr' | 'rtl';
    /** 表格标题（字符串；富内容用 titleSnippet） */
    title?: string;
    /** 表格尾部（字符串；富内容用 footerSnippet） */
    footer?: string;
    /** 树形 dataSource 中子级字段名，默认 'children'（对齐 Semi 顶层 childrenRecordName） */
    childrenRecordName?: string;
    /** 最外层 .cd-table-wrapper 自定义样式名（对齐 Semi className） */
    class?: string;
    /** 最外层 .cd-table-wrapper 内联样式（对齐 Semi style） */
    style?: string;
    /**
     * 覆盖组成元素的 tag 名（对齐 Semi components）。Svelte 侧以标签名字符串生效，
     * 经 <svelte:element> 渲染，内部 class/role/事件仍注入。缺省用原生
     * table/thead/tbody/tr/th/td/colgroup/col。常见用法：body.row='div' 配合拖拽库。
     * body.colgroup.{wrapper,col} 对齐 Semi ColGroup 消费的 components.body.colgroup
     * （Semi 自身实现里唯一真被消费的 components 子槽位，其余 header.outer/body.outer/
     * footer.* 在 Semi 源码中也未被消费，本库同步不实现）。
     */
    components?: {
      table?: string;
      header?: { wrapper?: string; row?: string; cell?: string };
      body?: {
        wrapper?: string;
        row?: string;
        cell?: string;
        colgroup?: { wrapper?: string; col?: string };
      };
    };
    /**
     * 返回虚拟化滚动控制句柄（对齐 Semi getVirtualizedListRef）。仅 virtualized 时有效。
     * 句柄含 scrollTo(offset) 与 scrollToItem(index)，命令式驱动表体滚动。
     */
    getVirtualizedListRef?: (ref: {
      scrollTo: (offset: number) => void;
      scrollToItem: (index: number) => void;
    }) => void;
  } = $props();

  // 解析各槽位 tag，缺省回退原生（对齐 Semi DEFAULT_COMPONENTS）。
  const tagTable = $derived(components?.table ?? 'table');
  const tagThead = $derived(components?.header?.wrapper ?? 'thead');
  const tagTbody = $derived(components?.body?.wrapper ?? 'tbody');
  const tagHeaderRow = $derived(components?.header?.row ?? 'tr');
  const tagHeaderCell = $derived(components?.header?.cell ?? 'th');
  const tagBodyRow = $derived(components?.body?.row ?? 'tr');
  const tagBodyCell = $derived(components?.body?.cell ?? 'td');
  const tagColgroupWrapper = $derived(components?.body?.colgroup?.wrapper ?? 'colgroup');
  const tagCol = $derived(components?.body?.colgroup?.col ?? 'col');

  const loc = useLocale();
  // 单例 live region（polite）：排序结果播报给屏幕阅读器（命令式写入在事件回调，红线 #3）。
  const announcer = useLiveAnnouncer();

  // --- 键解析 ---
  const getKey = (record: T): RowKey =>
    typeof rowKey === 'function' ? rowKey(record) : (record[rowKey] as RowKey);

  const colKeyOf = (col: ColumnDef<T>, index: number): string =>
    col.key ?? col.dataIndex ?? String(index);

  // --- 表头合并（column.children）：叶子列驱动 body/ColGroup/固定列，父列只作表头分组 ---
  // 组合式 <Column> 收集：根收集器 + 唯一 version $state（所有层冒泡到此）。
  // 红线 #2：<Column> 的 register/update/unregister（副作用）写普通数组 + bump version；
  // collectedColumns $derived 只读 version 重建根 snapshot（递归读普通数组，不写 $state）。
  let columnsVersion = $state(0);
  const rootCollector = createColumnCollector<T>(() => {
    columnsVersion += 1;
  });
  setColumnsContext(rootCollector);
  const collectedColumns = $derived.by<ColumnDef<T>[]>(() => {
    void columnsVersion; // 收集顺序/内容变化触发重建
    return rootCollector.snapshot();
  });
  // 实际列源：传了配置式 columns 用之（向后兼容）；否则用组合式收集树。
  const effectiveColumns = $derived(columns.length > 0 ? columns : collectedColumns);

  // 无 children 时 leafColumns 与 columns 等价（零行为变化）。
  function flattenLeaves(cols: ColumnDef<T>[]): ColumnDef<T>[] {
    const out: ColumnDef<T>[] = [];
    for (const c of cols) {
      if (c.children && c.children.length > 0) out.push(...flattenLeaves(c.children));
      else out.push(c);
    }
    return out;
  }
  const leafColumns = $derived(flattenLeaves(effectiveColumns));
  const hasHeaderMerge = $derived(effectiveColumns.some((c) => c.children && c.children.length > 0));

  function leafCount(col: ColumnDef<T>): number {
    if (!col.children || col.children.length === 0) return 1;
    return col.children.reduce((s, c) => s + leafCount(c), 0);
  }
  const headerDepth = $derived.by(() => {
    const depth = (col: ColumnDef<T>): number =>
      col.children && col.children.length > 0 ? 1 + Math.max(...col.children.map(depth)) : 1;
    return effectiveColumns.length ? Math.max(...effectiveColumns.map(depth)) : 1;
  });
  interface HeaderCell {
    col: ColumnDef<T>;
    colSpan: number;
    rowSpan: number;
    leafIndex: number; // 叶子格：其在 leafColumns 的下标；父分组格：-1
    isLeaf: boolean;
  }
  // 二维表头：rows[r] 是第 r 行的表头格序列。叶子列 rowSpan 纵向合并到底行。
  const headerRows = $derived.by<HeaderCell[][]>(() => {
    const depth = headerDepth;
    const rows: HeaderCell[][] = Array.from({ length: depth }, () => []);
    const walk = (col: ColumnDef<T>, rowIndex: number, startLeaf: number): void => {
      if (!col.children || col.children.length === 0) {
        rows[rowIndex]?.push({ col, colSpan: 1, rowSpan: depth - rowIndex, leafIndex: startLeaf, isLeaf: true });
      } else {
        rows[rowIndex]?.push({ col, colSpan: leafCount(col), rowSpan: 1, leafIndex: -1, isLeaf: false });
        let childLeaf = startLeaf;
        for (const child of col.children) {
          walk(child, rowIndex + 1, childLeaf);
          childLeaf += leafCount(child);
        }
      }
    };
    let cursor = 0;
    for (const col of effectiveColumns) {
      walk(col, 0, cursor);
      cursor += leafCount(col);
    }
    return rows;
  });

  // --- 列宽拖拽：本地覆盖宽度 (colKey → px)，不写回 columns prop (红线 #1) ---
  const MIN_COL_WIDTH = 40;
  const widthOverrides = new SvelteMap<string, number>();
  // 拖拽手柄所在列头引用（用于 pointerdown 读取起始几何）
  const resizeHandles: Record<string, HTMLElement | null> = $state({});
  // TableHeaderRow.svelte 用此回调写入 resizeHandles（而非直接 mutate 传入的对象引用，
  // 对齐同文件 onRowEl 的回调式 DOM ref 收集模式，避免 Svelte 5 ownership_invalid_mutation）。
  function setResizeHandleEl(colKey: string, el: HTMLElement | null) {
    resizeHandles[colKey] = el;
  }
  // 当前正在拖拽的列 key（用于手柄高亮 / body class）
  let resizingKey = $state<string | null>(null);

  // 解析某列最终宽度：覆盖宽度优先，否则 col.width
  function resolveWidth(col: ColumnDef<T>, index: number): number | string | undefined {
    const ov = widthOverrides.get(colKeyOf(col, index));
    if (ov !== undefined) return ov;
    return col.width;
  }

  // 某列是否可伸缩：Table 级 resizable 开启时，带 width 且 column.resize!==false 的列
  // 可伸缩（对齐 Semi）。
  function columnResizable(col: ColumnDef<T>): boolean {
    if (!resizable) return false;
    if (col.resize === false) return false;
    return col.width !== undefined;
  }
  // Table 级 resizable 对象态的事件配置。
  const resizableConfig = $derived<ResizableConfig<T> | null>(
    typeof resizable === 'object' ? resizable : null,
  );
  // resize 事件返回的列覆盖（如 className）：colKey → 合并进该列头的覆盖对象。
  const resizeOverrides = new SvelteMap<string, Partial<ColumnDef<T>>>();
  function applyResizeEvent(
    handler: ((column: ColumnDef<T>) => Partial<ColumnDef<T>> | void) | undefined,
    col: ColumnDef<T>,
    colKey: string,
  ) {
    if (!handler) return;
    const prev = resizeOverrides.get(colKey);
    const merged = handler(prev ? { ...col, ...prev } : { ...col });
    if (merged && typeof merged === 'object') resizeOverrides.set(colKey, merged);
  }

  // 列头拖拽：收敛到 core 通用拖拽原语 createResizeDrag，命令式管理指针几何
  // (红线 #3)。pointerdown 时以当前列 colKey / 起始宽度构建一次性拖拽实例，
  // 由原语在 document 上绑定 pointermove/pointerup 并在结束/卸载时解绑；
  // 绝不用响应式 attachment 读几何。
  let activeDrag: ResizeDragController | null = null;
  function startResize(event: PointerEvent, col: ColumnDef<T>, index: number) {
    event.preventDefault();
    event.stopPropagation();
    const colKey = colKeyOf(col, index);
    const th = resizeHandles[colKey]?.closest('th') as HTMLElement | null;
    // 起始宽度：已有覆盖 > col.width 数值 > 实测列头宽度
    const ov = widthOverrides.get(colKey);
    const startWidth =
      ov ?? (typeof col.width === 'number' ? col.width : (th?.getBoundingClientRect().width ?? MIN_COL_WIDTH));

    activeDrag?.destroy();
    const drag = createResizeDrag({
      axis: 'x',
      getStart: () => ({ width: startWidth }),
      // 单数 min 作用于 x 轴：等价 Math.max(MIN_COL_WIDTH, ...)，原语内部再 Math.round
      min: MIN_COL_WIDTH,
      onStart: () => {
        resizingKey = colKey;
        applyResizeEvent(resizableConfig?.onResizeStart, col, colKey);
      },
      onMove: (s) => {
        widthOverrides.set(colKey, s.width);
        applyResizeEvent(resizableConfig?.onResize, col, colKey);
      },
      onEnd: () => {
        resizingKey = null;
        activeDrag = null;
        applyResizeEvent(resizableConfig?.onResizeStop, col, colKey);
      },
    });
    activeDrag = drag;
    drag.start(event, 'right');
  }

  // 卸载兜底：若拖拽未结束就卸载，销毁拖拽实例清掉可能遗留的全局监听 (红线 #3)。
  $effect(() => () => {
    activeDrag?.destroy();
  });

  // --- 排序：受控 sortState 不回写 (红线 #1) ---
  const isSortControlled = $derived(sortState !== undefined);
  let innerSort = $state<SortState>(initSort());
  const currentSort = $derived<SortState>(
    isSortControlled ? (sortState as SortState) : innerSort,
  );
  function initSort(): SortState {
    // Check for per-column defaultSortOrder
    for (let i = 0; i < leafColumns.length; i++) {
      const col = leafColumns[i] as ColumnDef<T>;
      if (col.defaultSortOrder != null) {
        return { key: colKeyOf(col, i), order: col.defaultSortOrder };
      }
    }
    return { ...defaultSortState };
  }

  // --- 列筛选：本地 state（colKey → 选中值集合），不写回 props (红线 #1) ---
  // 非受控初始值吃 column.defaultFilteredValue（对齐 Semi）。
  const filterState = new SvelteMap<string, Set<string | number>>(initFilterState());
  function initFilterState(): [string, Set<string | number>][] {
    const seed: [string, Set<string | number>][] = [];
    // 组合式列首帧收集树可能为空，defaultFilteredValue 初始不追溯（对齐 Semi，见组合式限制）。
    flattenLeaves(effectiveColumns).forEach((col, i) => {
      if (col.defaultFilteredValue && col.defaultFilteredValue.length > 0) {
        seed.push([col.key ?? col.dataIndex ?? String(i), new Set(col.defaultFilteredValue)]);
      }
    });
    return seed;
  }
  // confirm 模式（filterConfirmMode='confirm' 或 renderFilterDropdown）临时筛选值：
  // 打开面板时从生效值快照，点确定才写回 filterState（对齐 Semi tempFilteredValue）。
  const tempFilterState = new SvelteMap<string, (string | number)[]>();
  // 打开的筛选浮层列 key（同时只开一个）
  let openFilterKey = $state<string | null>(null);
  // 各列漏斗按钮引用（trigger）+ 当前浮层引用（dismiss extraTargets）
  const filterTriggers: Record<string, HTMLButtonElement | null> = $state({});
  // TableHeaderRow.svelte 用此回调写入 filterTriggers（同上，避免直接 mutate props）。
  function setFilterTriggerEl(colKey: string, el: HTMLButtonElement | null) {
    filterTriggers[colKey] = el;
  }
  let filterPanelEl = $state<HTMLDivElement | null>(null);

  // 全局浮层注册（见 core registerOverlayRoot 注释）：filter panel portal 到 body 后
  // 与祖先 hover 浮层脱节，登记后祖先的 pointerleave 判断能识别"鼠标去了合法子浮层"。
  $effect(() => {
    if (!filterPanelEl) return;
    return registerOverlayRoot(filterPanelEl);
  });

  /**
   * 进/退场动画对齐 Semi（Semi 列筛选浮层复用 <Dropdown>，继承其 zoomIn/zoomOut；
   * 本库自建 use:floating，之前完全没有面板动画。同一时刻仅一个 openFilterKey，
   * 关闭时记录 closingFilterKey 播放 hide 动画，animationend 后才真正从 DOM 卸载。
   * 切换到另一列时旧列走退场、新列走进场，两者 key 不同，DOM 上短暂共存不冲突。
   */
  let closingFilterKey = $state<string | null>(null);

  // 打开/关闭筛选浮层（统一入口：同步 temp 快照 + onFilterDropdownVisibleChange 通知）。
  function setFilterOpen(col: ColumnDef<T>, colKey: string, open: boolean) {
    if (open) {
      tempFilterState.set(colKey, [...effectiveFilterValues(col, colKey)]);
      openFilterKey = colKey;
      if (closingFilterKey === colKey) closingFilterKey = null;
    } else if (openFilterKey === colKey) {
      openFilterKey = null;
      closingFilterKey = colKey;
    }
    col.onFilterDropdownVisibleChange?.(open);
  }

  function finalizeFilterClose(colKey: string): void {
    if (closingFilterKey === colKey) closingFilterKey = null;
  }

  // 浮层外点击/Esc 关闭（红线 #3：$effect 内 useDismiss，cleanup 解绑）
  $effect(() => {
    if (openFilterKey === null) return;
    const trigger = filterTriggers[openFilterKey];
    if (!trigger) return;
    const key = openFilterKey;
    return useDismiss(trigger, {
      onDismiss: () => {
        openFilterKey = null;
        closingFilterKey = key;
        // dismiss 关闭也要通知 visible=false
        leafColumns.forEach((c, i) => {
          if (colKeyOf(c, i) === key) c.onFilterDropdownVisibleChange?.(false);
        });
      },
      escape: true,
      outsideClick: true,
      extraTargets: [filterPanelEl],
    });
  });

  function activeFilterValues(colKey: string): Set<string | number> {
    return filterState.get(colKey) ?? new Set();
  }
  function isFiltered(colKey: string): boolean {
    return (filterState.get(colKey)?.size ?? 0) > 0;
  }
  // 某列是否走 confirm 模式（点筛选项先暂存，点确定才生效，对齐 Semi filterConfirmMode）。
  function isConfirmMode(col: ColumnDef<T>): boolean {
    return col.filterConfirmMode === 'confirm';
  }
  function toggleFilterValue(col: ColumnDef<T>, colKey: string, value: string | number) {
    if (isConfirmMode(col)) {
      // confirm 模式：只改临时值，不触发筛选。
      const cur = new Set(tempFilterState.get(colKey) ?? []);
      if (cur.has(value)) cur.delete(value);
      else cur.add(value);
      tempFilterState.set(colKey, [...cur]);
      return;
    }
    const cur = new Set(filterState.get(colKey) ?? []);
    if (cur.has(value)) cur.delete(value);
    else cur.add(value);
    filterState.set(colKey, cur);
    emitFilterChange(colKey, [...cur]);
  }
  // 单选（filterMultiple=false）选择：confirm 模式暂存，否则立即生效。
  function selectSingleFilterValue(col: ColumnDef<T>, colKey: string, value: string | number) {
    if (isConfirmMode(col)) {
      tempFilterState.set(colKey, [value]);
      return;
    }
    filterState.set(colKey, new Set([value]));
    emitFilterChange(colKey, [value]);
  }
  // confirm 模式点「确定」：临时值写回生效值并关闭（对齐 Semi）。
  function confirmFilter(col: ColumnDef<T>, colKey: string, opts?: { closeDropdown?: boolean; filteredValue?: (string | number)[] }) {
    const values = opts?.filteredValue ?? tempFilterState.get(colKey) ?? [];
    filterState.set(colKey, new Set(values));
    tempFilterState.set(colKey, [...values]);
    if (opts?.closeDropdown !== false) setFilterOpen(col, colKey, false);
    emitFilterChange(colKey, [...values]);
  }
  // confirm 模式点「重置」：恢复到打开面板时的初始状态（不关闭面板，对齐 Semi）。
  function resetTempFilter(col: ColumnDef<T>, colKey: string) {
    tempFilterState.set(colKey, [...effectiveFilterValues(col, colKey)]);
  }
  // renderFilterDropdown 的 clear：清空筛选值与临时值（对齐 Semi）。
  function clearFilter(col: ColumnDef<T>, colKey: string, opts?: { closeDropdown?: boolean }) {
    filterState.set(colKey, new Set());
    tempFilterState.set(colKey, []);
    if (opts?.closeDropdown !== false) setFilterOpen(col, colKey, false);
    emitFilterChange(colKey, []);
  }
  // 筛选变化：单列 onFilterChange + 聚合 onChange。dataIndex 优先列 dataIndex，回退 colKey。
  function emitFilterChange(colKey: string, values: (string | number)[]) {
    const col = leafColumns.find((c, i) => colKeyOf(c, i) === colKey);
    onFilterChange?.({ dataIndex: col?.dataIndex ?? colKey, values });
    emitChange('filter');
  }
  // 行是否通过某列筛选：选中值任一 onFilter 命中（缺省按 dataIndex 全等）。
  function rowPassesColumn(col: ColumnDef<T>, colKey: string, record: T): boolean {
    const selected = filterState.get(colKey);
    if (!selected || selected.size === 0) return true;
    const test =
      col.onFilter ??
      ((value: string | number, rec: T): boolean =>
        col.dataIndex ? rec[col.dataIndex] === value : false);
    for (const v of selected) {
      if (test(v, record)) return true;
    }
    return false;
  }

  // 合并某列的有效筛选值：filteredValue（受控）优先，否则本地 filterState。
  function effectiveFilterValues(col: ColumnDef<T>, colKey: string): Set<string | number> {
    if (col.filteredValue !== undefined) {
      if (col.filteredValue === null) return new Set();
      return new Set(col.filteredValue);
    }
    return filterState.get(colKey) ?? new Set();
  }
  function isEffectivelyFiltered(col: ColumnDef<T>, colKey: string): boolean {
    return effectiveFilterValues(col, colKey).size > 0;
  }

  // --- 数据管道：列筛选 → 排序（客户端）。状态全来自 props / 本地 $state，派生安全 (红线 #2) ---
  const processed = $derived.by(() => {
    let data = [...dataSource];
    // 列筛选（多列 AND）
    for (let i = 0; i < leafColumns.length; i++) {
      const col = leafColumns[i] as ColumnDef<T>;
      const ck = colKeyOf(col, i);
      if (isEffectivelyFiltered(col, ck)) {
        const selected = effectiveFilterValues(col, ck);
        const test =
          col.onFilter ??
          ((value: string | number, rec: T): boolean =>
            col.dataIndex ? rec[col.dataIndex] === value : false);
        const passes = (rec: T): boolean => {
          for (const v of selected) {
            if (test(v, rec)) return true;
          }
          return false;
        };
        if (col.filterChildrenRecord) {
          // 树形子级本地过滤：子级命中则父级保留（对齐 Semi filterChildrenRecord）。
          // 递归裁剪 children 字段：自身命中保留整行；否则保留命中的子孙分支。
          const childKey = childrenRecordName ?? 'children';
          const prune = (records: T[]): T[] => {
            const out: T[] = [];
            for (const rec of records) {
              const kids = rec[childKey];
              const prunedKids = Array.isArray(kids) ? prune(kids as T[]) : [];
              if (passes(rec)) {
                out.push(rec);
              } else if (prunedKids.length > 0) {
                out.push({ ...rec, [childKey]: prunedKids });
              }
            }
            return out;
          };
          data = prune(data);
        } else {
          data = data.filter(passes);
        }
      }
    }
    const { key, order } = currentSort;
    if (key && order) {
      let target: ColumnDef<T> | undefined;
      leafColumns.forEach((col, i) => {
        if (colKeyOf(col, i) === key) target = col;
      });
      if (target && target.sorter) {
        const dataIndex = target.dataIndex;
        const sorterFn = target.sorter;
        const compare =
          typeof sorterFn === 'function'
            ? (a: T, b: T): number => sorterFn(a, b, order)
            : (a: T, b: T): number => {
                if (!dataIndex) return 0;
                const av = a[dataIndex];
                const bv = b[dataIndex];
                if (av == null && bv == null) return 0;
                if (av == null) return -1;
                if (bv == null) return 1;
                if (typeof av === 'number' && typeof bv === 'number') return av - bv;
                return String(av).localeCompare(String(bv));
              };
        if (target.sortChildrenRecord) {
          // 树形子级本地排序：每层 children 也按同一比较器排序（对齐 Semi sortChildrenRecord）。
          const childKey = childrenRecordName ?? 'children';
          const deepSort = (records: T[]): T[] =>
            applySort(records, order, compare).map((rec) => {
              const kids = rec[childKey];
              if (Array.isArray(kids) && kids.length > 0) {
                return { ...rec, [childKey]: deepSort(kids as T[]) };
              }
              return rec;
            });
          data = deepSort(data);
        } else {
          data = applySort(data, order, compare);
        }
      }
    }
    return data;
  });

  // --- 分页：受控 currentPage 不回写 (红线 #1) ---
  // virtualized 与分页互斥：虚拟滚动时全量渲染滚动，忽略 pagination（取舍见 props 注释）。
  const paginationEnabled = $derived(!virtualized && pagination !== false);
  const pageSize = $derived(pagination ? (pagination.pageSize ?? 10) : 10);
  const controlledPage = $derived(pagination ? pagination.currentPage : undefined);
  const isPageControlled = $derived(controlledPage !== undefined);
  let innerPage = $state(initPage());
  function initPage(): number {
    return pagination ? (pagination.defaultCurrentPage ?? 1) : 1;
  }
  const currentPage = $derived(controlledPage ?? innerPage);

  // 受控远程分页可传 pagination.total 覆盖本地数据长度（对齐 Semi）。
  const total = $derived(
    pagination && pagination.total !== undefined ? pagination.total : processed.length,
  );
  // 分页器位置（对齐 Semi position），默认 bottom。
  const paginationPosition = $derived(
    (pagination && pagination.position) || 'bottom',
  );
  // 分页 range 文案（对齐 Semi Table pageText / formatPageText）：
  // formatPageText=false 关闭；函数时自定义；缺省用 locale 的 pageText。
  const pageRangeText = $derived.by<string | null>(() => {
    const fmt = pagination ? pagination.formatPageText : undefined;
    if (fmt === false) return null;
    const info = {
      currentStart: total === 0 ? 0 : (currentPage - 1) * pageSize + 1,
      currentEnd: Math.min(currentPage * pageSize, total),
      total,
    };
    if (typeof fmt === 'function') return fmt(info);
    return loc().t('Table.pageText', info);
  });
  // 受控模式下 Table 不再对 dataSource 分页（对齐 Semi：受控时传入当前页数据）。
  const visibleRows = $derived(
    paginationEnabled && !isPageControlled
      ? paginate(processed, currentPage, pageSize)
      : processed,
  );

  // --- 行选择：受控 selectedRowKeys 不回写 (红线 #1) ---
  const isSelectionControlled = $derived(
    rowSelection?.selectedRowKeys !== undefined,
  );
  let innerSelected = $state<RowKey[]>(initSelected());
  function initSelected(): RowKey[] {
    return [...(rowSelection?.defaultSelectedRowKeys ?? [])];
  }
  const currentSelectedKeys = $derived<RowKey[]>(
    isSelectionControlled
      ? (rowSelection?.selectedRowKeys ?? [])
      : innerSelected,
  );
  const selectedSet = $derived(new Set(currentSelectedKeys));

  // --- 树形数据（嵌套行）---
  // tree 启用时：filter/sort/paginate 作用于顶层行(processed/visibleRows)，
  // 然后据展开态把可见顶层行扁平化为带 level/hasChildren 的渲染行列表。
  const treeEnabled = $derived(tree === true);
  const indentSize = $derived(indentSizeProp);

  function getChildren(record: T): T[] | undefined {
    const kids = record[childrenRecordName ?? 'children'];
    return Array.isArray(kids) ? (kids as T[]) : undefined;
  }

  // --- 树形行选择父子联动 ---
  // checkStrictly 默认 false=联动；true 时父子独立（与非树形逐行选择一致，向后兼容）。
  // 联动仅在树形 + 有行选择时生效。联动态下 base 选中集为叶子级，经纯函数
  // conductRows(顶层可见行树) 派生 {checked, half}（红线 #2：纯函数 + $derived）。
  // checkRelation（对齐 Semi）显式传入时优先：'related'=联动，'unRelated'=独立；
  // 缺省沿用 checkStrictly（默认 false=联动）。
  const treeCheckable = $derived.by(() => {
    if (!treeEnabled || rowSelection === undefined) return false;
    if (rowSelection.checkRelation !== undefined) return rowSelection.checkRelation === 'related';
    return rowSelection.checkStrictly !== true;
  });
  const rowDisabledFn = (record: T): boolean =>
    rowSelection?.getCheckboxProps?.(record)?.disabled ?? false;
  // 联动选择派生：覆盖整棵可见顶层行树（含未展开的子行）。
  const conducted = $derived.by(() => {
    if (!treeCheckable) return { checked: selectedSet, half: new Set<RowKey>() };
    return conductRows(visibleRows, selectedSet, getKey, getChildren, rowDisabledFn);
  });

  // --- 展开状态：单一顶层架构（对齐 Semi Table.tsx expandedRowKeys/onExpand/
  // onExpandedRowsChange 均为顶层 prop，无 expandable/tree 嵌套状态对象，见
  // foundation.ts handleRowExpanded：一份 expandedRowKeys 数组同时驱动
  // expandedRowRender 展开行渲染与树形 children 渲染）。受控 expandedRowKeys
  // 不回写，仅经 onExpand(单行)/onExpandedRowsChange(全量展开记录数组) 通知 (红线 #1)。
  const hasExpandedRowRender = $derived(expandedRowRender !== undefined);
  // 展开按钮是否占独立前置列：hideExpandedColumn=false 时独立成列；默认 true 并入首列（对齐 Semi）。
  const expandAsColumn = $derived(hasExpandedRowRender && hideExpandedColumn === false);
  const isExpandControlled = $derived(expandedRowKeys !== undefined);
  let innerExpanded = $state<RowKey[]>(initExpanded());
  function initExpanded(): RowKey[] {
    if (defaultExpandedRowKeys) {
      return [...defaultExpandedRowKeys];
    }
    if (defaultExpandAllRows) {
      // 递归收集所有「应展开」的行 key：有 expandedRowRender 时全部顶层行；
      // 树形时额外收集所有含子行的行（含嵌套层级）。
      const keys: RowKey[] = [];
      const walk = (records: T[], isTop: boolean): void => {
        for (const r of records) {
          const k = getKey(r);
          const kids = treeEnabled ? getChildren(r) : undefined;
          const hasKids = !!kids && kids.length > 0;
          if ((isTop && hasExpandedRowRender) || hasKids) keys.push(k);
          if (hasKids) walk(kids!, false);
        }
      };
      walk(dataSource, true);
      return keys;
    }
    return [];
  }
  // expandAllRows=true 时展开全部「可展开」的行（对齐 Semi expandAllRows，覆盖其余展开态）：
  // 有 expandedRowRender 时全部顶层行；树形时全部含子行的行（含嵌套层级）。
  const allExpandableKeys = $derived.by<RowKey[]>(() => {
    if (expandAllRows !== true) return [];
    const keys: RowKey[] = [];
    const walk = (records: T[], isTop: boolean): void => {
      for (const r of records) {
        const kids = treeEnabled ? getChildren(r) : undefined;
        const hasKids = !!kids && kids.length > 0;
        if ((isTop && hasExpandedRowRender) || hasKids) keys.push(getKey(r));
        if (hasKids) walk(kids!, false);
      }
    };
    walk(dataSource, true);
    return keys;
  });
  const expandedSet = $derived<Set<RowKey>>(
    expandAllRows === true
      ? new Set(allExpandableKeys)
      : new Set(isExpandControlled ? (expandedRowKeys ?? []) : innerExpanded),
  );

  function canExpand(record: T): boolean {
    return rowExpandable ? rowExpandable(record) : true;
  }

  // 据 key 集合解析完整 record 数组（含树形嵌套子行），供 onExpandedRowsChange
  // 回传（对齐 Semi onExpandedRowsChange：入参为完整 record 数组而非 key 数组，
  // 实测于 Semi 官方「行可交换的树形数据」demo）。
  function recordsForExpandedKeys(keys: Set<RowKey>): T[] {
    const out: T[] = [];
    const walk = (records: T[]): void => {
      for (const r of records) {
        if (keys.has(getKey(r))) out.push(r);
        const kids = treeEnabled ? getChildren(r) : undefined;
        if (kids) walk(kids);
      }
    };
    walk(dataSource);
    return out;
  }

  function toggleExpand(record: T) {
    if (!canExpand(record)) return;
    const key = getKey(record);
    const next = new Set(expandedSet);
    const willExpand = !next.has(key);
    if (willExpand) next.add(key);
    else next.delete(key);
    if (!isExpandControlled) innerExpanded = [...next];
    onExpand?.(willExpand, record);
    onExpandedRowsChange?.(recordsForExpandedKeys(next));
    onExpandChange?.({ expanded: willExpand, record, expandedRowKeys: [...next] });
  }

  // 扁平化可见行：纯 $derived，不读 effect 写的状态 (红线 #2)。
  // 顶层行已是分页后的 visibleRows；树形时递归展开，否则等价 1:1 映射。
  const displayRows = $derived.by<FlatRow<T>[]>(() => {
    if (!treeEnabled) {
      return visibleRows.map((record, i) => ({
        record,
        key: getKey(record),
        level: 0,
        parentKey: null,
        hasChildren: false,
        topIndex: i,
      }));
    }
    return flattenTreeRows(visibleRows, expandedSet, getKey, getChildren);
  });

  // --- 行虚拟滚动：仅渲染视口内行（复用 core fixedRange 纯函数）---
  // 视口容器自身滚动，scrollTop 由命令式 scroll 回调写入；可见区间纯 $derived
  // 仅依赖本地 $state，render 期只读不读 DOM（红线 #2）。
  const VIRTUAL_OVERSCAN = 4;
  let scrollEl = $state<HTMLDivElement | null>(null);
  // 最外层 wrapper 引用（scrollToFirstRowOnChange 无 scroll.y 时滚入视口）
  let wrapperEl = $state<HTMLDivElement | null>(null);
  // 仅由 scroll 回调写入的本地 scrollTop，render 期只读。
  let scrollTop = $state(0);
  // rAF 节流句柄（非响应式）。
  let rafId = 0;
  // onReachBottom 去抖：仅在「进入触底区」的那一帧触发一次，离开后复位（非响应式）。
  let reachedBottom = false;
  // 横滚位置（固定列阴影按位置显隐，对齐 Semi scroll-position-left/right）：
  // 在最左时隐藏左固定列右阴影，在最右时隐藏右固定列左阴影。初始默认在最左。
  let scrollPosLeft = $state(true);
  let scrollPosRight = $state(false);

  const vRowHeight = $derived(rowHeight > 0 ? rowHeight : 48);
  const vTotalHeight = $derived(displayRows.length * vRowHeight);

  // getVirtualizedListRef：virtualized 时把滚动控制句柄回传给使用方（对齐 Semi）。
  // scrollTo(offset) 直接设 scrollTop；scrollToItem(index) 按行高换算偏移。命令式，非响应式读。
  $effect(() => {
    if (!virtualized || !scrollEl || !getVirtualizedListRef) return;
    const el = scrollEl;
    const rowH = vRowHeight;
    getVirtualizedListRef({
      scrollTo: (offset: number) => {
        el.scrollTop = offset;
      },
      scrollToItem: (index: number) => {
        el.scrollTop = index * rowH;
      },
    });
  });
  const vRange = $derived(
    virtualized
      ? fixedRange(scrollTop, height, vRowHeight, displayRows.length, VIRTUAL_OVERSCAN)
      : { startIndex: 0, endIndex: displayRows.length },
  );
  // 实际喂给 #each 的行集合：virtualized 时只取视口内切片，否则全量。
  const renderRows = $derived(
    virtualized ? displayRows.slice(vRange.startIndex, vRange.endIndex) : displayRows,
  );
  // 上下 spacer 行高度：未渲染的上方/下方行总高，撑出正确总高（保持原生 table 语义）。
  const vTopPad = $derived(virtualized ? vRange.startIndex * vRowHeight : 0);
  const vBottomPad = $derived(
    virtualized ? Math.max(0, (displayRows.length - vRange.endIndex) * vRowHeight) : 0,
  );

  // 滚动监听需附着的容器是否需要纵向滚动能力：
  // 非虚拟化但提供了 onScroll/onReachBottom 时，约束高度并 overflow:auto，
  // 使表体可纵向滚动从而能上报位置/触底（虚拟化已自带固定高度滚动）。
  const scrollBody = $derived(!virtualized && (!!onScroll || !!onReachBottom));

  // 滚动监听（命令式 + rAF 节流 + cleanup）（红线 #3）。
  // 同时服务：① virtualized 视口区间计算（写 scrollTop）② onScroll 位置回调 ③ onReachBottom 触底。
  $effect(() => {
    const el = scrollEl;
    const needScroll = virtualized || !!onScroll || !!onReachBottom;
    if (!el || !needScroll) return;
    const handleScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        if (!el) return;
        if (virtualized) scrollTop = el.scrollTop;
        const { scrollLeft, scrollTop: sTop, scrollWidth, clientWidth, scrollHeight, clientHeight } = el;
        const atBottom = sTop + clientHeight >= scrollHeight - Math.max(0, reachBottomThreshold) - 1;
        if (onScroll) {
          onScroll({
            scrollLeft,
            scrollTop: sTop,
            atLeft: scrollLeft <= 0,
            atRight: scrollLeft + clientWidth >= scrollWidth - 1,
            atTop: sTop <= 0,
            atBottom,
          });
        }
        // 触底懒加载：仅在「刚进入触底区」触发一次，离开后复位（避免持续滚动重复触发）。
        if (onReachBottom) {
          if (atBottom && !reachedBottom) {
            reachedBottom = true;
            onReachBottom();
          } else if (!atBottom) {
            reachedBottom = false;
          }
        }
      });
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', handleScroll);
      reachedBottom = false;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };
  });

  // 横滚位置检测（对齐 Semi scroll-position-left/right）：横滚容器 scrollLeft 决定
  // 左/右固定列阴影显隐，以及 bordered 模式下容器右边框覆盖层显隐（对齐 Semi #441 fix，
  // 详见 .cd-table-wrapper-bordered::after 规则）——不限定 hasFixed：Semi 该 class 是
  // 无条件挂在 wrapCls 上的通用横滚位置状态，服务多个消费场景，不只是固定列阴影；
  // 此前限定 hasFixed 会导致纯 scroll.x（无 fixed 列）横滚到底时该 class 永不挂载。
  // 命令式监听 + 初始同步，写本地 $state 只加 class（红线 #3）。
  let hRafId = 0;
  $effect(() => {
    const el = scrollEl;
    if (!el) return;
    const update = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      // scrollLeft 在 RTL 下可能为负，取绝对值判定边缘
      const sl = Math.abs(scrollLeft);
      scrollPosLeft = sl <= 0;
      scrollPosRight = sl + clientWidth >= scrollWidth - 1;
    };
    update(); // 初始同步（内容未溢出时 both true，阴影都隐藏）
    const onHScroll = () => {
      if (hRafId) return;
      hRafId = requestAnimationFrame(() => {
        hRafId = 0;
        update();
      });
    };
    el.addEventListener('scroll', onHScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onHScroll);
      if (hRafId) {
        cancelAnimationFrame(hRafId);
        hRafId = 0;
      }
    };
  });

  // 双 table 场景横向滚动同步（对齐 Semi handleBodyScrollLeft）：Body 是横向滚动的
  // 权威来源（用户在 Body 上横滚），HeadTable 的 wrapper div 只读不可交互
  // （overflow-x:hidden），每次 Body scroll 事件命令式把 scrollLeft 写过去。
  // 与上面固定列阴影检测effect分离（各自关注点独立），同样 rAF 节流 + cleanup（红线 #3）。
  let headSyncRafId = 0;
  $effect(() => {
    const el = scrollEl;
    const head = headWrapEl;
    if (!el || !head || !useFixedHeader) return;
    const sync = () => {
      head.scrollLeft = el.scrollLeft;
    };
    sync(); // 初始同步
    const onScrollSync = () => {
      if (headSyncRafId) return;
      headSyncRafId = requestAnimationFrame(() => {
        headSyncRafId = 0;
        sync();
      });
    };
    el.addEventListener('scroll', onScrollSync, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScrollSync);
      if (headSyncRafId) {
        cancelAnimationFrame(headSyncRafId);
        headSyncRafId = 0;
      }
    };
  });

  // 全选范围 = 当前渲染行集（树形含已展开的子行）；半选据可见行计算
  const visibleKeys = $derived(displayRows.map((r) => r.key));
  const disabledSet = $derived.by(() => {
    const set = new Set<RowKey>();
    const getProps = rowSelection?.getCheckboxProps;
    if (getProps) {
      for (const r of displayRows) {
        if (getProps(r.record).disabled) set.add(r.key);
      }
    }
    return set;
  });
  // 全选状态：联动态据「整棵可见行树」的顶层行 checked/half 计算
  // （顶层行全 checked → 全选；任一 half 或部分 checked → 半选），
  // 否则沿用扁平可见行的 selectAllState。
  const topKeys = $derived(visibleRows.map((r) => getKey(r)));
  const headerSelect = $derived.by(() => {
    if (!treeCheckable) return selectAllState(visibleKeys, selectedSet, disabledSet);
    const tops = topKeys.filter((k) => !disabledSet.has(k));
    if (tops.length === 0) return { checked: false, indeterminate: false };
    const allChecked = tops.every((k) => conducted.checked.has(k));
    const anyMarked = tops.some(
      (k) => conducted.checked.has(k) || conducted.half.has(k),
    );
    return { checked: allChecked, indeterminate: !allChecked && anyMarked };
  });

  // 选择功能启用（状态/回调生效）；rowSelection.hidden=true 时选择列不渲染
  // （配合 useFullRender 把 selection 物料摆进任意单元格，对齐 Semi hidden）。
  const selectionEnabled = $derived(rowSelection !== undefined);
  const hasSelection = $derived(selectionEnabled && rowSelection?.hidden !== true);
  const colSpan = $derived(
    leafColumns.length + (hasSelection ? 1 : 0) + (expandAsColumn ? 1 : 0),
  );

  // 表头行内联 style：headerStyle 支持字符串或键值对象，统一序列化为 style 字符串。
  const headerStyleStr = $derived.by(() => {
    if (headerStyle == null) return undefined;
    if (typeof headerStyle === 'string') return headerStyle;
    return Object.entries(headerStyle)
      .map(([k, v]) => `${k}:${v}`)
      .join(';');
  });

  // --- 选择变更：回调取对应行对象 ---
  // 联动树形需含未展开的子行，故据整棵可见行树建 key→record 映射；
  // 非树形/严格态沿用扁平 displayRows。
  const keyRecordMap = $derived.by(() => {
    const map = new Map<RowKey, T>();
    if (treeCheckable) {
      const walk = (record: T): void => {
        map.set(getKey(record), record);
        const kids = getChildren(record);
        if (kids) for (const c of kids) walk(c);
      };
      for (const r of visibleRows) walk(r);
    } else {
      for (const r of displayRows) map.set(r.key, r.record);
    }
    return map;
  });
  function rowsForKeys(keys: RowKey[]): T[] {
    const result: T[] = [];
    for (const k of keys) {
      const r = keyRecordMap.get(k);
      if (r !== undefined) result.push(r);
    }
    return result;
  }

  // next 是叶子级 base 集（联动态可经 conductRows round-trip）。
  // 内部态存 base；onChange 联动态回传含父行的完整 checked 集 + 行。
  function emitSelection(next: Set<RowKey>) {
    if (!isSelectionControlled) innerSelected = [...next];
    if (treeCheckable) {
      const { checked } = conductRows(visibleRows, next, getKey, getChildren, rowDisabledFn);
      const keys = [...checked];
      const rows = rowsForKeys(keys);
      rowSelection?.onChange?.(keys, rows);
      onSelectChange?.({ selectedRowKeys: keys, selectedRows: rows });
    } else {
      const keys = [...next];
      const rows = rowsForKeys(keys);
      rowSelection?.onChange?.(keys, rows);
      onSelectChange?.({ selectedRowKeys: keys, selectedRows: rows });
    }
  }

  function onToggleAll() {
    // radio 模式无全选
    if (rowSelection?.type === 'radio') return;
    if (treeCheckable) {
      // 全选：勾全部可见顶层行（连带后代叶子）；已全选则清空。
      const tops = topKeys.filter((k) => !disabledSet.has(k));
      const allChecked = tops.length > 0 && tops.every((k) => conducted.checked.has(k));
      let next = new Set(selectedSet);
      for (const k of tops) {
        // 目标态：全选则要 off，否则要 on；与当前态不符才 toggle
        const isOn = conducted.checked.has(k);
        if (allChecked === isOn) {
          next = toggleRowCheck(visibleRows, next, k, getKey, getChildren, rowDisabledFn);
        }
      }
      const wasSelected = allChecked;
      emitSelection(next);
      // onSelectAll 回调
      if (rowSelection?.onSelectAll) {
        const { checked } = treeCheckable
          ? conductRows(visibleRows, next, getKey, getChildren, rowDisabledFn)
          : { checked: next };
        const selectedRows = rowsForKeys([...checked]);
        // changedRows: 非 disabled 的顶层行对应记录
        const changedRows = tops.map((k) => keyRecordMap.get(k)).filter((r): r is T => r !== undefined);
        rowSelection.onSelectAll(!wasSelected, selectedRows, changedRows);
      }
      return;
    }
    const prevKeys = [...selectedSet];
    const next = toggleSelectAll(visibleKeys, selectedSet, disabledSet);
    emitSelection(next);
    // onSelectAll 回调
    if (rowSelection?.onSelectAll) {
      const nextKeys = [...next];
      const isNowSelected = nextKeys.length > prevKeys.length;
      const selectedRows = rowsForKeys(nextKeys);
      const changedKeys = isNowSelected
        ? nextKeys.filter((k) => !selectedSet.has(k))
        : prevKeys.filter((k) => !next.has(k));
      const changedRows = rowsForKeys(changedKeys);
      rowSelection.onSelectAll(isNowSelected, selectedRows, changedRows);
    }
  }

  function onToggleRow(record: T) {
    const key = getKey(record);
    if (disabledSet.has(key)) return;
    const isRadio = rowSelection?.type === 'radio';
    if (isRadio) {
      // 单选：直接将选中集设为该行
      const next = new Set<RowKey>([key]);
      const wasSelected = selectedSet.has(key);
      emitSelection(next);
      rowSelection?.onSelect?.(record, !wasSelected, rowsForKeys([...next]));
      return;
    }
    const wasSelected = selectedSet.has(key);
    if (treeCheckable) {
      const next = toggleRowCheck(visibleRows, selectedSet, key, getKey, getChildren, rowDisabledFn);
      emitSelection(next);
      const { checked } = conductRows(visibleRows, next, getKey, getChildren, rowDisabledFn);
      rowSelection?.onSelect?.(record, !wasSelected, rowsForKeys([...checked]));
      return;
    }
    const next = toggleRow(selectedSet, key);
    emitSelection(next);
    rowSelection?.onSelect?.(record, !wasSelected, rowsForKeys([...next]));
  }

  // --- 聚合 onChange 载荷快照（读 render 期派生态，仅在事件回调内调用，红线 #2）---
  // 当前各列筛选选中值（colKey → values[]），仅含非空筛选列。
  function snapshotFilters(): Record<string, (string | number)[]> {
    const out: Record<string, (string | number)[]> = {};
    leafColumns.forEach((col, i) => {
      const ck = colKeyOf(col, i);
      const vals = filterState.get(ck);
      if (vals && vals.size > 0) out[ck] = [...vals];
    });
    return out;
  }
  // 触发聚合 onChange：sorterOverride/pageOverride 让排序/分页变化时用「即将生效」的值，
  // 因 $derived 在同步事件回调内尚未重算（受控时本就不回写）。
  function emitChange(
    action: TableChangeAction,
    sorterOverride?: SortState,
    pageOverride?: number,
  ) {
    onChange?.({
      pagination: {
        current: pageOverride ?? currentPage,
        pageSize,
      },
      filters: snapshotFilters(),
      sorter: sorterOverride ?? currentSort,
      extra: { action },
    });
    maybeScrollToFirstRow();
  }

  // scroll.scrollToFirstRowOnChange：分页/排序/筛选变化后滚到表格顶部（对齐 Semi）。
  // scroll.y 时重置表体内部滚动到顶；否则把表格滚入视口顶部。命令式写 DOM，非响应式。
  function maybeScrollToFirstRow() {
    if (!scroll?.scrollToFirstRowOnChange) return;
    if (scroll.y != null && scrollEl) {
      scrollEl.scrollTop = 0;
    } else if (wrapperEl) {
      wrapperEl.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  }

  // --- 排序点击 ---
  function onSort(col: ColumnDef<T>, index: number) {
    const key = colKeyOf(col, index);
    const next = toggleSort(currentSort, key);
    if (!isSortControlled) innerSort = next;
    onSortChange?.(next);
    emitChange('sort', next);
    announceSort(col, next);
  }

  // 排序变化播报：升/降序播 sortedAnnounce（含列名 + 方向），三态循环到 null 播 sortClearedAnnounce。
  function announceSort(col: ColumnDef<T>, next: SortState) {
    const column = columnLabel(col);
    if (next.order) {
      const order = loc().t(
        next.order === 'ascend' ? 'Table.sortOrderAscend' : 'Table.sortOrderDescend',
      );
      announcer.announce(loc().t('Table.sortedAnnounce', { column, order }));
    } else {
      announcer.announce(loc().t('Table.sortClearedAnnounce', { column }));
    }
  }

  // 列的可读名：title 为字符串时直接用，否则回退列 dataIndex/key（Snippet title 无文本可取）。
  function columnLabel(col: ColumnDef<T>): string {
    return typeof col.title === 'string' ? col.title : String(col.dataIndex ?? col.key ?? '');
  }

  function ariaSortFor(col: ColumnDef<T>, index: number): 'ascending' | 'descending' | 'none' {
    const order = col.sortOrder !== undefined
      ? col.sortOrder
      : (currentSort.key === colKeyOf(col, index) ? currentSort.order : null);
    if (!order) return 'none';
    return order === 'ascend' ? 'ascending' : 'descending';
  }

  // --- 分页变更 ---
  function onPageChange(page: number) {
    if (!isPageControlled) innerPage = page;
    if (pagination) {
      pagination.onPageChange?.(page);
      pagination.onChange?.(page);
    }
    onPaginationChange?.({ current: page, pageSize });
    emitChange('paginate', undefined, page);
  }

  // --- 单元格取值 ---
  function cellValue(col: ColumnDef<T>, record: T): unknown {
    return col.dataIndex ? record[col.dataIndex] : undefined;
  }
  function cellText(value: unknown): string {
    return value == null ? '' : String(value);
  }

  function alignOf(col: ColumnDef<T>): Align {
    return col.align ?? 'left';
  }
  // ellipsis 开启且未显式 showTitle:false 时，td 带原生 title 提示完整文本（对齐 Semi）。
  function cellTitleAttr(col: ColumnDef<T>, value: unknown): string | undefined {
    if (!col.ellipsis) return undefined;
    if (typeof col.ellipsis === 'object' && col.ellipsis.showTitle === false) return undefined;
    const text = cellText(value);
    return text || undefined;
  }
  function widthStyle(col: ColumnDef<T>, index: number): string | undefined {
    const w = resolveWidth(col, index);
    if (w === undefined) return undefined;
    return typeof w === 'number' ? `width:${w}px` : `width:${w}`;
  }
  // ColGroup <col> 宽度：对齐 Semi（width + minWidth 同值），无宽则不设。
  function colGroupStyle(col: ColumnDef<T>, index: number): string | undefined {
    const w = resolveWidth(col, index);
    if (w === undefined) return undefined;
    const v = typeof w === 'number' ? `${w}px` : w;
    return `width:${v};min-width:${v}`;
  }
  // 选择列宽度：rowSelection.columnWidth 优先，否则 Semi 默认 48px（对齐 LEADING_W）。
  const selectionColWidth = $derived(
    typeof rowSelection?.columnWidth === 'number'
      ? rowSelection.columnWidth
      : 48,
  );

  // --- 固定列：JS 实测宽度累加（对齐 Semi TableHeaderRow.cacheRef + arrayAdd） ---
  // selection / expand 前置列宽（与 CSS .cd-table-column-selection/--expand 对齐；
  // 恒定 48px 非可变宽列，不纳入 headWidths 实测，直接用 token 值作为偏移基数）。
  const LEADING_W = 48;
  // 前置 leading 列（expand + selection）的总宽，作为 left 固定列偏移基数
  const leadingWidth = $derived((expandAsColumn ? LEADING_W : 0) + (hasSelection ? LEADING_W : 0));
  // fixed 归一化：true 等效 'left'（对齐 Semi）。
  const fixedOf = (c: ColumnDef<T>): 'left' | 'right' | undefined =>
    c.fixed === true ? 'left' : c.fixed || undefined;
  const hasFixed = $derived(leafColumns.some((c) => fixedOf(c)));
  // 固定列时 table 的最小总宽（列宽和 + 前置列），撑过容器以触发横滚
  const totalMinWidth = $derived(
    leadingWidth +
      leafColumns.reduce((sum, c, i) => {
        const w = resolveWidth(c, i);
        return sum + (typeof w === 'number' ? w : 120);
      }, 0),
  );
  const tableStyle = $derived(hasFixed ? `min-width:${totalMinWidth}px` : undefined);

  function colNumWidth(col: ColumnDef<T>, index: number): number {
    const w = resolveWidth(col, index);
    return typeof w === 'number' ? w : 0;
  }

  // --- headWidths 实测：对齐 Semi state.headWidths（按表头层级分组的 {key,width}[]）。
  //     TableHeaderRow.cacheRef 等价物——每层表头 <tr> 挂载/更新后测量其叶子 <th>
  //     宽度（数值 column.width 优先，否则 getBoundingClientRect() 实测），写入本状态。
  //     写入前做值比较去重（headWidthsEqual），避免"测量→写→触发依赖 headWidths 的
  //     effect 重跑→再次测量"的自循环（红线 #2：measureHeaderLevel 只在挂载/依赖变化
  //     的 $effect 里调用，写入的是与测量无关的独立 $state，不读自身触发源）。
  let headWidths = $state<HeadWidthEntry[][]>([]);
  function setHeadWidthsLevel(index: number, widths: HeadWidthEntry[]) {
    const prev = headWidths[index];
    if (prev && headWidthsEqual(prev, widths)) return;
    const next = headWidths.slice();
    next[index] = widths;
    headWidths = next;
  }
  // 单层表头 <tr> 实测：row 是该层表头格序列（含叶子列与分组列，与 DOM 内 .cd-table-row-head
  // 顺序一一对应，对齐 Semi row/heads 位置映射）。skipLeading 跳过 row 0 前置的
  // expand/selection th（本库把它们当独立恒宽列处理，不纳入 leafColumns/headWidths，
  // 与 Semi 把它们规整为合成 column 不同——已知的架构差异，见 Body 侧 leadingWidth 常量）。
  function measureHeaderRow(node: HTMLElement | null, row: { col: ColumnDef<T>; leafIndex: number; isLeaf: boolean }[], level: number, skipLeading = 0) {
    if (!node) return;
    const allHeads = node.querySelectorAll<HTMLElement>('.cd-table-row-head');
    const heads = skipLeading > 0 ? Array.from(allHeads).slice(skipLeading) : allHeads;
    const widths: HeadWidthEntry[] = [];
    heads.forEach((head, i) => {
      const cell = row[i];
      if (!cell) return;
      const key = cell.isLeaf ? colKeyOf(cell.col, cell.leafIndex) : (typeof cell.col.title === 'string' ? cell.col.title : (cell.col.key ?? String(i)));
      let width = cell.isLeaf ? resolveWidth(cell.col, cell.leafIndex) : undefined;
      if (typeof width !== 'number') {
        width = head.getBoundingClientRect().width || 0;
      }
      widths.push({ key: String(key), width: width as number });
    });
    setHeadWidthsLevel(level, widths);
  }
  // 表头行 <tr> DOM 引用：level 0（首行，可能含 expand/selection rowspan 占位后接叶子/分组格）
  // + 合并模式下 headerRows.slice(1) 的后续层。
  let headerRowEl0 = $state<HTMLElement | null>(null);
  let headerRowElsRest: (HTMLElement | null)[] = $state([]);
  // 该层需要测量的「格序列」：level 0 用 headerRows[0]（合并模式）或 leafColumns 映射的
  // 叶子格（非合并模式，rowSpan=1 单层），其余层用 headerRows[level]。
  const headerLevel0Row = $derived.by<{ col: ColumnDef<T>; leafIndex: number; isLeaf: boolean }[]>(() =>
    hasHeaderMerge ? (headerRows[0] ?? []) : leafColumns.map((col, i) => ({ col, leafIndex: i, isLeaf: true as const })),
  );
  const leadingColCount = $derived((expandAsColumn ? 1 : 0) + (hasSelection ? 1 : 0));
  $effect(() => {
    // 依赖：列结构变化（leafColumns/headerRows 引用变化）与拖拽覆盖宽度变化触发重测；
    // 只读 DOM ref 与派生列表，不读 headWidths 自身，避免自触发循环。
    void headerLevel0Row;
    void widthOverrides.size;
    void leadingColCount;
    if (showHeader && headerRowEl0) {
      measureHeaderRow(headerRowEl0, headerLevel0Row, 0, leadingColCount);
    }
  });
  $effect(() => {
    void headerRows;
    void widthOverrides.size;
    if (showHeader && hasHeaderMerge) {
      const rest = headerRows.slice(1);
      rest.forEach((hrow, ri) => {
        const el = headerRowElsRest[ri];
        if (el) measureHeaderRow(el, hrow, ri + 1);
      });
    }
  });

  // Body 侧消费同一份 headWidths：按 leafColumns 的 key 顺序取实测宽度数组
  // （对齐 Semi Body getCellWidths(flattenedColumns)，表头与单元格共享同一份数据源）。
  const leafCellWidths = $derived(getCellWidths(leafColumns.map((c, i) => colKeyOf(c, i)), headWidths));

  // 每个数据列的 left 偏移（左固定列）：前置宽 + 之前所有左固定列宽之和（arrayAdd 实测累加）
  const fixedLeftOffsets = $derived.by(() => {
    const out: (number | null)[] = new Array(leafColumns.length).fill(null);
    if (!leafCellWidths.length) return out;
    for (let i = 0; i < leafColumns.length; i++) {
      const col = leafColumns[i] as ColumnDef<T>;
      if (fixedOf(col) === 'left') {
        out[i] = leadingWidth + arrayAdd(leafCellWidths, 0, i);
      }
    }
    return out;
  });
  // 每个数据列的 right 偏移（右固定列）：之后所有右固定列宽之和（arrayAdd 实测累加）
  const fixedRightOffsets = $derived.by(() => {
    const out: (number | null)[] = new Array(leafColumns.length).fill(null);
    if (!leafCellWidths.length) return out;
    for (let i = leafColumns.length - 1; i >= 0; i--) {
      const col = leafColumns[i] as ColumnDef<T>;
      if (fixedOf(col) === 'right') {
        out[i] = arrayAdd(leafCellWidths, i + 1);
      }
    }
    return out;
  });
  // 最后一个左固定列 / 第一个右固定列索引（用于阴影边界）
  const lastLeftFixed = $derived.by(() => {
    let idx = -1;
    leafColumns.forEach((c, i) => {
      if (fixedOf(c) === 'left') idx = i;
    });
    return idx;
  });
  const firstRightFixed = $derived(leafColumns.findIndex((c) => fixedOf(c) === 'right'));

  // RTL：语义上「固定在左端」的列在 RTL 下视觉挂在右边（对齐 Semi TableCell.tsx/
  // TableHeaderRow.tsx getTdProps()：isRTL 时 sticky 的 CSS 属性名与 -left-last/
  // -right-first class 归属都互换，非只翻文字方向）。
  const isRtl = $derived(direction === 'rtl');

  // 组合某数据列的 sticky 行内样式（含宽度）
  function cellStyle(col: ColumnDef<T>, i: number): string | undefined {
    const parts: string[] = [];
    const w = widthStyle(col, i);
    if (w) parts.push(w);
    const left = fixedLeftOffsets[i];
    const right = fixedRightOffsets[i];
    if (left != null) parts.push(`position:sticky`, `${isRtl ? 'right' : 'left'}:${left}px`);
    else if (right != null) parts.push(`position:sticky`, `${isRtl ? 'left' : 'right'}:${right}px`);
    return parts.length ? parts.join(';') : undefined;
  }

  function fixedCellClass(i: number): string {
    if (fixedLeftOffsets[i] != null) {
      const lastClass = isRtl ? 'cd-table-cell-fixed-right-first' : 'cd-table-cell-fixed-left-last';
      const sideClass = isRtl ? 'cd-table-cell-fixed-right' : 'cd-table-cell-fixed-left';
      return `cd-table-cell-fixed ${sideClass}${i === lastLeftFixed ? ` ${lastClass}` : ''}`;
    }
    if (fixedRightOffsets[i] != null) {
      const firstClass = isRtl ? 'cd-table-cell-fixed-left-last' : 'cd-table-cell-fixed-right-first';
      const sideClass = isRtl ? 'cd-table-cell-fixed-left' : 'cd-table-cell-fixed-right';
      return `cd-table-cell-fixed ${sideClass}${i === firstRightFixed ? ` ${firstClass}` : ''}`;
    }
    return '';
  }

  // 前置 leading 列在存在左固定列时也需 sticky 锁定在最左（RTL 下锁在视觉右端）
  function leadingStyle(slot: 'expand' | 'selection'): string | undefined {
    if (!hasFixed || lastLeftFixed < 0) return undefined;
    const offset = slot === 'expand' ? 0 : expandAsColumn ? LEADING_W : 0;
    return `position:sticky;${isRtl ? 'right' : 'left'}:${offset}px`;
  }
  const leadingFixedClass = $derived(
    hasFixed && lastLeftFixed >= 0 ? `cd-table-cell-fixed ${isRtl ? 'cd-table-cell-fixed-right' : 'cd-table-cell-fixed-left'}` : '',
  );

  // 单元格 style 合并：把 onCell 返回的自定义 style 追加到该 td 已有的 sticky/宽度 style 之后。
  function mergeCellStyle(base: string | undefined, extra: string | undefined): string | undefined {
    if (!extra) return base;
    if (!base) return extra;
    return `${base};${extra}`;
  }

  // 表头单元格 style 合并：把 headerStyle（应用到所有 th）追加到该 th 已有的 sticky/宽度 style 之后。
  function mergeHeaderStyle(base: string | undefined): string | undefined {
    if (!headerStyleStr) return base;
    if (!base) return headerStyleStr;
    return `${base};${headerStyleStr}`;
  }

  // --- 半选 indeterminate：用 attachment 命令式写具体 input 元素属性。
  //     仅读派生布尔值并写 DOM，不读几何，写属性不触发响应式，无循环风险 (不违反红线 #3)。
  function indeterminate(value: boolean) {
    return (node: HTMLInputElement) => {
      node.indeterminate = value;
    };
  }

  // --- 双 table 判定（对齐 Semi useFixedHeader）：存在 fixed 列，或需要吸顶/固定高度
  // 滚动表头（isStickyHead 已覆盖 sticky/virtualized/scrollBody/scroll.y）时，
  // thead 与 tbody 拆成两个独立 <table>（HeadTable + Body），JS 同步横向 scrollLeft；
  // 否则维持单一 <table>（thead+tbody 同表，Body includeHeader=true）。
  const isStickyHead = $derived(!!sticky || virtualized || scrollBody || scroll?.y != null);
  const useFixedHeader = $derived(hasFixed || isStickyHead);

  // table-layout：tableLayout 显式传值时覆盖默认推导（对齐 Semi tableLayout）；
  // 缺省 '' 时沿用 Semi getTableLayout() 推导：存在 fixed/ellipsis 列，或
  // useFixedHeader（双 table：sticky/virtualized/scrollBody/scroll.y/固定列）时 fixed，否则 auto。
  const hasEllipsis = $derived(leafColumns.some((c) => !!c.ellipsis));
  const resolvedFixedLayout = $derived(
    tableLayout === 'fixed'
      ? true
      : tableLayout === 'auto'
        ? false
        : hasFixed || hasEllipsis || useFixedHeader,
  );
  const cls = $derived(
    [
      'cd-table',
      `cd-table-${size}`,
      bordered && 'cd-table-bordered',
      stripe && 'cd-table-stripe',
      resolvedFixedLayout && 'cd-table-fixed',
      rowSpanHover && 'cd-table-row-span-hover',
    ]
      .filter(Boolean)
      .join(' '),
  );

  // --- scroll prop: wrapper container style ---
  // scroll.y → max-height + overflow-y:auto; scroll.x → min-width on table
  const scrollWrapStyle = $derived.by(() => {
    const parts: string[] = [];
    if (virtualized || scrollBody) {
      parts.push(`height:${height}px`, 'overflow:auto');
    }
    if (scroll?.y != null) {
      const yVal = typeof scroll.y === 'number' ? `${scroll.y}px` : scroll.y;
      parts.push(`max-height:${yVal}`, 'overflow-y:auto');
    }
    if (scroll?.x != null) {
      parts.push('overflow-x:auto');
    }
    return parts.length ? parts.join(';') : undefined;
  });

  const scrollTableStyle = $derived.by(() => {
    const parts: string[] = [];
    if (scroll?.x != null) {
      // 对齐 Semi（HeadTable/BodyTable：scroll.x 时 tableStyle.width = x）：
      // 用固定 width（物理属性，与 Semi 一致；表格纯尺寸无 RTL 方向性，不影响逻辑属性 RTL 架构）
      // 而非 min-width——表格宽度严格等于 scroll.x，table-layout:fixed 下列宽严格按 col width，
      // 无 width 列吸收剩余。用 min-width 会让表格撑满更宽的容器致有 width 的列被按比例放大
      // （ellipsis 列撑宽后文字不截断、tooltip 失效）。
      const xVal = typeof scroll.x === 'number' ? `${scroll.x}px` : scroll.x;
      parts.push(`width:${xVal}`);
    } else if (tableStyle) {
      // 无 scroll.x 但有固定列：min-width 保证固定列不被压缩（窄容器横滚），
      // 同时 width:100% 撑满容器（对齐 Semi：无 scroll.x 时表格 100%，无 width 列
      // 吸收剩余空间，不塌成固定列总宽致右侧留白）。
      parts.push(tableStyle, 'width:100%');
    }
    return parts.length ? parts.join(';') : undefined;
  });

  // --- sticky prop: thead top offset ---
  const stickyOffset = $derived.by((): number => {
    if (!sticky) return 0;
    if (typeof sticky === 'object' && sticky.top != null) return sticky.top;
    return 0;
  });
  // HeadTable 外层 div 引用：双 table 场景下，Body 横向滚动时命令式把 scrollLeft
  // 写到这里（对齐 Semi handleBodyScrollLeft）。单 table 场景不使用。
  let headWrapEl = $state<HTMLDivElement | null>(null);

  // --- selection column width style ---
  const selectionColStyle = $derived.by((): string | undefined => {
    const parts: string[] = [];
    if (rowSelection?.columnWidth != null) {
      const w = rowSelection.columnWidth;
      parts.push(`width:${typeof w === 'number' ? `${w}px` : w}`);
    }
    if (rowSelection?.fixed) {
      // fixed selection column — sticky at start of row（RTL 下锁在视觉右端）
      parts.push('position:sticky', `${isRtl ? 'right' : 'left'}:0`);
    }
    return parts.length ? parts.join(';') : undefined;
  });
  const selectionFixedClass = $derived(
    rowSelection?.fixed ? `cd-table-cell-fixed ${isRtl ? 'cd-table-cell-fixed-right' : 'cd-table-cell-fixed-left'}` : '',
  );

  // --- groupBy: build grouped display rows ---
  type GroupRow = { type: 'group'; groupKey: string; group: T[]; expanded: boolean; groupIndex: number };
  type DataDisplayRow = FlatRow<T> & { type: 'data' };
  type RenderRow = DataDisplayRow | GroupRow;

  const isGrouped = $derived(groupBy !== undefined);
  // role=grid/treegrid 静态标注（对齐 Semi Body/index.tsx）：分组/展开行/树形时 treegrid，否则 grid。
  // 双 table 场景下 HeadTable 与 Body 各自的 <table> 都用同一 role（对齐 Semi 两表 role 一致）。
  const tableRole = $derived<'grid' | 'treegrid'>(isGrouped || hasExpandedRowRender || treeEnabled ? 'treegrid' : 'grid');

  const groupKeyOf = (record: T): string => {
    if (typeof groupBy === 'function') return groupBy(record);
    return String(record[groupBy as string] ?? '');
  };

  // 有序分组桶：仅顶层行参与分组。纯 $derived（红线 #2）。
  const groupBuckets = $derived.by<{ order: string[]; map: Map<string, T[]> }>(() => {
    const order: string[] = [];
    const map = new Map<string, T[]>();
    if (!groupBy) return { order, map };
    for (const row of displayRows) {
      if (row.level === 0) {
        const gk = groupKeyOf(row.record);
        if (!map.has(gk)) {
          order.push(gk);
          map.set(gk, []);
        }
        map.get(gk)!.push(row.record);
      }
    }
    return { order, map };
  });

  // --- 可折叠分组：受控 expandAllGroupRows 不回写，仅经 onGroupExpandChange 通知 (红线 #1) ---
  // 受控（expandAllGroupRows 定义）时展开态由该值统一决定（true 全展/false 全折）。
  // 非受控时仅记录「用户显式切换过的分组 → 展开态」，未切换的分组回退到默认值：
  // 对齐 Semi（foundation initExpandedRowKeys）：仅 defaultExpandAllGroupRows === true
  // 时默认展开，缺省(undefined)与 false 均默认折叠。默认值纯 $derived、不落地为
  // $state，故数据变化产生的新分组自动继承默认态，无需 effect seed（红线 #2）。
  const isGroupExpandControlled = $derived(expandAllGroupRows !== undefined);
  const groupDefaultExpanded = $derived(defaultExpandAllGroupRows === true);
  // 用户显式覆盖：groupKey → 展开态（未在此表中的分组用 groupDefaultExpanded）。
  const groupOverrides = new SvelteMap<string, boolean>();

  // 某分组是否展开：受控看 expandAllGroupRows，非受控看覆盖表 → 默认值。
  const isGroupExpanded = (groupKey: string): boolean => {
    if (isGroupExpandControlled) return expandAllGroupRows === true;
    return groupOverrides.get(groupKey) ?? groupDefaultExpanded;
  };

  function toggleGroupExpand(groupKey: string) {
    const willExpand = !isGroupExpanded(groupKey);
    if (!isGroupExpandControlled) {
      groupOverrides.set(groupKey, willExpand);
      const expandedKeys = groupBuckets.order.filter((gk) => isGroupExpanded(gk));
      onGroupExpandChange?.({ groupKey, expanded: willExpand, expandedGroupKeys: expandedKeys });
    } else {
      // 受控：不回写，仅通知（回传「若操作生效」后的期望集合，由消费方决定）
      const expandedKeys = expandAllGroupRows === true ? groupBuckets.order.slice() : [];
      onGroupExpandChange?.({ groupKey, expanded: willExpand, expandedGroupKeys: expandedKeys });
    }
  }

  const groupedDisplayRows = $derived.by<RenderRow[]>(() => {
    if (!groupBy) {
      return displayRows.map((r) => ({ ...r, type: 'data' as const }));
    }
    const { order, map } = groupBuckets;
    const result: RenderRow[] = [];
    let groupIndex = 0;
    for (const gk of order) {
      const group = map.get(gk)!;
      const expanded = isGroupExpanded(gk);
      result.push({ type: 'group', groupKey: gk, group, expanded, groupIndex: groupIndex++ });
      // 折叠的分组只渲染分组头，不铺开组内数据行。
      if (!expanded) continue;
      // Include all displayRows belonging to this group (incl. tree children)
      let inGroup = false;
      for (const row of displayRows) {
        if (row.level === 0) {
          inGroup = groupKeyOf(row.record) === gk;
        }
        if (inGroup) result.push({ ...row, type: 'data' as const });
      }
    }
    return result;
  });
</script>

<!-- 展开按钮：expandIcon 自定义图标覆盖默认三角（CustomExpandIcon 组件，对齐 Semi）。 -->
{#snippet expandButton(record: T, key: RowKey)}
  <CustomExpandIcon
    expanded={expandedSet.has(key)}
    componentType="expand"
    {expandIcon}
    {record}
    onClick={() => toggleExpand(record)}
  />
{/snippet}

<!-- 行选择输入框（radio/checkbox，含 rowSelection.renderCell 自定义渲染，ColumnSelection 组件对齐 Semi）。 -->
{#snippet rowSelectionInput(record: T, selected: boolean, rowHalf: boolean, rowDisabled: boolean)}
  <ColumnSelection
    {rowSelection}
    inHeader={false}
    {selected}
    indeterminate={rowHalf}
    disabled={rowDisabled}
    {record}
    onToggle={() => onToggleRow(record)}
  />
{/snippet}

<!-- 最外层 .semi-table-wrapper（含方向 ltr/rtl），对齐 Semi 分层 -->
<div
  class="cd-table-wrapper cd-table-wrapper-{direction} {className ?? ''}"
  class:cd-table-wrapper-rtl={direction === 'rtl'}
  class:cd-table-wrapper-bordered={bordered}
  data-column-fixed={hasFixed ? 'true' : undefined}
  dir={direction}
  {style}
  bind:this={wrapperEl}
>
  {#if children}
    <!-- 组合式 <Column> 收集宿主：display:none 不产生可见/占位 DOM 也不进 a11y 树，
         但仍挂载子组件、跑其 init/effect（注册列元数据），嵌套 Column 逐级 render 触发。 -->
    <div class="cd-table-column-collector" aria-hidden="true" style="display:none">
      {@render children()}
    </div>
  {/if}
  <!-- loading 遮罩：对齐 Semi Table.tsx（<Spin spinning={loading} size="large"> 包裹
       title/pagination/container/footer 整个内容区，非本库此前手写的仅 body 区域遮罩，
       复用本库自己的 Spin 组件而非重新手写 spinner 视觉）。 -->
  <Spin spinning={loading} size="large">
  {#if titleSnippet || title}
    <div class="cd-table-title">
      {#if titleSnippet}{@render titleSnippet()}{:else}{title}{/if}
    </div>
  {/if}
  {#if paginationEnabled && total > 0 && (paginationPosition === 'top' || paginationPosition === 'both')}
    {@render paginationArea()}
  {/if}
  <!-- .semi-table-container：承载 body + footer -->
  <div class="cd-table-container">
    <!-- role=grid/treegrid 静态标注（对齐 Semi Body/index.tsx：分组/展开行/树形时 treegrid，否则 grid）；
         aria-rowcount/aria-colcount 为顶层数据源行数/列数（对齐 Semi，非渲染切片数） -->
    <!-- ColGroup：对齐 Semi，每列一个 <col>，selection/expand 列带对应 class。HeadTable 与 Body
         两处各自 mount 一份、参数相同保证列宽一致（对齐 Semi 双 table 架构，两表各自独立 colgroup）。 -->
  {#snippet colgroupContent()}
    <ColGroup
      {leafColumns}
      {expandAsColumn}
      {hasSelection}
      {selectionColWidth}
      leadingWidth={LEADING_W}
      colKey={colKeyOf}
      colStyle={colGroupStyle}
      tagColgroup={tagColgroupWrapper}
      {tagCol}
    />
  {/snippet}
  {#snippet theadContent()}
    {#if showHeader}
      {@const headerRowProps = onHeaderRow ? onHeaderRow(effectiveColumns, 0) : undefined}
    <svelte:element
      this={tagThead}
      class="cd-table-thead"
    >
      <TableHeaderRow
        variant="leaf"
        tag={tagHeaderRow}
        onRowEl={(el) => (headerRowEl0 = el)}
        {expandAsColumn}
        {hasSelection}
        {hasHeaderMerge}
        {headerDepth}
        {rowSelection}
        {headerSelect}
        {onToggleAll}
        {leadingFixedClass}
        {selectionFixedClass}
        {selectionColStyle}
        {leadingStyle}
        {headerRowProps}
        {leafColumns}
        mergedRow={headerRows[0] ?? []}
        {colKeyOf}
        {alignOf}
        {mergeHeaderStyle}
        {mergeCellStyle}
        {cellStyle}
        {fixedCellClass}
        {columnResizable}
        {ariaSortFor}
        {isEffectivelyFiltered}
        {currentSort}
        {onSort}
        {openFilterKey}
        {closingFilterKey}
        {filterTriggers}
        {resizeHandles}
        onFilterTriggerEl={setFilterTriggerEl}
        onResizeHandleEl={setResizeHandleEl}
        {resizingKey}
        {setFilterOpen}
        {startResize}
        {selectionEnabled}
        {resizeOverrides}
        {columnTitle}
        {filterDropdownPanel}
        locT={(key) => loc().t(key)}
      />
      {#if hasHeaderMerge}
        {#each headerRows.slice(1) as hrow, ri (ri)}
          <TableHeaderRow
            variant="group"
            onRowEl={(el) => (headerRowElsRest[ri] = el)}
            mergedRow={hrow}
            {colKeyOf}
            {alignOf}
            {mergeHeaderStyle}
            {mergeCellStyle}
            {cellStyle}
            {fixedCellClass}
            {columnResizable}
            {ariaSortFor}
            {isEffectivelyFiltered}
            {currentSort}
            {onSort}
            {openFilterKey}
            {closingFilterKey}
            {filterTriggers}
            {resizeHandles}
            onFilterTriggerEl={setFilterTriggerEl}
            onResizeHandleEl={setResizeHandleEl}
            {resizingKey}
            {setFilterOpen}
            {startResize}
            {selectionEnabled}
            {resizeOverrides}
            {columnTitle}
            {filterDropdownPanel}
            locT={(key) => loc().t(key)}
          />
        {/each}
      {/if}
    </svelte:element>
    {/if}
  {/snippet}
  {#snippet columnTitle(col: ColumnDef<T>)}
    {#if typeof col.title === 'string'}{col.title}{:else}{@render (col.title as Snippet<[{ filter?: Snippet; sorter?: Snippet; selection?: Snippet }]>)({})}{/if}
  {/snippet}
    <!-- 筛选浮层面板（string / 自定义 title 复用；触发器绑 filterTriggers[colKey]） -->
    {#snippet filterDropdownPanel(col: ColumnDef<T>, colKey: string)}
      {@const filterMultiple = col.filterMultiple !== false}
      {@const confirmMode = isConfirmMode(col)}
      <div
        class="cd-table-column-filter-dropdown"
        class:cd-table-column-filter-dropdown-motion-show={openFilterKey === colKey}
        class:cd-table-column-filter-dropdown-motion-hide={closingFilterKey === colKey}
        onanimationend={() => finalizeFilterClose(colKey)}
        use:floating={{ trigger: filterTriggers[colKey], placement: 'bottom', autoAdjust: true, offset: 4, getContainer: getPopupContainer }}
        bind:this={filterPanelEl}
      >
        {#if col.renderFilterDropdown}
          {@render col.renderFilterDropdown({
            tempFilteredValue: tempFilterState.get(colKey) ?? [],
            setTempFilteredValue: (values) => void tempFilterState.set(colKey, [...values]),
            confirm: (opts) => confirmFilter(col, colKey, opts?.filteredValue !== undefined ? { closeDropdown: opts?.closeDropdown !== false, filteredValue: opts.filteredValue } : { closeDropdown: opts?.closeDropdown !== false }),
            clear: (opts) => clearFilter(col, colKey, { closeDropdown: opts?.closeDropdown !== false }),
            close: () => setFilterOpen(col, colKey, false),
            ...(col.filters !== undefined ? { filters: col.filters } : {}),
          })}
        {:else}
        {@const checkedSet = confirmMode ? new Set(tempFilterState.get(colKey) ?? []) : activeFilterValues(colKey)}
        <FilterDropdownHost showTick={col.filterDropdownProps?.showTick ?? false}>
        <ul class="cd-table-column-filter-list">
          {#each col.filters ?? [] as f (f.value)}
            {@const checked = checkedSet.has(f.value)}
            {@const onItemChange = () =>
              filterMultiple
                ? toggleFilterValue(col, colKey, f.value)
                : selectSingleFilterValue(col, colKey, f.value)}
            <li class="cd-table-column-filter-item">
              {#if col.renderFilterDropdownItem}
                {@render col.renderFilterDropdownItem({ text: f.text, value: f.value, checked, filteredValue: [...checkedSet], filterMultiple, onChange: onItemChange })}
              {:else}
              <label class="cd-table-column-filter-label">
                {#if filterMultiple}
                  <input type="checkbox" {checked} onchange={onItemChange} />
                {:else}
                  <input type="radio" name="cd-filter-{colKey}" {checked} onchange={onItemChange} />
                {/if}
                <span>{f.text}</span>
              </label>
              {/if}
            </li>
          {/each}
        </ul>
        </FilterDropdownHost>
        <!-- 重置/确定按钮仅 confirm 模式显示（对齐 Semi ColumnFilter.tsx:148-152
             "Show confirm and reset buttons in confirm mode"：immediate 模式点选项
             立即生效，无需二次确认，Semi 完全不渲染这组按钮；此前本库无条件渲染，
             与 Semi immediate 语义不符）。 -->
        {#if confirmMode}
        <div class="cd-table-column-filter-actions">
          <button type="button" class="cd-table-column-filter-reset" onclick={() => resetTempFilter(col, colKey)}>{loc().t('Table.resetFilter')}</button>
          <button type="button" class="cd-table-column-filter-confirm" onclick={() => confirmFilter(col, colKey)}>{loc().t('Table.confirmFilter')}</button>
        </div>
        {/if}
        {/if}
      </div>
    {/snippet}
  {#snippet tbodyContent()}
    <svelte:element this={tagTbody} class="cd-table-tbody">
      {#if visibleRows.length === 0}
        <!-- svelte-ignore a11y_no_redundant_roles -- 对齐 Semi：显式 role="row"（Semi BaseRow 同样在原生 tr 上显式设置） -->
        <tr class="cd-table-row cd-table-row-placeholder" role="row">
          <td
            class="cd-table-row-cell cd-table-placeholder"
            colspan={colSpan}
            role="gridcell"
            aria-colindex={1}
          >
            {#if emptySnippet}{@render emptySnippet()}{:else}{empty ?? loc().t('Table.emptyText')}{/if}
          </td>
        </tr>
      {:else}
        {#if isGrouped}
          {#each groupedDisplayRows as groupRow (groupRow.type === 'group' ? `__group__${(groupRow as GroupRow).groupKey}` : (groupRow as DataDisplayRow).key)}
            {#if groupRow.type === 'group'}
              {@const gRow = groupRow as GroupRow}
              {@const groupedRowProps = onGroupedRow ? onGroupedRow(gRow.group, gRow.groupIndex) : undefined}
              <SectionRow
                groupKey={gRow.groupKey}
                group={gRow.group}
                expanded={gRow.expanded}
                {colSpan}
                {clickGroupedRowToExpand}
                {groupedRowProps}
                {renderGroupSection}
                onToggle={() => toggleGroupExpand(gRow.groupKey)}
              />
            {:else}
              {@const row = groupRow as DataDisplayRow}
              {@const record = row.record}
              {@const key = row.key}
              {@const index = row.topIndex}
              {@const selected = treeCheckable ? conducted.checked.has(key) : selectedSet.has(key)}
              {@const rowHalf = treeCheckable && conducted.half.has(key)}
              {@const rowDisabled = disabledSet.has(key)}
              {@const extra = rowClassName ? rowClassName(record, index) : ''}
              {@const clickable = !!onRowClick || expandRowByClick || rowSelection?.clickRow === true}
              {@const rowProps = onRow ? onRow(record, index, { disabled: rowDisabled, selected }) : undefined}
              {#snippet groupedRowCells()}
                {#if expandAsColumn}
                  <td
                    class="cd-table-row-cell cd-table-column-expand {leadingFixedClass}"
                    style={leadingStyle('expand')}
                    role="gridcell"
                  >
                    {#if canExpand(record)}
                      {@render expandButton(record, key)}
                    {/if}
                  </td>
                {/if}
                {#if hasSelection}
                  <td
                    class="cd-table-row-cell cd-table-column-selection {selectionFixedClass || leadingFixedClass}"
                    style={selectionColStyle ?? leadingStyle('selection')}
                    role="gridcell"
                  >
                    {@render rowSelectionInput(record, selected, rowHalf, rowDisabled)}
                  </td>
                {/if}
                {#each leafColumns as col, i (colKeyOf(col, i))}
                  {@const value = cellValue(col, record)}
                  <td
                    class="cd-table-row-cell cd-table-align-{alignOf(col)} {fixedCellClass(i)}"
                    class:cd-table-row-cell-ellipsis={!!col.ellipsis}
                    title={cellTitleAttr(col, value)}
                    style={cellStyle(col, i)}
                  >
                    {#snippet gExpandMaterial()}
                      {#if hasExpandedRowRender && !expandAsColumn && i === 0}
                        <span class="cd-table-expand-icon-cell">
                          {#if canExpand(record)}
                            {@render expandButton(record, key)}
                          {:else}
                            <span class="cd-table-expand-icon cd-table-expand-icon-placeholder" aria-hidden="true"></span>
                          {/if}
                        </span>
                      {/if}
                      {#if treeEnabled && i === 0}
                        {#if row.hasChildren && canExpand(record)}
                          <CustomExpandIcon
                            expanded={expandedSet.has(key)}
                            componentType="tree"
                            {record}
                            onClick={() => toggleExpand(record)}
                          />
                        {:else}
                          <span class="cd-table-expand-icon cd-table-expand-icon-placeholder" aria-hidden="true"></span>
                        {/if}
                      {/if}
                    {/snippet}
                    {#snippet gIndentMaterial()}
                      {#if treeEnabled && i === 0}
                        <span class="cd-table-row-indent" style="width:{row.level * indentSize}px" aria-hidden="true"></span>
                      {/if}
                    {/snippet}
                    {#if col.useFullRender && col.render}
                      {@render col.render({ value, record, index, expandIcon: gExpandMaterial, indentText: gIndentMaterial })}
                    {:else}
                      {#if i === 0}{@render gIndentMaterial()}{@render gExpandMaterial()}{/if}
                      {#if col.render}
                        {@render col.render({ value, record, index })}
                      {:else}
                        {cellText(value)}
                      {/if}
                    {/if}
                  </td>
                {/each}
              {/snippet}
              <BaseRow
                tag={tagBodyRow}
                {record}
                {index}
                {selected}
                {stripe}
                {clickable}
                isChild={treeEnabled && row.level > 0}
                extraClassName={extra}
                {rowProps}
                onRowClick={(e) => {
                  if (expandRowByClick && (hasExpandedRowRender || (treeEnabled && row.hasChildren)) && canExpand(record)) toggleExpand(record);
                  if (rowSelection?.clickRow && !rowDisabled) onToggleRow(record);
                  if (onRowClick) onRowClick({ record, index });
                  if (rowProps?.onClick) rowProps.onClick(e);
                }}
                cells={groupedRowCells}
              />
              {#if hasExpandedRowRender && canExpand(record)}
                {#snippet expandedContent()}
                  {@render expandedRowRender!({ record, index })}
                {/snippet}
                {#if keepDOM}
                  <ExpandedRow {colSpan} displayNone={!expandedSet.has(key)} content={expandedContent} />
                {:else if expandedSet.has(key)}
                  <ExpandedRow {colSpan} content={expandedContent} />
                {/if}
              {/if}
            {/if}
          {/each}
        {:else}
        {#if virtualized && vTopPad > 0}
          <tr class="cd-table-row cd-table-row-spacer" aria-hidden="true">
            <td colspan={colSpan} style="height:{vTopPad}px; padding:0; border:0"></td>
          </tr>
        {/if}
        {#each renderRows as row, ri (row.key)}
          {@const record = row.record}
          {@const key = row.key}
          {@const index = row.topIndex}
          {@const gridRow = (virtualized ? vRange.startIndex : 0) + ri}
          {@const selected = treeCheckable ? conducted.checked.has(key) : selectedSet.has(key)}
          {@const rowHalf = treeCheckable && conducted.half.has(key)}
          {@const rowDisabled = disabledSet.has(key)}
          {@const extra = rowClassName ? rowClassName(record, index) : ''}
          {@const clickable = !!onRowClick || expandRowByClick || rowSelection?.clickRow === true}
          {@const rowProps = onRow ? onRow(record, index, { disabled: rowDisabled, selected }) : undefined}
          {#snippet rowCells()}
            {#if expandAsColumn}
              {@const gc = 0}
              <td
                class="cd-table-row-cell cd-table-column-expand {leadingFixedClass}"
                style={leadingStyle('expand')}
                role="gridcell"
                aria-colindex={gc + 1}
              >
                {#if canExpand(record)}
                  {@render expandButton(record, key)}
                {/if}
              </td>
            {/if}
            {#if hasSelection}
              {@const gc = expandAsColumn ? 1 : 0}
              <td
                class="cd-table-row-cell cd-table-column-selection {selectionFixedClass || leadingFixedClass}"
                style={selectionColStyle ?? leadingStyle('selection')}
                role="gridcell"
                aria-colindex={gc + 1}
              >
                {@render rowSelectionInput(record, selected, rowHalf, rowDisabled)}
              </td>
            {/if}
            {#each leafColumns as col, i (colKeyOf(col, i))}
              {@const value = cellValue(col, record)}
              {@const gc = (expandAsColumn ? 1 : 0) + (hasSelection ? 1 : 0) + i}
              {@const cellProps = col.onCell ? col.onCell(record, index) : undefined}
              {#if !(cellProps && (cellProps.colSpan === 0 || cellProps.rowSpan === 0))}
              <td
                class="cd-table-row-cell cd-table-align-{alignOf(col)} {fixedCellClass(i)} {cellProps?.className ?? ''}"
                class:cd-table-row-cell-ellipsis={!!col.ellipsis}
                title={cellTitleAttr(col, value)}
                colspan={cellProps?.colSpan}
                rowspan={cellProps?.rowSpan}
                style={mergeCellStyle(cellStyle(col, i), cellProps?.style)}
                role="gridcell"
                aria-colindex={gc + 1}
              >
                <!-- 展开图标 / 树形三角 / 缩进物料：useFullRender 时不自动前置，改注入 render 供自行摆放 -->
                {#snippet cellExpandMaterial()}
                  {#if hasExpandedRowRender && !expandAsColumn && i === 0}
                    <span class="cd-table-expand-icon-cell">
                      {#if canExpand(record)}
                        {@render expandButton(record, key)}
                      {:else}
                        <span class="cd-table-expand-icon cd-table-expand-icon-placeholder" aria-hidden="true"></span>
                      {/if}
                    </span>
                  {/if}
                  {#if treeEnabled && i === 0}
                    {#if row.hasChildren && canExpand(record)}
                      <CustomExpandIcon
                        expanded={expandedSet.has(key)}
                        componentType="tree"
                        {record}
                        onClick={() => toggleExpand(record)}
                      />
                    {:else}
                      <span class="cd-table-expand-icon cd-table-expand-icon-placeholder" aria-hidden="true"></span>
                    {/if}
                  {/if}
                {/snippet}
                {#snippet cellIndentMaterial()}
                  {#if treeEnabled && i === 0}
                    <span class="cd-table-row-indent" style="width:{row.level * indentSize}px" aria-hidden="true"></span>
                  {/if}
                {/snippet}
                {#snippet cellSelectionMaterial()}
                  {#if selectionEnabled}
                    {@render rowSelectionInput(record, selected, rowHalf, rowDisabled)}
                  {/if}
                {/snippet}
                {#if col.useFullRender && col.render}
                  {@render col.render({ value, record, index, expandIcon: cellExpandMaterial, selection: cellSelectionMaterial, indentText: cellIndentMaterial })}
                {:else}
                  {#if i === 0}{@render cellIndentMaterial()}{@render cellExpandMaterial()}{/if}
                  {#if col.render}
                    {@render col.render({ value, record, index })}
                  {:else}
                    {cellText(value)}
                  {/if}
                {/if}
              </td>
              {/if}
            {/each}
          {/snippet}
          <BaseRow
            tag={tagBodyRow}
            {record}
            {index}
            {selected}
            {stripe}
            {clickable}
            isChild={treeEnabled && row.level > 0}
            extraClassName={extra}
            {rowProps}
            ariaRowIndex={gridRow + 2}
            onRowClick={(e) => {
              if (expandRowByClick && (hasExpandedRowRender || (treeEnabled && row.hasChildren)) && canExpand(record)) toggleExpand(record);
              if (rowSelection?.clickRow && !rowDisabled) onToggleRow(record);
              if (onRowClick) onRowClick({ record, index });
              if (rowProps?.onClick) rowProps.onClick(e);
            }}
            cells={rowCells}
          />
          {#if hasExpandedRowRender && canExpand(record)}
            {#snippet expandedContent2()}
              {@render expandedRowRender!({ record, index })}
            {/snippet}
            {#if keepDOM}
              <ExpandedRow {colSpan} displayNone={!expandedSet.has(key)} content={expandedContent2} />
            {:else if expandedSet.has(key)}
              <ExpandedRow {colSpan} content={expandedContent2} />
            {/if}
          {/if}
        {/each}
        {#if virtualized && vBottomPad > 0}
          <tr class="cd-table-row cd-table-row-spacer" aria-hidden="true">
            <td colspan={colSpan} style="height:{vBottomPad}px; padding:0; border:0"></td>
          </tr>
        {/if}
        {/if}
      {/if}
    </svelte:element>
  {/snippet}
  {#if useFixedHeader}
    <!-- 双 table：HeadTable（独立 thead table，横滚只读，overflow-x:hidden）+
         Body（独立 tbody table，用户实际横滚交互的容器，includeHeader=false）。
         HeadTable 的 scrollLeft 由 Table.svelte 的 headSyncRafId effect 命令式同步
         （对齐 Semi handleBodyScrollLeft），本组件不感知同步逻辑。 -->
    <HeadTable
      tag={tagTable}
      cls={cls}
      style={scrollTableStyle}
      ariaLabel={ariaLabel}
      role={tableRole}
      ariaRowCount={dataSource.length}
      ariaColCount={leafColumns.length}
      colgroup={colgroupContent}
      thead={theadContent}
      bind:wrapEl={headWrapEl}
      sticky={!!sticky}
      stickyTop={stickyOffset}
    />
    <div
      class="cd-table-body"
      class:cd-table-body-virtual={virtualized}
      class:cd-table-body-scroll={scrollBody}
      class:cd-table-scroll-position-left={scrollPosLeft}
      class:cd-table-scroll-position-right={scrollPosRight}
      bind:this={scrollEl}
      style={scrollWrapStyle}
    >
      <Body
        includeHeader={false}
        tag={tagTable}
        cls={cls}
        style={scrollTableStyle}
        ariaLabel={ariaLabel}
        role={tableRole}
        ariaRowCount={dataSource.length}
        ariaColCount={leafColumns.length}
        colgroup={colgroupContent}
        tbody={tbodyContent}
      />
    </div>
  {:else}
    <!-- 单 table：thead+tbody 同表，Body includeHeader=true（现状路径，DOM 结构不变）。 -->
    <div
      class="cd-table-body"
      class:cd-table-body-virtual={virtualized}
      class:cd-table-body-scroll={scrollBody}
      class:cd-table-scroll-position-left={scrollPosLeft}
      class:cd-table-scroll-position-right={scrollPosRight}
      bind:this={scrollEl}
      style={scrollWrapStyle}
    >
      <Body
        includeHeader={true}
        tag={tagTable}
        cls={cls}
        style={scrollTableStyle}
        ariaLabel={ariaLabel}
        role={tableRole}
        ariaRowCount={dataSource.length}
        ariaColCount={leafColumns.length}
        colgroup={colgroupContent}
        thead={theadContent}
        tbody={tbodyContent}
      />
    </div>
  {/if}
    <!-- footer 在 .cd-table-container 内、body 之后（对齐 Semi） -->
    {#if footerSnippet || footer}
      <div class="cd-table-footer">
        {#if footerSnippet}{@render footerSnippet({ currentData: visibleRows })}{:else}{footer}{/if}
      </div>
    {/if}
  </div>

  {#if paginationEnabled && total > 0 && (paginationPosition === 'bottom' || paginationPosition === 'both')}
    {@render paginationArea()}
  {/if}
  </Spin>
</div>
<!-- /.cd-table-wrapper -->

{#snippet paginationArea()}
  <TablePagination {total} {currentPage} {pageSize} onChange={onPageChange} {pageRangeText} {renderPagination} />
{/snippet}

<style>
  /* ===== 严格对齐 Semi Design table.scss —— 消费 Semi 全名 token ===== */

  /* 最外层容器：.semi-table-wrapper */
  .cd-table-wrapper {
    position: relative;
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    width: 100%;
    color: var(--cd-color-table-text-default);
    font-size: var(--cd-font-table-base-fontsize);
    /* 对齐 Semi font-size-regular mixin：line-height 20px，避免继承文档站正文行高致表头/单元格偏高 */
    line-height: var(--cd-line-height-regular);
  }

  /* body 滚动容器：.semi-table-body（横向 + 纵向滚动区） */
  .cd-table-body {
    position: relative;
    width: 100%;
    box-sizing: border-box;
    overflow-x: auto;
  }
  .cd-table-body-virtual,
  .cd-table-body-scroll {
    overflow: auto;
  }

  .cd-table-row-spacer:hover {
    background: transparent;
  }

  /* 表格本体：.semi-table。真实 <table> 元素由 HeadTable.svelte/Body.svelte（双 table
     架构）渲染（svelte:element this={tag}），本文件从不直接渲染 <table>——即便"单 table"
     路径也走 <Body includeHeader> 组件，故这两条规则须整条 :global()，否则 scoped hash
     永远不命中真实 <table>（真机验证发现 background/border-collapse/table-layout 全部
     静默失效：table-layout 恒为浏览器默认 auto，长文本列被撑宽，ellipsis 截断与
     showTooltip 判断依赖的 truncated 测量永远为 false，tooltip 永不触发）。 */
  :global(.cd-table) {
    width: 100%;
    text-align: left;
    border-collapse: separate;
    border-spacing: 0;
    font-size: inherit;
    display: table;
    background: var(--cd-color-table-bg-default);
  }
  /* fixed 布局：固定列 / 列宽精确 */
  :global(.cd-table-fixed) {
    width: auto;
    min-width: 100%;
    table-layout: fixed;
  }

  /* ===== 表头 thead =====
     .cd-table-row-head 在 TableHeaderRow.svelte 渲染，本文件只是 <thead> 容器，
     故不再要求 .cd-table-thead > .cd-table-row > 祖先链（那条 <tr> 同样不在本文件，
     跨组件 scoped hash 不匹配会导致规则失效，见下方 tbody 注释的完整说明）。 */
  :global(.cd-table-row-head) {
    background-color: var(--cd-color-table-th-bg-default);
    color: var(--cd-color-table-th-text-default);
    font-weight: var(--cd-font-weight-bold, 600);
    text-align: left;
    vertical-align: middle;
    overflow-wrap: break-word;
    position: relative;
    padding-left: var(--cd-spacing-table-row-head-paddingx);
    padding-right: var(--cd-spacing-table-row-head-paddingx);
    padding-top: var(--cd-spacing-table-row-head-paddingy);
    padding-bottom: var(--cd-spacing-table-row-head-paddingy);
    border-bottom: var(--cd-width-table-header-border) var(--cd-border-table-base-borderstyle) var(--cd-color-table-th-border-default);
  }
  /* 点击排序表头：clickSort */
  :global(.cd-table-row-head-clicksort) {
    cursor: pointer;
  }
  :global(.cd-table-row-head-clicksort:hover) {
    background-image: linear-gradient(0deg, var(--cd-color-table-th-clicksort-bg-hover), var(--cd-color-table-th-clicksort-bg-hover));
    background-color: var(--cd-color-table-cell-bg-hover);
  }
  :global(.cd-table-row-head.cd-table-column-selection) {
    text-align: center;
  }
  :global(.cd-table-row-head-ellipsis),
  :global(.cd-table-row-head-ellipsis) :global(.cd-table-row-head-title) {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  /* ===== 表体 tbody =====
     .cd-table-row（<tr>）由 BaseRow.svelte/SectionRow.svelte/ExpandedRow.svelte
     渲染（批次2文件拆分后），.cd-table-row-cell（<td>）由本文件内联渲染。两者分属
     不同组件的 scoped 作用域：Svelte 只给「出现在当前文件模板里」的元素追加当前
     文件 hash，<tr> 不在本文件模板里，若规则写成 `.cd-table-tbody > .cd-table-row >
     .cd-table-row-cell` 这类祖先链，Svelte 仍会给未被 :global() 包裹的每一段都加
     本文件 hash，导致 .cd-table-row 那一段永远不可能匹配真实 DOM 上的 tr（它带的
     是 BaseRow.svelte 自己的 hash）——规则语法合法、typecheck/编译均不报错，只是
     静默从不生效（真机验证发现：td 实际 padding 只有 1px 的 UA 默认值，说明这里
     曾经全部失效）。

     以下規則统一改为：只在实际会跨组件的祖先层（.cd-table-row 及其状态修饰类
     selected/stripe/expand/section/hovered，均由子组件渲染）用 :global()，落到
     本文件内渲染的目标元素（.cd-table-row-cell 及其子代）时不需要额外 :global()
     包裹目标本身——但由于父选择器已经是 :global()，Svelte 编译器要求同一条选择器
     内混用 :global()/非-:global() 时非 global 段仍会独立加 hash 并可能仍然错位，
     为避免重蹈覆辙，整条选择器统一包在 :global() 内，牺牲一点 scoped 隔离换取
     跨组件可靠匹配（class 命名本身已足够语义化，不依赖 scoped 隔离防冲突）。 */
  :global(.cd-table-tbody) {
    display: table-row-group;
  }
  :global(.cd-table-row) {
    display: table-row;
    background-color: var(--cd-color-table-body-bg-default);
  }
  :global(.cd-table-row-cell) {
    display: table-cell;
    overflow-wrap: break-word;
    border-left: none;
    border-right: none;
    border-bottom: var(--cd-width-table-base-border) var(--cd-border-table-base-borderstyle) var(--cd-color-table-border-default);
    padding: var(--cd-spacing-table-tbody-rowcell-padding);
    box-sizing: border-box;
    position: relative;
    vertical-align: middle;
  }
  /* 尺寸档：middle / small 单元格纵向内边距。.cd-table-middle/.cd-table-small 挂在
     <table> 上（HeadTable.svelte/Body.svelte 渲染），同样跨组件，须 :global()。 */
  :global(.cd-table-middle) :global(.cd-table-row-cell) {
    padding-top: var(--cd-spacing-table-middle-paddingy);
    padding-bottom: var(--cd-spacing-table-middle-paddingy);
  }
  :global(.cd-table-small) :global(.cd-table-row-cell) {
    padding-top: var(--cd-spacing-table-small-paddingy);
    padding-bottom: var(--cd-spacing-table-small-paddingy);
  }
  :global(.cd-table-row-cell-ellipsis) {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  /* 行 hover：Semi 用 background-image+background-color 双层（fill-0 半透 + bg-0 兜底）。
     .cd-table-row-hovered 目前代码里没有任何地方会添加这个 class（grep 全库确认），
     是遗留的死选择器，保留以防未来接线，不在本次范围内新增命令式逻辑去点亮它。 */
  :global(.cd-table-row):hover > :global(.cd-table-row-cell),
  :global(.cd-table-row-hovered) > :global(.cd-table-row-cell) {
    background-image: linear-gradient(0deg, var(--cd-color-table-body-bg-hover), var(--cd-color-table-body-bg-hover));
    background-color: var(--cd-color-table-cell-bg-hover);
  }
  /* 固定列 hover：底色保持 body-default，避免透出横滚内容。
     须限定 .cd-table-tbody 祖先（对齐 Semi table.scss &-tbody > &-row:hover 嵌套写法）——
     .cd-table-cell-fixed-left/-right 同时命中表头 th 与 tbody td（固定列定位 class
     不分头尾），且表头 <tr> 与 tbody <tr> 同名 .cd-table-row，缺少祖先限定会导致
     hover 表头固定列（含筛选/复选框列）时也被这条 tbody 专属规则误染灰。 */
  :global(.cd-table-tbody) :global(.cd-table-row):hover > :global(.cd-table-cell-fixed-left),
  :global(.cd-table-tbody) :global(.cd-table-row):hover > :global(.cd-table-cell-fixed-right),
  :global(.cd-table-tbody) :global(.cd-table-row-hovered) > :global(.cd-table-cell-fixed-left),
  :global(.cd-table-tbody) :global(.cd-table-row-hovered) > :global(.cd-table-cell-fixed-right) {
    background-image: linear-gradient(0deg, var(--cd-color-table-body-bg-hover), var(--cd-color-table-body-bg-hover));
    background-color: var(--cd-color-table-body-bg-default);
  }

  /* 对齐 */
  :global(.cd-table-align-center) {
    text-align: center;
  }
  :global(.cd-table-align-right) {
    text-align: right;
  }

  /* 选择列 / 展开列固定宽度（对齐 Semi $width-table_column_selection = 48px） */
  :global(.cd-table-column-selection),
  :global(.cd-table-column-expand) {
    width: var(--cd-width-table-column-selection);
    text-align: center;
    white-space: nowrap;
  }

  /* 斑马纹（chenzy-design 扩展；Semi 靠 demo onRow className 实现，此处保留组件级开关）。
     .cd-table-stripe 挂在 <table> 上，.cd-table-row-stripe 挂在 <tr> 上，均跨组件。 */
  :global(.cd-table-stripe) :global(.cd-table-row-stripe) > :global(.cd-table-row-cell) {
    background-color: var(--cd-color-table-selection-bg-default);
  }

  /* 选中行 */
  :global(.cd-table-row-selected) > :global(.cd-table-row-cell) {
    background-color: var(--cd-color-primary-light-default);
  }
  :global(.cd-table-row-clickable) {
    cursor: pointer;
  }

  /* ===== 展开行 / 分组行 ===== */
  :global(.cd-table-row-expand) > :global(.cd-table-row-cell) {
    background-color: var(--cd-color-table-row-expanded-bg-default);
  }
  :global(.cd-table-row-cell-expanded-content) {
    padding-left: var(--cd-spacing-table-expand-row-paddingleft);
    padding-right: var(--cd-spacing-table-expand-row-paddingright);
    padding-top: var(--cd-spacing-table-expand-row-paddingtop);
    padding-bottom: var(--cd-spacing-table-expand-row-paddingbottom);
    background-color: var(--cd-color-table-row-expanded-bg-default);
  }
  :global(.cd-table-row-hidden) {
    display: none;
  }

  /* 分组表头行 .semi-table-row-section */
  :global(.cd-table-row-section) > :global(.cd-table-row-cell) {
    background-color: var(--cd-color-table-selection-bg-default);
    border-bottom: var(--cd-width-table-base-border) var(--cd-border-table-base-borderstyle) var(--cd-color-table-border-default);
  }
  :global(.cd-table-row-section) > :global(.cd-table-row-cell):not(:global(.cd-table-column-selection)) {
    padding: var(--cd-spacing-table-tbody-rowselection-rowcell-notselection-paddingy) var(--cd-spacing-table-tbody-rowselection-rowcell-notselection-paddingx);
  }
  :global(.cd-table-section-inner) {
    display: inline-flex;
    align-items: center;
  }
  :global(.cd-table-row-section-clickable) :global(.cd-table-row-cell-section) {
    cursor: pointer;
    user-select: none;
  }
  :global(.cd-table-row-cell-section):focus-visible {
    outline: 2px solid var(--cd-focus-ring, currentColor);
    outline-offset: -2px;
  }

  /* ===== 固定列：sticky + 边界阴影 =====
     .cd-table-cell-fixed-* 都命中本文件内渲染的 <td>（数据单元格）或
     TableHeaderRow.svelte 渲染的 <th>（表头单元格），后者跨组件须 :global()——
     此前漏了 :global()，真机核对发现表头固定列 z-index 恒为 auto（未命中这条
     规则），横向滚动时表头分割线/阴影被非固定列内容盖住，与 tbody 表现不一致。 */
  :global(.cd-table-cell-fixed-left),
  :global(.cd-table-cell-fixed-right) {
    z-index: var(--cd-z-table-fixed-column);
    position: sticky;
    background-color: var(--cd-color-table-bg-default);
  }
  /* 复合选择器（同一元素上两个 class）：不能只把 .cd-table-row-head 单独包 :global()——
     Svelte 仍会给同一复合选择器里未被包裹的 .cd-table-cell-fixed-left/-right 追加本文件
     hash，而 <th> 实际携带的是 TableHeaderRow.svelte 的 hash，两段 hash 要求无法同时
     满足，整条规则永远不命中（真机核对发现：th 背景色退回 .cd-table-bg-default 兜底，
     恰好与 .cd-table-th-bg-default 引用同一底层 token 才没有肉眼可见的差异，但语义上
     这条规则本身确实失效，不能依赖这种数值巧合）。须整条 :global()。 */
  :global(.cd-table-row-head.cd-table-cell-fixed-left),
  :global(.cd-table-row-head.cd-table-cell-fixed-right) {
    background-color: var(--cd-color-table-th-bg-default);
  }
  /* .cd-table-cell-fixed-left-last/-right-first 同时命中表头 th（TableHeaderRow.svelte
     渲染）与 tbody td（本文件 tbodyContent 渲染），跨组件须整条 :global()——此前是
     普通 scoped 规则，真机核对发现分割线/阴影从未命中过表头（computed border-right
     恒为 0，box-shadow 恒为 none），只在 tbody 生效，表头视觉上完全没有固定列分割线。 */
  :global(.cd-table-cell-fixed-left-last) {
    border-right: var(--cd-width-table-cell-fixed-left-last) solid var(--cd-color-table-shadow-border-default);
    box-shadow: var(--cd-shadow-table-right);
  }
  :global(.cd-table-cell-fixed-right-first) {
    border-left: var(--cd-width-table-cell-fixed-right-first) solid var(--cd-color-table-shadow-border-default);
    box-shadow: var(--cd-shadow-table-left);
  }
  /* 横滚到边隐藏对应阴影 */
  :global(.cd-table-scroll-position-left) :global(.cd-table-cell-fixed-left-last) {
    box-shadow: none;
  }
  :global(.cd-table-scroll-position-right) :global(.cd-table-cell-fixed-right-first) {
    box-shadow: none;
  }

  /* ===== 带边框 bordered ===== */
  /* bordered 表格外框：container 是 wrapper 的子、table 的祖先，故用 wrapper 的 bordered
     class 选中（此前误用 table 上的 .cd-table-bordered > container，方向反致外框全丢）。
     须用普通后代选择器而非 `>` 直接子代——wrapper 与 container 之间隔着 <Spin> 组件的
     .cd-spin 包裹 div（loading 遮罩），并非真实直接父子关系；真机核对发现 `>` 版本的
     选择器从未命中过，container 的 border computed 值恒为 0，外框视觉上从未生效
     （更早的既有 bug，与本次改动无关但顺带一并修正）。
     对齐 Semi：保留上/左边框（含表头上边框），右/下由单元格 border 补齐避免双线。 */
  .cd-table-wrapper-bordered .cd-table-container {
    position: relative;
    border: var(--cd-width-table-base-border) var(--cd-border-table-base-borderstyle) var(--cd-color-table-border-default);
    border-right: 0;
    border-bottom: 0;
  }
  /* .cd-table-bordered 挂在 <table>（HeadTable.svelte/Body.svelte 渲染），
     .cd-table-row-head 在 TableHeaderRow.svelte，.cd-table-row-cell 在本文件——
     三者两两跨组件，整条选择器须 :global()。 */
  :global(.cd-table-bordered) :global(.cd-table-row-head),
  :global(.cd-table-bordered) :global(.cd-table-row-cell) {
    border-right: var(--cd-width-table-base-border) var(--cd-border-table-base-borderstyle) var(--cd-color-table-border-default);
  }
  /* 横滚未到底时右边框在视口外不可见修复（对齐 Semi #441 fix，table.scss &-bordered
     :not(&-scroll-position-right)）：单元格自身 border-right 只画在该单元格实际位置，
     scroll.x 超宽且未滚到底时最后一列被横滚裁切到可视区外，右边框随之不可见。
     用容器级 ::after 覆盖层在视口固定右侧画一条常驻边框；滚到底时
     .cd-table-scroll-position-right 存在，不画该层避免与单元格边框重复。
     :not(.cd-table-wrapper-rtl) 排除 RTL——RTL 镜像版本（画左边框）见下方 RTL 覆盖层
     规则，两者互斥，避免同一元素 ::after 被两条规则争抢定义。 */
  .cd-table-wrapper-bordered:not(.cd-table-wrapper-rtl):not(:has(.cd-table-scroll-position-right)) .cd-table-container::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: var(--cd-width-table-base-border);
    background-color: var(--cd-color-table-border-default);
    display: block;
    z-index: calc(var(--cd-z-table-fixed-column) + 2);
    pointer-events: none;
  }
  /* 双 table 架构下表头（.cd-table-head，见 HeadTable.svelte）也须补右边框：原生滚动条
     在部分浏览器可能盖住容器 ::after 覆盖层，用 inset box-shadow 兜底表头自身可见。 */
  .cd-table-wrapper-bordered:not(.cd-table-wrapper-rtl):not(:has(.cd-table-scroll-position-right)) .cd-table-container :global(.cd-table-head) {
    box-shadow: inset calc(var(--cd-width-table-base-border) * -1) 0 0 0 var(--cd-color-table-border-default);
  }

  /* ===== 空数据占位 .semi-table-placeholder ===== */
  .cd-table-placeholder {
    padding: var(--cd-spacing-table-paddingy) var(--cd-spacing-table-paddingx);
    color: var(--cd-color-table-placeholder-text-default);
    font-size: var(--cd-font-table-base-fontsize);
    text-align: center;
    background: var(--cd-color-table-pl-bg-default);
    border-bottom: var(--cd-width-table-base-border) var(--cd-border-table-base-borderstyle) var(--cd-color-table-border-default);
  }

  /* ===== 排序 ColumnSorter =====
     .cd-table-operate-wrapper/.cd-table-operate-plain 由 TableHeaderRow.svelte 渲染
     （批次3阶段B补做拆出的表头行组件），跨组件须 :global()（同一类坑：此前只修了这两个
     class 的 RTL 覆盖版本，漏了基础版本本身——真机验证发现 display:flex 不生效，
     表头排序/筛选按钮区域退化为默认 inline 布局，line-box 撑高表头）。 */
  /* 对齐 Semi .semi-table-operate-wrapper：flex 行容器，消除 inline line-box 撑高（表头恒 38px） */
  :global(.cd-table-operate-wrapper) {
    display: flex;
    align-items: center;
  }
  /* 纯自定义 title（无 sorter/filter）：不产生布局盒，title 直接在 th 内 inline 布局，
     对齐 Semi（Semi 自定义 title 不套 operate-wrapper，其 inline-flex 内容自然撑高表头）。 */
  :global(.cd-table-operate-plain) {
    display: contents;
  }
  :global(.cd-table-align-center) :global(.cd-table-operate-wrapper) {
    justify-content: center;
  }
  :global(.cd-table-align-right) :global(.cd-table-operate-wrapper) {
    justify-content: flex-end;
  }

  /* .cd-table-column-sorter* 全部由 ColumnSorter.svelte 渲染（批次1拆出），跨组件
     须 :global()（同一类坑：真机核对时发现遗漏，此前只顾着修 tbody/表头/展开图标
     几处，排序按钮的基础样式——flex 布局/gap/字重/cursor——从未被系统性核对过，
     实际全部静默失效）。 */
  :global(.cd-table-column-sorter-wrapper) {
    display: inline-flex;
    align-items: center;
    /* baseline 对齐会留 descender 空间撑高 th 1px；middle 消除，对齐 Semi 恒 38px 表头 */
    vertical-align: middle;
    gap: var(--cd-spacing-table-column-sorter-marginleft);
    overflow: hidden;
    cursor: pointer;
    padding: 0;
    color: inherit;
    font: inherit;
    font-weight: var(--cd-font-weight-bold, 600);
    background: none;
    border: none;
  }
  :global(.cd-table-column-sorter-wrapper):focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
    border-radius: var(--cd-border-radius-small);
  }
  :global(.cd-table-column-sorter) {
    display: inline-block;
    width: var(--cd-width-table-column-sorter-icon);
    height: var(--cd-height-table-column-sorter-icon);
    vertical-align: middle;
    text-align: center;
  }
  :global(.cd-table-column-sorter-up),
  :global(.cd-table-column-sorter-down) {
    display: block;
    height: 0;
    color: var(--cd-color-table-sorter-text-default);
  }
  :global(.cd-table-column-sorter-up.on),
  :global(.cd-table-column-sorter-down.on) {
    color: var(--cd-color-table-sorter-on-text-default);
  }
  :global(.cd-table-column-sorter-up) :global(svg),
  :global(.cd-table-column-sorter-down) :global(svg) {
    width: var(--cd-width-table-column-sorter-icon);
    height: var(--cd-height-table-column-sorter-icon);
  }

  /* ===== 列筛选 ColumnFilter =====
     .cd-table-column-filter（触发按钮基础样式）由 ColumnFilter.svelte 渲染（批次4
     拆出），跨组件须 :global()；.cd-table-column-filter-dropdown 及其内部结构
     （list/label/actions/reset/confirm）仍在本文件内联渲染（filterDropdownPanel
     snippet），保持 scoped 不受影响。 */
  :global(.cd-table-column-filter) {
    margin-left: var(--cd-spacing-table-column-filter-marginleft);
    display: inline-flex;
    align-items: center;
    /* 同 sorter：消除 baseline descender，避免撑高 th */
    vertical-align: middle;
    cursor: pointer;
    color: var(--cd-color-table-filter-text-default);
    padding: 0;
    border: none;
    background: transparent;
  }
  :global(.cd-table-column-filter) :global(svg) {
    width: var(--cd-width-table-column-filter-icon);
    height: var(--cd-height-table-column-filter-icon);
  }
  :global(.cd-table-column-filter.on) {
    color: var(--cd-color-table-filter-on-text-default);
  }
  :global(.cd-table-column-filter):focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  /* 筛选下拉面板 .semi-table-column-filter-dropdown */
  .cd-table-column-filter-dropdown {
    z-index: var(--cd-z-dropdown, 1060);
    min-width: 10rem;
    padding-top: var(--cd-spacing-extra-tight);
    padding-bottom: var(--cd-spacing-extra-tight);
    background: var(--cd-color-bg-3, #fff);
    border-radius: var(--cd-border-radius-medium, 6px);
    box-shadow: var(--cd-shadow-elevated, 0 4px 12px rgba(0, 0, 0, 0.12));
    font-weight: var(--cd-font-weight-regular, 400);
  }
  /*
   * 进/退场动画对齐 Semi（列筛选浮层复用 Dropdown，即 Tooltip 实例，故用 tooltip
   * 命名空间 token）：scale(0.8→1) + opacity(0→1)，用独立 CSS `scale` 属性
   * （非 transform:scale()）——use:floating 用 transform:translate() 定位，
   * scale 与 transform 正交，同一元素上二者互不覆盖。
   */
  .cd-table-column-filter-dropdown-motion-show {
    animation: cd-table-filter-zoom-in var(--cd-animation-duration-tooltip-in)
      var(--cd-animation-function-tooltip-in);
  }
  .cd-table-column-filter-dropdown-motion-hide {
    animation: cd-table-filter-zoom-out var(--cd-animation-duration-tooltip-out)
      var(--cd-animation-function-tooltip-out);
  }
  @keyframes cd-table-filter-zoom-in {
    from {
      opacity: var(--cd-tooltip-motion-zoom-opacity-from);
      scale: var(--cd-tooltip-motion-zoom-scale-from);
    }
    50% {
      opacity: var(--cd-tooltip-motion-zoom-opacity-to);
    }
    to {
      opacity: var(--cd-tooltip-motion-zoom-opacity-to);
      scale: 1;
    }
  }
  @keyframes cd-table-filter-zoom-out {
    from {
      opacity: var(--cd-tooltip-motion-zoom-opacity-to);
      scale: 1;
    }
    60% {
      opacity: var(--cd-tooltip-motion-zoom-opacity-from);
      scale: var(--cd-tooltip-motion-zoom-scale-from);
    }
    to {
      opacity: var(--cd-tooltip-motion-zoom-opacity-from);
      scale: var(--cd-tooltip-motion-zoom-scale-from);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-table-column-filter-dropdown-motion-show,
    .cd-table-column-filter-dropdown-motion-hide {
      animation-duration: 0.01ms;
    }
  }
  .cd-table-column-filter-list {
    margin: 0;
    padding: 0;
    list-style: none;
    max-height: var(--cd-height-table-column-filter-dropdown);
    overflow-y: auto;
  }
  .cd-table-column-filter-label {
    display: flex;
    align-items: center;
    gap: var(--cd-spacing-tight);
    padding: var(--cd-spacing-extra-tight) var(--cd-spacing-base-tight);
    cursor: pointer;
  }
  .cd-table-column-filter-label:hover {
    background: var(--cd-color-table-body-bg-hover);
  }
  .cd-table-column-filter-actions {
    display: flex;
    justify-content: space-between;
    gap: var(--cd-spacing-tight);
    padding: var(--cd-spacing-extra-tight) var(--cd-spacing-base-tight);
    border-top: var(--cd-width-table-base-border) var(--cd-border-table-base-borderstyle) var(--cd-color-table-border-default);
  }
  .cd-table-column-filter-reset,
  .cd-table-column-filter-confirm {
    padding: 0;
    border: none;
    background: transparent;
    font: inherit;
    font-size: var(--cd-font-size-small);
    cursor: pointer;
  }
  .cd-table-column-filter-reset {
    color: var(--cd-color-table-filter-text-default);
  }
  .cd-table-column-filter-confirm {
    color: var(--cd-color-table-filter-on-text-default);
  }

  /* ===== 列宽拖拽：.react-resizable-handle 自身样式迁至 ResizableHeaderCell.svelte
     （Svelte scoped CSS 不跨组件生效，该 <span> 元素已不在本文件模板里）。
     .cd-table-row-head-resizable（位置基准）与 .resizing.cd-table-row-head（表头拖拽中
     标示线）挂载点在 TableHeaderRow.svelte，规则同理迁至该文件。此处只保留数据行
     .resizing.cd-table-row-cell（若未来数据行也标 resizing class 时生效，目前无挂载点，
     保留是为了不丢 Semi 对齐语义，非死代码故意保留供后续对齐）。 */
  .resizing.cd-table-row-cell {
    border-right: var(--cd-width-table-resizer-border) solid var(--cd-color-table-resizer-bg-default);
  }

  /* ===== 行选择 checkbox 包裹 .semi-table-selection-wrap =====
     全部由 ColumnSelection.svelte 渲染（批次1拆出），跨组件须 :global()。 */
  :global(.cd-table-selection-wrap) {
    display: inline-flex;
    vertical-align: bottom;
  }
  :global(.cd-table-selection-disabled) {
    cursor: not-allowed;
  }
  :global(.cd-table-selection-checkbox) {
    cursor: pointer;
    accent-color: var(--cd-color-primary);
  }
  :global(.cd-table-selection-checkbox):disabled {
    cursor: not-allowed;
  }
  :global(.cd-table-selection-checkbox):focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }

  /* ===== 展开图标 .semi-table-expand-icon =====
     可交互的展开按钮实际由 CustomExpandIcon.svelte（批次1拆出）/SectionRow.svelte
     （批次2拆出）渲染，本文件内只有不可交互的 -placeholder 占位符。以下规则统一
     :global()（同一类"拆组件后普通scoped CSS祖先链全面失效"的坑：此前是普通 scoped
     规则，命中真实按钮时因 scoped hash 不匹配从不生效——真机验证发现点击展开后
     class 正确切到 cd-table-expandedIcon-show，但 computed transform 仍是 none，
     旋转动画完全未生效）。 */
  :global(.cd-table-expand-icon) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    user-select: none;
    position: relative;
    cursor: pointer;
    padding: 0;
    border: none;
    vertical-align: middle;
    background: var(--cd-color-table-expanded-bg-default);
    color: var(--cd-color-table-expanded-icon-default);
    margin-right: var(--cd-spacing-table-expand-icon-marginright);
    transition: transform 150ms cubic-bezier(0.62, 0.05, 0.36, 0.95);
  }
  :global(.cd-table-expand-icon):hover {
    color: var(--cd-color-table-text-default);
  }
  :global(.cd-table-expand-icon):focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
    border-radius: var(--cd-border-radius-small);
  }
  /* 旋转态：展开 90°（对齐 Semi -expandedIcon-show/-hide） */
  :global(.cd-table-expandedIcon-show) {
    transform: rotate(90deg);
  }
  :global(.cd-table-expandedIcon-hide) {
    transform: rotate(0deg);
  }
  .cd-table-expand-icon-placeholder {
    width: 16px;
    height: 16px;
    background: transparent;
    pointer-events: none;
    cursor: default;
  }
  /* 展开按钮并入首列（hideExpandedColumn）内联包裹 */
  .cd-table-expand-icon-cell {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    vertical-align: middle;
  }
  /* 树形缩进占位 */
  .cd-table-row-indent {
    display: inline-block;
    vertical-align: middle;
  }

  /* ===== 分页器 .semi-table-pagination-outer =====
     全部由 TablePagination.svelte 渲染（批次4拆出），跨组件须 :global()。 */
  :global(.cd-table-pagination-outer) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: var(--cd-height-table-pagination-outer-min);
    color: var(--cd-color-table-page-text-default);
  }
  /* 分页左侧 range 文案（显示第 X-Y 条，共 N 条），对齐 Semi 灰色说明文字。 */
  :global(.cd-table-pagination-total) {
    color: var(--cd-color-table-page-text-default);
    font-size: var(--cd-font-size-regular, 14px);
  }

  /* ===== 标题 / footer ===== */
  .cd-table-title {
    position: relative;
    padding-top: var(--cd-spacing-table-title-paddingy);
    padding-bottom: var(--cd-spacing-table-title-paddingy);
    padding-left: var(--cd-spacing-table-title-paddingx);
    padding-right: var(--cd-spacing-table-title-paddingx);
  }
  .cd-table-footer {
    background-color: var(--cd-color-table-footer-bg-default);
    padding: var(--cd-spacing-table-footer-padding);
    margin: 0;
    position: relative;
  }

  /* 加载态：复用 Spin 组件（对齐 Semi <Spin spinning={loading} size="large">），
     不再手写遮罩/spinner 视觉与 @keyframes，样式由 Spin.svelte 自己承担。 */

  @media (prefers-reduced-motion: reduce) {
    .cd-table-expand-icon {
      transition: none;
    }
  }

  /* —— RTL（对齐 Semi table/rtl.scss，完整覆盖，非此前 3 条精简版）——
     选择器锚点用 .cd-table-wrapper-rtl（挂在本组件最外层 wrapper，同批同时带
     dir="rtl"），对齐本库 Modal/SideSheet 已用惯例（class:cd-{component}-rtl +
     :global(.cd-{component}-rtl) 祖先选择器），非全局 .cd-rtl。 */

  /* 表体默认文字方向由左改右（表头文字方向 + align-left/right operate-wrapper 镜像
     已移至 TableHeaderRow.svelte——.cd-table-row-head/.cd-table-operate-wrapper
     都在该组件渲染，同样是跨组件祖先链失效的坑，见该文件对应规则注释）。
     真实 <table> 元素由 HeadTable.svelte/Body.svelte 渲染（同批修复 .cd-table 基础
     规则时的同一根因），故 .cd-table 部分也须 :global()，不能只包裹 .cd-table-wrapper-rtl
     ——"部分 global"（只包一段，复合选择器里其余段仍会被加本文件 hash）不可靠，
     整条选择器统一 :global() 才是唯一可靠写法。 */
  :global(.cd-table-wrapper-rtl .cd-table) {
    direction: rtl;
    text-align: right;
  }

  /* 固定列边框 + 阴影：class 归属已在 fixedCellClass()/leadingFixedClass 按
     isRtl 交换（-left-last↔-right-first 語義随视觉左右重新分配，对齐 Semi
     TableCell.tsx/TableHeaderRow.tsx 的 isRTL 分支），但 Semi rtl.scss 在此基础上
     仍对同一对 class 显式重写了 border-left/right（tbody 见 rtl.scss L74-88，
     独立于 JS 端已完成的 class 语义交换）。两处是否重复镜像存疑——按 Semi 实际
     产物（rtl.scss 源码字面量）照抄，不按自己的推导省略，避免主观判断引入偏差。
     若未来有条件真机对比 Semi RTL 固定列渲染，可用于校验此处是否需要精简。

     选择器省去 Semi 原文的 `.cd-table-tbody > .cd-table-row >` 祖先链：这条 <tr> 由
     BaseRow.svelte 渲染（批次2拆分后），带的是该组件自己的 scoped hash，不是本文件
     的 hash；`:global()` 只包在最外层 `.cd-table-wrapper-rtl` 时，Svelte 仍会给链条
     中间未被 :global() 包裹的 `.cd-table-tbody`/`.cd-table-row` 追加本文件 hash，
     导致这段祖先链在真实 DOM 里永远不可能匹配（真机验证发现：computed border 值与
     规则定义正好相反，命中的是未加 RTL 覆盖前的 LTR 基础规则）。.cd-table-cell-fixed-
     left-last/-right-first 在语义上已经唯一（只出现在固定列单元格），无需祖先链
     消歧——但目标 class 自身同样须 :global()：它同时命中表头 th（TableHeaderRow.svelte）
     与 tbody td（本文件），未包裹时只对本文件内元素生效，RTL 覆盖在表头侧同样会
     静默失效（与上方基础规则同一类坑）。 */
  :global(.cd-table-wrapper-rtl) :global(.cd-table-cell-fixed-left-last) {
    border-right: 0;
    border-left: var(--cd-width-table-cell-fixed-left-last) solid var(--cd-color-table-shadow-border-default);
  }
  :global(.cd-table-wrapper-rtl) :global(.cd-table-cell-fixed-right-first) {
    border-left: 0;
    border-right: var(--cd-width-table-cell-fixed-right-first) solid var(--cd-color-table-shadow-border-default);
  }

  /* bordered 模式：容器/单元格/placeholder 边框左右互换。
     表头 <th> 一侧（.cd-table-row-head）已移至 TableHeaderRow.svelte（该 class 命中
     该文件内高频渲染点，:global()+长组合链在此处曾实测触发 svelte.compile() 编译
     卡死不返回，详见 TableHeaderRow.svelte 对应规则注释）。 */
  :global(.cd-table-wrapper-rtl.cd-table-wrapper-bordered) .cd-table-container {
    border-left: 0;
    border-right: var(--cd-width-table-base-border) var(--cd-border-table-base-borderstyle) var(--cd-color-table-border-default);
  }
  /* 条件前缀用 .cd-table-wrapper-bordered（挂在最外层 wrapper，与 .cd-table-wrapper-rtl
     同级）而非 .cd-table-bordered（table 元素上的 class）：双 table 架构下 <table> 由
     HeadTable.svelte/Body.svelte 渲染，.cd-table-bordered 前缀会被加上本文件 hash，
     与 table 元素实际携带的 hash 不同，导致祖先链在真实 DOM 里不可能匹配（同一类
     "跨组件祖先链失效"坑，详见 TableHeaderRow.svelte 对应规则注释）。 */
  :global(.cd-table-wrapper-rtl.cd-table-wrapper-bordered) .cd-table-row-cell {
    border-right: 0;
    border-left: var(--cd-width-table-base-border) var(--cd-border-table-base-borderstyle) var(--cd-color-table-border-default);
  }
  /* RTL 镜像：LTR 覆盖层画右边框（阅读方向下会被裁切的是右侧），RTL 画左边框
     （对齐 Semi rtl.scss #441 fix，条件也镜像为 scroll-position-left）。 */
  :global(.cd-table-wrapper-rtl.cd-table-wrapper-bordered):not(:has(:global(.cd-table-scroll-position-left))) .cd-table-container::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: var(--cd-width-table-base-border);
    background-color: var(--cd-color-table-border-default);
    display: block;
    z-index: calc(var(--cd-z-table-fixed-column) + 2);
    pointer-events: none;
  }
  :global(.cd-table-wrapper-rtl.cd-table-wrapper-bordered):not(:has(:global(.cd-table-scroll-position-left))) .cd-table-container :global(.cd-table-head) {
    box-shadow: inset var(--cd-width-table-base-border) 0 0 0 var(--cd-color-table-border-default);
  }
  :global(.cd-table-wrapper-rtl) .cd-table-placeholder {
    border-left: var(--cd-width-table-base-border) var(--cd-border-table-base-borderstyle) var(--cd-color-table-border-default);
    border-right: 0;
  }

  /* Spin/loading 遮罩：对齐 Semi rtl.scss `.semi-spin { direction: rtl }`。
     本库加载态用简单转圈 spinner（非 Spin 组件实例），无方向敏感内容，跳过。 */
</style>
