/** Menu 项键类型。 */
export type MenuKey = string | number;

/** Menu 数据项；含 children 即为 SubMenu。 */
export interface MenuItemDef {
  key: string | number;
  label: string;
  disabled?: boolean;
  children?: MenuItemDef[];
}
