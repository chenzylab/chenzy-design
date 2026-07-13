/**
 * Overflow-collapse math — framework-agnostic pure functions.
 * Given measured item/tab widths + container width, compute how many leading
 * items fit before the rest collapse into a "+N" (OverflowList) or "more"
 * dropdown (Tabs) node. No DOM, no framework deps, no internal mutable state.
 *
 * NOTE: The Svelte OverflowList strictly mirrors Semi and measures/collapses
 * inline (per-item ResizeObserver accumulation), so it no longer consumes these
 * helpers. `computeVisibleCount` is retained only as the shared leading-fit core
 * for `computeTabOverflow` (Tabs dropdown-overflow).
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
 * Tabs dropdown-overflow partition input. Given measured tab sizes + the bar's
 * available main-axis size, decide which leading tabs render inline and which
 * collapse into a "more" trigger. Pure math: the svelte layer measures DOM
 * (ResizeObserver) and feeds sizes in. The active tab is always kept visible
 * (Semi behavior) — if it would collapse, it is pulled into the visible set so
 * the selected panel's tab is never hidden behind the dropdown.
 */
export interface TabOverflowInput {
  /** measured main-axis size of each tab, in document order */
  tabSizes: readonly number[];
  /** available main-axis size of the tab bar (minus reserved chrome) */
  containerSize: number;
  /** main-axis size of the "more" trigger (reserved when collapsing) */
  moreSize: number;
  /** gap between adjacent tabs */
  gap: number;
  /** index of the active tab; always kept in the visible set when valid */
  activeIndex?: number;
}

export interface TabOverflowResult {
  /** tab indexes rendered inline, in document order */
  visibleIndexes: number[];
  /** tab indexes collapsed into the "more" dropdown, in document order */
  overflowIndexes: number[];
}

/**
 * Partition tabs into visible (inline) and overflow (collapsed into "more").
 * Reuses {@link computeVisibleCount} for the leading-fit math, then guarantees
 * the active tab is visible by swapping it into the last visible slot if it
 * landed in the overflow set.
 */
export function computeTabOverflow(input: TabOverflowInput): TabOverflowResult {
  const { tabSizes, containerSize, moreSize, gap, activeIndex } = input;
  const count = tabSizes.length;
  if (count === 0) return { visibleIndexes: [], overflowIndexes: [] };

  const { visibleCount } = computeVisibleCount({
    itemSizes: tabSizes,
    containerSize,
    overflowSize: moreSize,
    gap,
  });

  // Leading tabs are visible by default.
  const visible = new Set<number>();
  for (let i = 0; i < visibleCount; i += 1) visible.add(i);

  // Guarantee the active tab is visible: if it overflowed, swap it for the last
  // leading visible tab (which is then pushed into overflow). Keeps the visible
  // count stable so the "more" reservation still holds.
  if (
    activeIndex !== undefined &&
    activeIndex >= 0 &&
    activeIndex < count &&
    !visible.has(activeIndex) &&
    visibleCount > 0
  ) {
    visible.delete(visibleCount - 1);
    visible.add(activeIndex);
  }

  const visibleIndexes: number[] = [];
  const overflowIndexes: number[] = [];
  for (let i = 0; i < count; i += 1) {
    if (visible.has(i)) visibleIndexes.push(i);
    else overflowIndexes.push(i);
  }
  return { visibleIndexes, overflowIndexes };
}
