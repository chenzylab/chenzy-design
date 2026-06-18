/**
 * Machine-readable component metadata for AI/docs consumption.
 * Table — see specs/components/show/Table.spec.md
 */
export const meta = {
  name: 'Table',
  category: 'show',
  description:
    '表格：列定义驱动渲染，三态排序(升/降/无)、客户端分页、行选择(含半选 indeterminate)；sortState / rowSelection.selectedRowKeys / pagination.current 受控不回写，仅经 onSortChange / onChange 通知。复用 @chenzy-design/core 纯函数算法与 Pagination 组件。本子集；固定列 / 虚拟化 / 筛选 / 树形 / 行展开延后。',
  exports: ['Table'],
  props: [
    { name: 'columns', type: 'ColumnDef<T>[]', default: '[]', desc: '列定义：key/dataIndex/title/width/align/ellipsis/sorter/render' },
    { name: 'dataSource', type: 'T[]', default: '[]', desc: '数据行' },
    { name: 'rowKey', type: "string | ((record: T) => RowKey)", default: "'key'", desc: '行唯一键解析' },
    { name: 'size', type: "'small'|'default'|'large'", default: "'default'" },
    { name: 'bordered', type: 'boolean', default: 'false', desc: '单元格边框' },
    { name: 'stripe', type: 'boolean', default: 'false', desc: '斑马纹' },
    { name: 'loading', type: 'boolean', default: 'false', desc: '半透明遮罩 + spinner' },
    { name: 'sortState', type: 'SortState', default: 'undefined', desc: '受控排序态；受控时不回写，仅 onSortChange' },
    { name: 'defaultSortState', type: 'SortState', default: '{ key: null, order: null }', desc: '非受控初始排序' },
    { name: 'onSortChange', type: '(state: SortState) => void', default: 'undefined' },
    {
      name: 'pagination',
      type: "false | { pageSize?: number; current?: number; defaultCurrent?: number; onChange?: (page: number) => void }",
      default: 'undefined',
      desc: 'false 关闭；对象/缺省启用内置分页(pageSize 默认 10)。current 受控不回写',
    },
    {
      name: 'rowSelection',
      type: 'RowSelection<T>',
      default: 'undefined',
      desc: 'selectedRowKeys 受控不回写；defaultSelectedRowKeys / onChange / getCheckboxProps',
    },
    { name: 'rowClassName', type: '(record: T, index: number) => string', default: 'undefined' },
    { name: 'empty', type: 'string', default: "'暂无数据'", desc: '空数据占位文案' },
    { name: 'ariaLabel', type: 'string', default: 'undefined', desc: 'table aria-label' },
    { name: 'onRowClick', type: '(info: { record: T; index: number }) => void', default: 'undefined' },
  ],
  events: [
    { name: 'onSortChange', desc: '表头排序切换(三态循环)' },
    { name: 'rowSelection.onChange', desc: '行选择变更，回传 keys 与对应 rows' },
    { name: 'pagination.onChange', desc: '页码变更' },
    { name: 'onRowClick', desc: '行点击(复选框/排序按钮已阻止冒泡)' },
  ],
  slots: [
    { name: 'column.render', desc: '单元格自定义渲染 Snippet<[{ value, record, index }]>' },
    { name: 'empty', desc: '空态文案经 empty prop 配置(字符串)' },
  ],
  a11y: {
    hasRole: true,
    focusable: true,
    note: '原生 <table><thead><tbody> 语义；th scope=col，可排序列加 aria-sort(ascending/descending/none)；行选择用原生 checkbox，全选 aria-label「全选」、行选 aria-label「选择此行」，半选经 attachment 命令式设 input.indeterminate(只写属性、不读几何、无响应式循环)；排序为 <button>，焦点环用 --cd-focus-ring；reduced-motion 下关闭 spinner 与图标过渡。',
  },
  tokens: [
    '--cd-table-bg',
    '--cd-table-header-bg',
    '--cd-table-header-text',
    '--cd-table-cell-text',
    '--cd-table-border-color',
    '--cd-table-row-hover-bg',
    '--cd-table-row-selected-bg',
    '--cd-table-row-stripe-bg',
    '--cd-table-cell-padding-y',
    '--cd-table-cell-padding-x',
    '--cd-table-cell-padding-y-small',
    '--cd-table-cell-padding-y-large',
    '--cd-table-sort-active-color',
    '--cd-table-sort-icon-color',
    '--cd-table-loading-mask',
    '--cd-table-empty-color',
    '--cd-table-radius',
  ],
  responsive: false,
  examples: [
    {
      title: '基础',
      code: '<Table {columns} dataSource={data} rowKey="id" />',
    },
    {
      title: '可排序',
      code: '<Table columns={[{ dataIndex: "age", title: "年龄", sorter: true }]} dataSource={data} />',
    },
    {
      title: '行选择 + 分页',
      code: '<Table {columns} dataSource={data} rowSelection={{ onChange: (keys) => (selected = keys) }} pagination={{ pageSize: 10 }} />',
    },
  ],
} as const;
