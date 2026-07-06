/**
 * sidebar — framework-agnostic helpers for the SideBar Container (P0).
 *
 * The Container's drag geometry is fully delegated to `createResizeDrag`
 * (resizable.ts, axis:'x' single-axis + clamp) — this module only carries the
 * small pure helpers the Svelte shell needs: parse a CSS size to px and clamp a
 * candidate width into [minWidth, maxWidth]. Kept pure (no DOM, no framework)
 * so it is unit-testable in isolation. See
 * specs/components/show/SideBar.spec.md §3.
 */

/** Parse a CSS size (`number` = px, or `"NNNpx"` / bare numeric string) to px. */
export function parseSideBarWidth(
  size: string | number | undefined,
): number | undefined {
  if (size == null) return undefined;
  if (typeof size === 'number') return Number.isFinite(size) ? size : undefined;
  const trimmed = size.trim();
  if (trimmed.endsWith('px')) {
    const n = Number(trimmed.slice(0, -2));
    return Number.isFinite(n) ? n : undefined;
  }
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : undefined;
}

/** Clamp a candidate width into `[min, max]` (either bound may be undefined). */
export function clampSideBarWidth(
  width: number,
  min: number | undefined,
  max: number | undefined,
): number {
  let w = width;
  if (min != null) w = Math.max(w, min);
  if (max != null) w = Math.min(w, max);
  return w;
}
