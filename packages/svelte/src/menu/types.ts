import type { Snippet } from 'svelte';

/** Menu 项键类型。 */
export type MenuKey = string | number;

/** 普通菜单项；含 children 即为可展开的 SubMenu。 */
export interface MenuItemNode {
  /** 非分隔符/分组时无需 type，默认即普通项；显式可写 'item' */
  type?: 'item';
  key: MenuKey;
  label: string;
  disabled?: boolean;
  /** 项前自定义图标 */
  icon?: Snippet;
  children?: MenuItemDef[];
}

/**
 * 分隔符项：渲染为一条水平分隔线，不可选不可聚焦（role=separator）。
 * 无需 key/label；为避免 #each 缺 key 警告，渲染时按索引生成兜底 key。
 */
export interface MenuDividerNode {
  type: 'divider';
  key?: MenuKey;
}

/**
 * 分组项：渲染为不可点击的组标题 + 其下始终展开的菜单项。
 * 区别于 SubMenu（可展开/收起）——group 是始终展开的分区标题。
 */
export interface MenuGroupNode {
  type: 'group';
  key?: MenuKey;
  /** 分组标题文案 */
  label: string;
  children: MenuItemDef[];
}

/**
 * Menu 数据项。向后兼容：普通项可省略 type；
 * 通过 type='divider' / type='group' 扩展分隔符与分组标题。
 */
export type MenuItemDef = MenuItemNode | MenuDividerNode | MenuGroupNode;

/** 类型守卫：分隔符项。 */
export function isDivider(item: MenuItemDef): item is MenuDividerNode {
  return (item as MenuDividerNode).type === 'divider';
}

/** 类型守卫：分组项。 */
export function isGroup(item: MenuItemDef): item is MenuGroupNode {
  return (item as MenuGroupNode).type === 'group';
}
