/**
 * Machine-readable component metadata for AI/docs consumption.
 * BackTop — see specs/components/other/BackTop.spec.md
 */
export const meta = {
  name: 'BackTop',
  category: 'other',
  description:
    '回到顶部悬浮按钮：滚动超阈值显隐 + 平滑缓动(easeInOutCubic)回顶，三尺寸(small/default/large)，原生 button 支持 Enter/Space，prefers-reduced-motion 下瞬时回顶，RTL 友好(inset-inline-end)。本子集监听 window 滚动；自定义 target 元素、受控 visible、announceOnArrive 延后。',
  exports: ['BackTop'],
  props: [
    {
      name: 'visibilityHeight',
      type: 'number',
      default: '400',
      desc: '滚动超过此高度(px)显示按钮',
    },
    { name: 'duration', type: 'number', default: '450', desc: '回顶动画时长(ms)，0 瞬时' },
    { name: 'bottom', type: 'number|string', default: '40', desc: '距底偏移，number→px' },
    {
      name: 'right',
      type: 'number|string',
      default: '40',
      desc: '距 inline-end 偏移，number→px',
    },
    { name: 'size', type: "'small'|'default'|'large'", default: "'default'" },
    { name: 'ariaLabel', type: 'string', default: "'回到顶部'", desc: '无障碍标签' },
    {
      name: 'icon',
      type: 'Snippet<[{ size }]>',
      default: 'undefined',
      desc: '替换图标(保留圆形按钮外壳)',
    },
    {
      name: 'children',
      type: 'Snippet<[{ visible }]>',
      default: 'undefined',
      desc: '完全自定义按钮内容',
    },
    { name: 'onClick', type: '(e: MouseEvent) => void', default: 'undefined' },
    {
      name: 'onVisibleChange',
      type: '(info: { visible: boolean }) => void',
      default: 'undefined',
      desc: '显隐切换通知',
    },
    {
      name: 'onScrollEnd',
      type: '() => void',
      default: 'undefined',
      desc: '回顶动画结束通知',
    },
    { name: 'class', type: 'string', default: "''" },
  ],
  events: [
    { name: 'onClick', desc: '按钮点击' },
    { name: 'onVisibleChange', desc: '显隐切换' },
    { name: 'onScrollEnd', desc: '回顶动画结束' },
  ],
  slots: [
    { name: 'children', desc: '完全自定义按钮内容，入参 { visible }' },
    { name: 'icon', desc: '替换默认图标，入参 { size }，保留圆形按钮外壳' },
  ],
  a11y: {
    hasRole: true,
    focusable: true,
    note: '原生 button 自带 button role + Enter/Space 触发；aria-label 文本；隐藏态 aria-hidden=true + tabindex=-1 移出 Tab 序与 a11y 树；focus-visible 焦点环。',
  },
  tokens: [
    '--cd-backtop-size',
    '--cd-backtop-size-small',
    '--cd-backtop-size-large',
    '--cd-backtop-bg',
    '--cd-backtop-bg-hover',
    '--cd-backtop-bg-active',
    '--cd-backtop-color',
    '--cd-backtop-border',
    '--cd-backtop-shadow',
    '--cd-backtop-radius',
    '--cd-backtop-z',
    '--cd-backtop-focus-ring',
    '--cd-backtop-motion-duration',
  ],
  responsive: false,
  examples: [
    { title: '基础', code: '<BackTop />' },
    { title: '小尺寸', code: '<BackTop size="small" />' },
    { title: '自定义偏移', code: '<BackTop bottom={80} right={24} />' },
  ],
} as const;
