/**
 * createOverflowList helpers — framework-agnostic overflow-collapse math.
 * Pure functions only: given measured item widths + container width, compute
 * how many leading items fit before the rest collapse into a "+N" node. No DOM,
 * no framework deps, no internal mutable state — the svelte layer measures DOM
 * (ResizeObserver) and feeds widths in. See specs/components/show/OverflowList.spec.md §3.
 * The fit math is axis-agnostic — horizontal/vertical only changes which DOM
 * dimension the svelte layer measures — and `computeOverflowPartition` adds
 * `collapseFrom: 'start' | 'end'` for head- vs tail-collapse.
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

/** which end the overflow node collapses from: trailing (`end`) or leading (`start`) */
export type CollapseFrom = 'end' | 'start';

export interface OverflowPartitionInput extends OverflowComputeInput {
  /** collapse trailing items (`end`, default) or leading items (`start`) */
  collapseFrom?: CollapseFrom;
}

export interface OverflowPartitionResult extends OverflowComputeResult {
  /** indexes rendered visibly, in document order */
  visibleIndexes: number[];
  /** indexes collapsed into the overflow node, in document order */
  overflowIndexes: number[];
}

/**
 * Partition items into visible + overflow honoring `collapseFrom`. The fit math
 * is direction-agnostic (the svelte layer feeds the main-axis sizes regardless
 * of horizontal/vertical), so the same {@link computeVisibleCount} drives both
 * ends — for `start` we mirror the size array, fit the same number of items, and
 * map the kept window back to the trailing positions.
 *
 * `end`  → visible = leading [0..k), overflow = trailing [k..count)
 * `start`→ visible = trailing [count-k..count), overflow = leading [0..count-k)
 *
 * `alwaysVisible` indexes and `minVisibleItems` raise the visible-count floor in
 * both directions (mirrored for `start`).
 */
export function computeOverflowPartition(
  input: OverflowPartitionInput,
): OverflowPartitionResult {
  const { itemSizes, collapseFrom = 'end', alwaysVisible = [] } = input;
  const count = itemSizes.length;

  if (collapseFrom === 'end') {
    const { visibleCount, overflowCount } = computeVisibleCount(input);
    const visibleIndexes: number[] = [];
    const overflowIndexes: number[] = [];
    for (let i = 0; i < count; i += 1) {
      if (i < visibleCount) visibleIndexes.push(i);
      else overflowIndexes.push(i);
    }
    return { visibleCount, overflowCount, visibleIndexes, overflowIndexes };
  }

  // start: mirror so the same leading-fit math keeps the *trailing* window.
  const mirroredSizes = [...itemSizes].reverse();
  // mirror alwaysVisible indexes too (i → count-1-i).
  const mirroredAlways = alwaysVisible.map((i) => count - 1 - i);
  const { visibleCount } = computeVisibleCount({
    ...input,
    itemSizes: mirroredSizes,
    alwaysVisible: mirroredAlways,
  });
  const overflowCount = count - visibleCount;
  const firstVisible = overflowCount; // [overflowCount .. count) stay visible
  const visibleIndexes: number[] = [];
  const overflowIndexes: number[] = [];
  for (let i = 0; i < count; i += 1) {
    if (i < firstVisible) overflowIndexes.push(i);
    else visibleIndexes.push(i);
  }
  return { visibleCount, overflowCount, visibleIndexes, overflowIndexes };
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
