/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 */
export const meta = {
  name: 'Cascader',
  category: 'input',
  description: '级联选择器，点击逐级展开列，单选叶子节点。',
  props: [
    { name: 'value', type: '(string|number)[] | (string|number)[][]', default: 'undefined', desc: '单选单条路径；多选多条路径' },
    { name: 'defaultValue', type: '(string|number)[] | (string|number)[][]', default: 'undefined' },
    { name: 'treeData', type: 'CascaderNode[]', default: '[]' },
    { name: 'open', type: 'boolean', default: 'undefined' },
    { name: 'defaultOpen', type: 'boolean', default: 'false' },
    { name: 'multiple', type: 'boolean', default: 'false', desc: '每列 checkbox 多选 + 父子联动，多 tag 回显' },
    { name: 'size', type: "'small'|'default'|'large'", default: 'default' },
    { name: 'status', type: "'default'|'warning'|'error'", default: 'default' },
    { name: 'placeholder', type: 'string', default: "'请选择'" },
    { name: 'disabled', type: 'boolean', default: 'false' },
    { name: 'clearable', type: 'boolean', default: 'false' },
    { name: 'changeOnSelect', type: 'boolean', default: 'false' },
    { name: 'filterable', type: 'boolean', default: 'false', desc: '搜索时切换扁平路径列表 + 高亮命中' },
    { name: 'loadData', type: '(node: CascaderNode) => Promise<CascaderNode[]>', default: 'undefined', desc: '动态加载子节点' },
    { name: 'onChange', type: '(value: (string|number)[] | (string|number)[][]) => void', default: 'undefined', desc: '单选回调单条路径；多选回调多条叶子路径' },
    { name: 'onOpenChange', type: '(open: boolean) => void', default: 'undefined' },
    { name: 'ariaLabel', type: 'string', default: 'undefined' },
  ],
  a11y: {
    role: 'combobox',
    notes: [
      'combobox + 每列 listbox + option ARIA 模式',
      '触发器 aria-haspopup="listbox"、aria-expanded',
      '每列 option aria-selected 标记当前路径',
      'disabled 节点 aria-disabled 且不可点击',
    ],
  },
  tokens: [
    '--cd-select-*',
    '--cd-tree-*',
    '--cd-cascader-column-width',
    '--cd-cascader-column-border',
    '--cd-focus-ring',
  ],
} as const;
