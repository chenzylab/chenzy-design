/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 */
export const meta = {
  name: 'TreeSelect',
  category: 'input',
  description: '树形选择器，单面板可展开/收起的树，单选叶子或任意节点。',
  props: [
    { name: 'value', type: 'TreeKey|TreeKey[]|null', default: 'undefined' },
    { name: 'defaultValue', type: 'TreeKey|TreeKey[]|null', default: 'null' },
    { name: 'treeData', type: 'TreeNode[]', default: '[]', desc: '树数据源；字段名可经 fieldNames 自定义' },
    {
      name: 'fieldNames',
      type: '{ key?: string; label?: string; children?: string }',
      default: "{ key:'key', label:'label', children:'children' }",
      desc: '自定义节点字段名映射，适配任意后端数据（如 { key:\'id\', label:\'name\', children:\'sub\' }）。派生只读映射；onChange 回传的 key 即原始字段值',
    },
    { name: 'open', type: 'boolean', default: 'undefined' },
    { name: 'defaultOpen', type: 'boolean', default: 'false' },
    { name: 'multiple', type: 'boolean', default: 'false', desc: 'checkbox 多选 + 父子联动，多 tag 回显' },
    { name: 'checkStrictly', type: 'boolean', default: 'false', desc: '多选时父子勾选互不影响' },
    { name: 'placeholder', type: 'string', default: "'请选择'" },
    { name: 'size', type: "'small'|'default'|'large'", default: 'default' },
    { name: 'status', type: "'default'|'warning'|'error'", default: 'default' },
    { name: 'disabled', type: 'boolean', default: 'false' },
    { name: 'clearable', type: 'boolean', default: 'false' },
    { name: 'leafOnly', type: 'boolean', default: 'false' },
    { name: 'defaultExpandAll', type: 'boolean', default: 'false' },
    { name: 'filterable', type: 'boolean', default: 'false', desc: '面板搜索框过滤节点 + 高亮命中' },
    {
      name: 'onChange',
      type: '(value: TreeKey|TreeKey[]|null) => void',
      default: 'undefined',
      desc: '多选返回 checked 全集数组，单选返回单 key',
    },
    { name: 'onOpenChange', type: '(open: boolean) => void', default: 'undefined' },
    { name: 'ariaLabel', type: 'string', default: 'undefined' },
  ],
  a11y: {
    role: 'combobox',
    notes: [
      'combobox 触发器 + role="tree" 面板 + role="treeitem"',
      '有 children 节点 aria-expanded 标记展开态',
      'aria-selected 标记选中节点',
      'leafOnly 时非叶子节点仅切换展开，不可选',
    ],
  },
  tokens: ['--cd-select-*', '--cd-tree-*', '--cd-focus-ring'],
} as const;
