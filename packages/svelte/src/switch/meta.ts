/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 */
export const meta = {
  name: 'Switch',
  category: 'input',
  description: '开关选择器，表示两种互斥状态的即时切换，支持加载态与自定义文案。',
  props: [
    { name: 'value', type: 'boolean', default: 'undefined', desc: '受控值；提供则为受控' },
    { name: 'defaultValue', type: 'boolean', default: 'false', desc: '非受控初始值' },
    { name: 'size', type: "'small'|'default'|'large'", default: 'default' },
    { name: 'status', type: "'default'|'warning'|'error'", default: 'default' },
    { name: 'disabled', type: 'boolean', default: 'false' },
    { name: 'loading', type: 'boolean', default: 'false' },
    { name: 'checkedChildren', type: 'string | Snippet', default: 'undefined' },
    { name: 'uncheckedChildren', type: 'string | Snippet', default: 'undefined' },
    { name: 'name', type: 'string', default: 'undefined' },
    { name: 'ariaLabel', type: 'string', default: 'undefined' },
    { name: 'onChange', type: '(v: boolean) => void', default: 'undefined' },
  ],
  a11y: {
    role: 'switch',
    keyboard: ['Enter', 'Space'],
    notes: ['原生 button role=switch', 'aria-checked 反映状态', 'loading 时 aria-busy'],
  },
  tokens: ['--cd-switch-*', '--cd-focus-ring', '--cd-motion-*', '--cd-radius-full'],
} as const;
