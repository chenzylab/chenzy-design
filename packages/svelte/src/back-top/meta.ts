/**
 * Machine-readable component metadata for AI/docs consumption.
 * BackTop — see specs/components/other/BackTop.spec.md
 */
export const meta = {
  name: 'BackTop',
  category: 'navigation',
  description:
    '回到顶部悬浮按钮：滚动超阈值显隐 + 平滑缓动(easeInOutCubic)回顶，三尺寸(small/default/large)，原生 button 支持 Enter/Space，prefers-reduced-motion 下瞬时回顶，RTL 友好(inset-inline-end)。默认监听 window 滚动，可经 target 指定自定义滚动容器；支持受控 visible 与 announceOnArrive 到顶 ARIA live 播报。',
  exports: ['BackTop'],
  props: [
    {
      name: 'target',
      type: '() => HTMLElement | string | Window | null',
      default: 'undefined',
      desc: '监听并回顶的滚动容器，返回元素/CSS 选择器/window；不传监听 window',
    },
    {
      name: 'visible',
      type: 'boolean',
      default: 'undefined',
      desc: '受控显隐：传入则由外部控制按钮显隐（仅读不回写），不传按 visibilityHeight 自动',
    },
    {
      name: 'announceOnArrive',
      type: 'boolean',
      default: 'false',
      desc: '回到顶部后经 ARIA live region 播报（文案取 locale BackTop.arrived）',
    },
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
