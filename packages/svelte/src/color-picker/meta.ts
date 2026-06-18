/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 */
export const meta = {
  name: 'ColorPicker',
  category: 'input',
  description:
    '颜色选择器：trigger 触发浮层面板（saturation 方块 + hue 条 + alpha 条 + hex 输入 + presets），对外以 hex 字符串通信。',
  props: [
    { name: 'value', type: 'string', default: 'undefined' },
    { name: 'defaultValue', type: 'string', default: "'#000000'" },
    { name: 'alpha', type: 'boolean', default: 'true' },
    { name: 'open', type: 'boolean', default: 'undefined' },
    { name: 'defaultOpen', type: 'boolean', default: 'false' },
    { name: 'presets', type: 'string[]', default: '[]' },
    { name: 'size', type: "'small'|'default'|'large'", default: 'default' },
    { name: 'disabled', type: 'boolean', default: 'false' },
    { name: 'outputUppercase', type: 'boolean', default: 'true' },
    { name: 'onChange', type: '(hex: string) => void', default: 'undefined' },
    { name: 'onOpenChange', type: '(open: boolean) => void', default: 'undefined' },
    { name: 'ariaLabel', type: 'string', default: 'undefined' },
  ],
  a11y: {
    role: 'dialog',
    notes: [
      'trigger 含 aria-haspopup=dialog / aria-expanded',
      '浮层 role=dialog',
      'saturation / hue / alpha handle 为 role=slider，含 aria-label 与 aria-valuenow',
      'hue / alpha / saturation 支持方向键微调',
      'hex 输入含 label 与 aria-label',
      'Esc 与外部点击经 useDismiss 关闭浮层',
    ],
  },
  tokens: ['--cd-color-picker-*', '--cd-focus-ring', '--cd-input-*', '--cd-color-*'],
} as const;
