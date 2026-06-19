/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 */
export const meta = {
  name: 'TextArea',
  category: 'input',
  description: '多行文本录入框，支持计数、IME 与 autosize 自适应高度（minRows/maxRows）。',
  props: [
    { name: 'value', type: 'string', default: 'undefined', desc: '受控值；提供则为受控' },
    { name: 'defaultValue', type: 'string', default: "''", desc: '非受控初始值' },
    { name: 'size', type: "'small'|'default'|'large'", default: 'default' },
    { name: 'disabled', type: 'boolean', default: 'false' },
    { name: 'readonly', type: 'boolean', default: 'false' },
    { name: 'placeholder', type: 'string', default: 'undefined' },
    { name: 'showCount', type: 'boolean', default: 'false' },
    { name: 'maxLength', type: 'number', default: 'undefined' },
    { name: 'status', type: "'default'|'warning'|'error'", default: 'default' },
    { name: 'rows', type: 'number', default: '3' },
    {
      name: 'autosize',
      type: 'boolean | { minRows?: number; maxRows?: number }',
      default: 'false',
      desc: '随内容自适应高度',
    },
    { name: 'name', type: 'string', default: 'undefined' },
    { name: 'ariaLabel', type: 'string', default: 'undefined' },
    { name: 'onChange', type: '(v: string) => void', default: 'undefined' },
    { name: 'onInput', type: '(v: string) => void', default: 'undefined' },
  ],
  a11y: {
    role: 'textbox',
    notes: ['原生 textarea', 'error 时 aria-invalid', 'IME composition 安全'],
  },
  tokens: ['--cd-input-*', '--cd-focus-ring', '--cd-motion-*'],
} as const;
