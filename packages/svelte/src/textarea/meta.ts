/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 */
export const meta = {
  name: 'Textarea',
  category: 'input',
  description: '多行文本录入框，支持自适应高度（autosize）、字数统计与 IME。',
  props: [
    { name: 'value', type: 'string', default: 'undefined', desc: '受控值；提供则为受控' },
    { name: 'defaultValue', type: 'string', default: "''", desc: '非受控初始值' },
    { name: 'placeholder', type: 'string', default: 'undefined' },
    { name: 'rows', type: 'number', default: '3' },
    {
      name: 'autosize',
      type: 'boolean | { minRows?: number; maxRows?: number }',
      default: 'false',
      desc: 'true 或对象时根据内容自适应高度',
    },
    { name: 'size', type: "'small'|'default'|'large'", default: 'default' },
    { name: 'status', type: "'default'|'warning'|'error'", default: 'default' },
    { name: 'disabled', type: 'boolean', default: 'false' },
    { name: 'readonly', type: 'boolean', default: 'false' },
    { name: 'showCount', type: 'boolean', default: 'false' },
    { name: 'maxLength', type: 'number', default: 'undefined' },
    { name: 'name', type: 'string', default: 'undefined' },
    { name: 'ariaLabel', type: 'string', default: 'undefined' },
    { name: 'onChange', type: '(v: string) => void', default: 'undefined' },
    { name: 'onInput', type: '(v: string) => void', default: 'undefined' },
  ],
  a11y: {
    role: 'textbox',
    notes: ['原生 textarea', 'error 时 aria-invalid', 'autosize 用 attachment 测量 scrollHeight'],
  },
  tokens: ['--cd-input-*', '--cd-focus-ring', '--cd-motion-*', '--cd-spacing-*'],
} as const;
