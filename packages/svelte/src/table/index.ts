import TableComponent from './Table.svelte';
import ColumnComponent from './Column.svelte';

// Table.Column 命名空间（对齐 Semi Table.Column）+ 兄弟 Column 导出（对齐本库
// Tabs/TabPane、Steps/Step 惯例），双写法皆可。显式类型注解避免泄漏组件内部
// Props 类型导致的 .d.ts 声明 emit 报错（同 Tabs/Steps 做法）。
export const Table: typeof TableComponent & {
  Column: typeof ColumnComponent;
} = Object.assign(TableComponent, { Column: ColumnComponent });

export { default as Column } from './Column.svelte';
export { meta as tableMeta } from './meta.js';
export type {
  ColumnDef,
  RowSelection,
  ResizableConfig,
  RenderFilterDropdownProps,
  Expandable,
  TreeTable,
  TableChangeInfo,
  TableChangeAction,
  TableScrollInfo,
  ScrollConfig,
} from './types.js';
export type { RowKey, SortState, SortOrder } from '@chenzy-design/core';
