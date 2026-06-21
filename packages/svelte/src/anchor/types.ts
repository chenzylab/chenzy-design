/** Anchor 链接项；href 形如 '#section-1'，key 唯一标识。 */
export interface AnchorLink {
  key: string;
  href: string;
  title: string;
  /** 子链接，形成多级嵌套树；缺省即平铺链接（向后兼容）。 */
  children?: AnchorLink[];
}
