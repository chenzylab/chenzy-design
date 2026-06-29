import type { Snippet } from 'svelte';
import type { MenuItemDef } from '../menu/types.js';

/** Nav 项键类型（对齐 Semi itemKey）。 */
export type NavKey = string | number;

/** Nav 模式：垂直（侧边）或水平（顶部）。对齐 Semi mode。 */
export type NavMode = 'vertical' | 'horizontal';

/**
 * Nav 导航项（字段对齐 Semi：itemKey / text / icon / items）。
 * 含 items 即为可展开子导航。Nav 内部映射为 Menu 的 MenuItemDef 渲染。
 */
export interface NavItemDef {
  /** 导航项唯一标识（对齐 Semi itemKey）。 */
  itemKey: NavKey;
  /** 导航项文案（对齐 Semi text）。 */
  text: string;
  /** 项前置图标。 */
  icon?: Snippet;
  /** 是否禁用。 */
  disabled?: boolean;
  /** 链接地址；传入时叶子项渲染为原生 `<a href>`（站点导航语义）。 */
  link?: string;
  /** 链接 target（如 '_blank'）。 */
  target?: string;
  /** 链接 rel（如 'noopener noreferrer'）。 */
  rel?: string;
  /** 项级点击回调（叶子项）。 */
  onClick?: (e: MouseEvent) => void;
  /** 项级鼠标移入回调。 */
  onMouseEnter?: (e: MouseEvent) => void;
  /** 项级鼠标移出回调。 */
  onMouseLeave?: (e: MouseEvent) => void;
  /** 子导航项；含 items 即为可展开子导航。 */
  items?: NavItemDef[];
}

/** Nav.Header 配置对象（对齐 Semi header={{logo,text}}）。 */
export interface NavHeaderConfig {
  /** Logo 节点（Snippet）。 */
  logo?: Snippet;
  /** Logo 文案。 */
  text?: string;
}

/** Nav.Footer 配置对象（对齐 Semi footer={{collapseButton}}）。 */
export interface NavFooterConfig {
  /** 是否展示底部「收起侧边栏」按钮，仅 mode='vertical' 生效。 */
  collapseButton?: boolean;
}

/**
 * 把 Nav 项（Semi 字段）递归映射为 Menu 的 MenuItemDef。
 * itemKey→key、text→label、items→children、link→href，icon/target/rel/disabled 直传。
 */
export function navItemsToMenuItems(items: NavItemDef[] = []): MenuItemDef[] {
  return items.map((it) => {
    const node: MenuItemDef = {
      key: it.itemKey,
      label: it.text,
    };
    if (it.icon) node.icon = it.icon;
    if (it.disabled) node.disabled = it.disabled;
    if (it.link) node.href = it.link;
    if (it.target) node.target = it.target;
    if (it.rel) node.rel = it.rel;
    if (it.onClick) node.onClick = it.onClick;
    if (it.onMouseEnter) node.onMouseEnter = it.onMouseEnter;
    if (it.onMouseLeave) node.onMouseLeave = it.onMouseLeave;
    if (it.items && it.items.length) node.children = navItemsToMenuItems(it.items);
    return node;
  });
}
