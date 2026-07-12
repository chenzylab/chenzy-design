/**
 * createBackTop helpers — framework-agnostic easing + threshold logic for BackTop.
 * Pure functions only (easing curve, visibility threshold, scroll interpolation);
 * the svelte layer owns the scroll listener (rAF) and DOM scroll writes.
 * See specs/components/other/BackTop.spec.md §3.
 */

/** easeInOutCubic — smooth acceleration then deceleration, t in [0,1] → [0,1]. */
export function easeInOutCubic(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * true if the button should be visible given the current scroll position.
 * 对齐 Semi foundation：`scrollTop > visibilityHeight`（严格大于，边界处不显）。
 */
export function isAboveThreshold(scrollTop: number, visibilityHeight: number): boolean {
  return scrollTop > visibilityHeight;
}

/**
 * Interpolate the scroll position at elapsed `elapsed` ms of a `duration` ms
 * animation easing from `from` to 0. Returns the scrollTop to set this frame.
 */
export function scrollPositionAt(from: number, elapsed: number, duration: number): number {
  if (duration <= 0) return 0;
  const t = Math.min(1, elapsed / duration);
  return Math.round(from * (1 - easeInOutCubic(t)));
}
