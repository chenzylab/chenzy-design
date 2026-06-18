/**
 * Machine-readable component metadata for AI/docs consumption.
 * Tag — see specs/components/show/Tag.spec.md
 */
export const meta = {
  name: 'Tag',
  category: 'show',
  description:
    '标签：light/solid/ghost 三态，五种语义色，可关闭(closable)与可选中(checkable)；受控 checked/visible 不回写，仅通过 onChange/onClose 通知。',
  exports: ['Tag'],
  props: [
    { name: 'type', type: "'light'|'solid'|'ghost'", default: "'light'", desc: '视觉风格' },
    {
      name: 'color',
      type: "'grey'|'primary'|'success'|'warning'|'danger'",
      default: "'grey'",
      desc: '语义色',
    },
    { name: 'size', type: "'small'|'default'|'large'", default: "'default'" },
    { name: 'shape', type: "'square'|'circle'", default: "'square'", desc: 'circle 用 full 圆角' },
    { name: 'closable', type: 'boolean', default: 'false', desc: '尾部关闭按钮' },
    {
      name: 'visible',
      type: 'boolean',
      default: 'undefined',
      desc: '受控显隐；false 不渲染。受控时不回写',
    },
    { name: 'checkable', type: 'boolean', default: 'false', desc: '可选中 chip(role=checkbox)' },
    {
      name: 'checked',
      type: 'boolean',
      default: 'undefined',
      desc: '受控选中态；受控时不回写，仅 onChange',
    },
    { name: 'disabled', type: 'boolean', default: 'false' },
    { name: 'onClose', type: '() => void', default: 'undefined', desc: '关闭点击回调' },
    { name: 'onChange', type: '(checked: boolean) => void', default: 'undefined' },
    { name: 'children', type: 'Snippet', default: 'undefined', desc: '标签内容' },
    { name: 'prefixIcon', type: 'Snippet', default: 'undefined', desc: '前置图标' },
  ],
  events: [
    { name: 'onClose', desc: '关闭按钮点击' },
    { name: 'onChange', desc: 'checkable 切换' },
  ],
  slots: [
    { name: 'children', desc: '标签文本/内容' },
    { name: 'prefixIcon', desc: '前置图标' },
  ],
  a11y: {
    hasRole: true,
    focusable: true,
    note: 'checkable 时 role=checkbox + aria-checked，可键盘 Space/Enter 切换；关闭按钮 aria-label「关闭」。',
  },
  tokens: [
    '--cd-tag-height-default',
    '--cd-tag-height-small',
    '--cd-tag-height-large',
    '--cd-tag-padding-x',
    '--cd-tag-radius',
    '--cd-tag-font-size',
    '--cd-tag-gap',
  ],
  responsive: false,
  examples: [
    { title: '基础', code: '<Tag color="primary">标签</Tag>' },
    { title: '可关闭', code: '<Tag closable onClose={() => {}}>关闭</Tag>' },
    {
      title: '可选中',
      code: '<Tag checkable checked={on} onChange={(v) => (on = v)}>选中</Tag>',
    },
  ],
} as const;
