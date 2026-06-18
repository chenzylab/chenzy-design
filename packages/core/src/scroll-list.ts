/**
 * createScrollList helpers — framework-agnostic single-column picker math.
 * Pure functions only: scroll offset ↔ selected index mapping, disabled-item
 * skipping, and keyboard target resolution. No DOM, no framework deps, no
 * internal mutable state — the render layer (svelte) owns scroll state and the
 * actual CSS scroll-snap. See specs/components/show/ScrollList.spec.md §3
 * (single-column subset; momentum/cyclic/multi-column deferred).
 */

export type ScrollListValue = string | number;

export interface ScrollListItem {
  value: ScrollListValue;
  label: string;
  disabled?: boolean;
}

/** Map a scrollTop offset to the centered item index (clamped to range). */
export function offsetToIndex(scrollTop: number, itemHeight: number, count: number): number {
  if (itemHeight <= 0 || count <= 0) return 0;
  const raw = Math.round(scrollTop / itemHeight);
  return Math.max(0, Math.min(count - 1, raw));
}

/** The scrollTop that centers a given index. */
export function indexToOffset(index: number, itemHeight: number): number {
  return index * itemHeight;
}

/** Index of an item by value, or -1. */
export function indexOfValue(
  items: readonly ScrollListItem[],
  value: ScrollListValue | undefined,
): number {
  if (value === undefined) return -1;
  return items.findIndex((it) => it.value === value);
}

/**
 * Resolve the nearest enabled index at or after `from` in `dir` (+1/-1).
 * If none exists in that direction, returns the original `from` unchanged.
 */
export function nextEnabledIndex(
  items: readonly ScrollListItem[],
  from: number,
  dir: 1 | -1,
): number {
  let i = from + dir;
  while (i >= 0 && i < items.length) {
    if (!items[i]?.disabled) return i;
    i += dir;
  }
  return from;
}

/** First enabled index (for Home / value resolution), or -1 if all disabled. */
export function firstEnabledIndex(items: readonly ScrollListItem[]): number {
  for (let i = 0; i < items.length; i += 1) {
    if (!items[i]?.disabled) return i;
  }
  return -1;
}

/** Last enabled index (for End), or -1 if all disabled. */
export function lastEnabledIndex(items: readonly ScrollListItem[]): number {
  for (let i = items.length - 1; i >= 0; i -= 1) {
    if (!items[i]?.disabled) return i;
  }
  return -1;
}

export type ScrollListKey =
  | 'ArrowUp'
  | 'ArrowDown'
  | 'PageUp'
  | 'PageDown'
  | 'Home'
  | 'End';

/**
 * Resolve the target index for a keyboard action from the current index.
 * Returns the current index when the action can't move (boundary / all
 * neighbors disabled). `page` is how many rows PageUp/PageDown move.
 */
export function keyboardTarget(
  items: readonly ScrollListItem[],
  current: number,
  key: ScrollListKey,
  page = 3,
): number {
  switch (key) {
    case 'ArrowUp':
      return nextEnabledIndex(items, current, -1);
    case 'ArrowDown':
      return nextEnabledIndex(items, current, 1);
    case 'Home': {
      const f = firstEnabledIndex(items);
      return f === -1 ? current : f;
    }
    case 'End': {
      const l = lastEnabledIndex(items);
      return l === -1 ? current : l;
    }
    case 'PageUp': {
      let target = current;
      for (let n = 0; n < page; n += 1) {
        const nxt = nextEnabledIndex(items, target, -1);
        if (nxt === target) break;
        target = nxt;
      }
      return target;
    }
    case 'PageDown': {
      let target = current;
      for (let n = 0; n < page; n += 1) {
        const nxt = nextEnabledIndex(items, target, 1);
        if (nxt === target) break;
        target = nxt;
      }
      return target;
    }
    default:
      return current;
  }
}
