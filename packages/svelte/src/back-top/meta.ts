/**
 * Machine-readable component metadata for AI/docs consumption.
 * BackTop — 严格对齐 Semi backtop/index.tsx（BackTopProps 7 prop）。
 */
export const meta = {
  name: 'BackTop',
  category: 'navigation',
  description:
    '回到顶部悬浮按钮：滚动超过 visibilityHeight(默认 400px) 时显现、点击平滑缓动(easeInOutCubic, duration 默认 450ms)滚回顶部；默认监听 window，可经 target 指定自定义滚动容器；默认渲染 IconButton(theme="light") + IconChevronUp，可用 children 完全自定义。严格对齐 Semi。',
  exports: ['BackTop'],
  props: [
    {
      name: 'target',
      type: '() => HTMLElement | Window | null',
      default: '() => window',
      desc: '返回需要监听其滚动事件的元素对应 DOM 元素的函数（对齐 Semi）',
    },
    {
      name: 'visibilityHeight',
      type: 'number',
      default: '400',
      desc: '出现 BackTop 需要达到的滚动高度(px)',
    },
    { name: 'duration', type: 'number', default: '450', desc: '滚动到顶部的时间(ms)' },
    { name: 'onClick', type: '(e: MouseEvent) => void', default: 'undefined', desc: '点击事件的回调函数' },
    {
      name: 'children',
      type: 'Snippet',
      default: 'undefined',
      desc: '自定义按钮内容（替换默认 IconButton）',
    },
    { name: 'style', type: 'string', default: "''", desc: '根节点内联样式' },
    { name: 'class', type: 'string', default: "''", desc: '根节点类名' },
  ],
  events: [{ name: 'onClick', desc: '按钮点击' }],
  slots: [{ name: 'children', desc: '自定义按钮内容，替换默认 IconButton' }],
  a11y: {
    hasRole: true,
    focusable: true,
    note: '对齐 Semi：外层 div.cd-back-top 为可点击容器，真实按钮语义/键盘可聚焦/可访问名（locale BackTop.ariaLabel）由内部 IconButton(theme="light") 承担；不可见时不在 DOM。',
  },
  tokens: ['--cd-backtop-z', '--cd-backtop-right', '--cd-backtop-bottom'],
  responsive: false,
  examples: [
    { title: '基本用法', code: '<BackTop />' },
    { title: '自定义样式', code: '<BackTop style="...">{icon}</BackTop>' },
  ],
} as const;
