/**
 * Table 公共类型 — 由 Table.svelte 消费、index.ts 对外 re-export。
 * 拆成独立模块以避免 .svelte 组件无法导出类型声明的限制。
 * See specs/components/show/Table.spec.md
 */
import type { Snippet } from 'svelte';
import type { RowKey } from '@chenzy-design/core';

export type Align = 'left' | 'center' | 'right';
export type TableSize = 'small' | 'default' | 'large';

export interface ColumnDef<T> {
  /** 列唯一键，缺省回退 dataIndex / 列索引 */
  key?: string;
  /** 取值字段 */
  dataIndex?: keyof T & string;
  /**
   * 表头文案（string）或自定义表头渲染（Snippet）。Snippet 入参含 filter/sorter/selection
   * 物料（对齐 Semi title 函数的 { filter, sorter, selection }），由使用方自行摆放；
   * 摆放物料时组件不再自动前置排序/筛选按钮（配合 useFullRender 完全自定义表头）。
   */
  title: string | Snippet<[{ filter?: Snippet; sorter?: Snippet; selection?: Snippet }]>;
  /**
   * 子列（表头合并，对齐 Semi column.children）。父列只作表头分组，
   * 数据渲染下沉到叶子列；父列 title 横跨其全部叶子列。
   */
  children?: ColumnDef<T>[];
  /** 表头列合并（对齐 Semi column.colSpan）：设置为 0 时该表头格不渲染 */
  colSpan?: number;
  /** 列宽 */
  width?: number | string;
  /** 固定列：横向滚动时左/右侧 sticky 锁定（需配合 width 数值）。true 等效 'left'（对齐 Semi） */
  fixed?: boolean | 'left' | 'right';
  /** 列宽可拖拽调整：列头右侧出现拖拽手柄，指针拖拽实时改列宽 */
  resizable?: boolean;
  /**
   * Table 级 resizable 开启后是否允许本列伸缩（对齐 Semi column.resize）。
   * 默认 true；设置为 false 后本列不再出现拖拽手柄。
   */
  resize?: boolean;
  /** 对齐方式，默认 left */
  align?: Align;
  /** 列样式名（作用于 col / th / td，对齐 Semi column.className） */
  className?: string;
  /** 单元格溢出省略；对象态可关掉原生 title 提示（对齐 Semi ellipsis.showTitle） */
  ellipsis?: boolean | { showTitle: boolean };
  /** 筛选确认模式：immediate 立即生效 / confirm 需点确定（对齐 Semi filterConfirmMode） */
  filterConfirmMode?: 'immediate' | 'confirm';
  /** true 按 dataIndex 默认比较；或自定义比较器（第三参可读当前 sortOrder，对齐 Semi） */
  sorter?: boolean | ((a: T, b: T, sortOrder?: 'ascend' | 'descend') => number);
  /** 受控排序状态（当前列）*/
  sortOrder?: 'ascend' | 'descend' | null;
  /** 默认排序状态 */
  defaultSortOrder?: 'ascend' | 'descend' | null;
  /** 是否展示排序提示（hover 排序按钮时 tooltip 提示下一次点击的排序方向，对齐 Semi showSortTip）。受控 sortOrder 时不生效 */
  showSortTip?: boolean;
  /** 自定义排序图标（整个排序按钮区），入参当前列排序态（对齐 Semi sortIcon） */
  sortIcon?: Snippet<[{ sortOrder: 'ascend' | 'descend' | null }]>;
  /** 列头筛选项（下拉多选）；配合 onFilter 过滤数据 */
  filters?: { text: string; value: string | number }[];
  /** 受控列筛选值 */
  filteredValue?: (string | number)[] | null;
  /** 筛选默认值（非受控初始筛选，对齐 Semi defaultFilteredValue） */
  defaultFilteredValue?: (string | number)[];
  /** 是否多选筛选，默认 true */
  filterMultiple?: boolean;
  /** 自定义 filter 图标，入参当前列是否处于筛选态（对齐 Semi filterIcon） */
  filterIcon?: Snippet<[{ filtered: boolean }]>;
  /** 行是否匹配某筛选值；缺省时按 dataIndex 全等比较 */
  onFilter?: (value: string | number, record: T) => boolean;
  /** 是否对子级数据本地过滤：子级命中则父级保留（树形，对齐 Semi filterChildrenRecord） */
  filterChildrenRecord?: boolean;
  /** 是否对子级数据本地排序（树形，对齐 Semi sortChildrenRecord） */
  sortChildrenRecord?: boolean;
  /**
   * 自定义筛选器 dropdown 面板（对齐 Semi renderFilterDropdown）。入参提供
   * tempFilteredValue / setTempFilteredValue / confirm / clear / close / filters。
   */
  renderFilterDropdown?: Snippet<[RenderFilterDropdownProps]>;
  /** 自定义每个筛选项的渲染方式（对齐 Semi renderFilterDropdownItem） */
  renderFilterDropdownItem?: Snippet<
    [
      {
        text: string;
        value: string | number;
        checked: boolean;
        filteredValue: (string | number)[];
        filterMultiple: boolean;
        onChange: () => void;
      },
    ]
  >;
  /** 筛选浮层可见变化回调（对齐 Semi onFilterDropdownVisibleChange） */
  onFilterDropdownVisibleChange?: (visible: boolean) => void;
  /**
   * 透传给筛选浮层的配置（对齐 Semi filterDropdownProps）。
   * showTick=true 时（配合 renderFilterDropdownItem 渲染 Dropdown.Item），
   * 选中项左侧显示对勾。
   */
  filterDropdownProps?: { showTick?: boolean };
  /** 设置头部单元格属性（对齐 Semi column.onHeaderCell）。返回 style/className/事件 */
  onHeaderCell?: (column: ColumnDef<T>, columnIndex: number) => {
    style?: string;
    className?: string;
    onClick?: (e: MouseEvent) => void;
    onMouseEnter?: (e: MouseEvent) => void;
    onMouseLeave?: (e: MouseEvent) => void;
  };
  /**
   * 是否完全自定义渲染（对齐 Semi useFullRender）。开启后 render 额外收到
   * { selection, expandIcon, indentText } 物料，由使用方自行摆放，组件不再
   * 自动前置缩进/展开图标/选择框。
   */
  useFullRender?: boolean;
  /** 单元格自定义渲染。useFullRender 时额外收到 selection/expandIcon/indentText 物料 Snippet。 */
  render?: Snippet<
    [
      {
        value: unknown;
        record: T;
        index: number;
        selection?: Snippet;
        expandIcon?: Snippet;
        indentText?: Snippet;
      },
    ]
  >;
  /**
   * 设置单元格属性（对齐 Semi column.onCell）。返回 { colSpan, rowSpan } 实现行列合并：
   * 值为 0 时该单元格不渲染（被合并进相邻格）；也可返回 style/className。
   */
  onCell?: (record: T, rowIndex: number) => {
    colSpan?: number;
    rowSpan?: number;
    style?: string;
    className?: string;
  };
}

/** renderFilterDropdown 入参（对齐 Semi RenderFilterDropdownProps） */
export interface RenderFilterDropdownProps {
  /** 临时筛选值，初始值为 filteredValue 或 defaultFilteredValue */
  tempFilteredValue: (string | number)[];
  /** 设置临时筛选值 */
  setTempFilteredValue: (tempFilteredValue: (string | number)[]) => void;
  /** confirm 默认把 tempFilteredValue 赋给 filteredValue 并触发筛选；也可传 filteredValue 直接设置 */
  confirm: (props?: { closeDropdown?: boolean; filteredValue?: (string | number)[] }) => void;
  /** 清除筛选值、临时筛选值 */
  clear: (props?: { closeDropdown?: boolean }) => void;
  /** 关闭 dropdown */
  close: () => void;
  /** 筛选器配置项 */
  filters?: { text: string; value: string | number }[];
}

export interface Expandable<T> {
  /** 展开行内容渲染 */
  expandedRowRender: Snippet<[{ record: T; index: number }]>;
  /** 该行是否可展开，默认全部可展开 */
  rowExpandable?: (record: T) => boolean;
  /** 受控展开行 key 列表 */
  expandedRowKeys?: RowKey[];
  /** 非受控初始展开 */
  defaultExpandedRowKeys?: RowKey[];
  /** 展开/收起回调 */
  onExpand?: (expanded: boolean, record: T) => void;
}

export interface TreeTable {
  /** 子行字段名，默认 'children' */
  childrenColumnName?: string;
  /** 每层缩进像素，默认 16 */
  indentSize?: number;
  /** 非受控初始展开行 key 列表 */
  defaultExpandedRowKeys?: RowKey[];
  /** 受控展开行 key 列表；受控时不回写，仅 onExpand 通知 */
  expandedRowKeys?: RowKey[];
  /** 展开/收起回调 */
  onExpand?: (expanded: boolean, key: RowKey) => void;
}

export interface RowSelection<T> {
  /** 受控选中行 key 列表 */
  selectedRowKeys?: RowKey[];
  /** 非受控初始选中 */
  defaultSelectedRowKeys?: RowKey[];
  /** 选择变更回调 */
  onChange?: (keys: RowKey[], rows: T[]) => void;
  /** 逐行定制复选框属性（如 disabled） */
  getCheckboxProps?: (record: T) => { disabled?: boolean };
  /**
   * 树形表父子选择是否独立。默认 false：勾选父行连带勾选所有后代，
   * 后代部分选中时父行显示半选(indeterminate)。true 时父子互不联动
   * （等同非树形表逐行选择，向后兼容）。仅在 tree 启用时生效。
   */
  checkStrictly?: boolean;
  /**
   * 父子节点选择关联模式（对齐 Semi checkRelation）。'related' 时父子联动，
   * 'unRelated' 时互不影响。与 checkStrictly 语义互补：显式传入时优先生效
   * （'related' ≙ checkStrictly:false，'unRelated' ≙ checkStrictly:true）。
   * Semi 默认 'unRelated'；本库缺省沿用 checkStrictly 默认（联动）。
   */
  checkRelation?: 'related' | 'unRelated';
  /**
   * 点击行任意位置触发行选择/取消（对齐 Semi clickRow）。禁用行点击不选中。
   * 默认 false。
   */
  clickRow?: boolean;
  /** 选择方式: checkbox（多选）或 radio（单选），默认 checkbox */
  type?: 'checkbox' | 'radio';
  /** 单行选择回调 */
  onSelect?: (record: T, selected: boolean, selectedRows: T[]) => void;
  /** 全选回调 */
  onSelectAll?: (selected: boolean, selectedRows: T[], changedRows: T[]) => void;
  /** 选择列固定 */
  fixed?: boolean | 'left';
  /** 选择列宽度 */
  columnWidth?: number | string;
  /** 隐藏全选框 */
  hideSelectAll?: boolean;
  /** 隐藏选择列（选择状态仍生效，配合 useFullRender 摆放选择框，对齐 Semi hidden） */
  hidden?: boolean;
  /** 表头 Checkbox 是否禁用（对齐 Semi disabled） */
  disabled?: boolean;
  /**
   * 自定义渲染勾选框（对齐 Semi renderCell）。入参含 selected/record/
   * originNode（默认勾选框 Snippet）/inHeader/disabled/indeterminate/index 与
   * selectRow/selectAll 回调。
   */
  renderCell?: Snippet<
    [
      {
        selected: boolean;
        record?: T;
        originNode: Snippet;
        inHeader: boolean;
        disabled: boolean;
        indeterminate: boolean;
        index?: number;
        selectRow?: (selected: boolean) => void;
        selectAll?: (selected: boolean) => void;
      },
    ]
  >;
}

/** Table 级 resizable 对象态：列伸缩事件（对齐 Semi Resizable）。
 *  返回的对象会与该列合并（如 className）。 */
export interface ResizableConfig<T> {
  /** 列宽改变中触发 */
  onResize?: (column: ColumnDef<T>) => Partial<ColumnDef<T>> | void;
  /** 开始改变列宽触发 */
  onResizeStart?: (column: ColumnDef<T>) => Partial<ColumnDef<T>> | void;
  /** 停止改变列宽触发 */
  onResizeStop?: (column: ColumnDef<T>) => Partial<ColumnDef<T>> | void;
}

/**
 * onRow / onGroupedRow 返回的行属性（对齐 Semi「返回任意 tr 支持的属性或事件」）。
 * 除常用事件外含 draggable 与 HTML5 拖拽事件，便于自实现拖拽排序。
 */
export interface RowAttrs {
  onClick?: (e: MouseEvent) => void;
  onDoubleClick?: (e: MouseEvent) => void;
  onMouseEnter?: (e: MouseEvent) => void;
  onMouseLeave?: (e: MouseEvent) => void;
  className?: string;
  style?: string;
  draggable?: boolean;
  onDragStart?: (e: DragEvent) => void;
  onDragOver?: (e: DragEvent) => void;
  onDragEnter?: (e: DragEvent) => void;
  onDragLeave?: (e: DragEvent) => void;
  onDrop?: (e: DragEvent) => void;
  onDragEnd?: (e: DragEvent) => void;
}

export interface ScrollConfig {
  x?: number | string;
  y?: number | string;
  scrollToFirstRowOnChange?: boolean;
}

/** 聚合 onChange 的 extra.action 取值 */
export type TableChangeAction = 'paginate' | 'sort' | 'filter';

/** 聚合 onChange 载荷（排序/筛选/分页任一变化的主入口，spec §4） */
export interface TableChangeInfo {
  pagination: { current: number; pageSize: number };
  filters: Record<string, (string | number)[]>;
  sorter: SortStateLike;
  extra: { action: TableChangeAction };
}

/** onScroll 载荷（spec §4，含触底用于无限加载） */
export interface TableScrollInfo {
  scrollLeft: number;
  scrollTop: number;
  atLeft: boolean;
  atRight: boolean;
  atTop: boolean;
  atBottom: boolean;
}

// 局部别名，避免在本文件引入对 SortState 的运行期依赖说明
type SortStateLike = import('@chenzy-design/core').SortState;

export type { RowKey } from '@chenzy-design/core';
export type { SortState, SortOrder } from '@chenzy-design/core';
