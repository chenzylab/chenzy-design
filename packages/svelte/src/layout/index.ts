import LayoutRoot from './Layout.svelte';
import Header from './Header.svelte';
import Footer from './Footer.svelte';
import Content from './Content.svelte';
import Sider from './Sider.svelte';

/** Named exports (also usable directly). */
export {
  Header as LayoutHeader,
  Footer as LayoutFooter,
  Content as LayoutContent,
  Sider as LayoutSider,
};

/**
 * Aggregated namespace export: enables <Layout.Header /> etc.
 * Explicit type annotation avoids leaking component Props type errors.
 */
export const Layout: typeof LayoutRoot & {
  Header: typeof Header;
  Footer: typeof Footer;
  Content: typeof Content;
  Sider: typeof Sider;
} = Object.assign(LayoutRoot, { Header, Footer, Content, Sider });

export { meta as layoutMeta } from './meta.js';
