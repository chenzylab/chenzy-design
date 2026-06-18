import { describe, expect, it } from 'vitest';
import {
  nextSortOrder,
  toggleSort,
  applySort,
  paginate,
  pageCount,
  selectAllState,
  toggleSelectAll,
  toggleRow,
  type SortState,
} from './table.js';

describe('sort cycling', () => {
  it('cycles none → ascend → descend → none', () => {
    expect(nextSortOrder(null)).toBe('ascend');
    expect(nextSortOrder('ascend')).toBe('descend');
    expect(nextSortOrder('descend')).toBe(null);
  });

  it('toggleSort starts a new column at ascend', () => {
    const s: SortState = { key: 'a', order: 'descend' };
    expect(toggleSort(s, 'b')).toEqual({ key: 'b', order: 'ascend' });
  });

  it('toggleSort cycles the same column and clears key at none', () => {
    expect(toggleSort({ key: 'a', order: null }, 'a')).toEqual({ key: 'a', order: 'ascend' });
    expect(toggleSort({ key: 'a', order: 'ascend' }, 'a')).toEqual({ key: 'a', order: 'descend' });
    expect(toggleSort({ key: 'a', order: 'descend' }, 'a')).toEqual({ key: null, order: null });
  });
});

describe('applySort', () => {
  const data = [
    { id: 1, n: 3 },
    { id: 2, n: 1 },
    { id: 3, n: 1 },
    { id: 4, n: 2 },
  ];
  const cmp = (a: { n: number }, b: { n: number }): number => a.n - b.n;

  it('returns a copy unchanged when order is null', () => {
    const out = applySort(data, null, cmp);
    expect(out).toEqual(data);
    expect(out).not.toBe(data);
  });

  it('sorts ascending', () => {
    expect(applySort(data, 'ascend', cmp).map((d) => d.id)).toEqual([2, 3, 4, 1]);
  });

  it('sorts descending', () => {
    expect(applySort(data, 'descend', cmp).map((d) => d.id)).toEqual([1, 4, 2, 3]);
  });

  it('is stable for equal keys (ascend keeps original order)', () => {
    // ids 2 and 3 both have n=1 → stay in original relative order
    expect(applySort(data, 'ascend', cmp).slice(0, 2).map((d) => d.id)).toEqual([2, 3]);
  });
});

describe('pagination', () => {
  const data = Array.from({ length: 23 }, (_, i) => i + 1);

  it('slices the right page', () => {
    expect(paginate(data, 1, 10)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(paginate(data, 3, 10)).toEqual([21, 22, 23]);
  });

  it('computes page count', () => {
    expect(pageCount(23, 10)).toBe(3);
    expect(pageCount(0, 10)).toBe(1);
    expect(pageCount(20, 10)).toBe(2);
  });
});

describe('selection', () => {
  const keys = ['a', 'b', 'c', 'd'];

  it('select-all state: none / some / all', () => {
    expect(selectAllState(keys, new Set())).toEqual({ checked: false, indeterminate: false });
    expect(selectAllState(keys, new Set(['a']))).toEqual({ checked: false, indeterminate: true });
    expect(selectAllState(keys, new Set(keys))).toEqual({ checked: true, indeterminate: false });
  });

  it('excludes disabled rows from the all-computation', () => {
    // d disabled; selecting a,b,c counts as "all selectable"
    const st = selectAllState(keys, new Set(['a', 'b', 'c']), new Set(['d']));
    expect(st).toEqual({ checked: true, indeterminate: false });
  });

  it('toggleSelectAll selects all selectable then clears', () => {
    const on = toggleSelectAll(keys, new Set(), new Set(['d']));
    expect([...on].sort()).toEqual(['a', 'b', 'c']); // d never auto-selected
    const off = toggleSelectAll(keys, on, new Set(['d']));
    expect(off.size).toBe(0);
  });

  it('toggleSelectAll preserves a pre-selected disabled row', () => {
    const off = toggleSelectAll(keys, new Set(['a', 'b', 'c', 'd']), new Set(['d']));
    expect([...off]).toEqual(['d']); // selectable cleared, disabled d kept
  });

  it('toggleRow flips a single row', () => {
    expect([...toggleRow(new Set(), 'a')]).toEqual(['a']);
    expect([...toggleRow(new Set(['a']), 'a')]).toEqual([]);
  });
});
