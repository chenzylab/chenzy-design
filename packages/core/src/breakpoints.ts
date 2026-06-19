/**
 * breakpoints — framework-agnostic responsive breakpoint resolution.
 * Six-tier scale aligned with Semi Design / Ant Design. Pure functions over a
 * viewport width; no DOM, no matchMedia (the render layer owns the listener).
 * See specs/components/basic/Grid.spec.md (responsive).
 */

/** ordered from smallest to largest; min-width (px) for each tier. */
export const BREAKPOINTS = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1600,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

/** smallest → largest, the降级查找顺序的反向基准 */
export const BREAKPOINT_ORDER: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];

/** the active breakpoint for a viewport width (largest tier whose min-width ≤ width). */
export function resolveActiveBreakpoint(width: number): Breakpoint {
  let active: Breakpoint = 'xs';
  for (const bp of BREAKPOINT_ORDER) {
    if (width >= BREAKPOINTS[bp]) active = bp;
  }
  return active;
}

/**
 * Resolve a per-breakpoint map to the value that applies at `active`, cascading
 * down: if `active` has no value, fall back to the nearest smaller tier that
 * does (mobile-first). Returns `fallback` if none match.
 *
 *   resolveResponsiveValue({ xs: 24, md: 12 }, 'lg') // → 12 (md cascades up to lg)
 *   resolveResponsiveValue({ md: 12 }, 'sm')          // → fallback (no sm/xs)
 */
export function resolveResponsiveValue<T>(
  byBreakpoint: Partial<Record<Breakpoint, T>>,
  active: Breakpoint,
  fallback: T,
): T {
  const activeIndex = BREAKPOINT_ORDER.indexOf(active);
  for (let i = activeIndex; i >= 0; i -= 1) {
    const bp = BREAKPOINT_ORDER[i]!;
    const value = byBreakpoint[bp];
    if (value !== undefined) return value;
  }
  return fallback;
}
