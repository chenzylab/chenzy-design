<!--
  Table — see specs/components/show/Table.spec.md
  列定义驱动渲染：三态排序、客户端分页、行选择(含半选)，受控/非受控双轨。
  受控 sortState / rowSelection.selectedRowKeys / pagination.current 不回写，
  仅通过 onSortChange / rowSelection.onChange / pagination.onChange 通知 (红线 #1)。
  复用 @chenzy-design/core 纯函数算法与 Pagination 组件，不重复实现。
  固定列：column.fixed='left'|'right'，横滚时 sticky 锁定 + 逐列像素偏移 + 边界阴影。
  列筛选：column.filters + onFilter，列头漏斗弹浮层多选过滤（复用 _floating + useDismiss）。
  列宽拖拽：column.resizable，列头右侧拖拽手柄，指针几何命令式管理(红线 #3)；
  覆盖宽度存本地 SvelteMap 不写回 columns prop(红线 #1)，进 cellStyle 宽度计算。
  树形数据：tree=true 或 tree={{ childrenColumnName, indentSize, expandedRowKeys... }}；
  行含 children 自动嵌套，第一列内展开三角 + 逐级缩进；排序/分页/筛选作用于顶层行，
  可见行经 core flattenTreeRows 纯函数扁平化驱动 tbody (红线 #2)；受控展开 keys 不回写 (红线 #1)。
  树形行选择父子联动：rowSelection.checkStrictly 默认 false=联动（勾父连带勾全部后代，
  后代部分选中父行半选 indeterminate），true=父子独立(向后兼容)。联动 {checked,half} 经 core
  conductRows/toggleRowCheck 纯函数据整棵可见行树派生 (红线 #2)；内部存叶子级 base，
  onChange 回传含父行的完整 checked 集；半选写 input.indeterminate 复用 attachment (红线 #3)。
  行虚拟滚动：virtualized=true 时 .cd-table-body 自身纵向滚动(固定 height)，thead sticky 固定顶部，
  tbody 仅渲染视口内行切片(复用 core fixedRange 算可见区间)，首尾各一个 padding spacer tr 撑出
  未渲染行总高(保持原生 <table>/<tr>/<td> 语义与 a11y)。scrollTop 命令式 scroll 回调 + rAF 节流写入
  本地 $state，可见区间纯 $derived render 期只读(红线 #2/#3)。virtualized 与 pagination 互斥(虚拟时
  忽略分页全量滚动)；排序/筛选/行选择/树形/固定列均正常协同。假定行等高，不建议与 expandable 混用。
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
  import { Pagination } from '../pagination/index.js';
  import {
    IconCaretup,
    IconCaretdown,
    IconFilter,
    IconChevronRight,
    IconTreeTriangleRight,
  } from '@chenzy-design/icons';
  import { floating } from '../_floating/use-floating.js';
  import { useDismiss } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';
  import {
    buildGridCols,
    nextGridCoord,
    isFocusCell as isFocusCellPure,
    rovingTabindexAt,
    type GridCol,
  } from './grid-nav.js';
  import type {
    ColumnDef,
    RowSelection,
    ResizableConfig,
    RowAttrs,
    Expandable,
    TreeTable,
    Align,
    TableSize,
    TableChangeInfo,
    TableChangeAction,
    TableScrollInfo,
    ScrollConfig,
  } from './types.js';
  import Tooltip from '../tooltip/Tooltip.svelte';
  import FilterDropdownHost from './FilterDropdownHost.svelte';
  import Checkbox from '../checkbox/Checkbox.svelte';
  import Radio from '../radio/Radio.svelte';

  // 泛型组件 props 用内联类型而非具名 interface Props：在 declaration:true 下，
  // 引用泛型参数 T 的具名 interface 会被当作私有名泄漏进生成的 .d.ts 公共签名而报错。
  let {
    columns = [],
    dataSource = [],
    rowKey = 'key',
    size = 'default',
    bordered = false,
    stripe = false,
    loading = false,
    sortState,
    defaultSortState = { key: null, order: null },
    onSortChange,
    pagination,
    rowSelection,
    expandable,
    tree,
    rowClassName,
    empty,
    ariaLabel,
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
    gridNav,
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
    dataSource?: T[];
    rowKey?: string | ((record: T) => RowKey);
    size?: TableSize;
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
          /** 受控当前页（本库旧名，与 currentPage 等效，currentPage 优先） */
          current?: number;
          /** 非受控默认当前页（对齐 Semi defaultCurrentPage） */
          defaultCurrentPage?: number;
          /** 非受控默认当前页（本库旧名，与 defaultCurrentPage 等效） */
          defaultCurrent?: number;
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
    expandable?: Expandable<T>;
    tree?: boolean | TreeTable;
    rowClassName?: (record: T, index: number) => string;
    empty?: string;
    /** 空数据占位自定义渲染（富内容，如 Empty 组件；优先于 empty 文案，对齐 Semi empty: ReactNode） */
    emptySnippet?: Snippet;
    ariaLabel?: string;
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
     *  假定行等高（rowHeight）；与 expandable 同用时展开内容行不计入高度，故不建议混用。 */
    virtualized?: boolean;
    /** 虚拟滚动视口高度（px）。virtualized 时生效，默认 400 */
    height?: number;
    /** 虚拟滚动行高（px）。virtualized 时生效，默认 48 */
    rowHeight?: number;
    /**
     * 交互态 WAI-ARIA Grid Pattern 开关（role=grid + 单元格二维方向键漫游 +
     * roving tabindex + 虚拟化焦点回收）。
     * - 缺省（undefined）：当存在交互能力（排序/筛选/行选择/展开/树形/行点击）时自动启用 grid，
     *   纯展示表保持 role=table，省去漫游逻辑（spec §3 纯展示降级）。
     * - 显式 true/false：强制启用/关闭 grid 漫游。
     */
    gridNav?: boolean;
    /** 横/纵向滚动配置，x 设最小宽度并横向溢出，y 设最大高度并纵向溢出 */
    scroll?: ScrollConfig;
    /** 表头吸顶：true 时表头 sticky 定位；对象时可指定 offsetHeader（px） */
    sticky?: boolean | { offsetHeader?: number };
    /** 是否显示表头，默认 true */
    showHeader?: boolean;
    /** 默认展开全部行（包含树形行），默认 false */
    defaultExpandAllRows?: boolean;
    /** 是否展开所有行（对齐 Semi expandAllRows；受控语义弱化为初始态同 defaultExpandAllRows） */
    expandAllRows?: boolean;
    /**
     * Table 级列伸缩开关（对齐 Semi resizable）。true 时所有带 width 的列可拖拽伸缩
     * （column.resize=false 单列关闭）；对象态提供 onResize/onResizeStart/onResizeStop
     * 事件（返回的对象与该列合并，如 className）。与列级 column.resizable 兼容并存。
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
    /** 树形缩进像素，默认 20（tree.indentSize 优先） */
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
    /** 分组展开/收起变化回调（点击分组标题行触发），回传当前展开的分组 key 集合 */
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
     * 仅在 expandable 展开列生效（树形行的展开三角另有渲染，不受此影响）。
     */
    expandIcon?: Snippet<[{ expanded: boolean; record: T }]>;
    /**
     * 展开按钮是否与首列文案渲染在同一单元格。默认 true（并入首列，对齐 Semi）；
     * 传 false 时展开按钮单独作为一列渲染（首列前的独立 expand 列）。仅 expandable 时生效。
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
    /** 树形 dataSource 中子级字段名，默认 'children'（对齐 Semi childrenRecordName；tree.childrenColumnName 优先） */
    childrenRecordName?: string;
    /** 最外层 .cd-table-wrapper 自定义样式名（对齐 Semi className） */
    class?: string;
    /** 最外层 .cd-table-wrapper 内联样式（对齐 Semi style） */
    style?: string;
    /**
     * 覆盖组成元素的 tag 名（对齐 Semi components）。Svelte 侧以标签名字符串生效，
     * 经 <svelte:element> 渲染，内部 class/role/事件仍注入。缺省用原生
     * table/thead/tbody/tr/th/td。常见用法：body.row='div' 配合拖拽库。
     */
    components?: {
      table?: string;
      header?: { wrapper?: string; row?: string; cell?: string };
      body?: { wrapper?: string; row?: string; cell?: string };
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

  const loc = useLocale();
  // 单例 live region（polite）：排序结果播报给屏幕阅读器（命令式写入在事件回调，红线 #3）。
  const announcer = useLiveAnnouncer();

  // --- 键解析 ---
  const getKey = (record: T): RowKey =>
    typeof rowKey === 'function' ? rowKey(record) : (record[rowKey] as RowKey);

  const colKeyOf = (col: ColumnDef<T>, index: number): string =>
    col.key ?? col.dataIndex ?? String(index);

  // --- 表头合并（column.children）：叶子列驱动 body/ColGroup/固定列，父列只作表头分组 ---
  // 无 children 时 leafColumns 与 columns 等价（零行为变化）。
  function flattenLeaves(cols: ColumnDef<T>[]): ColumnDef<T>[] {
    const out: ColumnDef<T>[] = [];
    for (const c of cols) {
      if (c.children && c.children.length > 0) out.push(...flattenLeaves(c.children));
      else out.push(c);
    }
    return out;
  }
  const leafColumns = $derived(flattenLeaves(columns));
  const hasHeaderMerge = $derived(columns.some((c) => c.children && c.children.length > 0));

  function leafCount(col: ColumnDef<T>): number {
    if (!col.children || col.children.length === 0) return 1;
    return col.children.reduce((s, c) => s + leafCount(c), 0);
  }
  const headerDepth = $derived.by(() => {
    const depth = (col: ColumnDef<T>): number =>
      col.children && col.children.length > 0 ? 1 + Math.max(...col.children.map(depth)) : 1;
    return columns.length ? Math.max(...columns.map(depth)) : 1;
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
    for (const col of columns) {
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
  // 当前正在拖拽的列 key（用于手柄高亮 / body class）
  let resizingKey = $state<string | null>(null);

  // 解析某列最终宽度：覆盖宽度优先，否则 col.width
  function resolveWidth(col: ColumnDef<T>, index: number): number | string | undefined {
    const ov = widthOverrides.get(colKeyOf(col, index));
    if (ov !== undefined) return ov;
    return col.width;
  }

  // 某列是否可伸缩：Table 级 resizable 开启时，带 width 且 column.resize!==false 的列
  // 可伸缩（对齐 Semi）；列级 column.resizable 保持兼容。
  function columnResizable(col: ColumnDef<T>): boolean {
    if (col.resizable) return true;
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
    flattenLeaves(columns).forEach((col, i) => {
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
  let filterPanelEl = $state<HTMLDivElement | null>(null);

  // 打开/关闭筛选浮层（统一入口：同步 temp 快照 + onFilterDropdownVisibleChange 通知）。
  function setFilterOpen(col: ColumnDef<T>, colKey: string, open: boolean) {
    if (open) {
      tempFilterState.set(colKey, [...effectiveFilterValues(col, colKey)]);
      openFilterKey = colKey;
    } else if (openFilterKey === colKey) {
      openFilterKey = null;
    }
    col.onFilterDropdownVisibleChange?.(open);
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
  function resetFilter(col: ColumnDef<T>, colKey: string) {
    filterState.set(colKey, new Set());
    setFilterOpen(col, colKey, false);
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
          const childKey = typeof tree === 'object' ? (tree.childrenColumnName ?? 'children') : (childrenRecordName ?? 'children');
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
          const childKey = typeof tree === 'object' ? (tree.childrenColumnName ?? 'children') : (childrenRecordName ?? 'children');
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

  // --- 分页：受控 currentPage/current 不回写 (红线 #1) ---
  // virtualized 与分页互斥：虚拟滚动时全量渲染滚动，忽略 pagination（取舍见 props 注释）。
  // currentPage（对齐 Semi）优先于旧名 current；defaultCurrentPage 优先于 defaultCurrent。
  const paginationEnabled = $derived(!virtualized && pagination !== false);
  const pageSize = $derived(pagination ? (pagination.pageSize ?? 10) : 10);
  const controlledPage = $derived(
    pagination ? (pagination.currentPage ?? pagination.current) : undefined,
  );
  const isPageControlled = $derived(controlledPage !== undefined);
  let innerPage = $state(initPage());
  function initPage(): number {
    return pagination ? (pagination.defaultCurrentPage ?? pagination.defaultCurrent ?? 1) : 1;
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
  // 受控 tree.expandedRowKeys 不回写，仅 onExpand 通知 (红线 #1)。
  const treeEnabled = $derived(tree !== undefined && tree !== false);
  const treeOpts = $derived<TreeTable>(typeof tree === 'object' ? tree : {});
  const childrenColumnName = $derived(treeOpts.childrenColumnName ?? childrenRecordName ?? 'children');
  const indentSize = $derived(treeOpts.indentSize ?? indentSizeProp);

  function getChildren(record: T): T[] | undefined {
    const kids = record[childrenColumnName];
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

  const isTreeExpandControlled = $derived(treeOpts.expandedRowKeys !== undefined);
  let innerTreeExpanded = $state<RowKey[]>(initTreeExpanded());
  function initTreeExpanded(): RowKey[] {
    if (typeof tree === 'object' && tree.defaultExpandedRowKeys) {
      return [...tree.defaultExpandedRowKeys];
    }
    if (defaultExpandAllRows) {
      // 递归收集所有含子行的行 key
      const keys: RowKey[] = [];
      const col = typeof tree === 'object' ? (tree.childrenColumnName ?? 'children') : 'children';
      const walk = (records: T[]): void => {
        for (const r of records) {
          const k = typeof rowKey === 'function' ? rowKey(r) : (r[rowKey as string] as RowKey);
          const kids = r[col];
          if (Array.isArray(kids) && kids.length > 0) {
            keys.push(k);
            walk(kids as T[]);
          }
        }
      };
      walk(dataSource);
      return keys;
    }
    return [];
  }
  // expandAllRows=true 时展开全部含子行的行（对齐 Semi expandAllRows，覆盖其余展开态）。
  const allTreeExpandableKeys = $derived.by<RowKey[]>(() => {
    if (expandAllRows !== true || !treeEnabled) return [];
    const keys: RowKey[] = [];
    const walk = (records: T[]): void => {
      for (const r of records) {
        const kids = getChildren(r);
        if (kids && kids.length > 0) {
          keys.push(getKey(r));
          walk(kids);
        }
      }
    };
    walk(dataSource);
    return keys;
  });
  const treeExpandedSet = $derived<Set<RowKey>>(
    expandAllRows === true
      ? new Set(allTreeExpandableKeys)
      : new Set(isTreeExpandControlled ? (treeOpts.expandedRowKeys ?? []) : innerTreeExpanded),
  );

  function toggleTreeExpand(record: T) {
    const key = getKey(record);
    const next = new Set(treeExpandedSet);
    const willExpand = !next.has(key);
    if (willExpand) next.add(key);
    else next.delete(key);
    if (!isTreeExpandControlled) innerTreeExpanded = [...next];
    treeOpts.onExpand?.(willExpand, key);
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
    return flattenTreeRows(visibleRows, treeExpandedSet, getKey, getChildren);
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

  // 固定列横滚位置检测（对齐 Semi scroll-position-left/right）：横滚容器 scrollLeft
  // 决定左/右固定列阴影显隐。命令式监听 + 初始同步，写本地 $state 只加 class（红线 #3）。
  let hRafId = 0;
  $effect(() => {
    const el = scrollEl;
    if (!el || !hasFixed) return;
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
  const hasExpand = $derived(expandable !== undefined);
  // 展开按钮是否占独立前置列：hideExpandedColumn=false 时独立成列；默认 true 并入首列（对齐 Semi）。
  const expandAsColumn = $derived(hasExpand && hideExpandedColumn === false);
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

  // --- 展开行：受控 expandedRowKeys 不回写 (红线 #1) ---
  const isExpandControlled = $derived(expandable?.expandedRowKeys !== undefined);
  let innerExpanded = $state<RowKey[]>(initExpanded());
  function initExpanded(): RowKey[] {
    if (expandable?.defaultExpandedRowKeys) {
      return [...expandable.defaultExpandedRowKeys];
    }
    if (defaultExpandAllRows && expandable) {
      return dataSource.map((r) =>
        typeof rowKey === 'function' ? rowKey(r) : (r[rowKey as string] as RowKey),
      );
    }
    return [];
  }
  const expandedSet = $derived<Set<RowKey>>(
    expandAllRows === true && expandable
      ? new Set(dataSource.map((r) => getKey(r)))
      : new Set(
          isExpandControlled
            ? (expandable?.expandedRowKeys ?? [])
            : innerExpanded,
        ),
  );

  function canExpand(record: T): boolean {
    return expandable?.rowExpandable ? expandable.rowExpandable(record) : true;
  }

  function toggleExpand(record: T) {
    const key = getKey(record);
    if (!canExpand(record)) return;
    const next = new Set(expandedSet);
    const willExpand = !next.has(key);
    if (willExpand) next.add(key);
    else next.delete(key);
    if (!isExpandControlled) innerExpanded = [...next];
    expandable?.onExpand?.(willExpand, record);
    onExpandChange?.({ expanded: willExpand, record, expandedRowKeys: [...next] });
  }

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

  // ===================================================================
  //  交互态 WAI-ARIA Grid Pattern：role=grid + 二维方向键漫游 + roving
  //  tabindex + 虚拟化焦点回收。
  //
  //  焦点模型（红线 #2/#3）：
  //  - 焦点坐标 focusRow/focusCol 为「逻辑索引」存本地 $state：
  //      focusRow = -1 表示表头行，0..displayRows.length-1 表示数据行（逻辑序，
  //      与虚拟化是否渲染无关）；focusCol 索引进「网格列」扁平表
  //      [expand?, selection?, ...dataColumns]。
  //  - 每个渲染单元格的 tabindex 由纯派生函数 rovingTabindex(row,col) 计算：
  //      命中焦点坐标 → 0，否则 -1；整个 grid 只有一个 tabbable 入口（APG）。
  //  - 方向键算下一坐标（纯函数 nextRovingIndex），命令式 focusCell() 聚焦：
  //      虚拟化下目标行未渲染先滚动进视口 + tick() 再 focus（render 期不写 $state）。
  //  - 被虚拟化回收的焦点行：$effect 监测，焦点回退到 grid 容器并 announce，
  //      不让焦点掉到 <body>。
  // ===================================================================

  // grid 是否启用：缺省自动检测交互能力；显式 gridNav 覆盖。
  const isInteractive = $derived(
    selectionEnabled ||
      hasExpand ||
      treeEnabled ||
      !!onRowClick ||
      columns.some((c) => !!c.sorter || (!!c.filters && c.filters.length > 0)),
  );
  const gridEnabled = $derived(gridNav !== undefined ? gridNav : isInteractive);

  // grid 单元格 id 前缀（稳定、SSR 安全）。
  const gridId = useId('cd-table-grid');
  // 网格列扁平表：前置 expand/selection 占位列 + 数据列（纯函数 buildGridCols）。
  const gridCols = $derived<GridCol[]>(
    buildGridCols({ hasExpand: expandAsColumn, hasSelection, dataColumnCount: leafColumns.length }),
  );
  const gridColCount = $derived(gridCols.length);
  // 总行数（含表头行）= aria-rowcount，虚拟化时为逻辑总数而非渲染数（spec §6）。
  const gridRowCount = $derived(displayRows.length + 1);

  // 焦点坐标（逻辑索引）。-1 行 = 表头；col 索引进 gridCols。
  // 初始未聚焦时为 null，首个 tab 停靠点回退到表头首格。
  let focusRow = $state(-1);
  let focusCol = $state(0);
  let hasFocused = $state(false);

  // 当前是否处于「单元格交互模式」（Enter/F2 进入，Esc 退出）。
  // 交互模式下单元格内可聚焦控件参与 Tab；导航模式下它们 tabindex=-1。
  let cellInteractive = $state(false);

  // 某 (row,col) 是否为当前 roving 焦点格（纯派生，render 期只读）。
  function isFocusCell(row: number, col: number): boolean {
    if (!gridEnabled) return false;
    return isFocusCellPure(row, col, { row: focusRow, col: focusCol, hasFocused });
  }
  // 单元格 roving tabindex：焦点格 0，其余 -1（仅 grid 启用时）。
  function rovingTabindex(row: number, col: number): 0 | -1 | undefined {
    if (!gridEnabled) return undefined;
    return rovingTabindexAt(row, col, { row: focusRow, col: focusCol, hasFocused });
  }
  // 单元格内交互控件的 tabindex：导航模式下 -1（不参与 Tab，靠 Enter/F2 进入），
  // 交互模式下当前焦点格内控件恢复 0。非 grid 时不接管（undefined）。
  function childTabindex(row: number, col: number): 0 | -1 | undefined {
    if (!gridEnabled) return undefined;
    if (cellInteractive && isFocusCell(row, col)) return 0;
    return -1;
  }
  // 单元格稳定 id（focusCell 命令式聚焦目标）。row=-1 表头记作 'h'。
  function cellId(row: number, col: number): string {
    return `${gridId}-r${row === -1 ? 'h' : row}-c${col}`;
  }

  // grid 容器（table 元素）引用 —— 焦点回收落点。
  let gridEl = $state<HTMLTableElement | null>(null);

  // 命令式聚焦某逻辑坐标的单元格：虚拟化下若行未渲染先滚动进视口 + tick 再聚焦。
  async function focusCell(row: number, col: number) {
    focusRow = row;
    focusCol = col;
    hasFocused = true;
    cellInteractive = false;
    // 数据行在虚拟化视口外：先滚动使其进入视口（render 期外，事件回调内，红线 #3）。
    if (virtualized && row >= 0 && scrollEl) {
      const inView = row >= vRange.startIndex && row < vRange.endIndex;
      if (!inView) {
        // 目标行顶部对齐到视口（留一行余量），写 scrollEl.scrollTop 触发 scroll 回调更新区间。
        const target = Math.max(0, row * vRowHeight);
        scrollEl.scrollTop = target;
        scrollTop = target;
        await tick();
      }
    }
    await tick();
    const el = gridEl?.querySelector<HTMLElement>(`#${cssEscape(cellId(row, col))}`);
    if (el) el.focus();
    else if (gridEl) gridEl.focus(); // 兜底：目标仍不可用，焦点回收到 grid 容器（不掉 body）。
  }

  // CSS.escape 兜底（id 仅含字母数字与 '-'，本不需转义，留作健壮性）。
  function cssEscape(id: string): string {
    return typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(id) : id;
  }

  // 二维方向键漫游 keydown（绑定在 grid table 上，事件委托冒泡）。
  function onGridKeydown(e: KeyboardEvent) {
    if (!gridEnabled) return;
    const key = e.key;

    // 交互模式：Esc 退出回导航模式并聚焦当前格；其余按键交给单元格内控件处理。
    if (cellInteractive) {
      if (key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        cellInteractive = false;
        void focusCellSameCoord();
      }
      return;
    }

    // Enter/F2：进入交互模式（聚焦当前格内首个可聚焦控件，无则不拦截）。
    if (key === 'Enter' || key === 'F2') {
      const entered = enterCellInteractive();
      if (entered) {
        e.preventDefault();
        e.stopPropagation();
      }
      return;
    }

    // 导航模式：用纯函数算下一坐标（PageUp/Down 翻一屏行数）。
    const pageRows = Math.max(1, Math.floor(height / vRowHeight) || 10);
    const next = nextGridCoord(
      key,
      { ctrl: e.ctrlKey, meta: e.metaKey },
      {
        current: { row: focusRow, col: focusCol },
        rowCount: displayRows.length,
        colCount: gridColCount,
        pageRows,
      },
    );
    if (!next) return; // 非漫游键
    e.preventDefault();
    e.stopPropagation();
    if (next.row !== focusRow || next.col !== focusCol || !hasFocused) {
      void focusCell(next.row, next.col);
    }
  }

  // 重聚焦当前坐标（退出交互模式时用，避免改坐标）。
  async function focusCellSameCoord() {
    await tick();
    const el = gridEl?.querySelector<HTMLElement>(`#${cssEscape(cellId(focusRow, focusCol))}`);
    if (el) el.focus();
  }

  // 进入交互模式：聚焦当前焦点格内首个可聚焦元素。返回是否成功进入。
  function enterCellInteractive(): boolean {
    const cell = gridEl?.querySelector<HTMLElement>(`#${cssEscape(cellId(focusRow, focusCol))}`);
    if (!cell) return false;
    const focusable = cell.querySelector<HTMLElement>(
      'button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"]):not(.cd-table-row-cell)',
    );
    if (!focusable) return false;
    cellInteractive = true;
    // tabindex 由 childTabindex 派生切到 0；命令式聚焦控件。
    void tick().then(() => focusable.focus());
    return true;
  }

  // 单元格被点击/获得焦点时，同步焦点坐标（鼠标与键盘一致）。
  function syncFocusCoord(row: number, col: number) {
    if (!gridEnabled) return;
    focusRow = row;
    focusCol = col;
    hasFocused = true;
  }

  // --- 虚拟化焦点回收 ---
  // 当聚焦数据行被滚出渲染区间（虚拟化卸载），焦点会掉到 <body>。监测并回收：
  // 把焦点移到 grid 容器（table，tabindex=-1）并 announce，保证键盘用户不丢失上下文。
  $effect(() => {
    if (!gridEnabled || !virtualized || !hasFocused) return;
    // 仅当焦点落在数据行、且该行不在渲染区间时回收。
    const row = focusRow;
    if (row < 0) return;
    const inView = row >= vRange.startIndex && row < vRange.endIndex;
    if (inView) return;
    const active = typeof document !== 'undefined' ? document.activeElement : null;
    // 仅当焦点确实在本 grid 内（即将随卸载丢失）时回收。
    if (gridEl && active && gridEl.contains(active)) {
      gridEl.focus();
      announcer.announce(
        loc().t('Table.rowCount', { count: displayRows.length }),
      );
    }
  });

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

  // --- 固定列：纯 CSS sticky + 逐列像素偏移计算 ---
  // selection / expand 前置列宽（与 CSS .cd-table-column-selection/--expand 对齐）
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
  const tableStyle = $derived(hasFixed ? `min-inline-size:${totalMinWidth}px` : undefined);

  function colNumWidth(col: ColumnDef<T>, index: number): number {
    const w = resolveWidth(col, index);
    return typeof w === 'number' ? w : 0;
  }

  // 每个数据列的 left 偏移（左固定列）：前置宽 + 之前所有左固定列宽之和
  const fixedLeftOffsets = $derived.by(() => {
    const out: (number | null)[] = [];
    let acc = leadingWidth;
    for (let i = 0; i < leafColumns.length; i++) {
      const col = leafColumns[i] as ColumnDef<T>;
      if (fixedOf(col) === 'left') {
        out.push(acc);
        acc += colNumWidth(col, i);
      } else {
        out.push(null);
      }
    }
    return out;
  });
  // 每个数据列的 right 偏移（右固定列）：之后所有右固定列宽之和
  const fixedRightOffsets = $derived.by(() => {
    const out: (number | null)[] = new Array(leafColumns.length).fill(null);
    let acc = 0;
    for (let i = leafColumns.length - 1; i >= 0; i--) {
      const col = leafColumns[i] as ColumnDef<T>;
      if (fixedOf(col) === 'right') {
        out[i] = acc;
        acc += colNumWidth(col, i);
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

  // 组合某数据列的 sticky 行内样式（含宽度）
  function cellStyle(col: ColumnDef<T>, i: number): string | undefined {
    const parts: string[] = [];
    const w = widthStyle(col, i);
    if (w) parts.push(w);
    const left = fixedLeftOffsets[i];
    const right = fixedRightOffsets[i];
    if (left != null) parts.push(`position:sticky`, `inset-inline-start:${left}px`);
    else if (right != null) parts.push(`position:sticky`, `inset-inline-end:${right}px`);
    return parts.length ? parts.join(';') : undefined;
  }

  function fixedCellClass(i: number): string {
    if (fixedLeftOffsets[i] != null) {
      return `cd-table-cell-fixed cd-table-cell-fixed-left${i === lastLeftFixed ? ' cd-table-cell-fixed-left-last' : ''}`;
    }
    if (fixedRightOffsets[i] != null) {
      return `cd-table-cell-fixed cd-table-cell-fixed-right${i === firstRightFixed ? ' cd-table-cell-fixed-right-first' : ''}`;
    }
    return '';
  }

  // 前置 leading 列在存在左固定列时也需 sticky 锁定在最左
  function leadingStyle(slot: 'expand' | 'selection'): string | undefined {
    if (!hasFixed || lastLeftFixed < 0) return undefined;
    const offset = slot === 'expand' ? 0 : expandAsColumn ? LEADING_W : 0;
    return `position:sticky;inset-inline-start:${offset}px`;
  }
  const leadingFixedClass = $derived(hasFixed && lastLeftFixed >= 0 ? 'cd-table-cell-fixed cd-table-cell-fixed-left' : '');

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

  const cls = $derived(
    [
      'cd-table',
      `cd-table-${size}`,
      bordered && 'cd-table-bordered',
      stripe && 'cd-table-stripe',
      hasFixed && 'cd-table-fixed',
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
      parts.push(`block-size:${height}px`, 'overflow:auto');
    }
    if (scroll?.y != null) {
      const yVal = typeof scroll.y === 'number' ? `${scroll.y}px` : scroll.y;
      parts.push(`max-block-size:${yVal}`, 'overflow-y:auto');
    }
    if (scroll?.x != null) {
      parts.push('overflow-x:auto');
    }
    return parts.length ? parts.join(';') : undefined;
  });

  const scrollTableStyle = $derived.by(() => {
    const parts: string[] = [];
    if (tableStyle) parts.push(tableStyle);
    if (scroll?.x != null) {
      const xVal = typeof scroll.x === 'number' ? `${scroll.x}px` : scroll.x;
      parts.push(`min-inline-size:${xVal}`);
    }
    return parts.length ? parts.join(';') : undefined;
  });

  // --- sticky prop: thead top offset ---
  const stickyOffset = $derived.by((): number => {
    if (!sticky) return 0;
    if (typeof sticky === 'object' && sticky.offsetHeader != null) return sticky.offsetHeader;
    return 0;
  });
  const isStickyHead = $derived(!!sticky || virtualized || scrollBody || scroll?.y != null);

  // --- selection column width style ---
  const selectionColStyle = $derived.by((): string | undefined => {
    const parts: string[] = [];
    if (rowSelection?.columnWidth != null) {
      const w = rowSelection.columnWidth;
      parts.push(`inline-size:${typeof w === 'number' ? `${w}px` : w}`);
    }
    if (rowSelection?.fixed) {
      // fixed selection column — sticky at start of row
      parts.push('position:sticky', 'inset-inline-start:0');
    }
    return parts.length ? parts.join(';') : undefined;
  });
  const selectionFixedClass = $derived(rowSelection?.fixed ? 'cd-table-cell-fixed cd-table-cell-fixed-left' : '');

  // --- groupBy: build grouped display rows ---
  type GroupRow = { type: 'group'; groupKey: string; group: T[]; expanded: boolean; groupIndex: number };
  type DataDisplayRow = FlatRow<T> & { type: 'data' };
  type RenderRow = DataDisplayRow | GroupRow;

  const isGrouped = $derived(groupBy !== undefined);

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
  // defaultExpandAllGroupRows 显式 false → 默认折叠；缺省(undefined)或 true → 默认展开
  // （向后兼容既有「分组头+组内行都显示」）。默认值纯 $derived、不落地为 $state，
  // 故数据变化产生的新分组自动继承默认展开态，无需 effect seed（红线 #2）。
  const isGroupExpandControlled = $derived(expandAllGroupRows !== undefined);
  const groupDefaultExpanded = $derived(defaultExpandAllGroupRows !== false);
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

<!-- 展开按钮：expandIcon 自定义图标覆盖默认三角。gridTab 为 grid 模式下的 roving tabindex（非 grid 时传 undefined）。 -->
{#snippet expandButton(record: T, key: RowKey, gridTab: number | undefined)}
  <button
    type="button"
    class="cd-table-expand-icon"
    class:cd-table-expandedIcon-show={expandedSet.has(key)}
    aria-expanded={expandedSet.has(key)}
    aria-label={expandedSet.has(key) ? loc().t('Table.collapseRow') : loc().t('Table.expandRow')}
    tabindex={gridTab}
    onclick={(e) => {
      e.stopPropagation();
      toggleExpand(record);
    }}
  >
    {#if expandIcon}
      {@render expandIcon({ expanded: expandedSet.has(key), record })}
    {:else}
      <IconChevronRight size="small" aria-hidden="true" />
    {/if}
  </button>
{/snippet}

<!-- 行选择输入框（radio/checkbox，含 rowSelection.renderCell 自定义渲染）。
     gridTab 为 grid 模式下 roving tabindex（非 grid/物料摆放传 undefined）。 -->
{#snippet rowSelectionInput(record: T, selected: boolean, rowHalf: boolean, rowDisabled: boolean, gridTab: 0 | -1 | undefined)}
  {#snippet selectionOrigin()}
    {#if rowSelection?.type === 'radio'}
      <Radio
        class="cd-table-selection-checkbox"
        ariaLabel={loc().t('Table.selectRow')}
        checked={selected}
        disabled={rowDisabled}
        tabindex={gridTab}
        onChange={() => onToggleRow(record)}
      />
    {:else}
      <Checkbox
        class="cd-table-selection-checkbox"
        ariaLabel={loc().t('Table.selectRow')}
        checked={selected}
        disabled={rowDisabled}
        indeterminate={rowHalf}
        tabindex={gridTab}
        onChange={() => onToggleRow(record)}
      />
    {/if}
  {/snippet}
  <span
    class="cd-table-selection-wrap"
    class:cd-table-selection-disabled={rowDisabled}
    role="presentation"
    onclick={(e) => e.stopPropagation()}
  >
    {#if rowSelection?.renderCell}
      {@render rowSelection.renderCell({
        selected,
        record,
        originNode: selectionOrigin,
        inHeader: false,
        disabled: rowDisabled,
        indeterminate: rowHalf,
        selectRow: () => onToggleRow(record),
      })}
    {:else}
      {@render selectionOrigin()}
    {/if}
  </span>
{/snippet}

<!-- 最外层 .semi-table-wrapper（含方向 ltr/rtl），对齐 Semi 分层 -->
<div
  class="cd-table-wrapper cd-table-wrapper-{direction} {className ?? ''}"
  class:cd-table-wrapper-rtl={direction === 'rtl'}
  data-column-fixed={hasFixed ? 'true' : undefined}
  dir={direction}
  {style}
  bind:this={wrapperEl}
>
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
    <div
      class="cd-table-body"
      class:cd-table-body-virtual={virtualized}
      class:cd-table-body-scroll={scrollBody}
      class:cd-table-scroll-position-left={hasFixed && scrollPosLeft}
      class:cd-table-scroll-position-right={hasFixed && scrollPosRight}
      bind:this={scrollEl}
      style={scrollWrapStyle}
    >
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <!-- role=grid 是交互容器；tabindex=-1 仅作虚拟化焦点回收落点，不进 Tab 序列 -->
  <table
    bind:this={gridEl}
    class={cls}
    style={scrollTableStyle}
    aria-label={ariaLabel}
    role={gridEnabled ? 'grid' : undefined}
    aria-rowcount={gridEnabled ? gridRowCount : undefined}
    aria-colcount={gridEnabled ? gridColCount : undefined}
    tabindex={gridEnabled ? -1 : undefined}
    onkeydown={gridEnabled ? onGridKeydown : undefined}
  >
    <!-- ColGroup：对齐 Semi，每列一个 <col>，selection/expand 列带对应 class -->
    <colgroup class="cd-table-colgroup">
      {#if expandAsColumn}
        <col class="cd-table-column-expand" style="width:{LEADING_W}px" />
      {/if}
      {#if hasSelection}
        <col class="cd-table-column-selection" style="width:{selectionColWidth}px" />
      {/if}
      {#each leafColumns as col, i (colKeyOf(col, i))}
        <col class={col.className} style={colGroupStyle(col, i)} />
      {/each}
    </colgroup>
    {#if showHeader}
      {@const headerRowProps = onHeaderRow ? onHeaderRow(columns, 0) : undefined}
    <svelte:element
      this={tagThead}
      class="cd-table-thead"
      class:cd-table-thead-sticky={isStickyHead}
      style={isStickyHead && stickyOffset > 0 ? `top:${stickyOffset}px` : undefined}
    >
      <svelte:element
        this={tagHeaderRow}
        role={gridEnabled ? 'row' : undefined}
        aria-rowindex={gridEnabled ? 1 : undefined}
        class="cd-table-row {headerRowProps?.className ?? ''}"
        style={headerRowProps?.style ?? undefined}
        onclick={headerRowProps?.onClick ?? undefined}
        onmouseenter={headerRowProps?.onMouseEnter ?? undefined}
        onmouseleave={headerRowProps?.onMouseLeave ?? undefined}
      >
        {#if expandAsColumn}
          {@const gc = 0}
          <th
            rowspan={hasHeaderMerge ? headerDepth : undefined}
            class="cd-table-row-head cd-table-column-expand {leadingFixedClass}"
            scope="col"
            style={mergeHeaderStyle(leadingStyle('expand'))}
            role={gridEnabled ? 'columnheader' : undefined}
            id={gridEnabled ? cellId(-1, gc) : undefined}
            tabindex={rovingTabindex(-1, gc)}
            aria-colindex={gridEnabled ? gc + 1 : undefined}
            onfocusin={gridEnabled ? () => syncFocusCoord(-1, gc) : undefined}
          ></th>
        {/if}
        {#if hasSelection}
          {@const gc = expandAsColumn ? 1 : 0}
          {@const isRadio = rowSelection?.type === 'radio'}
          {@const showSelectAll = !isRadio && !rowSelection?.hideSelectAll}
          <th
            rowspan={hasHeaderMerge ? headerDepth : undefined}
            class="cd-table-row-head cd-table-column-selection {selectionFixedClass || leadingFixedClass}"
            scope="col"
            style={mergeHeaderStyle(selectionColStyle ?? leadingStyle('selection'))}
            role={gridEnabled ? 'columnheader' : undefined}
            id={gridEnabled ? cellId(-1, gc) : undefined}
            tabindex={rovingTabindex(-1, gc)}
            aria-colindex={gridEnabled ? gc + 1 : undefined}
            onfocusin={gridEnabled ? () => syncFocusCoord(-1, gc) : undefined}
          >
            {#if showSelectAll}
              {#snippet headerSelectionOrigin()}
                <Checkbox
                  class="cd-table-selection-checkbox"
                  ariaLabel={loc().t('Table.selectAll')}
                  checked={headerSelect.checked}
                  disabled={rowSelection?.disabled === true}
                  indeterminate={headerSelect.indeterminate}
                  tabindex={childTabindex(-1, gc)}
                  onChange={() => onToggleAll()}
                />
              {/snippet}
              <span class="cd-table-selection-wrap" class:cd-table-selection-disabled={rowSelection?.disabled === true}>
                {#if rowSelection?.renderCell}
                  {@render rowSelection.renderCell({
                    selected: headerSelect.checked,
                    originNode: headerSelectionOrigin,
                    inHeader: true,
                    disabled: rowSelection?.disabled === true,
                    indeterminate: headerSelect.indeterminate,
                    selectAll: () => onToggleAll(),
                  })}
                {:else}
                  {@render headerSelectionOrigin()}
                {/if}
              </span>
            {/if}
          </th>
        {/if}
        {#if !hasHeaderMerge}
          {#each leafColumns as col, i (colKeyOf(col, i))}
            {@render leafHeaderCell(col, i, 1)}
          {/each}
        {:else}
          <!-- 合并模式首行：expand/selection th 已 rowspan 跨满，其后接 headerRows[0] -->
          {#each headerRows[0] ?? [] as hc (hc.isLeaf ? colKeyOf(hc.col, hc.leafIndex) : `g-${typeof hc.col.title === 'string' ? hc.col.title : (hc.col.key ?? '')}-${hc.leafIndex}`)}
            {@render headerMergeCell(hc)}
          {/each}
        {/if}
      </svelte:element>
      {#if hasHeaderMerge}
        {#each headerRows.slice(1) as hrow, ri (ri)}
          <tr class="cd-table-row">
            {#each hrow as hc (hc.isLeaf ? colKeyOf(hc.col, hc.leafIndex) : `g-${typeof hc.col.title === 'string' ? hc.col.title : (hc.col.key ?? '')}-${hc.leafIndex}`)}
              {@render headerMergeCell(hc)}
            {/each}
          </tr>
        {/each}
      {/if}
    </svelte:element>
    {/if}
    {#snippet headerMergeCell(hc: HeaderCell)}
      {#if hc.isLeaf}
        {@render leafHeaderCell(hc.col, hc.leafIndex, hc.rowSpan)}
      {:else}
        <th
          class="cd-table-row-head cd-table-align-{alignOf(hc.col)}"
          class:cd-table-row-cell-ellipsis={!!hc.col.ellipsis}
          scope="colgroup"
          colspan={hc.colSpan}
          role={gridEnabled ? 'columnheader' : undefined}
          style={mergeHeaderStyle(undefined)}
        >
          <span class="cd-table-row-head-title">{@render columnTitle(hc.col)}</span>
        </th>
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
        use:floating={{ trigger: filterTriggers[colKey], placement: 'bottomEnd', autoAdjust: true, offset: 4, getContainer: getPopupContainer }}
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
        <div class="cd-table-column-filter-actions">
          {#if confirmMode}
            <button type="button" class="cd-table-column-filter-reset" onclick={() => resetTempFilter(col, colKey)}>{loc().t('Table.filterReset')}</button>
            <button type="button" class="cd-table-column-filter-confirm" onclick={() => confirmFilter(col, colKey)}>{loc().t('Table.filterConfirm')}</button>
          {:else}
            <button type="button" class="cd-table-column-filter-reset" onclick={() => resetFilter(col, colKey)}>{loc().t('Table.filterReset')}</button>
            <button type="button" class="cd-table-column-filter-confirm" onclick={() => setFilterOpen(col, colKey, false)}>{loc().t('Table.filterConfirm')}</button>
          {/if}
        </div>
        {/if}
      </div>
    {/snippet}
    {#snippet sorterIcons(order: 'ascend' | 'descend' | null, col: ColumnDef<T>)}
      {#if col.sortIcon}
        {@render col.sortIcon({ sortOrder: order })}
      {:else}
        <span class="cd-table-column-sorter" aria-hidden="true">
          <span class="cd-table-column-sorter-up" class:on={order === 'ascend'}>
            <IconCaretup size="small" />
          </span>
          <span class="cd-table-column-sorter-down" class:on={order === 'descend'}>
            <IconCaretdown size="small" />
          </span>
        </span>
      {/if}
    {/snippet}
    {#snippet leafHeaderCell(col: ColumnDef<T>, i: number, thRowSpan: number)}
          {@const gc = (expandAsColumn ? 1 : 0) + (hasSelection ? 1 : 0) + i}
          {@const sortable = !!col.sorter}
          {@const colKey = colKeyOf(col, i)}
          {@const hasFilter = (!!col.filters && col.filters.length > 0) || !!col.renderFilterDropdown}
          {@const colResizable = columnResizable(col)}
          {@const headerCellProps = col.onHeaderCell ? col.onHeaderCell(col, i) : undefined}
          {@const resizeOverride = resizeOverrides.get(colKey)}
          {#if col.colSpan !== 0}
          <th
            rowspan={thRowSpan > 1 ? thRowSpan : undefined}
            colspan={col.colSpan !== undefined && col.colSpan > 1 ? col.colSpan : undefined}
            class="cd-table-row-head cd-table-align-{alignOf(col)} {fixedCellClass(i)} {headerCellProps?.className ?? ''} {resizeOverride?.className ?? ''}"
            class:cd-table-row-cell-ellipsis={!!col.ellipsis}
            class:cd-table-row-head-has-filter={hasFilter}
            class:cd-table-row-head-resizable={colResizable}
            class:resizing={resizingKey === colKey}
            scope="col"
            style={mergeCellStyle(mergeHeaderStyle(cellStyle(col, i)), headerCellProps?.style)}
            aria-sort={sortable ? ariaSortFor(col, i) : undefined}
            role={gridEnabled ? 'columnheader' : undefined}
            id={gridEnabled ? cellId(-1, gc) : undefined}
            tabindex={rovingTabindex(-1, gc)}
            aria-colindex={gridEnabled ? gc + 1 : undefined}
            onfocusin={gridEnabled ? () => syncFocusCoord(-1, gc) : undefined}
            onclick={headerCellProps?.onClick ?? undefined}
            onmouseenter={headerCellProps?.onMouseEnter ?? undefined}
            onmouseleave={headerCellProps?.onMouseLeave ?? undefined}
          >
            <!-- 对齐 Semi：仅在有 sorter/filter 时套 .semi-table-operate-wrapper（flex），
                 消除 inline descender 撑高；纯自定义 title（无 sorter）不套 flex，
                 直接渲染保持其 inline 布局与 Semi 一致（Semi 自定义 title 不套 operate-wrapper）。 -->
            <div class="cd-table-operate-wrapper" class:cd-table-operate-plain={typeof col.title !== 'string' && !sortable}>
            {#if sortable}
              {@const order = col.sortOrder !== undefined ? col.sortOrder : (currentSort.key === colKeyOf(col, i) ? currentSort.order : null)}
              {@const showTip = col.showSortTip === true && col.sortOrder === undefined}
              <button
                type="button"
                class="cd-table-column-sorter-wrapper"
                tabindex={childTabindex(-1, gc)}
                onclick={() => onSort(col, i)}
              >
                <span class="cd-table-row-head-title">{@render columnTitle(col)}</span>
                {#if showTip}
                  {@const tipKey = order === 'ascend' ? 'Table.sortDescend' : order === 'descend' ? 'Table.sortCancel' : 'Table.sortAscend'}
                  <Tooltip content={loc().t(tipKey)}>
                    {@render sorterIcons(order, col)}
                  </Tooltip>
                {:else}
                  {@render sorterIcons(order, col)}
                {/if}
              </button>
            {:else if typeof col.title !== 'string'}
              <!-- 自定义 title（函数）：透传 selection/filter 物料，由使用方摆放（对齐 Semi
                   title({ selection, filter, sorter })）。摆放 selection 全选框会撑高表头至 41px。 -->
              {#snippet headerSelectionMaterial()}
                {#if selectionEnabled}
                  <Checkbox
                    class="cd-table-selection-checkbox"
                    ariaLabel={loc().t('Table.selectAll')}
                    checked={headerSelect.checked}
                    disabled={rowSelection?.disabled === true}
                    indeterminate={headerSelect.indeterminate}
                    tabindex={childTabindex(-1, gc)}
                    onChange={() => onToggleAll()}
                  />
                {/if}
              {/snippet}
              {#snippet headerFilterMaterial()}
                {#if hasFilter}
                  <button
                    type="button"
                    class="cd-table-column-filter"
                    class:on={isEffectivelyFiltered(col, colKey)}
                    aria-label={loc().t('Table.filter')}
                    aria-expanded={openFilterKey === colKey}
                    tabindex={childTabindex(-1, gc)}
                    bind:this={filterTriggers[colKey]}
                    onclick={(e) => { e.stopPropagation(); setFilterOpen(col, colKey, openFilterKey !== colKey); }}
                  >
                    {#if col.filterIcon}{@render col.filterIcon({ filtered: isEffectivelyFiltered(col, colKey) })}{:else}<IconFilter size="small" aria-hidden="true" />{/if}
                  </button>
                {/if}
              {/snippet}
              {@render (col.title as Snippet<[{ filter?: Snippet; sorter?: Snippet; selection?: Snippet }]>)(hasFilter ? { selection: headerSelectionMaterial, filter: headerFilterMaterial } : { selection: headerSelectionMaterial })}
            {:else}
              <span class="cd-table-row-head-title">{@render columnTitle(col)}</span>
            {/if}

            {#if hasFilter && typeof col.title === 'string'}
              <button
                type="button"
                class="cd-table-column-filter"
                class:on={isEffectivelyFiltered(col, colKey)}
                aria-label={loc().t('Table.filter')}
                aria-expanded={openFilterKey === colKey}
                tabindex={childTabindex(-1, gc)}
                bind:this={filterTriggers[colKey]}
                onclick={(e) => {
                  e.stopPropagation();
                  setFilterOpen(col, colKey, openFilterKey !== colKey);
                }}
              >
                {#if col.filterIcon}
                  {@render col.filterIcon({ filtered: isEffectivelyFiltered(col, colKey) })}
                {:else}
                  <IconFilter size="small" aria-hidden="true" />
                {/if}
              </button>
              {#if openFilterKey === colKey && filterTriggers[colKey]}
                {@render filterDropdownPanel(col, colKey)}
              {/if}
            {/if}
            </div>
            <!-- 自定义 title 时 filter 按钮由 title snippet 摆放，浮层在此独立渲染（触发器仍绑 filterTriggers[colKey]） -->
            {#if hasFilter && typeof col.title !== 'string' && openFilterKey === colKey && filterTriggers[colKey]}
              {@render filterDropdownPanel(col, colKey)}
            {/if}

            {#if colResizable}
              <span
                class="react-resizable-handle"
                role="separator"
                aria-orientation="vertical"
                aria-label={loc().t('Table.resizeColumn')}
                bind:this={resizeHandles[colKey]}
                onpointerdown={(e) => startResize(e, col, i)}
              ></span>
            {/if}
          </th>
          {/if}
    {/snippet}
    <svelte:element this={tagTbody} class="cd-table-tbody">
      {#if visibleRows.length === 0}
        <tr class="cd-table-row cd-table-row-placeholder" role={gridEnabled ? 'row' : undefined}>
          <td
            class="cd-table-row-cell cd-table-placeholder"
            colspan={colSpan}
            role={gridEnabled ? 'gridcell' : undefined}
            aria-colindex={gridEnabled ? 1 : undefined}
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
              <tr
                class="cd-table-row cd-table-row-section {groupedRowProps?.className ?? ''}"
                class:cd-table-row-section-clickable={clickGroupedRowToExpand}
                role={gridEnabled ? 'row' : undefined}
                style={groupedRowProps?.style ?? undefined}
                ondblclick={groupedRowProps?.onDoubleClick ?? undefined}
                onmouseenter={groupedRowProps?.onMouseEnter ?? undefined}
                onmouseleave={groupedRowProps?.onMouseLeave ?? undefined}
              >
                <td
                  class="cd-table-row-cell cd-table-row-cell-section"
                  colspan={colSpan}
                  role={clickGroupedRowToExpand ? 'button' : undefined}
                  tabindex={clickGroupedRowToExpand ? 0 : undefined}
                  aria-expanded={clickGroupedRowToExpand ? gRow.expanded : undefined}
                  onclick={(e) => {
                    if (clickGroupedRowToExpand) toggleGroupExpand(gRow.groupKey);
                    groupedRowProps?.onClick?.(e);
                  }}
                  onkeydown={clickGroupedRowToExpand
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleGroupExpand(gRow.groupKey);
                        }
                      }
                    : undefined}
                >
                  {#if clickGroupedRowToExpand}
                    <span
                      class="cd-table-expand-icon"
                      class:cd-table-expandedIcon-show={gRow.expanded}
                      aria-hidden="true"
                    >
                      <IconChevronRight size="small" aria-hidden="true" />
                    </span>
                  {/if}
                  {#if renderGroupSection}
                    {@render renderGroupSection({ groupKey: gRow.groupKey, group: gRow.group })}
                  {:else}
                    {gRow.groupKey}
                  {/if}
                </td>
              </tr>
            {:else}
              {@const row = groupRow as DataDisplayRow}
              {@const record = row.record}
              {@const key = row.key}
              {@const index = row.topIndex}
              {@const gridRow = index}
              {@const selected = treeCheckable ? conducted.checked.has(key) : selectedSet.has(key)}
              {@const rowHalf = treeCheckable && conducted.half.has(key)}
              {@const rowDisabled = disabledSet.has(key)}
              {@const extra = rowClassName ? rowClassName(record, index) : ''}
              {@const clickable = !!onRowClick || expandRowByClick || rowSelection?.clickRow === true}
              {@const rowProps = onRow ? onRow(record, index, { disabled: rowDisabled, selected }) : undefined}
              <svelte:element this={tagBodyRow}
                class="cd-table-row {extra} {rowProps?.className ?? ''}"
                class:cd-table-row-selected={selected}
                class:cd-table-row-stripe={stripe && index % 2 === 1}
                class:cd-table-row-clickable={clickable}
                class:cd-table-row-child={treeEnabled && row.level > 0}
                role={gridEnabled ? 'row' : undefined}
                style={rowProps?.style ?? undefined}
                onclick={(e) => {
                  if (expandRowByClick && hasExpand && canExpand(record)) toggleExpand(record);
                  if (expandRowByClick && treeEnabled && row.hasChildren) toggleTreeExpand(record);
                  if (rowSelection?.clickRow && !rowDisabled) onToggleRow(record);
                  if (rowSelection?.clickRow && !rowDisabled) onToggleRow(record);
              if (onRowClick) onRowClick({ record, index });
                  if (rowProps?.onClick) rowProps.onClick(e);
                }}
                ondblclick={rowProps?.onDoubleClick ?? undefined}
                onmouseenter={rowProps?.onMouseEnter ?? undefined}
                onmouseleave={rowProps?.onMouseLeave ?? undefined}
                draggable={rowProps?.draggable}
                ondragstart={rowProps?.onDragStart ?? undefined}
                ondragover={rowProps?.onDragOver ?? ((e) => rowProps?.onDrop && e.preventDefault())}
                ondragenter={rowProps?.onDragEnter ?? undefined}
                ondragleave={rowProps?.onDragLeave ?? undefined}
                ondrop={rowProps?.onDrop ?? undefined}
                ondragend={rowProps?.onDragEnd ?? undefined}
              >
                {#if expandAsColumn}
                  <td
                    class="cd-table-row-cell cd-table-column-expand {leadingFixedClass}"
                    style={leadingStyle('expand')}
                    role={gridEnabled ? 'gridcell' : undefined}
                  >
                    {#if canExpand(record)}
                      {@render expandButton(record, key, undefined)}
                    {/if}
                  </td>
                {/if}
                {#if hasSelection}
                  <td
                    class="cd-table-row-cell cd-table-column-selection {selectionFixedClass || leadingFixedClass}"
                    style={selectionColStyle ?? leadingStyle('selection')}
                    role={gridEnabled ? 'gridcell' : undefined}
                  >
                    {@render rowSelectionInput(record, selected, rowHalf, rowDisabled, undefined)}
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
                      {#if hasExpand && !expandAsColumn && i === 0}
                        <span class="cd-table-expand-icon-cell">
                          {#if canExpand(record)}
                            {@render expandButton(record, key, undefined)}
                          {:else}
                            <span class="cd-table-expand-icon cd-table-expand-icon-placeholder" aria-hidden="true"></span>
                          {/if}
                        </span>
                      {/if}
                      {#if treeEnabled && i === 0}
                        {#if row.hasChildren}
                          <button
                            type="button"
                            class="cd-table-expand-icon"
                            class:cd-table-expandedIcon-show={treeExpandedSet.has(key)}
                            aria-expanded={treeExpandedSet.has(key)}
                            aria-label={treeExpandedSet.has(key) ? loc().t('Table.collapseRow') : loc().t('Table.expandRow')}
                            onclick={(e) => { e.stopPropagation(); toggleTreeExpand(record); }}
                          >
                            <IconTreeTriangleRight size="small" aria-hidden="true" />
                          </button>
                        {:else}
                          <span class="cd-table-expand-icon cd-table-expand-icon-placeholder" aria-hidden="true"></span>
                        {/if}
                      {/if}
                    {/snippet}
                    {#snippet gIndentMaterial()}
                      {#if treeEnabled && i === 0}
                        <span class="cd-table-row-indent" style="inline-size:{row.level * indentSize}px" aria-hidden="true"></span>
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
              </svelte:element>
              {#if hasExpand && canExpand(record)}
                {#if keepDOM}
                  <tr class="cd-table-row cd-table-row-expand" role={gridEnabled ? 'row' : undefined} style={expandedSet.has(key) ? undefined : 'display:none'}>
                    <td class="cd-table-row-cell cd-table-row-cell-expanded-content" colspan={colSpan} role={gridEnabled ? 'gridcell' : undefined} aria-colindex={gridEnabled ? 1 : undefined}>
                      {@render expandable!.expandedRowRender({ record, index })}
                    </td>
                  </tr>
                {:else if expandedSet.has(key)}
                  <tr class="cd-table-row cd-table-row-expand" role={gridEnabled ? 'row' : undefined}>
                    <td class="cd-table-row-cell cd-table-row-cell-expanded-content" colspan={colSpan} role={gridEnabled ? 'gridcell' : undefined} aria-colindex={gridEnabled ? 1 : undefined}>
                      {@render expandable!.expandedRowRender({ record, index })}
                    </td>
                  </tr>
                {/if}
              {/if}
            {/if}
          {/each}
        {:else}
        {#if virtualized && vTopPad > 0}
          <tr class="cd-table-row cd-table-row-spacer" aria-hidden="true">
            <td colspan={colSpan} style="block-size:{vTopPad}px; padding:0; border:0"></td>
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
          <svelte:element this={tagBodyRow}
            class="cd-table-row {extra} {rowProps?.className ?? ''}"
            class:cd-table-row-selected={selected}
            class:cd-table-row-stripe={stripe && index % 2 === 1}
            class:cd-table-row-clickable={clickable}
            class:cd-table-row-child={treeEnabled && row.level > 0}
            role={gridEnabled ? 'row' : undefined}
            aria-rowindex={gridEnabled ? gridRow + 2 : undefined}
            aria-selected={gridEnabled && selectionEnabled ? selected : undefined}
            style={rowProps?.style ?? undefined}
            onclick={(e) => {
              if (expandRowByClick && hasExpand && canExpand(record)) toggleExpand(record);
              if (expandRowByClick && treeEnabled && row.hasChildren) toggleTreeExpand(record);
              if (rowSelection?.clickRow && !rowDisabled) onToggleRow(record);
              if (onRowClick) onRowClick({ record, index });
              if (rowProps?.onClick) rowProps.onClick(e);
            }}
            ondblclick={rowProps?.onDoubleClick ?? undefined}
            onmouseenter={rowProps?.onMouseEnter ?? undefined}
            onmouseleave={rowProps?.onMouseLeave ?? undefined}
            draggable={rowProps?.draggable}
            ondragstart={rowProps?.onDragStart ?? undefined}
            ondragover={rowProps?.onDragOver ?? ((e) => rowProps?.onDrop && e.preventDefault())}
            ondragenter={rowProps?.onDragEnter ?? undefined}
            ondragleave={rowProps?.onDragLeave ?? undefined}
            ondrop={rowProps?.onDrop ?? undefined}
            ondragend={rowProps?.onDragEnd ?? undefined}
          >
            {#if expandAsColumn}
              {@const gc = 0}
              <td
                class="cd-table-row-cell cd-table-column-expand {leadingFixedClass}"
                style={leadingStyle('expand')}
                role={gridEnabled ? 'gridcell' : undefined}
                id={gridEnabled ? cellId(gridRow, gc) : undefined}
                tabindex={rovingTabindex(gridRow, gc)}
                aria-colindex={gridEnabled ? gc + 1 : undefined}
                onfocusin={gridEnabled ? () => syncFocusCoord(gridRow, gc) : undefined}
              >
                {#if canExpand(record)}
                  {@render expandButton(record, key, childTabindex(gridRow, gc))}
                {/if}
              </td>
            {/if}
            {#if hasSelection}
              {@const gc = expandAsColumn ? 1 : 0}
              <td
                class="cd-table-row-cell cd-table-column-selection {selectionFixedClass || leadingFixedClass}"
                style={selectionColStyle ?? leadingStyle('selection')}
                role={gridEnabled ? 'gridcell' : undefined}
                id={gridEnabled ? cellId(gridRow, gc) : undefined}
                tabindex={rovingTabindex(gridRow, gc)}
                aria-colindex={gridEnabled ? gc + 1 : undefined}
                onfocusin={gridEnabled ? () => syncFocusCoord(gridRow, gc) : undefined}
              >
                {@render rowSelectionInput(record, selected, rowHalf, rowDisabled, childTabindex(gridRow, gc))}
              </td>
            {/if}
            {#each leafColumns as col, i (colKeyOf(col, i))}
              {@const value = cellValue(col, record)}
              {@const gc = (expandAsColumn ? 1 : 0) + (hasSelection ? 1 : 0) + i}
              {@const isRowHeader = gridEnabled && i === 0 && !hasSelection && !expandAsColumn}
              {@const cellProps = col.onCell ? col.onCell(record, index) : undefined}
              {#if !(cellProps && (cellProps.colSpan === 0 || cellProps.rowSpan === 0))}
              <td
                class="cd-table-row-cell cd-table-align-{alignOf(col)} {fixedCellClass(i)} {cellProps?.className ?? ''}"
                class:cd-table-row-cell-ellipsis={!!col.ellipsis}
                title={cellTitleAttr(col, value)}
                colspan={cellProps?.colSpan}
                rowspan={cellProps?.rowSpan}
                style={mergeCellStyle(cellStyle(col, i), cellProps?.style)}
                role={gridEnabled ? (isRowHeader ? 'rowheader' : 'gridcell') : undefined}
                id={gridEnabled ? cellId(gridRow, gc) : undefined}
                tabindex={rovingTabindex(gridRow, gc)}
                aria-colindex={gridEnabled ? gc + 1 : undefined}
                onfocusin={gridEnabled ? () => syncFocusCoord(gridRow, gc) : undefined}
              >
                <!-- 展开图标 / 树形三角 / 缩进物料：useFullRender 时不自动前置，改注入 render 供自行摆放 -->
                {#snippet cellExpandMaterial()}
                  {#if hasExpand && !expandAsColumn && i === 0}
                    <span class="cd-table-expand-icon-cell">
                      {#if canExpand(record)}
                        {@render expandButton(record, key, childTabindex(gridRow, gc))}
                      {:else}
                        <span class="cd-table-expand-icon cd-table-expand-icon-placeholder" aria-hidden="true"></span>
                      {/if}
                    </span>
                  {/if}
                  {#if treeEnabled && i === 0}
                    {#if row.hasChildren}
                      <button
                        type="button"
                        class="cd-table-expand-icon"
                        class:cd-table-expandedIcon-show={treeExpandedSet.has(key)}
                        aria-expanded={treeExpandedSet.has(key)}
                        aria-label={treeExpandedSet.has(key) ? loc().t('Table.collapseRow') : loc().t('Table.expandRow')}
                        tabindex={childTabindex(gridRow, gc)}
                        onclick={(e) => {
                          e.stopPropagation();
                          toggleTreeExpand(record);
                        }}
                      >
                        <IconTreeTriangleRight size="small" aria-hidden="true" />
                      </button>
                    {:else}
                      <span class="cd-table-expand-icon cd-table-expand-icon-placeholder" aria-hidden="true"></span>
                    {/if}
                  {/if}
                {/snippet}
                {#snippet cellIndentMaterial()}
                  {#if treeEnabled && i === 0}
                    <span class="cd-table-row-indent" style="inline-size:{row.level * indentSize}px" aria-hidden="true"></span>
                  {/if}
                {/snippet}
                {#snippet cellSelectionMaterial()}
                  {#if selectionEnabled}
                    {@render rowSelectionInput(record, selected, rowHalf, rowDisabled, undefined)}
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
          </svelte:element>
          {#if hasExpand && canExpand(record)}
            {#if keepDOM}
              <tr
                class="cd-table-row cd-table-row-expand"
                role={gridEnabled ? 'row' : undefined}
                style={expandedSet.has(key) ? undefined : 'display:none'}
              >
                <td
                  class="cd-table-row-cell cd-table-row-cell-expanded-content"
                  colspan={colSpan}
                  role={gridEnabled ? 'gridcell' : undefined}
                  aria-colindex={gridEnabled ? 1 : undefined}
                >
                  {@render expandable!.expandedRowRender({ record, index })}
                </td>
              </tr>
            {:else if expandedSet.has(key)}
              <tr class="cd-table-row cd-table-row-expand" role={gridEnabled ? 'row' : undefined}>
                <td
                  class="cd-table-row-cell cd-table-row-cell-expanded-content"
                  colspan={colSpan}
                  role={gridEnabled ? 'gridcell' : undefined}
                  aria-colindex={gridEnabled ? 1 : undefined}
                >
                  {@render expandable!.expandedRowRender({ record, index })}
                </td>
              </tr>
            {/if}
          {/if}
        {/each}
        {#if virtualized && vBottomPad > 0}
          <tr class="cd-table-row cd-table-row-spacer" aria-hidden="true">
            <td colspan={colSpan} style="block-size:{vBottomPad}px; padding:0; border:0"></td>
          </tr>
        {/if}
        {/if}
      {/if}
    </svelte:element>
  </table>
      {#if loading}
        <div class="cd-table-loading" aria-hidden="true">
          <span class="cd-table-spinner"></span>
        </div>
      {/if}
    </div>
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
</div>
<!-- /.cd-table-wrapper -->

{#snippet paginationArea()}
  {#if renderPagination}
    {@render renderPagination({ total, currentPage, pageSize, onChange: onPageChange })}
  {:else}
    <!-- 对齐 Semi Table 分页：左侧 range 文案（显示第 X-Y 条，共 N 条）+ 右侧 default 页码按钮。
         表格 size（行高密度）不影响分页器，故分页固定 default 尺寸（不透传表格 size）。 -->
    <div class="cd-table-pagination-outer">
      {#if pageRangeText !== null}
        <span class="cd-table-pagination-total">{pageRangeText}</span>
      {/if}
      <Pagination
        {total}
        currentPage={currentPage}
        {pageSize}
        size="default"
        onChange={onPageChange}
      />
    </div>
  {/if}
{/snippet}

<style>
  /* ===== 严格对齐 Semi Design table.scss —— 消费 Semi 全名 token ===== */

  /* 最外层容器：.semi-table-wrapper */
  .cd-table-wrapper {
    position: relative;
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    inline-size: 100%;
    color: var(--cd-color-table-text-default);
    font-size: var(--cd-font-table-base-fontsize);
    /* 对齐 Semi font-size-regular mixin：line-height 20px，避免继承文档站正文行高致表头/单元格偏高 */
    line-height: var(--cd-line-height-regular);
  }

  /* body 滚动容器：.semi-table-body（横向 + 纵向滚动区） */
  .cd-table-body {
    position: relative;
    inline-size: 100%;
    box-sizing: border-box;
    overflow-x: auto;
  }
  .cd-table-body-virtual,
  .cd-table-body-scroll {
    overflow: auto;
  }

  /* 吸顶表头：thead sticky */
  .cd-table-thead-sticky th {
    position: sticky;
    inset-block-start: 0;
    z-index: calc(var(--cd-z-table-fixed-column) + 1);
  }
  .cd-table-row-spacer:hover {
    background: transparent;
  }

  /* 表格本体：.semi-table */
  .cd-table {
    inline-size: 100%;
    text-align: left;
    border-collapse: separate;
    border-spacing: 0;
    font-size: inherit;
    display: table;
    background: var(--cd-color-table-bg-default);
  }
  /* fixed 布局：固定列 / 列宽精确 */
  .cd-table-fixed {
    inline-size: auto;
    min-inline-size: 100%;
    table-layout: fixed;
  }

  /* ===== 表头 thead ===== */
  .cd-table-thead > .cd-table-row > .cd-table-row-head {
    background-color: var(--cd-color-table-th-bg-default);
    color: var(--cd-color-table-th-text-default);
    font-weight: var(--cd-font-weight-bold, 600);
    text-align: left;
    vertical-align: middle;
    overflow-wrap: break-word;
    position: relative;
    padding-inline: var(--cd-spacing-table-row-head-paddingx);
    padding-block: var(--cd-spacing-table-row-head-paddingy);
    border-block-end: var(--cd-width-table-header-border) var(--cd-border-table-base-borderstyle) var(--cd-color-table-th-border-default);
  }
  /* 点击排序表头：clickSort */
  .cd-table-row-head-clicksort {
    cursor: pointer;
  }
  .cd-table-row-head-clicksort:hover {
    background-image: linear-gradient(0deg, var(--cd-color-table-th-clicksort-bg-hover), var(--cd-color-table-th-clicksort-bg-hover));
    background-color: var(--cd-color-table-cell-bg-hover);
  }
  .cd-table-row-head.cd-table-column-selection {
    text-align: center;
  }
  .cd-table-row-head-ellipsis,
  .cd-table-row-head-ellipsis .cd-table-row-head-title {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  /* ===== 表体 tbody ===== */
  .cd-table-tbody {
    display: table-row-group;
  }
  .cd-table-tbody > .cd-table-row {
    display: table-row;
    background-color: var(--cd-color-table-body-bg-default);
  }
  .cd-table-tbody > .cd-table-row > .cd-table-row-cell {
    display: table-cell;
    overflow-wrap: break-word;
    border-inline: none;
    border-block-end: var(--cd-width-table-base-border) var(--cd-border-table-base-borderstyle) var(--cd-color-table-border-default);
    padding: var(--cd-spacing-table-tbody-rowcell-padding);
    box-sizing: border-box;
    position: relative;
    vertical-align: middle;
  }
  /* 尺寸档：middle / small 单元格纵向内边距 */
  .cd-table-middle .cd-table-tbody > .cd-table-row > .cd-table-row-cell {
    padding-block: var(--cd-spacing-table-middle-paddingy);
  }
  .cd-table-small .cd-table-tbody > .cd-table-row > .cd-table-row-cell {
    padding-block: var(--cd-spacing-table-small-paddingy);
  }
  .cd-table-row-cell-ellipsis {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  /* 行 hover：Semi 用 background-image+background-color 双层（fill-0 半透 + bg-0 兜底） */
  .cd-table-tbody > .cd-table-row:hover > .cd-table-row-cell,
  .cd-table-tbody > .cd-table-row-hovered > .cd-table-row-cell {
    background-image: linear-gradient(0deg, var(--cd-color-table-body-bg-hover), var(--cd-color-table-body-bg-hover));
    background-color: var(--cd-color-table-cell-bg-hover);
  }
  /* 固定列 hover：底色保持 body-default，避免透出横滚内容 */
  .cd-table-tbody > .cd-table-row:hover > .cd-table-cell-fixed-left,
  .cd-table-tbody > .cd-table-row:hover > .cd-table-cell-fixed-right,
  .cd-table-tbody > .cd-table-row-hovered > .cd-table-cell-fixed-left,
  .cd-table-tbody > .cd-table-row-hovered > .cd-table-cell-fixed-right {
    background-image: linear-gradient(0deg, var(--cd-color-table-body-bg-hover), var(--cd-color-table-body-bg-hover));
    background-color: var(--cd-color-table-body-bg-default);
  }

  /* 对齐 */
  .cd-table-align-center {
    text-align: center;
  }
  .cd-table-align-right {
    text-align: right;
  }

  /* 选择列 / 展开列固定宽度（对齐 Semi $width-table_column_selection = 48px） */
  .cd-table-column-selection,
  .cd-table-column-expand {
    inline-size: var(--cd-width-table-column-selection);
    text-align: center;
    white-space: nowrap;
  }

  /* 斑马纹（chenzy-design 扩展；Semi 靠 demo onRow className 实现，此处保留组件级开关） */
  .cd-table-stripe .cd-table-tbody > .cd-table-row-stripe > .cd-table-row-cell {
    background-color: var(--cd-color-table-selection-bg-default);
  }

  /* 选中行 */
  .cd-table-tbody > .cd-table-row-selected > .cd-table-row-cell {
    background-color: var(--cd-color-primary-light-default);
  }
  .cd-table-row-clickable {
    cursor: pointer;
  }

  /* ===== 展开行 / 分组行 ===== */
  .cd-table-tbody > .cd-table-row-expand > .cd-table-row-cell {
    background-color: var(--cd-color-table-row-expanded-bg-default);
  }
  .cd-table-row-cell-expanded-content {
    padding-inline: var(--cd-spacing-table-expand-row-paddingleft) var(--cd-spacing-table-expand-row-paddingright);
    padding-block: var(--cd-spacing-table-expand-row-paddingtop) var(--cd-spacing-table-expand-row-paddingbottom);
    background-color: var(--cd-color-table-row-expanded-bg-default);
  }
  .cd-table-row-hidden {
    display: none;
  }

  /* 分组表头行 .semi-table-row-section */
  .cd-table-tbody > .cd-table-row-section > .cd-table-row-cell {
    background-color: var(--cd-color-table-selection-bg-default);
    border-block-end: var(--cd-width-table-base-border) var(--cd-border-table-base-borderstyle) var(--cd-color-table-border-default);
  }
  .cd-table-tbody > .cd-table-row-section > .cd-table-row-cell:not(.cd-table-column-selection) {
    padding: var(--cd-spacing-table-tbody-rowselection-rowcell-notselection-paddingy) var(--cd-spacing-table-tbody-rowselection-rowcell-notselection-paddingx);
  }
  .cd-table-section-inner {
    display: inline-flex;
    align-items: center;
  }
  .cd-table-row-section-clickable .cd-table-row-cell-section {
    cursor: pointer;
    user-select: none;
  }
  .cd-table-row-cell-section:focus-visible {
    outline: 2px solid var(--cd-focus-ring, currentColor);
    outline-offset: -2px;
  }

  /* ===== 固定列：sticky + 边界阴影 ===== */
  .cd-table-cell-fixed-left,
  .cd-table-cell-fixed-right {
    z-index: var(--cd-z-table-fixed-column);
    position: sticky;
    background-color: var(--cd-color-table-bg-default);
  }
  .cd-table-thead > .cd-table-row > .cd-table-cell-fixed-left,
  .cd-table-thead > .cd-table-row > .cd-table-cell-fixed-right {
    background-color: var(--cd-color-table-th-bg-default);
  }
  /* 固定列表头 z 与数据行固定列一致（=fixed，对齐 Semi：表头/数据行固定列同为 101），
     覆盖 thead-sticky 通配 th 的 fixed+1（那条用于非固定 sticky 表头列盖住固定列滚动） */
  .cd-table-thead-sticky th.cd-table-cell-fixed-left,
  .cd-table-thead-sticky th.cd-table-cell-fixed-right {
    z-index: var(--cd-z-table-fixed-column);
  }
  .cd-table-cell-fixed-left-last {
    border-inline-end: var(--cd-width-table-cell-fixed-left-last) solid var(--cd-color-table-shadow-border-default);
    box-shadow: var(--cd-shadow-table-right);
  }
  .cd-table-cell-fixed-right-first {
    border-inline-start: var(--cd-width-table-cell-fixed-right-first) solid var(--cd-color-table-shadow-border-default);
    box-shadow: var(--cd-shadow-table-left);
  }
  /* 横滚到边隐藏对应阴影 */
  .cd-table-scroll-position-left .cd-table-cell-fixed-left-last {
    box-shadow: none;
  }
  .cd-table-scroll-position-right .cd-table-cell-fixed-right-first {
    box-shadow: none;
  }

  /* ===== 带边框 bordered ===== */
  .cd-table-bordered > .cd-table-container {
    border: var(--cd-width-table-base-border) var(--cd-border-table-base-borderstyle) var(--cd-color-table-border-default);
    border-inline-end: 0;
    border-block-end: 0;
  }
  .cd-table-bordered .cd-table-thead > .cd-table-row > .cd-table-row-head,
  .cd-table-bordered .cd-table-tbody > .cd-table-row > .cd-table-row-cell {
    border-inline-end: var(--cd-width-table-base-border) var(--cd-border-table-base-borderstyle) var(--cd-color-table-border-default);
  }

  /* ===== 空数据占位 .semi-table-placeholder ===== */
  .cd-table-placeholder {
    padding: var(--cd-spacing-table-paddingy) var(--cd-spacing-table-paddingx);
    color: var(--cd-color-table-placeholder-text-default);
    font-size: var(--cd-font-table-base-fontsize);
    text-align: center;
    background: var(--cd-color-table-pl-bg-default);
    border-block-end: var(--cd-width-table-base-border) var(--cd-border-table-base-borderstyle) var(--cd-color-table-border-default);
  }

  /* ===== 排序 ColumnSorter ===== */
  /* 对齐 Semi .semi-table-operate-wrapper：flex 行容器，消除 inline line-box 撑高（表头恒 38px） */
  .cd-table-operate-wrapper {
    display: flex;
    align-items: center;
  }
  /* 纯自定义 title（无 sorter/filter）：不产生布局盒，title 直接在 th 内 inline 布局，
     对齐 Semi（Semi 自定义 title 不套 operate-wrapper，其 inline-flex 内容自然撑高表头）。 */
  .cd-table-operate-plain {
    display: contents;
  }
  .cd-table-align-center .cd-table-operate-wrapper {
    justify-content: center;
  }
  .cd-table-align-right .cd-table-operate-wrapper {
    justify-content: flex-end;
  }

  .cd-table-column-sorter-wrapper {
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
  .cd-table-column-sorter-wrapper:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
    border-radius: var(--cd-border-radius-small);
  }
  .cd-table-column-sorter {
    display: inline-block;
    inline-size: var(--cd-width-table-column-sorter-icon);
    block-size: var(--cd-height-table-column-sorter-icon);
    vertical-align: middle;
    text-align: center;
  }
  .cd-table-column-sorter-up,
  .cd-table-column-sorter-down {
    display: block;
    block-size: 0;
    color: var(--cd-color-table-sorter-text-default);
  }
  .cd-table-column-sorter-up.on,
  .cd-table-column-sorter-down.on {
    color: var(--cd-color-table-sorter-on-text-default);
  }
  .cd-table-column-sorter-up :global(svg),
  .cd-table-column-sorter-down :global(svg) {
    inline-size: var(--cd-width-table-column-sorter-icon);
    block-size: var(--cd-height-table-column-sorter-icon);
  }

  /* ===== 列筛选 ColumnFilter ===== */
  .cd-table-column-filter {
    margin-inline-start: var(--cd-spacing-table-column-filter-marginleft);
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
  .cd-table-column-filter :global(svg) {
    inline-size: var(--cd-width-table-column-filter-icon);
    block-size: var(--cd-height-table-column-filter-icon);
  }
  .cd-table-column-filter.on {
    color: var(--cd-color-table-filter-on-text-default);
  }
  .cd-table-column-filter:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  /* 筛选下拉面板 .semi-table-column-filter-dropdown */
  .cd-table-column-filter-dropdown {
    z-index: var(--cd-z-dropdown, 1060);
    min-inline-size: 10rem;
    padding-block: var(--cd-spacing-extra-tight);
    background: var(--cd-color-bg-3, #fff);
    border-radius: var(--cd-border-radius-medium, 6px);
    box-shadow: var(--cd-shadow-elevated, 0 4px 12px rgba(0, 0, 0, 0.12));
    font-weight: var(--cd-font-weight-regular, 400);
  }
  .cd-table-column-filter-list {
    margin: 0;
    padding: 0;
    list-style: none;
    max-block-size: var(--cd-height-table-column-filter-dropdown);
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
    border-block-start: var(--cd-width-table-base-border) var(--cd-border-table-base-borderstyle) var(--cd-color-table-border-default);
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

  /* ===== 列宽拖拽手柄 .react-resizable-handle ===== */
  .cd-table-row-head-resizable {
    position: relative;
  }
  .react-resizable-handle {
    position: absolute;
    inline-size: var(--cd-width-table-react-resizable-handle);
    block-size: calc(100% - var(--cd-spacing-table-resizable-offset-y) * 2);
    inset-block-end: var(--cd-spacing-table-resizable-bottom);
    inset-inline-end: var(--cd-spacing-table-react-resizable-handle-right);
    cursor: col-resize;
    z-index: 0;
    touch-action: none;
    user-select: none;
    background-color: var(--cd-color-table-border-default);
  }
  .react-resizable-handle:hover {
    background-color: var(--cd-color-table-resizer-bg-default);
  }
  /* 拖拽中列：resizing 标示线 */
  .resizing.cd-table-row-head,
  .resizing.cd-table-row-cell {
    border-inline-end: var(--cd-width-table-resizer-border) solid var(--cd-color-table-resizer-bg-default);
  }

  /* ===== 行选择 checkbox 包裹 .semi-table-selection-wrap ===== */
  .cd-table-selection-wrap {
    display: inline-flex;
    vertical-align: bottom;
  }
  .cd-table-selection-disabled {
    cursor: not-allowed;
  }
  .cd-table-selection-checkbox {
    cursor: pointer;
    accent-color: var(--cd-color-primary);
  }
  .cd-table-selection-checkbox:disabled {
    cursor: not-allowed;
  }
  .cd-table-selection-checkbox:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }

  /* ===== 展开图标 .semi-table-expand-icon ===== */
  .cd-table-expand-icon {
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
    margin-inline-end: var(--cd-spacing-table-expand-icon-marginright);
    transition: transform 150ms cubic-bezier(0.62, 0.05, 0.36, 0.95);
  }
  .cd-table-expand-icon:hover {
    color: var(--cd-color-table-text-default);
  }
  .cd-table-expand-icon:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
    border-radius: var(--cd-border-radius-small);
  }
  /* 旋转态：展开 90°（对齐 Semi -expandedIcon-show/-hide） */
  .cd-table-expandedIcon-show {
    transform: rotate(90deg);
  }
  .cd-table-expandedIcon-hide {
    transform: rotate(0deg);
  }
  .cd-table-expand-icon-placeholder {
    inline-size: 16px;
    block-size: 16px;
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

  /* ===== 分页器 .semi-table-pagination-outer ===== */
  .cd-table-pagination-outer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-block-size: var(--cd-height-table-pagination-outer-min);
    color: var(--cd-color-table-page-text-default);
  }
  /* 分页左侧 range 文案（显示第 X-Y 条，共 N 条），对齐 Semi 灰色说明文字。 */
  .cd-table-pagination-total {
    color: var(--cd-color-table-page-text-default);
    font-size: var(--cd-font-size-regular, 14px);
  }

  /* ===== 标题 / footer ===== */
  .cd-table-title {
    position: relative;
    padding-block: var(--cd-spacing-table-title-paddingy);
    padding-inline: var(--cd-spacing-table-title-paddingx);
  }
  .cd-table-footer {
    background-color: var(--cd-color-table-footer-bg-default);
    padding: var(--cd-spacing-table-footer-padding);
    margin: 0;
    position: relative;
  }

  /* ===== 加载态遮罩 ===== */
  .cd-table-loading {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--cd-color-table-bg-default);
    opacity: 0.6;
  }
  .cd-table-spinner {
    inline-size: 28px;
    block-size: 28px;
    border: 3px solid var(--cd-color-fill-1, rgba(0, 0, 0, 0.1));
    border-top-color: var(--cd-color-primary);
    border-radius: 50%;
    animation: cd-table-spin 0.8s linear infinite;
  }
  @keyframes cd-table-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .cd-table-spinner {
      animation: none;
    }
    .cd-table-expand-icon,
    .react-resizable-handle {
      transition: none;
    }
  }
</style>
