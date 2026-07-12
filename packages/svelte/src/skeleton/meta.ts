/**
 * Machine-readable component metadata for AI/docs consumption.
 * Skeleton — 镜像 Semi Design（semi-ui/skeleton）。
 */
export const meta = {
  name: 'Skeleton',
  category: 'feedback',
  description:
    '骨架屏：loading 切换占位/真实内容，active 开启 shimmer 流光动画；提供 Avatar / Image / Title / Button / Paragraph 五个原子占位形状自由组合。镜像 Semi：占位根节点为纯 <div class="cd-skeleton">，active 挂根容器类经后代选择器作用到骨架块。loading 受控不回写。',
  exports: [
    'Skeleton',
    'SkeletonAvatar',
    'SkeletonImage',
    'SkeletonTitle',
    'SkeletonButton',
    'SkeletonParagraph',
  ],
  props: [
    { name: 'loading', type: 'boolean', default: 'true', desc: 'true 显示占位元素，false 显示子组件；受控不回写' },
    { name: 'active', type: 'boolean', default: 'false', desc: '是否展示 shimmer 动画效果' },
    { name: 'placeholder', type: 'Snippet', default: 'undefined', desc: '加载等待时的占位元素' },
    { name: 'children', type: 'Snippet', default: 'undefined', desc: 'loading=false 时渲染的真实内容' },
    { name: 'class', type: 'string', default: 'undefined', desc: '容器类名（对齐 Semi className）' },
    { name: 'style', type: 'string', default: 'undefined', desc: '容器内联样式（对齐 Semi style）' },
  ],
  subComponents: [
    {
      name: 'SkeletonAvatar',
      props: [
        { name: 'size', type: "'extra-extra-small' | 'extra-small' | 'small' | 'medium' | 'large' | 'extra-large'", default: "'medium'", desc: '头像大小（对齐 Semi 6 档）' },
        { name: 'shape', type: "'circle' | 'square'", default: "'circle'", desc: '头像形状；circle → border-radius:50%' },
        { name: 'class', type: 'string', default: 'undefined', desc: '类名' },
        { name: 'style', type: 'string', default: 'undefined', desc: '内联样式（自定义尺寸经此透传，对齐 Semi）' },
      ],
    },
    {
      name: 'SkeletonImage',
      props: [
        { name: 'class', type: 'string', default: 'undefined', desc: '类名' },
        { name: 'style', type: 'string', default: 'undefined', desc: '内联样式；默认 100%×100%，自定义尺寸经此透传' },
      ],
    },
    {
      name: 'SkeletonTitle',
      props: [
        { name: 'class', type: 'string', default: 'undefined', desc: '类名' },
        { name: 'style', type: 'string', default: 'undefined', desc: '内联样式；默认 width:100% height:24px' },
      ],
    },
    {
      name: 'SkeletonButton',
      props: [
        { name: 'class', type: 'string', default: 'undefined', desc: '类名' },
        { name: 'style', type: 'string', default: 'undefined', desc: '内联样式；默认 width:115px height:32px' },
      ],
    },
    {
      name: 'SkeletonParagraph',
      props: [
        { name: 'rows', type: 'number', default: '4', desc: '段落占位行数；首行 100%、末行 60%、行高 16px、行距 10px' },
        { name: 'class', type: 'string', default: 'undefined', desc: '类名' },
        { name: 'style', type: 'string', default: 'undefined', desc: '内联样式' },
      ],
    },
  ],
  events: [],
  slots: [
    { name: 'placeholder', desc: '加载等待时的占位元素' },
    { name: 'children', desc: 'loading=false 时渲染的真实内容' },
  ],
  a11y: {
    hasRole: false,
    focusable: false,
    note: '镜像 Semi：占位根节点为纯 <div>，无 role/aria；骨架块为纯装饰 div，不进入 Tab 序列；prefers-reduced-motion 由使用方站点样式统一处理。',
  },
  tokens: [
    '--cd-color-skeleton-default-bg-default',
    '--cd-color-skeleton-loading-gradient-bg-active',
    '--cd-width-skeleton-avatar-extra-extra-small',
    '--cd-width-skeleton-avatar-extra-small',
    '--cd-width-skeleton-avatar-small',
    '--cd-width-skeleton-avatar-medium',
    '--cd-width-skeleton-avatar-large',
    '--cd-width-skeleton-avatar-extra-large',
    '--cd-width-skeleton-button',
    '--cd-height-skeleton-li',
    '--cd-height-skeleton-title',
    '--cd-height-skeleton-button',
    '--cd-spacing-skeleton-li-marginbottom',
    '--cd-radius-skeleton-item',
    '--cd-radius-skeleton-li',
    '--cd-animation-duration-skeleton-highlight',
    '--cd-animation-function-skeleton-highlight',
  ],
  responsive: false,
  examples: [
    { title: '基础骨架', code: '<Skeleton loading={loading}>\n  {#snippet placeholder()}\n    <SkeletonAvatar />\n  {/snippet}\n  <Avatar>U</Avatar>\n</Skeleton>' },
    {
      title: 'active 动画',
      code: '<Skeleton active loading={loading}>\n  {#snippet placeholder()}\n    <SkeletonTitle style="width:120px" />\n    <SkeletonParagraph rows={3} />\n  {/snippet}\n  <div>真实内容</div>\n</Skeleton>',
    },
    {
      title: '卡片组合',
      code: '<Skeleton active loading>\n  {#snippet placeholder()}\n    <SkeletonImage style="width:200px; height:150px" />\n    <SkeletonTitle style="width:50%; margin-top:10px" />\n    <SkeletonParagraph rows={2} />\n    <SkeletonButton />\n  {/snippet}\n</Skeleton>',
    },
  ],
} as const;
