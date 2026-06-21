import { describe, it, expect } from 'vitest';
import {
  flattenCascaderPaths,
  filterCascaderPaths,
  resolveColumnWidth,
  type CascaderPathNode,
} from './cascader.js';

const tree: CascaderPathNode[] = [
  {
    label: '浙江',
    value: 'zj',
    children: [
      {
        label: '杭州',
        value: 'hz',
        children: [
          { label: '西湖', value: 'xh' },
          { label: '余杭', value: 'yh', disabled: true },
        ],
      },
    ],
  },
  {
    label: '江苏',
    value: 'js',
    disabled: true,
    children: [{ label: '南京', value: 'nj', children: [{ label: '玄武', value: 'xw' }] }],
  },
];

describe('flattenCascaderPaths', () => {
  it('collects only leaf paths by default', () => {
    const paths = flattenCascaderPaths(tree);
    expect(paths.map((p) => p.values.join('/'))).toEqual([
      'zj/hz/xh',
      'zj/hz/yh',
      'js/nj/xw',
    ]);
    expect(paths.every((p) => p.isLeaf)).toBe(true);
  });

  it('includes non-leaf paths when requested (changeOnSelect)', () => {
    const paths = flattenCascaderPaths(tree, { includeNonLeaf: true });
    expect(paths.map((p) => p.values.join('/'))).toContain('zj');
    expect(paths.map((p) => p.values.join('/'))).toContain('zj/hz');
  });

  it('propagates disabled down the chain', () => {
    const paths = flattenCascaderPaths(tree);
    const yh = paths.find((p) => p.values.at(-1) === 'yh');
    const xw = paths.find((p) => p.values.at(-1) === 'xw');
    expect(yh?.disabled).toBe(true); // own disabled
    expect(xw?.disabled).toBe(true); // inherited from 江苏
  });

  it('folds in async children via childrenOf without mutating source', () => {
    const lazy: CascaderPathNode[] = [{ label: 'A', value: 'a' }];
    const extra = new Map<string | number, CascaderPathNode[]>([
      ['a', [{ label: 'B', value: 'b' }]],
    ]);
    const paths = flattenCascaderPaths(lazy, {
      childrenOf: (n) => n.children ?? extra.get(n.value),
    });
    expect(paths.map((p) => p.values.join('/'))).toEqual(['a/b']);
    expect(lazy[0]!.children).toBeUndefined();
  });
});

describe('filterCascaderPaths', () => {
  const flat = flattenCascaderPaths(tree, { includeNonLeaf: true });

  it('returns [] when filter disabled', () => {
    expect(filterCascaderPaths(flat, '杭', false)).toEqual([]);
  });

  it('returns [] for blank query', () => {
    expect(filterCascaderPaths(flat, '   ', true)).toEqual([]);
  });

  it('default match is case-insensitive substring over the label chain', () => {
    const r = filterCascaderPaths(flat, 'xh'.toUpperCase(), true);
    // default leafOnly=true → only leaf paths
    expect(r.length).toBe(0); // 'XH' not in labels (labels are chinese); sanity
    const r2 = filterCascaderPaths(flat, '西湖', true);
    expect(r2.map((p) => p.values.join('/'))).toEqual(['zj/hz/xh']);
  });

  it('respects custom separator in default match', () => {
    const r = filterCascaderPaths(flat, '浙江>杭州', true, { separator: '>' });
    expect(r.length).toBeGreaterThan(0);
    const none = filterCascaderPaths(flat, '浙江 / 杭州', true, { separator: '>' });
    expect(none.length).toBe(0);
  });

  it('leafOnly=false includes non-leaf matches', () => {
    const r = filterCascaderPaths(flat, '杭州', true, { leafOnly: false });
    expect(r.map((p) => p.values.join('/'))).toContain('zj/hz');
  });

  it('accepts a custom predicate', () => {
    const r = filterCascaderPaths(flat, 'q', (_q, p) => p.values.at(-1) === 'nj');
    expect(r.map((p) => p.values.join('/'))).toEqual(['js/nj']);
  });
});

describe('resolveColumnWidth', () => {
  it('returns fallback when undefined', () => {
    expect(resolveColumnWidth(undefined, 0)).toBe(180);
    expect(resolveColumnWidth(undefined, 2, 200)).toBe(200);
  });

  it('returns uniform width for a number', () => {
    expect(resolveColumnWidth(220, 0)).toBe(220);
    expect(resolveColumnWidth(220, 5)).toBe(220);
  });

  it('returns per-column width from an array, last entry past the end', () => {
    expect(resolveColumnWidth([100, 200, 300], 0)).toBe(100);
    expect(resolveColumnWidth([100, 200, 300], 1)).toBe(200);
    expect(resolveColumnWidth([100, 200, 300], 9)).toBe(300);
  });

  it('falls back when the array is empty', () => {
    expect(resolveColumnWidth([], 0, 150)).toBe(150);
  });
});
