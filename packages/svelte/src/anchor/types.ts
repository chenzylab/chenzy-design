/**
 * showTooltip 归一化后的配置：链接文字缩略时以浮层承载完整 title（对齐 Semi）。
 * type 决定用 Tooltip 还是 Popover 承载；opts 透传给对应浮层组件。
 */
export interface AnchorTooltipConfig {
  type: 'tooltip' | 'popover';
  opts?: Record<string, unknown>;
}

/**
 * showTooltip 入参：boolean | { type, opts }（对齐 Semi）。
 * true 等价 { type: 'tooltip' }；false（默认）不装浮层，零开销。
 */
export type AnchorShowTooltip = boolean | AnchorTooltipConfig;

/** railTheme：滑轨主题色（对齐 Semi）。muted 隐藏滑轨条。 */
export type AnchorRailTheme = 'primary' | 'tertiary' | 'muted';

/** size：锚点尺寸（对齐 Semi）。 */
export type AnchorSize = 'small' | 'default';

/**
 * 内部链接描述符：由 <Anchor.Link> 注册进父级收集器，构成嵌套树。
 * 非公开数组 API——对齐 Semi 组合式（children + <Anchor.Link>），无 links 数组 prop。
 */
export interface AnchorLinkNode {
  /** 目标锚点选择器，形如 '#section-1'（对齐 Semi href，同时作为唯一 key）。 */
  href: string;
  /** 链接标题文案。 */
  title: string;
  /** 是否禁用（不响应点击跳转，视觉置灰，排除出 roving tabindex）。 */
  disabled?: boolean;
  /** Link 级自定义类名，透传到链接元素。 */
  className?: string;
  /** Link 级自定义内联样式，透传到链接元素。 */
  style?: string;
  /** 子链接，形成多级嵌套树。 */
  children: AnchorLinkNode[];
}
