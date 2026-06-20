/**
 * createTable — framework-agnostic table algorithms for Table.svelte.
 * Pure functions only: three-state sort cycling, client-side data pipeline
 * (sort → paginate), and row-selection helpers (all/indeterminate with
 * disabled rows). No DOM, no framework deps, no internal mutable state — the
 * render layer (svelte runes) owns sort/page/selection state and calls these.
 * See specs/components/show/Table.spec.md §3.
 */

export type RowKey = string | number;
export type SortOrder = 'ascend' | 'descend' | null;

export interface SortState {
  /** column key currently sorted, or null */
  key: string | null;
  order: SortOrder;
}

/** Cycle a column's sort order: none → ascend → descend → none. */
export function nextSortOrder(current: SortOrder): SortOrder {
  if (current === null) return 'ascend';
  if (current === 'ascend') return 'descend';
  return null;
}

/**
 * Toggle sort for `key` given the current single-column sort state.
 * Returns the next state. Switching to a new column starts at ascend.
 */
export function toggleSort(state: SortState, key: string): SortState {
  if (state.key !== key) return { key, order: 'ascend' };
  const order = nextSortOrder(state.order);
  return order === null ? { key: null, order: null } : { key, order };
}

/**
 * Stable client-side sort. `compare(a, b)` must return the ascend comparison
 * (<0 if a before b). Returns a new array; descend reverses the comparator.
 * Original order is preserved when order is null.
 */
export function applySort<T>(
  data: readonly T[],
  order: SortOrder,
  compare: (a: T, b: T) => number,
): T[] {
  if (order === null) return [...data];
  // decorate-sort-undecorate for stability across engines
  const dir = order === 'ascend' ? 1 : -1;
  return data
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const c = compare(a.item, b.item) * dir;
      return c !== 0 ? c : a.index - b.index;
    })
    .map((d) => d.item);
}

/** Slice `data` to the given 1-based page. */
export function paginate<T>(data: readonly T[], current: number, pageSize: number): T[] {
  if (pageSize <= 0) return [...data];
  const start = (current - 1) * pageSize;
  return data.slice(start, start + pageSize);
}

/** Total page count for `total` rows at `pageSize`. */
export function pageCount(total: number, pageSize: number): number {
  if (pageSize <= 0) return 1;
  return Math.max(1, Math.ceil(total / pageSize));
}

export interface SelectAllState {
  /** every selectable row is selected */
  checked: boolean;
  /** some but not all selectable rows are selected */
  indeterminate: boolean;
}

/**
 * Compute the header select-all checkbox state from the current selection.
 * `disabledKeys` rows are excluded from the "all" computation.
 */
export function selectAllState(
  allKeys: readonly RowKey[],
  selectedKeys: ReadonlySet<RowKey>,
  disabledKeys: ReadonlySet<RowKey> = new Set(),
): SelectAllState {
  const selectable = allKeys.filter((k) => !disabledKeys.has(k));
  if (selectable.length === 0) return { checked: false, indeterminate: false };
  const selectedCount = selectable.filter((k) => selectedKeys.has(k)).length;
  return {
    checked: selectedCount === selectable.length,
    indeterminate: selectedCount > 0 && selectedCount < selectable.length,
  };
}

/**
 * Toggle the select-all checkbox: when not all selectable rows are selected,
 * select them all; otherwise clear them. Selection of disabled rows is
 * preserved (they are never auto-changed).
 */
export function toggleSelectAll(
  allKeys: readonly RowKey[],
  selectedKeys: ReadonlySet<RowKey>,
  disabledKeys: ReadonlySet<RowKey> = new Set(),
): Set<RowKey> {
  const { checked } = selectAllState(allKeys, selectedKeys, disabledKeys);
  const next = new Set(selectedKeys);
  if (checked) {
    for (const k of allKeys) if (!disabledKeys.has(k)) next.delete(k);
  } else {
    for (const k of allKeys) if (!disabledKeys.has(k)) next.add(k);
  }
  return next;
}

/** Toggle a single row's selection. */
export function toggleRow(
  selectedKeys: ReadonlySet<RowKey>,
  key: RowKey,
): Set<RowKey> {
  const next = new Set(selectedKeys);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  return next;
}

// --- Tree data (嵌套行) ---------------------------------------------------

/** A tree row flattened into the visible, ordered list (only expanded subtrees). */
export interface FlatRow<T> {
  /** the original data record */
  record: T;
  /** the record's resolved row key */
  key: RowKey;
  /** depth from the top level, starting at 0 */
  level: number;
  /** parent key, or null for top-level rows */
  parentKey: RowKey | null;
  /** has at least one child row */
  hasChildren: boolean;
  /** index of the record among the *top-level* rows (stable for striping/aria) */
  topIndex: number;
}

/**
 * Flatten tree-structured rows into an ordered list of visible rows.
 * A row's children are included only when its key is in `expandedKeys`.
 * Pure: no DOM, no mutable state — the render layer owns expansion state.
 *
 * `getKey` resolves a row's key; `getChildren` returns child rows (or
 * undefined/empty for leaves). `topIndex` is the row's position among the
 * top-level rows it descends from, so callers can keep stable striping/aria.
 */
export function flattenTreeRows<T>(
  rows: readonly T[],
  expandedKeys: ReadonlySet<RowKey>,
  getKey: (record: T) => RowKey,
  getChildren: (record: T) => readonly T[] | undefined,
): FlatRow<T>[] {
  const out: FlatRow<T>[] = [];
  function walk(
    nodes: readonly T[],
    level: number,
    parentKey: RowKey | null,
    topIndex: number,
  ): void {
    nodes.forEach((record, i) => {
      const key = getKey(record);
      const children = getChildren(record);
      const hasChildren = !!children && children.length > 0;
      const ti = level === 0 ? i : topIndex;
      out.push({ record, key, level, parentKey, hasChildren, topIndex: ti });
      if (hasChildren && expandedKeys.has(key)) {
        walk(children as readonly T[], level + 1, key, ti);
      }
    });
  }
  walk(rows, 0, null, 0);
  return out;
}
