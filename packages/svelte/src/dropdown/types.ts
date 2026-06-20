/**
 * Dropdown 数据项类型。与 Menu 对齐的判别联合思路（见 menu/types.ts）：
 * 普通项含 children 即为可展开 SubMenu；type='divider' 分隔符；type='group' 分组标题。
 * 向后兼容：普通项可省略 type，旧的 flat items 无需改动。
 */
/** Dropdown 项键类型。 */
export type DropdownKey = string | number;

/** 普通菜单项；含 children 即为可展开的 SubMenu。 */
export interface DropdownItemNode {
  /** 非分隔符/分组时无需 type，默认即普通项；显式可写 'item' */
  type?: 'item';
  key: DropdownKey;
  label: string;
  disabled?: boolean;
  danger?: boolean;
  /** 含子项即为可展开的子菜单（SubMenu），可多层嵌套 */
  children?: DropdownItem[];
}

/**
 * 分隔符项：渲染为一条水平分隔线，不可选不可聚焦（role=separator）。
 * 无需 key/label；为避免 #each 缺 key 警告，渲染时按索引生成兜底 key。
 */
export interface DropdownDividerNode {
  type: 'divider';
  key?: DropdownKey;
}

/**
 * 分组项：渲染为不可点击的组标题 + 其下始终展开的菜单项。
 * 区别于 SubMenu（可展开/收起）——group 是始终展开的分区标题。
 */
export interface DropdownGroupNode {
  type: 'group';
  key?: DropdownKey;
  /** 分组标题文案 */
  label: string;
  children: DropdownItem[];
}

/**
 * Dropdown 数据项。向后兼容：普通项可省略 type；
 * 通过 type='divider' / type='group' 扩展分隔符与分组标题，
 * 普通项的 children 表示可展开子菜单。
 */
export type DropdownItem =
  | DropdownItemNode
  | DropdownDividerNode
  | DropdownGroupNode;

/** 类型守卫：分隔符项。 */
export function isDropdownDivider(item: DropdownItem): item is DropdownDividerNode {
  return (item as DropdownDividerNode).type === 'divider';
}

/** 类型守卫：分组项。 */
export function isDropdownGroup(item: DropdownItem): item is DropdownGroupNode {
  return (item as DropdownGroupNode).type === 'group';
}

/** 普通项是否含可展开子菜单。 */
export function hasDropdownChildren(item: DropdownItemNode): boolean {
  return !!item.children && item.children.length > 0;
}
