/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 */
export const meta = {
  name: 'Radio',
  category: 'input',
  description: '单选框，通常置于 RadioGroup 中，遵循 WAI-ARIA radiogroup 模式（roving tabindex + 方向键）。',
  props: [
    { name: 'value', type: 'string | number | boolean', default: '—', desc: '选项值（必填）' },
    { name: 'checked', type: 'boolean', default: 'undefined', desc: '独立使用时受控选中' },
    { name: 'defaultChecked', type: 'boolean', default: 'false' },
    { name: 'disabled', type: 'boolean', default: 'false' },
    { name: 'size', type: "'small'|'default'|'large'", default: 'default' },
    { name: 'name', type: 'string', default: 'undefined' },
    { name: 'extra', type: 'string', default: 'undefined', desc: '辅助说明，aria-describedby 关联' },
    { name: 'children', type: 'Snippet', default: 'undefined', desc: '标签内容' },
    { name: 'onChange', type: '(checked: boolean) => void', default: 'undefined' },
  ],
  group: {
    name: 'RadioGroup',
    props: [
      { name: 'value', type: 'string | number | boolean', default: 'undefined', desc: '受控选中值' },
      { name: 'defaultValue', type: 'string | number | boolean', default: 'undefined' },
      { name: 'name', type: 'string', default: 'useId()' },
      {
        name: 'options',
        type: 'Array<{label,value,disabled?,extra?}>',
        default: 'undefined',
      },
      { name: 'disabled', type: 'boolean', default: 'false' },
      { name: 'size', type: "'small'|'default'|'large'", default: 'default' },
      { name: 'direction', type: "'horizontal'|'vertical'", default: 'horizontal' },
      { name: 'onChange', type: '(v: string|number|boolean) => void', default: 'undefined' },
      { name: 'children', type: 'Snippet', default: 'undefined' },
      { name: 'ariaLabel', type: 'string', default: 'undefined' },
    ],
  },
  a11y: {
    role: 'radiogroup / radio',
    keyboard: ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'],
    notes: [
      'div role=radiogroup 包裹',
      'roving tabindex：仅选中项（或首个可用项）tabindex=0',
      '方向键在可用项间循环移动并选中、聚焦，跳过 disabled',
      'extra 经 aria-describedby 关联',
    ],
  },
  tokens: ['--cd-radio-*', '--cd-focus-ring', '--cd-motion-*', '--cd-spacing-*', '--cd-radius-full'],
} as const;
