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
  // TODO（依赖 Tooltip 集成，暂不实现）：
  //   showTooltip?: boolean;  — 是否以 Tooltip 展示链接标题
  //   position?: TooltipPosition;  — Tooltip 弹出位置
}
