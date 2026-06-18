/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 */
export const meta = {
  name: 'Tooltip',
  category: 'show',
  description:
    '文字提示，鼠标悬停/聚焦/点击触发元素时展示简短说明。支持常用 placement、箭头、延迟与 dark/light 主题，浮层纯 CSS 定位。',
  props: [
    { name: 'content', type: 'string | Snippet', default: 'undefined', desc: '提示内容，为空不显示' },
    { name: 'open', type: 'boolean', default: 'undefined', desc: '受控显隐' },
    { name: 'defaultOpen', type: 'boolean', default: 'false', desc: '非受控初始显隐' },
    {
      name: 'trigger',
      type: "'hover'|'focus'|'click'|Array<'hover'|'focus'|'click'>",
      default: "['hover','focus']",
      desc: '触发方式，可组合',
    },
    {
      name: 'placement',
      type: "'top'|'topLeft'|'topRight'|'bottom'|'bottomLeft'|'bottomRight'|'left'|'right'",
      default: 'top',
      desc: '浮层方位',
    },
    { name: 'mouseEnterDelay', type: 'number', default: '100', desc: 'hover 进入延迟(ms)' },
    { name: 'mouseLeaveDelay', type: 'number', default: '100', desc: 'hover 离开延迟(ms)' },
    { name: 'showArrow', type: 'boolean', default: 'true', desc: '是否显示箭头' },
    { name: 'theme', type: "'dark'|'light'", default: 'dark', desc: '主题' },
    { name: 'maxWidth', type: 'number | string', default: '300', desc: '浮层最大宽度' },
    { name: 'disabled', type: 'boolean', default: 'false', desc: '禁用触发' },
    { name: 'onOpenChange', type: '(open: boolean) => void', default: 'undefined' },
    { name: 'children', type: 'Snippet', default: 'undefined', desc: '触发元素（必填）' },
  ],
  a11y: {
    role: 'tooltip',
    keyboard: ['Escape'],
    notes: [
      '浮层 role=tooltip，使用 useId 生成唯一 id',
      '触发元素 open 时加 aria-describedby 指向浮层',
      'focus 触发支持键盘聚焦展示，click 触发用 useDismiss 处理 Escape 与外部点击',
    ],
  },
  tokens: ['--cd-tooltip-*', '--cd-focus-ring', '--cd-motion-*'],
} as const;
