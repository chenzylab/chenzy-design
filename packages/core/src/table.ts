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
      // 容错缺 key，对齐 Semi 的可观察行为（某行 rowKey 取值为空时仍完整渲染整棵子树）。
      // Semi(React) 的 flattenData 直接用 getRecordKey 返回的 undefined 做 key，靠 React
      // 容忍 undefined/重复 key（仅 warning 不中断）。本库(Svelte) keyed `#each (row.key)`
      // 不容忍 undefined/重复 key（丢节点），故在此用「父 key + 位置」生成稳定 fallback key
      // 保证唯一且同次渲染稳定——框架差异导致的必要实现差异，容错效果与 Semi 一致。
      const resolved = getKey(record);
      const key: RowKey =
        resolved === undefined || resolved === null
          ? `__cd_treekey__${parentKey ?? 'root'}:${i}`
          : resolved;
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

// --- Tree row selection conduction (父子联动) ----------------------------
// Mirrors tree.ts conduct/toggleCheck, but operates on Table rows via
// getKey/getChildren rather than the {key,label,children} TreeNodeData shape,
// so callers needn't reshape rows. Disabled rows are excluded from auto-check.

interface RowMeta {
  /** leaf descendant keys per node (the checkable units) */
  leaves: Map<RowKey, RowKey[]>;
  /** all node keys in document order */
  allKeys: RowKey[];
}

function buildRowMeta<T>(
  rows: readonly T[],
  getKey: (record: T) => RowKey,
  getChildren: (record: T) => readonly T[] | undefined,
  disabled: ReadonlySet<RowKey>,
): RowMeta {
  const leaves = new Map<RowKey, RowKey[]>();
  const allKeys: RowKey[] = [];

  function walk(record: T): RowKey[] {
    const key = getKey(record);
    allKeys.push(key);
    const kids = getChildren(record);
    if (!kids || kids.length === 0) {
      // a leaf contributes itself only when enabled
      const own = disabled.has(key) ? [] : [key];
      leaves.set(key, own);
      return own;
    }
    const collected: RowKey[] = [];
    for (const child of kids) collected.push(...walk(child));
    leaves.set(key, collected);
    return collected;
  }

  for (const root of rows) walk(root);
  return { leaves, allKeys };
}

/** Collect keys of every row that is disabled (own flag, not inherited). */
function collectDisabled<T>(
  rows: readonly T[],
  getKey: (record: T) => RowKey,
  getChildren: (record: T) => readonly T[] | undefined,
  isDisabled: (record: T) => boolean,
): Set<RowKey> {
  const out = new Set<RowKey>();
  function walk(record: T): void {
    if (isDisabled(record)) out.add(getKey(record));
    const kids = getChildren(record);
    if (kids) for (const c of kids) walk(c);
  }
  for (const r of rows) walk(r);
  return out;
}

/**
 * Conduction (related mode) for tree-structured table rows: given a base set of
 * checked keys, derive the full checked set + half-checked (indeterminate) set
 * with bottom-up + top-down parent/child propagation. A checked parent checks
 * all enabled leaf descendants; a parent with some-but-not-all checked leaves is
 * half. Disabled leaves are excluded from the computation.
 */
export function conductRows<T>(
  rows: readonly T[],
  checkedInput: ReadonlySet<RowKey>,
  getKey: (record: T) => RowKey,
  getChildren: (record: T) => readonly T[] | undefined,
  isDisabled: (record: T) => boolean = () => false,
): { checked: Set<RowKey>; half: Set<RowKey> } {
  const disabled = collectDisabled(rows, getKey, getChildren, isDisabled);
  const meta = buildRowMeta(rows, getKey, getChildren, disabled);

  // Top-down: a checked node checks all its enabled leaf descendants.
  const leafChecked = new Set<RowKey>();
  for (const key of checkedInput) {
    const ls = meta.leaves.get(key);
    if (!ls) continue;
    for (const leaf of ls) leafChecked.add(leaf); // already enabled-only
  }

  const checked = new Set<RowKey>();
  const half = new Set<RowKey>();

  // Bottom-up: reverse document order so children resolve before parents.
  for (let i = meta.allKeys.length - 1; i >= 0; i--) {
    const key = meta.allKeys[i] as RowKey;
    const enabledLeaves = meta.leaves.get(key) as RowKey[];
    if (enabledLeaves.length === 0) continue;
    const checkedCount = enabledLeaves.filter((l) => leafChecked.has(l)).length;
    if (checkedCount === 0) continue;
    if (checkedCount === enabledLeaves.length) checked.add(key);
    else half.add(key);
  }

  return { checked, half };
}

/**
 * Normalize a checked set to leaf-level for table rows: any non-leaf (parent)
 * key is expanded to its enabled leaf descendants. Makes a base set resilient to
 * being fed conductRows output (which contains parent keys).
 */
export function normalizeRowsToLeaves<T>(
  rows: readonly T[],
  checked: ReadonlySet<RowKey>,
  getKey: (record: T) => RowKey,
  getChildren: (record: T) => readonly T[] | undefined,
  isDisabled: (record: T) => boolean = () => false,
): Set<RowKey> {
  const disabled = collectDisabled(rows, getKey, getChildren, isDisabled);
  const meta = buildRowMeta(rows, getKey, getChildren, disabled);
  const out = new Set<RowKey>();
  for (const key of checked) {
    const leaves = meta.leaves.get(key);
    if (!leaves) continue; // unknown key — drop it
    if (leaves.length === 1 && leaves[0] === key) out.add(key); // a leaf
    else for (const l of leaves) out.add(l); // parent → its leaves
  }
  return out;
}

/**
 * Toggle a row's check in related mode: returns the next *base* checked set
 * (leaf-level) after toggling `key`. The input base is normalized to leaves
 * first, so passing conductRows output round-trips correctly. Feed the result
 * through conductRows to render. Disabled leaves are never auto-changed.
 */
export function toggleRowCheck<T>(
  rows: readonly T[],
  currentChecked: ReadonlySet<RowKey>,
  key: RowKey,
  getKey: (record: T) => RowKey,
  getChildren: (record: T) => readonly T[] | undefined,
  isDisabled: (record: T) => boolean = () => false,
): Set<RowKey> {
  const disabled = collectDisabled(rows, getKey, getChildren, isDisabled);
  const meta = buildRowMeta(rows, getKey, getChildren, disabled);
  const base = normalizeRowsToLeaves(rows, currentChecked, getKey, getChildren, isDisabled);
  const leaves = meta.leaves.get(key) ?? []; // enabled-only
  const allChecked = leaves.length > 0 && leaves.every((l) => base.has(l));
  const next = new Set(base);
  if (allChecked) for (const l of leaves) next.delete(l);
  else for (const l of leaves) next.add(l);
  return next;
}
