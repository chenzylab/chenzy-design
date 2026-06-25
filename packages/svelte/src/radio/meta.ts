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
    {
      name: 'status',
      type: "'default'|'warning'|'error'",
      default: 'default',
      desc: '校验态，影响边框色；继承 Group，非 default 单项可覆盖',
    },
    { name: 'type', type: "'default'|'button'|'card'|'pureCard'", default: '继承 Group 或 default', desc: 'button/card/pureCard 用 role=radio 容器 + aria-checked' },
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
      {
        name: 'status',
        type: "'default'|'warning'|'error'",
        default: 'default',
        desc: '整组校验态，经 context 透传给组内 Radio；error 时根元素 aria-invalid',
      },
      { name: 'type', type: "'default'|'button'|'card'|'pureCard'", default: 'default', desc: '整组形态，透传子项；非 default 用 role=radio + aria-checked' },
      { name: 'direction', type: "'horizontal'|'vertical'", default: 'horizontal' },
      { name: 'onChange', type: '(v: string|number|boolean) => void', default: 'undefined' },
      { name: 'children', type: 'Snippet', default: 'undefined' },
      { name: 'ariaLabel', type: 'string', default: 'undefined' },
    ],
  },
  a11y: {
    role: 'radiogroup / radio',
    keyboard: ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Space'],
    notes: [
      'div role=radiogroup 包裹',
      'roving tabindex：仅选中项（或首个可用项）tabindex=0',
      '方向键在可用项间循环移动并选中、聚焦，跳过 disabled',
      'Home/End 跳首/末可用项',
      'RTL（dir=rtl）下 ArrowLeft/ArrowRight 语义镜像翻转',
      'button/card/pureCard 型用容器 role=radio + aria-checked（非原生 input），Space/Enter 选中',
      'extra 经 aria-describedby 关联',
    ],
  },
  tokens: ['--cd-radio-*', '--cd-focus-ring', '--cd-motion-*', '--cd-spacing-*', '--cd-radius-full'],
} as const;
