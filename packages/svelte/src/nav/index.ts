import NavRoot from './Nav.svelte';
import NavHeader from './NavHeader.svelte';
import NavFooter from './NavFooter.svelte';
import NavItem from './NavItem.svelte';
import NavSub from './NavSub.svelte';

/** Named exports (also usable directly). */
export { NavHeader, NavFooter, NavItem, NavSub };

/**
 * Aggregated namespace export: enables <Nav.Header /> / <Nav.Footer /> / <Nav.Item /> / <Nav.Sub />.
 * Explicit type annotation avoids leaking component Props type errors.
 */
export const Nav: typeof NavRoot & {
  Header: typeof NavHeader;
  Footer: typeof NavFooter;
  Item: typeof NavItem;
  Sub: typeof NavSub;
} = Object.assign(NavRoot, {
  Header: NavHeader,
  Footer: NavFooter,
  Item: NavItem,
  Sub: NavSub,
});

export { meta as navMeta } from './meta.js';
export type { NavItemDef, NavKey, NavMode, NavHeaderConfig, NavFooterConfig } from './types.js';
