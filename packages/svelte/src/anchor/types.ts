/** Anchor 链接项；href 形如 '#section-1'，key 唯一标识。 */
export interface AnchorLink {
  key: string;
  href: string;
  title: string;
  /** 子链接，形成多级嵌套树；缺省即平铺链接（向后兼容）。 */
  children?: AnchorLink[];
  /** 禁用：不响应点击跳转，视觉置灰，排除出 roving tabindex（对齐 Semi Link disabled）。 */
  disabled?: boolean;
  /** Link 级自定义类名，透传到 <a>。 */
  className?: string;
  /** Link 级自定义内联样式，透传到 <a>。 */
  style?: string;
}

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
