/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 * 严格对齐 Semi Anchor：组合式 API（children + <Anchor.Link>），无 links 数组 prop。
 */
export const meta = {
  name: 'Anchor',
  category: 'navigation',
  description:
    '锚点导航，垂直链接列表。组合式 API：children + <Anchor.Link>（对齐 Semi，无 links 数组 prop）。支持 scroll-spy 激活高亮、点击平滑滚动、滑轨条随激活项定位、自定义滚动容器、多级嵌套、文字缩略 Tooltip、autoCollapse 动态展开。',
  props: [
    {
      name: 'autoCollapse',
      type: 'boolean',
      default: 'false',
      desc: '滚动时动态展示下一级锚点（对齐 Semi）；默认全展开',
    },
    { name: 'class', type: 'string', default: 'undefined', desc: '根类名（对齐 Semi className）' },
    {
      name: 'defaultAnchor',
      type: 'string',
      default: "''",
      desc: '默认高亮锚点 href（对齐 Semi defaultAnchor 1.20.0）',
    },
    {
      name: 'getContainer',
      type: '() => HTMLElement | Window | null',
      default: 'window',
      desc: '指定滚动容器（对齐 Semi）；缺省 window',
    },
    {
      name: 'maxHeight',
      type: 'string | number',
      default: "'750px'",
      desc: '组件 max-height，超出滚动（数字转 px，对齐 Semi）',
    },
    {
      name: 'maxWidth',
      type: 'string | number',
      default: "'200px'",
      desc: '组件 max-width，超出 ellipsis（数字转 px，对齐 Semi）',
    },
    { name: 'offsetTop', type: 'number', default: '0', desc: '滚动偏移触发 Link 切换（对齐 Semi）' },
    {
      name: 'position',
      type: 'Placement',
      default: 'undefined',
      desc: 'Tooltip 显示位置；仅 showTooltip 时生效（对齐 Semi）',
    },
    {
      name: 'railTheme',
      type: "'primary' | 'tertiary' | 'muted'",
      default: "'primary'",
      desc: '滑轨主题色（对齐 Semi）；muted 隐藏滑轨',
    },
    {
      name: 'scrollMotion',
      type: 'boolean',
      default: 'false',
      desc: '是否开启滚动动画（对齐 Semi）；reduced-motion 下强制即时',
    },
    {
      name: 'showTooltip',
      type: "boolean | { type: 'tooltip' | 'popover'; opts?: Record<string, unknown> }",
      default: 'false',
      desc: '文字缩略时显示 Tooltip 及配置（对齐 Semi 2.36.0 object 形式）',
    },
    {
      name: 'size',
      type: "'small' | 'default'",
      default: "'default'",
      desc: '锚点尺寸（对齐 Semi）',
    },
    { name: 'style', type: 'string', default: 'undefined', desc: '根节点自定义内联样式（对齐 Semi）' },
    {
      name: 'targetOffset',
      type: 'number',
      default: '0',
      desc: '锚点滚动时距顶部偏移量（对齐 Semi 1.9.0）',
    },
    {
      name: 'onChange',
      type: '(currentLink: string, previousLink: string) => void',
      default: 'undefined',
      desc: '改变锚点回调（对齐 Semi：href 字符串）',
    },
    {
      name: 'onClick',
      type: '(event: MouseEvent, currentLink: string) => void',
      default: 'undefined',
      desc: '点击锚点回调（对齐 Semi：event + href 字符串）',
    },
    { name: 'aria-label', type: 'string', default: 'undefined', desc: '根 nav aria-label（缺省走 locale）' },
  ],
  subComponents: [
    {
      name: 'Anchor.Link',
      description:
        '锚点链接（对齐 Semi Anchor.Link）。无 children 为叶子，有 children 为分支（嵌套树）。组合式，非数组。',
      props: [
        { name: 'href', type: 'string', default: '—', desc: "跳转链接，形如 '#section-1'（对齐 Semi）" },
        { name: 'title', type: 'string', default: '—', desc: '文字内容（对齐 Semi）' },
        { name: 'disabled', type: 'boolean', default: 'false', desc: '禁用，不响应点击跳转（对齐 Semi 1.20.0）' },
        { name: 'class', type: 'string', default: 'undefined', desc: '类名（对齐 Semi className）' },
        { name: 'style', type: 'string', default: 'undefined', desc: '样式（对齐 Semi）' },
      ],
    },
  ],
  a11y: {
    role: 'navigation',
    keyboard: ['Tab', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Space'],
    notes: [
      'nav[role=navigation][aria-label] 包裹链接列表；链接 role=link，激活链接 aria-current=location',
      '键盘：Tab 进入链接列表（roving，单一 Tab 停靠点）；↑/↓ 移动焦点；Home/End 跳首/末；Space 激活并滚动',
      'disabled 链接 aria-disabled=true 且从 roving 序列移除',
      'scroll-spy 命令式监听 scroll（getContainer 时监听容器），rAF 节流，reduced-motion 下点击即时定位',
      '滑轨条据激活链接标题 offsetTop 绝对定位（对齐 Semi _setActiveSlide）',
      '多级嵌套用嵌套 Anchor.Link 表达层级树；扁平化树参与 scroll-spy，父子链接均可聚焦/跳转/高亮',
    ],
  },
  tokens: [
    // —— 全量对齐 Semi anchor/variables.scss（无中间层） ——
    '--cd-color-anchor-slide-default-bg-default',
    '--cd-color-anchor-slide-primary-bg-active',
    '--cd-color-anchor-slide-tertiary-bg-active',
    '--cd-color-anchor-slide-muted-bg-active',
    '--cd-color-anchor-title-text-default',
    '--cd-color-anchor-title-text-hover',
    '--cd-color-anchor-title-active-text-hover',
    '--cd-color-anchor-title-text-active',
    '--cd-color-anchor-title-text-disabled',
    '--cd-color-anchor-title-bg-default',
    '--cd-color-anchor-title-bg-active',
    '--cd-color-anchor-title-outline-focus',
    '--cd-spacing-anchor-slide-left',
    '--cd-spacing-anchor-slide-top',
    '--cd-spacing-anchor-slide-default-y',
    '--cd-spacing-anchor-slide-small-y',
    '--cd-spacing-anchor-link-title-paddingtop',
    '--cd-spacing-anchor-link-title-paddingbottom',
    '--cd-width-anchor-slide-default',
    '--cd-height-anchor-slide-default',
    '--cd-height-anchor-slide-small',
    '--cd-radius-anchor-slide',
    '--cd-width-anchor-outline',
    '--cd-width-anchor-outlineoffset',
    '--cd-width-anchor-outline-border-radius',
    // —— Animation：标题文字过渡 + 缩放（对齐 Semi anchor/animation.scss） ——
    '--cd-transition-duration-anchor-title-text',
    '--cd-transition-function-anchor-title-text',
    '--cd-transition-delay-anchor-title-text',
    '--cd-transform-scale-anchor-title-text',
    // —— 全局/别名 token（根字号，对齐 Semi @include font-size-*） ——
    '--cd-font-size-regular',
    '--cd-font-size-small',
  ],
} as const;
