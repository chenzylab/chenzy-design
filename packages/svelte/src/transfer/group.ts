import type { TransferGroup, TransferItem, TransferRenderGroup } from './types.js';

/**
 * Normalize either a flat `TransferItem[]` or a grouped `TransferGroup[]` into a
 * single flat list of items. Grouped input stamps `item.group` from the group
 * title (the group title wins over any pre-set `group` on the item). Flat input
 * is returned as-is so backward-compatible (ungrouped) behavior is untouched.
 */
export function normalizeData(
  dataSource: TransferItem[] | TransferGroup[],
): TransferItem[] {
  if (isGrouped(dataSource)) {
    const out: TransferItem[] = [];
    for (const grp of dataSource) {
      for (const item of grp.items) out.push({ ...item, group: grp.title });
    }
    return out;
  }
  return dataSource;
}

/** A grouped data source is an array whose entries have `items` (not `key`). */
export function isGrouped(
  dataSource: TransferItem[] | TransferGroup[],
): dataSource is TransferGroup[] {
  return (
    dataSource.length > 0 &&
    Array.isArray((dataSource[0] as TransferGroup).items) &&
    (dataSource[0] as TransferItem).key === undefined
  );
}

/**
 * Build render groups from a list of (already-filtered) items, preserving the
 * first-seen order of group names. Items without a `group` fall into a single
 * ungrouped bucket keyed by `fallbackTitle`. Empty groups are naturally absent
 * because the input is the post-filter item list.
 */
export function buildGroups(
  items: TransferItem[],
  fallbackTitle: string,
): TransferRenderGroup[] {
  const order: string[] = [];
  const map = new Map<string, TransferItem[]>();
  for (const item of items) {
    const title = item.group ?? fallbackTitle;
    let bucket = map.get(title);
    if (!bucket) {
      bucket = [];
      map.set(title, bucket);
      order.push(title);
    }
    bucket.push(item);
  }
  return order.map((title) => ({ title, items: map.get(title)! }));
}

/** True when any normalized item carries a `group` tag. */
export function hasGroups(items: TransferItem[]): boolean {
  return items.some((i) => i.group !== undefined);
}
