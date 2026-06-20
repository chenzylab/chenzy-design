/**
 * createVirtualRange helpers — framework-agnostic virtual-scroll math.
 * Pure functions only: visible-range computation for both fixed and dynamic
 * (variable) item heights. No DOM, no framework deps, no internal mutable
 * state — the render layer (svelte) owns scroll state and the actual height
 * measurement (ResizeObserver). See specs/components/show/VirtualList.spec.md.
 */

export interface VirtualRange {
  /** First index to render (already includes overscan, clamped to [0, count]). */
  startIndex: number;
  /** Exclusive end index to render (includes overscan, clamped to [0, count]). */
  endIndex: number;
}

/** Clamp helper. */
function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

/**
 * Fixed-height visible range. O(1).
 * @param scrollTop  current viewport scrollTop
 * @param viewportH  viewport client height
 * @param itemSize   fixed row height (px)
 * @param count      total item count
 * @param overscan   buffer rows above/below
 */
export function fixedRange(
  scrollTop: number,
  viewportH: number,
  itemSize: number,
  count: number,
  overscan: number,
): VirtualRange {
  if (itemSize <= 0 || count <= 0) return { startIndex: 0, endIndex: 0 };
  const startIndex = clamp(Math.floor(scrollTop / itemSize) - overscan, 0, count);
  const endIndex = clamp(
    Math.ceil((scrollTop + viewportH) / itemSize) + overscan,
    0,
    count,
  );
  return { startIndex, endIndex };
}

/**
 * Build a prefix-sum offset table from per-item heights.
 * Returns an array of length `heights.length + 1`, where `offsets[i]` is the
 * top of item `i` and `offsets[length]` is the total content height.
 *
 * `heights[i]` should be the measured height when known, otherwise the
 * estimated height — the render layer merges measured/estimated before calling.
 */
export function buildOffsets(heights: readonly number[]): number[] {
  const offsets = new Array<number>(heights.length + 1);
  let acc = 0;
  offsets[0] = 0;
  for (let i = 0; i < heights.length; i += 1) {
    acc += Math.max(0, heights[i] ?? 0);
    offsets[i + 1] = acc;
  }
  return offsets;
}

/** Total content height from an offsets table (last entry), 0 if empty. */
export function totalFromOffsets(offsets: readonly number[]): number {
  return offsets.length > 0 ? offsets[offsets.length - 1]! : 0;
}

/**
 * Find the first index whose item *bottom* is strictly greater than `top`
 * (i.e. the first item at least partially visible at scroll offset `top`),
 * via binary search over a prefix-sum offsets table.
 * Clamped to [0, count - 1]. Returns 0 when empty.
 */
export function offsetToIndex(offsets: readonly number[], top: number): number {
  const count = offsets.length - 1;
  if (count <= 0) return 0;
  const target = Math.max(0, top);
  let lo = 0;
  let hi = count - 1;
  let ans = count - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    // offsets[mid + 1] is the bottom of item `mid`.
    if (offsets[mid + 1]! > target) {
      ans = mid;
      hi = mid - 1;
    } else {
      lo = mid + 1;
    }
  }
  return ans;
}

/**
 * Dynamic (variable height) visible range using a prefix-sum offsets table.
 * @param offsets    prefix-sum table from buildOffsets (length = count + 1)
 * @param scrollTop  current viewport scrollTop
 * @param viewportH  viewport client height
 * @param overscan   buffer rows above/below
 */
export function dynamicRange(
  offsets: readonly number[],
  scrollTop: number,
  viewportH: number,
  overscan: number,
): VirtualRange {
  const count = offsets.length - 1;
  if (count <= 0) return { startIndex: 0, endIndex: 0 };
  const first = offsetToIndex(offsets, scrollTop);
  // last index at least partially visible at the bottom edge.
  const last = offsetToIndex(offsets, scrollTop + viewportH);
  const startIndex = clamp(first - overscan, 0, count);
  const endIndex = clamp(last + 1 + overscan, 0, count);
  return { startIndex, endIndex };
}
