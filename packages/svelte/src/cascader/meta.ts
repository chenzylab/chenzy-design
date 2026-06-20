/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 */
export const meta = {
  name: 'Cascader',
  category: 'input',
  description: '级联选择器，点击逐级展开列，单选叶子节点。',
  props: [
    { name: 'value', type: '(string|number)[]', default: 'undefined' },
    { name: 'defaultValue', type: '(string|number)[]', default: 'undefined' },
    { name: 'treeData', type: 'CascaderNode[]', default: '[]' },
    { name: 'open', type: 'boolean', default: 'undefined' },
    { name: 'defaultOpen', type: 'boolean', default: 'false' },
    { name: 'size', type: "'small'|'default'|'large'", default: 'default' },
    { name: 'status', type: "'default'|'warning'|'error'", default: 'default' },
    { name: 'placeholder', type: 'string', default: "'请选择'" },
    { name: 'disabled', type: 'boolean', default: 'false' },
    { name: 'clearable', type: 'boolean', default: 'false' },
    { name: 'changeOnSelect', type: 'boolean', default: 'false' },
    { name: 'loadData', type: '(node: CascaderNode) => Promise<CascaderNode[]>', default: 'undefined', desc: '动态加载子节点' },
    { name: 'onChange', type: '(path: (string|number)[]) => void', default: 'undefined' },
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
