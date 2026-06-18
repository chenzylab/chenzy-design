/**
 * Machine-readable component metadata for AI/docs consumption.
 * Badge — see specs/components/show/Badge.spec.md
 */
export const meta = {
  name: 'Badge',
  category: 'show',
  description:
    '徽标：包裹模式在子元素角落显示 count/dot 角标(支持 overflowCount、showZero、position、offset)；独立 status 点模式显示状态点 + 可选文字。',
  exports: ['Badge'],
  props: [
    { name: 'count', type: 'number|string', default: 'undefined', desc: '角标内容' },
    { name: 'dot', type: 'boolean', default: 'false', desc: '小圆点模式，忽略 count' },
    { name: 'overflowCount', type: 'number', default: '99', desc: '超出显示 {n}+' },
    { name: 'showZero', type: 'boolean', default: 'false', desc: 'count=0 时是否显示' },
    {
      name: 'type',
      type: "'primary'|'secondary'|'tertiary'|'success'|'warning'|'danger'",
      default: "'danger'",
    },
    { name: 'theme', type: "'solid'|'light'", default: "'solid'" },
    {
      name: 'position',
      type: "'top-right'|'top-left'|'bottom-right'|'bottom-left'",
      default: "'top-right'",
    },
    { name: 'offset', type: '[number, number]', default: '[0, 0]', desc: '[x, y] 偏移(px)' },
    { name: 'size', type: "'small'|'default'", default: "'default'" },
    {
      name: 'status',
      type: "'default'|'success'|'processing'|'error'|'warning'",
      default: 'undefined',
      desc: '设置且无 children 时进入独立状态点模式',
    },
    { name: 'children', type: 'Snippet', default: 'undefined', desc: '被包裹元素' },
    { name: 'countContent', type: 'Snippet', default: 'undefined', desc: '自定义角标内容' },
  ],
  events: [],
  slots: [
    { name: 'children', desc: '被角标包裹的元素' },
    { name: 'countContent', desc: '自定义角标内容' },
  ],
  a11y: {
    hasRole: false,
    focusable: false,
    note: '角标 sup 带 aria-label(count 值)；dot 模式与状态点 aria-hidden。',
  },
  tokens: [
    '--cd-badge-size',
    '--cd-badge-size-small',
    '--cd-badge-dot-size',
    '--cd-badge-bg',
    '--cd-badge-color',
    '--cd-badge-font-size',
  ],
  responsive: false,
  examples: [
    { title: '计数', code: '<Badge count={5}><Avatar alt="A" /></Badge>' },
    { title: '溢出', code: '<Badge count={120} overflowCount={99}>...</Badge>' },
    { title: '状态点', code: '<Badge status="success" count="已完成" />' },
  ],
} as const;
