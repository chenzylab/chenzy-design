/**
 * Nav → Nav.Footer 上下文。
 * Nav 通过 setContext 提供折叠态读取与 toggle；Footer 的 collapseButton 据此渲染并联动。
 */
import { getContext, hasContext } from 'svelte';

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
