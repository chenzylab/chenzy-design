/**
 * Nav 上下文：折叠联动（Footer）+ 声明式子项收集（Nav.Item/Nav.Sub）。
 */
import { getContext, hasContext } from 'svelte';
import type { NavItemDef } from './types.js';

export interface NavContext {
  /** 当前是否折叠（仅 vertical 有意义）。 */
  readonly collapsed: boolean;
  /** 当前模式。 */
  readonly mode: 'vertical' | 'horizontal';
  /** 切换折叠态。 */
  toggleCollapsed: () => void;
}

export const NAV_CONTEXT_KEY = Symbol('cd-nav');

/** Nav.Footer 内部读取 Nav 上下文（无则 undefined）。 */
export function getNavContext(): NavContext | undefined {
  return hasContext(NAV_CONTEXT_KEY) ? (getContext(NAV_CONTEXT_KEY) as NavContext) : undefined;
}

/**
 * 声明式子项收集上下文（Nav.Item / Nav.Sub）。
 *
 * 安全约束（见记忆 svelte5-child-register-state-array-loop）：
 * - 子项注册写入的 children 是【普通数组】（非 $state），子项 init 同步 push，不在 effect 里写 $state。
 * - 触发 Nav 重建 items 的反应量是单独一个 $state revision，子项在挂载后【异步】bump 一次，
 *   脱离挂载 effect 同步栈，避免读写自循环。
 * - Nav.Sub 向下提供一个新的 collector，其 children 指向自己 descriptor 的 children 数组，
 *   从而把嵌套结构按 DOM 顺序、按层级收进普通数组树。
 */
export interface NavCollector {
  /** 把一个子项描述符按声明顺序 push 进当前层级的普通数组，返回该描述符（供 Sub 取其 children）。 */
  add: (item: NavItemDef) => NavItemDef;
  /** 挂载后异步触发一次 Nav 重建（合并多次为一次）。 */
  bump: () => void;
}

export const NAV_COLLECTOR_KEY = Symbol('cd-nav-collector');

export function getNavCollector(): NavCollector | undefined {
  return hasContext(NAV_COLLECTOR_KEY)
    ? (getContext(NAV_COLLECTOR_KEY) as NavCollector)
    : undefined;
}
