/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/components/basic/Typography.spec.md.
 * Aggregated metadata for the Typography family (Title/Text/Paragraph/Link).
 */
const commonProps = [
  { name: 'type', type: "'default'|'secondary'|'tertiary'|'warning'|'danger'|'success'", default: "'default'" },
  { name: 'strong', type: 'boolean', default: 'false', desc: 'font-weight semibold' },
  { name: 'weight', type: "number|'regular'|'medium'|'semibold'|'bold'", default: 'undefined', desc: '显式覆盖字重' },
  { name: 'disabled', type: 'boolean', default: 'false' },
  { name: 'mark', type: 'boolean', default: 'false', desc: '高亮背景' },
  { name: 'underline', type: 'boolean', default: 'false' },
  { name: 'delete', type: 'boolean', default: 'false', desc: '删除线' },
  { name: 'code', type: 'boolean', default: 'false', desc: '等宽代码样式' },
  { name: 'class', type: 'string', default: "''" },
] as const;

export const meta = {
  name: 'Typography',
  category: 'basic',
  description: '排版家族：Title / Text / Paragraph / Link，统一文本样式与语义色。',
  subComponents: [
    {
      name: 'Typography.Title',
      element: 'h1..h6',
      props: [{ name: 'heading', type: '1|2|3|4|5|6', default: '1' }, ...commonProps],
    },
    { name: 'Typography.Text', element: 'span', props: commonProps },
    { name: 'Typography.Paragraph', element: 'p', props: commonProps },
    {
      name: 'Typography.Link',
      element: 'a',
      props: [
        { name: 'href', type: 'string', default: 'undefined' },
        { name: 'target', type: 'string', default: 'undefined' },
        { name: 'rel', type: 'string', default: 'undefined', desc: "target=_blank 且未显式 rel 时自动 noopener noreferrer" },
        ...commonProps,
      ],
    },
  ],
  events: [],
  slots: [{ name: 'children', desc: '文本内容' }],
  a11y: {
    link: 'disabled 时移除 href 并 aria-disabled',
    note: 'reduced-motion 下移除 Link 过渡',
  },
  tokens: [
    '--cd-typography-color',
    '--cd-typography-color-secondary',
    '--cd-typography-color-tertiary',
    '--cd-typography-color-link',
    '--cd-typography-color-link-hover',
    '--cd-typography-mark-bg',
    '--cd-typography-code-bg',
    '--cd-typography-code-font-size',
    '--cd-font-size-1..6',
  ],
  examples: [
    { title: '标题', code: '<Typography.Title heading={2}>标题</Typography.Title>' },
    { title: '链接', code: '<Typography.Link href="/" target="_blank">前往</Typography.Link>' },
  ],
} as const;
