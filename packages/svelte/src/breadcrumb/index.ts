import BreadcrumbRoot from './Breadcrumb.svelte';
import Item from './Item.svelte';

/** Named exports (also usable directly). */
export { default as BreadcrumbItem } from './Item.svelte';

/**
 * Aggregated namespace export: enables <Breadcrumb.Item />.
 * Explicit type annotation avoids leaking component Props type errors.
 */
export const Breadcrumb: typeof BreadcrumbRoot & {
  Item: typeof Item;
} = Object.assign(BreadcrumbRoot, { Item });

export { meta as breadcrumbMeta } from './meta.js';
export type { BreadcrumbRoute } from './types.js';
export {
  getBreadcrumbContext,
  setBreadcrumbContext,
  type BreadcrumbContext,
} from './context.js';
