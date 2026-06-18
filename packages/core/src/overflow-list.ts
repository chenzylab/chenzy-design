/**
 * createOverflowList helpers — framework-agnostic overflow-collapse math.
 * Pure functions only: given measured item widths + container width, compute
 * how many leading items fit before the rest collapse into a "+N" node. No DOM,
 * no framework deps, no internal mutable state — the svelte layer measures DOM
 * (ResizeObserver) and feeds widths in. See specs/components/show/OverflowList.spec.md §3
 * (collapse / end-direction subset; scroll mode & start-direction deferred).
 */

export interface OverflowComputeInput {
  /** measured main-axis size of each item, in document order */
  itemSizes: readonly number[];
  /** available container main-axis size */
  containerSize: number;
  /** main-axis size of the "+N" overflow node (reserved when collapsing) */
  overflowSize: number;
  /** gap between adjacent items */
  gap: number;
  /** items that must never be collapsed (indexes) */
  alwaysVisible?: readonly number[];
  /** never collapse below this many visible items (prefer overflow instead) */
  minVisibleItems?: number;
}

export interface OverflowComputeResult {
  /** number of leading items rendered visibly */
  visibleCount: number;
  /** number of items collapsed into the overflow node */
  overflowCount: number;
}

/** sum of `n` item sizes plus the gaps between them */
function rowWidth(sizes: readonly number[], n: number, gap: number): number {
  if (n <= 0) return 0;
  let total = 0;
  for (let i = 0; i < n; i += 1) total += sizes[i] ?? 0;
  total += gap * (n - 1);
  return total;
}

/**
 * Compute how many leading items fit. If all fit, no overflow node is reserved.
 * Otherwise reserve `overflowSize` (+ a gap) and fit as many leading items as
 * possible. `alwaysVisible` indexes and `minVisibleItems` raise the floor.
 */
export function computeVisibleCount(input: OverflowComputeInput): OverflowComputeResult {
  const {
    itemSizes,
    containerSize,
    overflowSize,
    gap,
    alwaysVisible = [],
    minVisibleItems = 0,
  } = input;
  const count = itemSizes.length;

  if (count === 0) return { visibleCount: 0, overflowCount: 0 };

  // Everything fits → no collapse.
  if (rowWidth(itemSizes, count, gap) <= containerSize) {
    return { visibleCount: count, overflowCount: 0 };
  }

  // Need to collapse: reserve room for the overflow node.
  const reserved = overflowSize + gap;
  let visible = 0;
  for (let n = 1; n <= count; n += 1) {
    if (rowWidth(itemSizes, n, gap) + reserved <= containerSize) {
      visible = n;
    } else {
      break;
    }
  }

  // Honor floors: alwaysVisible highest index + 1, and minVisibleItems.
  const maxAlways = alwaysVisible.length ? Math.max(...alwaysVisible) + 1 : 0;
  const floor = Math.min(count, Math.max(visible, maxAlways, minVisibleItems));
  visible = Math.max(visible, floor);

  // If the floor pushed us to render everything, there's no overflow.
  if (visible >= count) return { visibleCount: count, overflowCount: 0 };

  return { visibleCount: visible, overflowCount: count - visible };
}

/**
 * Apply hysteresis: keep the previous visibleCount unless the new computation
 * differs by enough to cross the threshold band, preventing flicker at the
 * boundary width. Returns the count to actually render.
 */
export function applyHysteresis(
  prev: number,
  next: number,
  prevContainerSize: number,
  containerSize: number,
  threshold: number,
): number {
  // Only damp tiny size wobbles; a real resize (beyond threshold) always applies.
  if (Math.abs(containerSize - prevContainerSize) <= threshold && next !== prev) {
    // within the dead-band: prefer keeping more items visible (avoid collapse churn)
    return Math.max(prev, next);
  }
  return next;
}
