/**
 * List selection state — framework-agnostic, pure functions.
 * Toggling / range-selecting row keys for a selectable List. No DOM, no
 * framework deps, no mutable module state — the render layer owns the controlled
 * `selectedKeys` and only feeds the next set to `onSelectionChange`.
 * See specs/components/show/List.spec.md.
 */

export type ListKey = string | number;

export type SelectionMode = 'single' | 'multiple';

/**
 * Compute the next selected-key set after clicking row `key`.
 *
 * - `single`: clicking an unselected row selects only it; clicking the already
 *   selected row clears the selection (toggle).
 * - `multiple`: clicking toggles `key`'s membership, preserving the rest.
 *
 * Pure: returns a brand new Set; never mutates `current`.
 *
 * @param current  the current selected-key set (controlled value)
 * @param key      the row key being toggled
 * @param mode     'single' | 'multiple'
 */
export function toggleSelection(
  current: ReadonlySet<ListKey>,
  key: ListKey,
  mode: SelectionMode,
): Set<ListKey> {
  if (mode === 'single') {
    // Toggle: re-clicking the sole selected row clears it.
    if (current.has(key) && current.size === 1) return new Set();
    return new Set([key]);
  }
  const next = new Set(current);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  return next;
}

/**
 * Compute the next selected-key set for a shift range-select between the anchor
 * row and the just-clicked row (multiple mode only). All keys in the inclusive
 * index range [min(anchor, target), max(anchor, target)] are added to the
 * current selection.
 *
 * Pure: returns a brand new Set; never mutates `current`.
 *
 * @param current     the current selected-key set
 * @param orderedKeys the full ordered list of row keys (index = row position)
 * @param anchorIndex the index of the last single-clicked (anchor) row
 * @param targetIndex the index of the shift-clicked row
 */
export function rangeSelection(
  current: ReadonlySet<ListKey>,
  orderedKeys: readonly ListKey[],
  anchorIndex: number,
  targetIndex: number,
): Set<ListKey> {
  const next = new Set(current);
  if (anchorIndex < 0 || targetIndex < 0) return next;
  const lo = Math.max(0, Math.min(anchorIndex, targetIndex));
  const hi = Math.min(orderedKeys.length - 1, Math.max(anchorIndex, targetIndex));
  for (let i = lo; i <= hi; i += 1) {
    const k = orderedKeys[i];
    if (k !== undefined) next.add(k);
  }
  return next;
}
