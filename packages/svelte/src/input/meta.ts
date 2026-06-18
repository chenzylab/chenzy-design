/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 */
export const meta = {
  name: 'Input',
  category: 'input',
  description: '单行文本录入框，支持前后缀、清除、计数、密码显隐与 IME。',
  props: [
    { name: 'value', type: 'string', default: 'undefined', desc: '受控值；提供则为受控' },
    { name: 'defaultValue', type: 'string', default: "''", desc: '非受控初始值' },
    { name: 'size', type: "'small'|'default'|'large'", default: 'default' },
    { name: 'disabled', type: 'boolean', default: 'false' },
    { name: 'readonly', type: 'boolean', default: 'false' },
    { name: 'placeholder', type: 'string', default: 'undefined' },
    { name: 'clearable', type: 'boolean', default: 'false' },
    { name: 'showCount', type: 'boolean', default: 'false' },
    { name: 'maxLength', type: 'number', default: 'undefined' },
    { name: 'status', type: "'default'|'warning'|'error'", default: 'default' },
    { name: 'type', type: "'text'|'password'", default: 'text' },
    { name: 'prefix', type: 'Snippet', default: 'undefined' },
    { name: 'suffix', type: 'Snippet', default: 'undefined' },
    { name: 'name', type: 'string', default: 'undefined' },
    { name: 'ariaLabel', type: 'string', default: 'undefined' },
    { name: 'onChange', type: '(v: string) => void', default: 'undefined' },
    { name: 'onInput', type: '(v: string) => void', default: 'undefined' },
    { name: 'onClear', type: '() => void', default: 'undefined' },
    { name: 'onEnter', type: '(e: KeyboardEvent) => void', default: 'undefined' },
  ],
  a11y: {
    role: 'textbox',
    notes: ['原生 input', 'error 时 aria-invalid', '密码切换 aria-pressed', '清除按钮 aria-label'],
  },
  tokens: ['--cd-input-*', '--cd-focus-ring', '--cd-motion-*'],
} as const;
