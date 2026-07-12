/**
 * Machine-readable component metadata for AI/docs consumption.
 * Badge — 对齐 Semi Design Badge。
 */
export const meta = {
  name: 'Badge',
  category: 'show',
  description:
    '徽标：在宿主元素角落展示 count 数字/dot 小圆点/自定义节点；无 children 时可独立使用。支持 type/theme/position/overflowCount。',
  exports: ['Badge'],
  props: [
    {
      name: 'count',
      type: 'number|string|Snippet',
      default: 'undefined',
      desc: '徽标内容；数字/字符串按 overflowCount 处理，Snippet 时直接渲染',
    },
    { name: 'dot', type: 'boolean', default: 'false', desc: '显示小圆点，优先于 count' },
    {
      name: 'type',
      type: "'primary'|'secondary'|'tertiary'|'danger'|'warning'|'success'",
      default: "'primary'",
    },
    { name: 'theme', type: "'solid'|'light'|'inverted'", default: "'solid'" },
    {
      name: 'position',
      type: "'leftTop'|'leftBottom'|'rightTop'|'rightBottom'",
      default: "'rightTop'",
    },
    { name: 'overflowCount', type: 'number', default: 'undefined', desc: '超出显示 {n}+' },
    { name: 'countStyle', type: 'string', default: 'undefined', desc: '徽标内容区域样式' },
    { name: 'countClass', type: 'string', default: 'undefined', desc: '徽标内容区域类名' },
    { name: 'style', type: 'string', default: 'undefined', desc: '徽标内容区域内联样式（优先于 countStyle）' },
    { name: 'class', type: 'string', default: 'undefined', desc: '根节点类名' },
    { name: 'onClick', type: '(e: MouseEvent) => void', default: 'undefined' },
    { name: 'onMouseEnter', type: '(e: MouseEvent) => void', default: 'undefined' },
    { name: 'onMouseLeave', type: '(e: MouseEvent) => void', default: 'undefined' },
    { name: 'children', type: 'Snippet', default: 'undefined', desc: '宿主子元素；省略时独立使用' },
  ],
  events: [],
  slots: [
    { name: 'children', desc: '被徽标包裹的宿主元素' },
    { name: 'count', desc: '自定义徽标内容（count 为 Snippet 时）' },
  ],
  a11y: {
    hasRole: false,
    focusable: false,
    note: 'Badge 为纯展示元素；不进入 Tab 序，语义由宿主文案承载。',
  },
  tokens: [
    '--cd-color-badge-default-bg-default',
    '--cd-color-badge-default-text-default',
    '--cd-color-badge-primary-solid-bg-default',
    '--cd-color-badge-danger-solid-bg-default',
    '--cd-width-badge-dot',
    '--cd-height-badge-count',
  ],
  responsive: false,
  examples: [
    { title: '计数', code: '<Badge count={5}><Avatar>A</Avatar></Badge>' },
    { title: '溢出', code: '<Badge count={100} overflowCount={99}>...</Badge>' },
    { title: '独立使用', code: '<Badge dot type="success" /> 成功' },
  ],
} as const;
