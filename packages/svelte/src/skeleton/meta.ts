/**
 * Machine-readable component metadata for AI/docs consumption.
 * Skeleton — see specs/components/feedback/Skeleton.spec.md
 */
export const meta = {
  name: 'Skeleton',
  category: 'feedback',
  description:
    '骨架屏：loading 切换占位/真实内容，active 开启 shimmer 流光动画；提供 Title / Paragraph / Avatar / Image / Button 五个原子形状自由组合；占位容器 aria-busy + aria-live=polite，骨架块 aria-hidden；reduced-motion 下关闭动画退化为静态底色。loading 受控不回写。',
  exports: [
    'Skeleton',
    'SkeletonTitle',
    'SkeletonParagraph',
    'SkeletonAvatar',
    'SkeletonImage',
    'SkeletonButton',
  ],
  props: [
    { name: 'loading', type: 'boolean', default: 'true', desc: 'true 渲染占位，false 渲染真实内容；受控不回写' },
    { name: 'active', type: 'boolean', default: 'false', desc: '开启 shimmer 流光动画（经 context 传给原子子组件）' },
    {
      name: 'unmountPlaceholder',
      type: 'boolean',
      default: 'true',
      desc: 'true 用 {#if} 条件渲染，未激活一侧从 DOM 卸载；false 走 keepDOM 模式：占位与真实内容同时挂载，靠 display:none 切换（隐藏侧 inert+aria-hidden），避免重挂开销',
    },
    { name: 'placeholder', type: 'Snippet', default: 'undefined', desc: '自定义占位模板，缺省渲染 Avatar+Title+Paragraph 组合' },
    { name: 'children', type: 'Snippet', default: 'undefined', desc: '真实内容' },
    { name: 'ariaLabel', type: 'string', default: "'内容加载中'", desc: '占位容器可访问名' },
    { name: 'class', type: 'string', default: 'undefined', desc: '容器自定义类' },
  ],
  events: [],
  slots: [
    { name: 'placeholder', desc: '自定义占位模板' },
    { name: 'children', desc: 'loading=false 时渲染的真实内容' },
  ],
  a11y: {
    hasRole: false,
    focusable: false,
    note: '占位容器 aria-busy=true + aria-live=polite + aria-label 公布加载；所有骨架块 aria-hidden（纯装饰）；不可聚焦；reduced-motion 下关闭 shimmer 动画，退化为静态底色。',
  },
  tokens: [
    '--cd-skeleton-color-bg',
    '--cd-skeleton-color-highlight',
    '--cd-skeleton-radius',
    '--cd-skeleton-radius-pill',
    '--cd-skeleton-gap',
    '--cd-skeleton-title-height',
    '--cd-skeleton-paragraph-height',
    '--cd-skeleton-anim-duration',
    '--cd-skeleton-anim-timing',
    '--cd-skeleton-image-icon-color',
  ],
  responsive: false,
  examples: [
    { title: '基础骨架', code: '<Skeleton loading={loading}>\n  <p>真实内容</p>\n</Skeleton>' },
    {
      title: 'active 动画',
      code: '<Skeleton active loading={loading}>\n  <p>真实内容</p>\n</Skeleton>',
    },
    {
      title: '卡片组合',
      code: "<Skeleton active loading>\n  {#snippet placeholder()}\n    <SkeletonImage />\n    <SkeletonTitle width=\"50%\" />\n    <SkeletonParagraph rows={2} />\n    <SkeletonButton />\n  {/snippet}\n</Skeleton>",
    },
  ],
} as const;
