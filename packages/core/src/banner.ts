/**
 * createBanner helpers — framework-agnostic role/aria-live resolution for Banner.
 * Pure functions only; the render layer (svelte runes) owns the open state.
 * See specs/components/feedback/Banner.spec.md §3.
 */

export type BannerType = 'info' | 'success' | 'warning' | 'danger';

export interface BannerRoleProps {
  /** alert for urgent (danger/warning), status for info/success, region for static */
  role: 'alert' | 'status' | 'region';
  'aria-live'?: 'assertive' | 'polite';
}

/**
 * Resolve the root role + aria-live for a banner.
 * - Static (non-dynamically-inserted) banners use role=region to avoid noisy
 *   announcements on first paint.
 * - Dynamic danger/warning announce assertively; info/success politely.
 */
export function resolveBannerRole(type: BannerType, dynamic = false): BannerRoleProps {
  if (!dynamic) return { role: 'region' };
  if (type === 'danger' || type === 'warning') {
    return { role: 'alert', 'aria-live': 'assertive' };
  }
  return { role: 'status', 'aria-live': 'polite' };
}
