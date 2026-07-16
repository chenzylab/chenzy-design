import type { Snippet } from 'svelte';

/** Nav 项键类型（对齐 Semi itemKey）。 */
export type NavKey = string | number;

/** Nav 模式：垂直（侧边）或水平（顶部）。对齐 Semi mode。 */
export type NavMode = 'vertical' | 'horizontal';

/** 透传给内部 Dropdown 的属性集（对齐 Semi dropdownProps / subDropdownProps，DropdownProps 子集）。 */
export type NavDropdownProps = Record<string, unknown>;

/**
 * Nav 导航项（字段对齐 Semi：itemKey / text / icon / items）。
 * 含 items 即为可展开子导航。Nav 由 NavItemRender 递归渲染。
 */
export interface NavItemDef {
  /** 导航项唯一标识（对齐 Semi itemKey）。 */
  itemKey: NavKey;
  /** 导航项文案（对齐 Semi text，可为字符串或 Snippet）。 */
  text: string | Snippet;
  /** 项前置图标。 */
  icon?: Snippet;
  /** 是否禁用（对齐 Semi，默认 false）。 */
  disabled?: boolean;
  /** 链接地址；传入时叶子项渲染为原生 `<a href>`（站点导航语义）。 */
  link?: string;
  /** 透传给 `<a>` 的属性（对齐 Semi linkOptions，如 target/rel/download）。 */
  linkOptions?: Record<string, string>;
  /** 嵌套层级（0=一级，对齐 Semi level）；由渲染层递归下传，声明式一般无需手写。 */
  level?: number;
  /** 是否保留左侧 Icon 占位（对齐 Semi indent）。 */
  indent?: boolean;
  /** 项级点击回调（叶子项，富载荷对齐 Semi）。 */
  onClick?: (data: NavClickData) => void;
  /** 项级鼠标移入回调。 */
  onMouseEnter?: (e: MouseEvent) => void;
  /** 项级鼠标移出回调。 */
  onMouseLeave?: (e: MouseEvent) => void;
  /** 子导航项；含 items 即为可展开子导航。string 项取值作 text 与 itemKey（对齐 Semi）。 */
  items?: NavItemInput[];
  /** 子导航最大高度（用于内联展开动画，对齐 Semi maxHeight，默认 999）。 */
  maxHeight?: number;
  /** 子导航是否展开（对齐 Semi Sub.isOpen，非受控展开配合）。 */
  isOpen?: boolean;
  /** 透传给该子导航浮层 Dropdown 的属性（对齐 Semi Sub dropdownProps）。 */
  dropdownProps?: NavDropdownProps;
  /** 透传给该子导航浮层 Dropdown 的内联样式（对齐 Semi Sub dropdownStyle）。 */
  dropdownStyle?: string;
}

/**
 * items 入参项：对象或字符串（对齐 Semi `items` 支持 string[]，取每项作 text 与 itemKey）。
 * 传入 Nav 后经 normalizeNavItems 归一为 NavItemDef。
 */
export type NavItemInput = string | NavItemDef;

/** onSelect 富载荷（对齐 Semi Navigation onSelect）。 */
export interface NavSelectData {
  /** 触发选中的项 key。 */
  itemKey: NavKey;
  /** 选中后的全部选中 key。 */
  selectedKeys: NavKey[];
  /** 选中后的全部选中项（Nav 形）。 */
  selectedItems: NavItemDef[];
  /** 原生事件。 */
  domEvent?: Event;
  /** 叶子恒 false。 */
  isOpen: boolean;
}

/** onClick 富载荷（对齐 Semi Navigation onClick）。 */
export interface NavClickData {
  itemKey: NavKey;
  domEvent?: Event;
  isOpen: boolean;
}

/** onOpenChange 富载荷（对齐 Semi Navigation onOpenChange）。 */
export interface NavOpenChangeData {
  itemKey: NavKey;
  openKeys: NavKey[];
  domEvent?: Event;
  isOpen: boolean;
}

/** Nav.Header 配置对象（对齐 Semi header={{logo,text,link,...}}）。 */
export interface NavHeaderConfig {
  /** Logo 节点（Snippet）。 */
  logo?: Snippet;
  /** Logo 文案（字符串或 Snippet）。 */
  text?: string | Snippet;
  /** 链接地址：传入时头部整体包裹 `<a>`。 */
  link?: string;
  /** 透传给 `<a>` 的属性（对齐 Semi linkOptions）。 */
  linkOptions?: Record<string, string>;
  /** 自定义类名。 */
  class?: string;
  /** 自定义内联样式。 */
  style?: string;
}

/** Nav.Footer 配置对象（对齐 Semi footer={{collapseButton,collapseText,onClick}}）。 */
export interface NavFooterConfig {
  /** 是否展示底部「收起侧边栏」按钮（或自定义节点 Snippet），仅 mode='vertical' 生效。 */
  collapseButton?: boolean | Snippet;
  /** 收起按钮文案（对齐 Semi collapseText，(collapsed)=>string）。 */
  collapseText?: (collapsed: boolean) => string;
  /** 自定义类名。 */
  class?: string;
  /** 自定义内联样式。 */
  style?: string;
  /** 点击事件回调。 */
  onClick?: (e: MouseEvent) => void;
}

/**
 * 归一 items 入参（对齐 Semi）：string 项 → { itemKey, text } 同值；对象项递归归一其 items。
 * Nav 在消费前调用一次，之后内部只处理 NavItemDef 树。
 */
export function normalizeNavItems(input: readonly NavItemInput[] | undefined): NavItemDef[] {
  if (!input) return [];
  return input.map((it) => {
    if (typeof it === 'string') return { itemKey: it, text: it };
    if (it.items && it.items.length) return { ...it, items: normalizeNavItems(it.items) };
    return it as NavItemDef;
  });
}

/** 是否为可展开子导航（含非空 items）。 */
export function hasSubNav(item: NavItemDef): boolean {
  return !!item.items && item.items.length > 0;
}

/** 递归按 key 集合从 Nav 项树收集节点（供回调 selectedItems）。 */
export function collectNavItemsByKeys(
  items: NavItemDef[],
  keys: readonly NavKey[],
): NavItemDef[] {
  const set = new Set(keys);
  const acc: NavItemDef[] = [];
  const walk = (list: NavItemDef[]) => {
    for (const it of list) {
      if (set.has(it.itemKey)) acc.push(it);
      if (it.items?.length) walk(normalizeNavItems(it.items));
    }
  };
  walk(items);
  return acc;
}

/**
 * 收集给定 key 集合中每个 key 的所有祖先 SubNav key（对齐 Semi：选中子项时父级 SubNav 高亮）。
 * 返回去重后的祖先 key 数组（不含自身）。
 */
export function collectAncestorKeys(items: NavItemDef[], keys: readonly NavKey[]): NavKey[] {
  const target = new Set(keys);
  const acc = new Set<NavKey>();
  const walk = (list: NavItemDef[], ancestors: NavKey[]): void => {
    for (const it of list) {
      if (target.has(it.itemKey)) ancestors.forEach((a) => acc.add(a));
      if (it.items?.length) walk(normalizeNavItems(it.items), [...ancestors, it.itemKey]);
    }
  };
  walk(items, []);
  return [...acc];
}
