/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 */
export const meta = {
  name: 'Collapsible',
  category: 'show',
  semiEquivalent: 'Collapsible',
  relatedTo: 'Collapse',
  description:
    '折叠容器原语：对任意内容做高度折叠/展开过渡，无触发器 UI（aria-expanded 由使用方提供）。是 Collapse 手风琴的底层能力，作为独立原语暴露以支持 keepDOM / lazyRender / collapseHeight 等精细控制。默认用 CSS grid 0fr↔1fr 自适应折叠（无 JS 测量）；collapseHeight>0（展开更多）时用显式高度过渡 + JS 测高。',
  props: [
    { name: 'isOpen', type: 'boolean', default: 'false', desc: '是否展开' },
    { name: 'duration', type: 'number', default: '250', desc: '过渡时长（ms）' },
    { name: 'motion', type: 'boolean', default: 'true', desc: '是否启用过渡动画（false 即时显隐）' },
    {
      name: 'keepDOM',
      type: 'boolean',
      default: 'false',
      desc: '折叠时是否保留 DOM（false 则完全折叠后移除内容 DOM）',
    },
    {
      name: 'lazyRender',
      type: 'boolean',
      default: 'false',
      desc: '首次展开前不渲染内容（配合 keepDOM，首帧惰性）',
    },
    {
      name: 'collapseHeight',
      type: 'number',
      default: '0',
      desc: '折叠时保留的高度（px，0=完全折叠；>0=保留部分作「展开更多」）',
    },
    {
      name: 'collapseHeightAdaptive',
      type: 'boolean',
      default: 'false',
      desc: '折叠高度是否自适应（不超过实测内容高度）',
    },
    { name: 'fade', type: 'boolean', default: 'false', desc: '折叠时是否叠加透明度渐变' },
    {
      name: 'reCalcKey',
      type: 'number | string',
      default: 'undefined',
      desc: '变更时强制重算高度（内容动态变化后触发重测，仅 collapseHeight>0 生效）',
    },
    { name: 'id', type: 'string', default: 'undefined', desc: '内容容器 id' },
    {
      name: 'onMotionEnd',
      type: '() => void',
      default: 'undefined',
      desc: '展开/折叠过渡动画结束回调',
    },
    { name: 'class', type: 'string', default: 'undefined', desc: '根节点 class' },
    { name: 'style', type: 'string', default: 'undefined', desc: '根节点内联样式' },
    { name: 'children', type: 'Snippet', default: 'undefined', desc: '被折叠的内容' },
  ],
  a11y: {
    role: 'presentation',
    keyboard: [],
    notes: [
      '折叠区完全折叠（不 keepDOM 且 collapseHeight===0）且不可见时，内容 aria-hidden=true 移出可达性树',
      '原语不含触发器：aria-expanded / aria-controls 由使用方（或 Collapse）提供',
      'reduced-motion：motion=true 但用户 prefers-reduced-motion 时移除过渡（即时）',
    ],
  },
  examples: [
    { title: '基础折叠', desc: 'isOpen 驱动高度过渡（CSS grid 自适应，无 JS 测量）' },
    { title: 'keepDOM 保留 DOM', desc: '折叠后内容 DOM 不卸载（保留表单状态/滚动位置）' },
    { title: 'lazyRender 惰性', desc: '首次展开前不渲染内容，省首屏成本（配合 keepDOM）' },
    { title: 'collapseHeight 展开更多', desc: '折叠保留部分高度呈现截断，点击展开全文' },
    { title: 'fade 渐变', desc: '折叠时叠加透明度渐变' },
    { title: 'reCalcKey 动态内容', desc: '内容动态变化后触发重测高度（collapseHeight>0）' },
  ],
  doNot: [
    '需要手风琴分组 UI（头部/箭头/分组）时改用 Collapse，Collapsible 只是无 UI 的折叠原语',
    '简单显隐无动画用 {#if} 即可，无需 Collapsible',
    '不要在 reduced-motion 下保留过渡（组件已自动移除）',
  ],
  tokens: ['--cd-collapsible-motion-duration', '--cd-collapsible-motion-ease'],
} as const;
