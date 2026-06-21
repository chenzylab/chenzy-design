/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 */
export const meta = {
  name: 'TagInput',
  category: 'input',
  description: '标签输入框，支持回车 / 分隔符提交、退格删除、去重、上限与失焦提交。',
  props: [
    { name: 'value', type: 'string[]', default: 'undefined' },
    { name: 'defaultValue', type: 'string[]', default: '[]' },
    { name: 'inputValue', type: 'string', default: 'undefined' },
    { name: 'defaultInputValue', type: 'string', default: "''" },
    { name: 'placeholder', type: 'string', default: 'undefined' },
    { name: 'size', type: "'small'|'default'|'large'", default: 'default' },
    { name: 'status', type: "'default'|'warning'|'error'", default: 'default' },
    { name: 'disabled', type: 'boolean', default: 'false' },
    { name: 'readonly', type: 'boolean', default: 'false' },
    { name: 'max', type: 'number', default: 'undefined' },
    { name: 'maxLength', type: 'number', default: 'undefined' },
    { name: 'maxTagTextLength', type: 'number', default: 'undefined' },
    { name: 'separator', type: 'string|string[]', default: "['Enter']" },
    { name: 'addOnBlur', type: 'boolean', default: 'false' },
    { name: 'allowDuplicates', type: 'boolean', default: 'false' },
    { name: 'trimWhitespace', type: 'boolean', default: 'true' },
    { name: 'onChange', type: '(tags: string[]) => void', default: 'undefined' },
    { name: 'onInputChange', type: '(value: string) => void', default: 'undefined' },
    { name: 'ariaLabel', type: 'string', default: 'undefined' },
  ],
  a11y: {
    role: 'group',
    notes: [
      '容器 role=group + aria-label',
      '每个标签删除按钮含 aria-label（本轮内置中文「删除」，TODO 接 locale）',
      '键盘：分隔符（默认 Enter）提交、输入为空时 Backspace 删除末尾标签',
      'error 状态时 aria-invalid 标注于内部输入',
    ],
  },
  tokens: ['--cd-input-*', '--cd-focus-ring', '--cd-motion-*', '--cd-color-fill-*'],
} as const;
