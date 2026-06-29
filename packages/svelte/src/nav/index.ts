import NavRoot from './Nav.svelte';
import NavHeader from './NavHeader.svelte';
import NavFooter from './NavFooter.svelte';

/** Named exports (also usable directly). */
export { NavHeader, NavFooter };

/**
 * Aggregated namespace export: enables <Nav.Header /> / <Nav.Footer />.
 * Explicit type annotation avoids leaking component Props type errors.
 */
export const Nav: typeof NavRoot & {
  Header: typeof NavHeader;
  Footer: typeof NavFooter;
} = Object.assign(NavRoot, { Header: NavHeader, Footer: NavFooter });

export { meta as navMeta } from './meta.js';
export type { NavItemDef, NavKey, NavMode, NavHeaderConfig, NavFooterConfig } from './types.js';
