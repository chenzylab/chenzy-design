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
  /** 表头文案 */
  title: string;
  /** 列宽 */
  width?: number | string;
  /** 固定列：横向滚动时左/右侧 sticky 锁定（需配合 width 数值） */
  fixed?: 'left' | 'right';
  /** 列宽可拖拽调整：列头右侧出现拖拽手柄，指针拖拽实时改列宽 */
  resizable?: boolean;
  /** 对齐方式，默认 left */
  align?: Align;
  /** 单元格溢出省略 */
  ellipsis?: boolean;
  /** true 按 dataIndex 默认比较；或自定义比较器 */
  sorter?: boolean | ((a: T, b: T) => number);
  /** 列头筛选项（下拉多选）；配合 onFilter 过滤数据 */
  filters?: { text: string; value: string | number }[];
  /** 行是否匹配某筛选值；缺省时按 dataIndex 全等比较 */
  onFilter?: (value: string | number, record: T) => boolean;
  /** 单元格自定义渲染 */
  render?: Snippet<[{ value: unknown; record: T; index: number }]>;
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
