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
  /**
   * 链接地址。仅 navigation 用途生效：叶子项渲染为原生 `<a href>` 走站点导航语义；
   * menu 用途（默认命令式菜单）忽略此字段，叶子仍为 button + onClick。
   */
  href?: string;
  /** 链接 target（如 '_blank'）；仅 navigation + href 渲染 `<a>` 时透传。 */
  target?: string;
  /** 链接 rel（如 'noopener noreferrer'）；仅 navigation + href 渲染 `<a>` 时透传。 */
  rel?: string;
  /** 项级点击回调（叶子项；在 Menu onSelect 之外额外触发）。 */
  onClick?: (e: MouseEvent) => void;
  /** 项级鼠标移入回调。 */
  onMouseEnter?: (e: MouseEvent) => void;
  /** 项级鼠标移出回调。 */
  onMouseLeave?: (e: MouseEvent) => void;
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

/**
 * Menu 用途（语义区分）：
 * - 'menu'（默认）：命令式菜单，执行操作。容器 role=menu/menubar，
 *   叶子 role=menuitem（多选 menuitemcheckbox），button + onClick，roving 键盘。
 * - 'navigation'：站点导航。容器为 nav landmark（无 menu role），
 *   含 href 的叶子渲染原生 `<a href>`，沿用浏览器原生链接 + Tab 键序，不用 menuitem role。
 */
export type MenuPurpose = 'menu' | 'navigation';

/** 容器 ARIA 角色集合，由 purpose + mode 纯函数派生（红线 #2）。 */
export interface MenuSemantics {
  /** 是否为 navigation 用途（原生链接语义）。 */
  navigation: boolean;
  /** 最外层 ul 的 role；navigation 下为 undefined（用原生 list 语义 + nav landmark 包裹）。 */
  listRole: 'menu' | 'menubar' | undefined;
  /** 叶子项控件 role；navigation 下为 undefined（原生 a/button 语义）。 */
  leafRole: 'menuitem' | 'menuitemcheckbox' | undefined;
  /** SubMenu 标题控件 role；navigation 下为 undefined。 */
  submenuTitleRole: 'menuitem' | undefined;
  /** 内嵌/浮层子列表 role；navigation 下为 undefined。 */
  subListRole: 'menu' | undefined;
  /** 分组/分隔等结构 li 的 role（none）；navigation 下为 undefined（原生 li）。 */
  structuralRole: 'none' | undefined;
  /** group 子列表 role；navigation 下为 undefined。 */
  groupListRole: 'group' | undefined;
}

/**
 * 纯函数：据 purpose + mode + multiple 派生容器/项的 ARIA 角色。
 * 无副作用、不读 DOM/registry（红线 #2）。
 */
export function deriveMenuSemantics(
  purpose: MenuPurpose,
  mode: 'vertical' | 'inline' | 'horizontal',
  multiple: boolean,
): MenuSemantics {
  if (purpose === 'navigation') {
    return {
      navigation: true,
      listRole: undefined,
      leafRole: undefined,
      submenuTitleRole: undefined,
      subListRole: undefined,
      structuralRole: undefined,
      groupListRole: undefined,
    };
  }
  return {
    navigation: false,
    listRole: mode === 'horizontal' ? 'menubar' : 'menu',
    leafRole: multiple ? 'menuitemcheckbox' : 'menuitem',
    submenuTitleRole: 'menuitem',
    subListRole: 'menu',
    structuralRole: 'none',
    groupListRole: 'group',
  };
}
