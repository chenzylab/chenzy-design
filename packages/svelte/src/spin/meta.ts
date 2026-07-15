/**
 * Machine-readable component metadata for AI/docs consumption.
 * Spin — see specs/components/feedback/Spin.spec.md
 */
export const meta = {
  name: 'Spin',
  category: 'feedback',
  description:
    '加载指示器，严格对齐 Semi Design：统一 DOM（.cd-spin > .cd-spin-wrapper 指示器 + .cd-spin-children 内容），有 children 时块级包裹并遮罩内容（opacity 0.5、不可交互），无 children 时独立指示器。delay 延迟去抖（复用 @chenzy-design/core createSpinController，无 minShowTime）。role=status + aria-live=polite 公布加载，装饰 SVG aria-hidden，reduced-motion 退化为呼吸。spinning 受控不回写。',
  exports: ['Spin'],
  props: [
    { name: 'spinning', type: 'boolean', default: 'true', desc: '是否处于加载中的状态；受控不回写' },
    { name: 'size', type: "'small'|'middle'|'large'", default: "'middle'", desc: '组件大小' },
    { name: 'indicator', type: 'Snippet', default: 'undefined', desc: '自定义加载指示符' },
    { name: 'delay', type: 'number', default: '0', desc: '延迟显示加载效果的时间（ms）' },
    { name: 'tip', type: 'string', default: "''", desc: '作为包裹元素时的描述文字，空则不渲染' },
    { name: 'wrapperClassName', type: 'string', default: "''", desc: '包裹元素的类名' },
    { name: 'style', type: 'string', default: 'undefined', desc: '根节点内联样式' },
    { name: 'childStyle', type: 'string', default: 'undefined', desc: '内部子元素（.cd-spin-children）的样式' },
    { name: 'children', type: 'Snippet', default: 'undefined', desc: '提供则块级包裹内容并叠加遮罩' },
  ],
  events: [],
  slots: [
    { name: 'children', desc: '被包裹的内容（提供则进入 block 包裹模式）' },
    { name: 'indicator', desc: '自定义指示器' },
  ],
  a11y: {
    hasRole: true,
    focusable: false,
    note: 'loading 时 .cd-spin-wrapper 使用 role=status + aria-live=polite（隐式 aria-atomic）公布加载；无 tip 时以 i18n Spin.loading 为 aria-label；内置渐变 SVG aria-hidden；组件无可聚焦元素，不进入 Tab 序列；reduced-motion 旋转退化为 opacity 呼吸。',
  },
  tokens: [
    // Semi 全量对齐（spin/variables.scss + animation.scss）
    '--cd-color-spin-bg',
    '--cd-width-spin-large',
    '--cd-width-spin-middle',
    '--cd-width-spin-small',
    '--cd-opacity-spin-children',
    '--cd-animation-duration-spin-wrapper-spin',
    '--cd-animation-duration-spin-custom-children-spin',
  ],
  responsive: false,
  examples: [
    { title: '基本', code: '<Spin />' },
    { title: '尺寸', code: '<Spin size="small" />\n<Spin size="middle" />\n<Spin size="large" />' },
    {
      title: '带文字包裹',
      code: '<Spin tip="加载中…">\n  <div>内容</div>\n</Spin>',
    },
    { title: '延迟显示', code: '<Spin delay={1000} spinning={loading} />' },
  ],
} as const;
