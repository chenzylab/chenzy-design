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

export interface RowSelection<T> {
  /** 受控选中行 key 列表 */
  selectedRowKeys?: RowKey[];
  /** 非受控初始选中 */
  defaultSelectedRowKeys?: RowKey[];
  /** 选择变更回调 */
  onChange?: (keys: RowKey[], rows: T[]) => void;
  /** 逐行定制复选框属性（如 disabled） */
  getCheckboxProps?: (record: T) => { disabled?: boolean };
}

export type { RowKey } from '@chenzy-design/core';
export type { SortState, SortOrder } from '@chenzy-design/core';
