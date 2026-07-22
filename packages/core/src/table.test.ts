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
  flattenTreeRows,
  conductRows,
  normalizeRowsToLeaves,
  toggleRowCheck,
  type SortState,
  type RowKey,
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

describe('flattenTreeRows', () => {
  interface Row {
    id: number;
    children?: Row[];
  }
  const data: Row[] = [
    {
      id: 1,
      children: [{ id: 11 }, { id: 12, children: [{ id: 121 }] }],
    },
    { id: 2 },
    { id: 3, children: [{ id: 31 }] },
  ];
  const getKey = (r: Row) => r.id;
  const getChildren = (r: Row) => r.children;

  it('shows only top-level rows when nothing is expanded', () => {
    const flat = flattenTreeRows(data, new Set(), getKey, getChildren);
    expect(flat.map((r) => r.key)).toEqual([1, 2, 3]);
    expect(flat.every((r) => r.level === 0)).toBe(true);
    expect(flat.map((r) => r.hasChildren)).toEqual([true, false, true]);
    expect(flat.map((r) => r.topIndex)).toEqual([0, 1, 2]);
  });

  it('reveals children of expanded rows with incremented level', () => {
    const flat = flattenTreeRows(data, new Set([1]), getKey, getChildren);
    expect(flat.map((r) => r.key)).toEqual([1, 11, 12, 2, 3]);
    const r12 = flat.find((r) => r.key === 12)!;
    expect(r12.level).toBe(1);
    expect(r12.parentKey).toBe(1);
    expect(r12.hasChildren).toBe(true);
  });

  it('recurses into nested expanded rows and carries topIndex', () => {
    const flat = flattenTreeRows(data, new Set([1, 12]), getKey, getChildren);
    expect(flat.map((r) => r.key)).toEqual([1, 11, 12, 121, 2, 3]);
    const deep = flat.find((r) => r.key === 121)!;
    expect(deep.level).toBe(2);
    expect(deep.parentKey).toBe(12);
    expect(deep.topIndex).toBe(0);
  });

  it('does not expand a key with no children', () => {
    const flat = flattenTreeRows(data, new Set([2]), getKey, getChildren);
    expect(flat.map((r) => r.key)).toEqual([1, 2, 3]);
  });

  it('容错缺 key 的行：生成稳定 fallback key，不丢失子树（对齐 Semi）', () => {
    interface LooseRow {
      id?: number;
      children?: LooseRow[];
    }
    const looseData: LooseRow[] = [
      {
        id: 1,
        children: [
          { id: 11 },
          { id: 12, children: [{ /* 缺 id/key */ }] },
        ],
      },
      { id: 2, children: [{ id: 21 }, { id: 22 }] },
    ];
    const flat = flattenTreeRows(
      looseData,
      new Set([1, 12, 2]),
      (r) => r.id as RowKey,
      (r) => r.children,
    );
    // 全展开：1 + 子(11,12) + 12的缺key孙 + 2 + 子(21,22) = 7 行，缺 key 行不中断
    expect(flat).toHaveLength(7);
    const keys = flat.map((r) => r.key);
    // 缺 key 行有稳定生成 key（父12 + 索引0）
    expect(keys).toContain('__cd_treekey__12:0');
    // key 全唯一（无冲突）
    expect(new Set(keys).size).toBe(keys.length);
    // 顺序正确：1,11,12,<缺key>,2,21,22 中 12 的子在 2 之前
    expect(keys.indexOf('__cd_treekey__12:0')).toBeLessThan(keys.indexOf(2));
  });
});

describe('tree row selection conduction', () => {
  interface Row {
    id: number;
    disabled?: boolean;
    children?: Row[];
  }
  // 1 ─ 11
  //   └ 12 ─ 121
  //         └ 122
  // 2
  const data: Row[] = [
    {
      id: 1,
      children: [
        { id: 11 },
        { id: 12, children: [{ id: 121 }, { id: 122 }] },
      ],
    },
    { id: 2 },
  ];
  const getKey = (r: Row) => r.id;
  const getChildren = (r: Row) => r.children;
  const isDisabled = (r: Row) => !!r.disabled;

  it('conductRows: checking a parent fully checks descendants', () => {
    const { checked, half } = conductRows(data, new Set([1]), getKey, getChildren);
    expect([...checked].sort((a, b) => Number(a) - Number(b))).toEqual([1, 11, 12, 121, 122]);
    expect(half.size).toBe(0);
  });

  it('conductRows: partial children make ancestors half', () => {
    const { checked, half } = conductRows(data, new Set([121]), getKey, getChildren);
    expect([...checked]).toEqual([121]);
    expect([...half].sort((a, b) => Number(a) - Number(b))).toEqual([1, 12]);
  });

  it('conductRows: all leaves of a parent → parent checked, not half', () => {
    const { checked, half } = conductRows(data, new Set([121, 122]), getKey, getChildren);
    expect(checked.has(12)).toBe(true);
    expect(half.has(12)).toBe(false); // 12 fully checked, not half
    expect(half.has(1)).toBe(true); // 1 still partial (11 unchecked)
  });

  it('conductRows: disabled leaf excluded from parent computation', () => {
    const withDisabled: Row[] = [
      { id: 1, children: [{ id: 11 }, { id: 12, disabled: true }] },
    ];
    // check only 11; 12 is disabled so 1 counts only the enabled leaf → checked
    const { checked, half } = conductRows(
      withDisabled,
      new Set([11]),
      getKey,
      getChildren,
      isDisabled,
    );
    expect(checked.has(1)).toBe(true);
    expect(half.has(1)).toBe(false);
  });

  it('toggleRowCheck: toggling a parent adds/removes all leaves', () => {
    const on = toggleRowCheck(data, new Set(), 1, getKey, getChildren);
    expect([...on].sort((a, b) => Number(a) - Number(b))).toEqual([11, 121, 122]); // leaf-level base
    const off = toggleRowCheck(data, on, 1, getKey, getChildren);
    expect(off.size).toBe(0);
  });

  it('toggleRowCheck: round-trips conductRows output (parent keys)', () => {
    // feed conduct output (contains parent keys) back through toggle
    const { checked } = conductRows(data, new Set([1]), getKey, getChildren);
    const off = toggleRowCheck(data, checked, 12, getKey, getChildren);
    // toggling 12 off should remove its leaves only, keep 11
    expect(off.has(11)).toBe(true);
    expect(off.has(121)).toBe(false);
    expect(off.has(122)).toBe(false);
  });

  it('normalizeRowsToLeaves: expands parents to leaves, drops unknown keys', () => {
    const out = normalizeRowsToLeaves(data, new Set([1, 999]), getKey, getChildren);
    expect([...out].sort((a, b) => Number(a) - Number(b))).toEqual([11, 121, 122]);
  });
});
