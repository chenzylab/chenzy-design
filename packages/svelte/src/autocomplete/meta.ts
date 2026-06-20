/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 */
export const meta = {
  name: 'AutoComplete',
  category: 'input',
  description: '输入联想框，支持本地过滤候选、远程异步搜索与键盘选择。',
  props: [
    { name: 'value', type: 'string', default: 'undefined' },
    { name: 'defaultValue', type: 'string', default: "''" },
    { name: 'data', type: 'Item[]', default: '[]' },
    { name: 'open', type: 'boolean', default: 'undefined' },
    { name: 'defaultOpen', type: 'boolean', default: 'false' },
    { name: 'placeholder', type: 'string', default: "''" },
    { name: 'size', type: "'small'|'default'|'large'", default: 'default' },
    { name: 'status', type: "'default'|'warning'|'error'", default: 'default' },
    { name: 'disabled', type: 'boolean', default: 'false' },
    { name: 'filter', type: 'boolean', default: 'true' },
    { name: 'defaultActiveFirstOption', type: 'boolean', default: 'true' },
    { name: 'clearable', type: 'boolean', default: 'false' },
    { name: 'onSearch', type: '(query: string) => void', default: 'undefined' },
    { name: 'loading', type: 'boolean', default: 'false' },
    { name: 'searchDebounce', type: 'number', default: '300' },
    { name: 'maxCount', type: 'number', default: '0' },
    { name: 'onChange', type: '(v: string) => void', default: 'undefined' },
    { name: 'onSelect', type: '(value: string|number) => void', default: 'undefined' },
    { name: 'onOpenChange', type: '(open: boolean) => void', default: 'undefined' },
  ],
  a11y: {
    role: 'combobox',
    notes: [
      'combobox + aria-autocomplete="list" + listbox',
      'aria-activedescendant 指向高亮候选',
      '键盘：↑↓ 移动、Enter 选中、Esc 关闭',
    ],
  },
  tokens: ['--cd-input-*', '--cd-select-dropdown-*', '--cd-focus-ring', '--cd-motion-*'],
} as const;
