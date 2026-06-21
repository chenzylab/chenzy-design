/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 */
export const meta = {
  name: 'TextArea',
  category: 'input',
  description: '多行文本录入框，支持计数（maxCount/字素）、清除、校验态、IME 与 autosize 自适应高度（minRows/maxRows）。',
  capabilities: ['multiline', 'autosize', 'char-count', 'clearable', 'validation-status'],
  props: [
    { name: 'value', type: 'string', default: 'undefined', desc: '受控值；提供则为受控' },
    { name: 'defaultValue', type: 'string', default: "''", desc: '非受控初始值' },
    { name: 'size', type: "'small'|'default'|'large'", default: 'default' },
    { name: 'disabled', type: 'boolean', default: 'false' },
    { name: 'readonly', type: 'boolean', default: 'false' },
    { name: 'placeholder', type: 'string', default: 'undefined' },
    { name: 'showCount', type: 'boolean', default: 'false', desc: '显示字符计数' },
    { name: 'maxLength', type: 'number', default: 'undefined', desc: '原生硬性长度限制（截断输入）' },
    { name: 'maxCount', type: 'number', default: 'undefined', desc: '计数上限（计数展示与超限提示，不截断）' },
    {
      name: 'countGraphemes',
      type: 'boolean',
      default: 'false',
      desc: '按视觉字符（Intl.Segmenter 字素）计数而非 code point，正确处理 emoji/组合字符',
    },
    { name: 'showClear', type: 'boolean', default: 'false', desc: '显示清除按钮（非空且非禁用/只读）' },
    { name: 'autoFocus', type: 'boolean', default: 'false', desc: '挂载后自动聚焦' },
    { name: 'status', type: "'default'|'warning'|'error'", default: 'default', desc: '校验态' },
    {
      name: 'validateStatus',
      type: "'default'|'warning'|'error'",
      default: 'undefined',
      desc: 'Form 注入别名，等价 status（仅当未显式传 status 时生效）',
    },
    { name: 'rows', type: 'number', default: '3' },
    {
      name: 'autosize',
      type: 'boolean | { minRows?: number; maxRows?: number }',
      default: 'false',
      desc: '随内容自适应高度',
    },
    {
      name: 'resize',
      type: "'none'|'vertical'|'both'",
      default: "'none'",
      desc: '原生手动调整把手（autosize 时强制 none）',
    },
    { name: 'name', type: 'string', default: 'undefined' },
    { name: 'id', type: 'string', default: 'undefined' },
    { name: 'class', type: 'string', default: "''", desc: '透传根类名' },
    { name: 'ariaLabel', type: 'string', default: 'undefined' },
    { name: 'ariaDescribedby', type: 'string', default: 'undefined' },
    { name: 'onChange', type: '(v: string) => void', default: 'undefined' },
    { name: 'onInput', type: '(v: string) => void', default: 'undefined' },
    { name: 'onClear', type: '() => void', default: 'undefined', desc: '点击清除按钮' },
  ],
  slots: [
    { name: 'count', scope: '{ count, maxCount, overLimit }', desc: '自定义计数器渲染（覆盖内建）' },
    { name: 'clearIcon', desc: '自定义清除图标' },
  ],
  a11y: {
    role: 'textbox',
    notes: [
      '原生 textarea',
      'error 时 aria-invalid',
      'IME composition 安全',
      '超限经 aria-live=polite 播报',
      '清除按钮可 Tab 到达，aria-label 来自 i18n',
    ],
  },
  i18nKeys: [
    'Textarea.clear',
    'Textarea.countFormat',
    'Textarea.countOnly',
    'Textarea.overLimitAnnounce',
  ],
  tokens: ['--cd-input-*', '--cd-focus-ring', '--cd-motion-*'],
} as const;
