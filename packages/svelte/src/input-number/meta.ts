/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 */
export const meta = {
  name: 'InputNumber',
  category: 'input',
  description: '受约束的数值录入框，含步进按钮、键盘步进、精度与范围 clamp，复用 Input 视觉。',
  props: [
    { name: 'value', type: 'number | null', default: 'undefined', desc: '受控值；提供则为受控' },
    { name: 'defaultValue', type: 'number | null', default: 'null', desc: '非受控初始值' },
    { name: 'min', type: 'number', default: '-Infinity' },
    { name: 'max', type: 'number', default: 'Infinity' },
    { name: 'step', type: 'number', default: '1' },
    { name: 'shiftStep', type: 'number', default: 'step * 10', desc: 'Shift+↑↓ 步长' },
    { name: 'precision', type: 'number', default: 'undefined', desc: '失焦四舍五入保留小数位' },
    { name: 'size', type: "'small'|'default'|'large'", default: 'default' },
    { name: 'disabled', type: 'boolean', default: 'false' },
    { name: 'readonly', type: 'boolean', default: 'false' },
    { name: 'status', type: "'default'|'warning'|'error'", default: 'default' },
    { name: 'controls', type: 'boolean', default: 'true', desc: '是否显示步进按钮' },
    { name: 'keyboard', type: 'boolean', default: 'true', desc: '是否启用 ↑↓ 步进' },
    { name: 'placeholder', type: 'string', default: 'undefined' },
    { name: 'name', type: 'string', default: 'undefined' },
    { name: 'ariaLabel', type: 'string', default: 'undefined' },
    { name: 'onChange', type: '(v: number | null) => void', default: 'undefined' },
  ],
  a11y: {
    role: 'spinbutton',
    keyboard: ['ArrowUp', 'ArrowDown', 'Shift+ArrowUp', 'Shift+ArrowDown', 'Enter'],
    notes: [
      'input role=spinbutton + aria-valuenow/valuemin/valuemax',
      '失焦按 precision 四舍五入并 clamp 到 [min,max]',
      '到 min/max 时对应步进按钮 disabled',
      '步进按钮 tabindex=-1，mousedown.preventDefault 不夺焦',
      'disabled→aria-disabled，readonly→aria-readonly，error→aria-invalid',
    ],
  },
  tokens: ['--cd-input-*', '--cd-color-*', '--cd-spacing-*', '--cd-focus-ring', '--cd-motion-*'],
} as const;
