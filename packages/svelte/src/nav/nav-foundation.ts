/**
 * Nav 逻辑层（对齐 semi-foundation/navigation/foundation.ts + NavItem.ts）。
 *
 * 与 Semi 的对应关系：
 * - Semi `NavItem.ts` 的构造器负责把 items 入参（含 string 简写）归一成节点树
 *   → 本库 `normalizeNavItems`（Svelte 侧无需 class 实例，纯函数即可）。
 * - Semi `foundation.ts` 的 `getSelectedKeys/getAncestorKeys` 等选中态推导
 *   → 本库 `collectNavItemsByKeys` / `collectAncestorKeys` / `hasSubNav`。
 *
 * 全部为无框架依赖的纯函数（不含 rune），故用 `.ts` 而非 `.svelte.ts`
 * （见 SOP「有响应式状态用 .svelte.ts（rune），纯函数用 .ts」）。
 * 响应式状态（selectedKeys/openKeys/collapsed 受控与非受控）由 Nav.svelte 用 rune 承担，
 * 对应 Semi foundation 里由 adapter 读写 state 的那部分。
 */
import type { NavItemDef, NavItemInput, NavKey } from './types.js';

/**
 * 归一 items 入参（对齐 Semi NavItem 构造器）：string 项 → { itemKey, text } 同值；
 * 对象项递归归一其 items。Nav 在消费前调用一次，之后内部只处理 NavItemDef 树。
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
export function collectNavItemsByKeys(items: NavItemDef[], keys: readonly NavKey[]): NavItemDef[] {
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
