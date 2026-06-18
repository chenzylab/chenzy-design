import { describe, expect, it } from 'vitest';
import {
  flattenVisible,
  findNode,
  collectExpandable,
  collectExpandableToDepth,
  conduct,
  toggleCheck,
  normalizeToLeaves,
  computeFilteredKeys,
  type TreeNodeData,
} from './tree.js';

const data: TreeNodeData[] = [
  {
    key: '1',
    label: 'Root 1',
    children: [
      { key: '1-1', label: 'Child 1-1' },
      {
        key: '1-2',
        label: 'Child 1-2',
        children: [
          { key: '1-2-1', label: 'Leaf 1-2-1' },
          { key: '1-2-2', label: 'Leaf 1-2-2' },
        ],
      },
    ],
  },
  { key: '2', label: 'Root 2' },
];

describe('flattenVisible', () => {
  it('shows only roots when nothing expanded', () => {
    const flat = flattenVisible(data, new Set());
    expect(flat.map((f) => f.node.key)).toEqual(['1', '2']);
    expect(flat[0]?.hasChildren).toBe(true);
    expect(flat[1]?.hasChildren).toBe(false);
  });

  it('reveals children of expanded nodes in document order', () => {
    const flat = flattenVisible(data, new Set(['1', '1-2']));
    expect(flat.map((f) => f.node.key)).toEqual([
      '1',
      '1-1',
      '1-2',
      '1-2-1',
      '1-2-2',
      '2',
    ]);
  });

  it('reports level, posInSet and setSize', () => {
    const flat = flattenVisible(data, new Set(['1']));
    const child = flat.find((f) => f.node.key === '1-2');
    expect(child?.level).toBe(1);
    expect(child?.posInSet).toBe(2);
    expect(child?.setSize).toBe(2);
    expect(child?.parentKey).toBe('1');
  });
});

describe('findNode / collectExpandable', () => {
  it('finds a deep node', () => {
    expect(findNode(data, '1-2-1')?.label).toBe('Leaf 1-2-1');
    expect(findNode(data, 'nope')).toBeUndefined();
  });

  it('collects every parent key', () => {
    expect(collectExpandable(data).sort()).toEqual(['1', '1-2']);
  });

  it('collects parents up to a depth', () => {
    expect(collectExpandableToDepth(data, 1)).toEqual(['1']);
    expect(collectExpandableToDepth(data, 2).sort()).toEqual(['1', '1-2']);
  });
});

describe('conduct (related mode)', () => {
  it('checking a parent fully checks it; leaves drive parent state', () => {
    // base = the two leaves of 1-2
    const { checked, half } = conduct(data, new Set(['1-2-1', '1-2-2']));
    expect(checked.has('1-2')).toBe(true); // all children checked → parent checked
    expect(half.has('1')).toBe(true); // 1 has 1-1 unchecked → half
    expect(checked.has('1')).toBe(false);
  });

  it('partial children → parent half-checked', () => {
    const { checked, half } = conduct(data, new Set(['1-2-1']));
    expect(half.has('1-2')).toBe(true);
    expect(half.has('1')).toBe(true);
    expect(checked.has('1-2')).toBe(false);
  });

  it('all leaves checked → root checked, no half', () => {
    const { checked, half } = conduct(data, new Set(['1-1', '1-2-1', '1-2-2']));
    expect(checked.has('1')).toBe(true);
    expect(half.size).toBe(0);
  });

  it('disabled leaves are excluded from the count', () => {
    const d: TreeNodeData[] = [
      {
        key: 'p',
        label: 'P',
        children: [
          { key: 'a', label: 'A' },
          { key: 'b', label: 'B', disabled: true },
        ],
      },
    ];
    // only enabled leaf 'a' checked → parent fully checked (b ignored)
    const { checked, half } = conduct(d, new Set(['a']));
    expect(checked.has('p')).toBe(true);
    expect(half.has('p')).toBe(false);
  });
});

describe('toggleCheck', () => {
  it('toggles a leaf on and off', () => {
    const on = toggleCheck(data, new Set(), '1-1');
    expect(on.has('1-1')).toBe(true);
    const off = toggleCheck(data, on, '1-1');
    expect(off.has('1-1')).toBe(false);
  });

  it('toggling a parent toggles all its leaves', () => {
    const on = toggleCheck(data, new Set(), '1-2');
    expect(on.has('1-2-1')).toBe(true);
    expect(on.has('1-2-2')).toBe(true);
    const off = toggleCheck(data, on, '1-2');
    expect(off.has('1-2-1')).toBe(false);
    expect(off.has('1-2-2')).toBe(false);
  });

  it('round-trips conduct output: unchecking a leaf after conduct removes it', () => {
    // simulate the controlled flow: check a parent, run conduct (adds parent keys),
    // feed that polluted set back, then uncheck a single leaf.
    const base = toggleCheck(data, new Set(), '1'); // check whole subtree under root 1
    const { checked } = conduct(data, base); // checked now contains parent keys '1','1-2'
    expect(checked.has('1')).toBe(true);
    // feed conduct output (with parent keys) back and uncheck a deep leaf
    const next = toggleCheck(data, checked, '1-2-1');
    expect(next.has('1-2-1')).toBe(false); // the leaf is actually removed
    expect(next.has('1-1')).toBe(true); // siblings stay
    const re = conduct(data, next);
    expect(re.checked.has('1')).toBe(false); // root no longer fully checked
    expect(re.half.has('1')).toBe(true); // root half-checked
  });
});

describe('normalizeToLeaves', () => {
  it('expands parent keys to their leaves and keeps leaves as-is', () => {
    const norm = normalizeToLeaves(data, new Set(['1-2', '1-1']));
    expect([...norm].sort()).toEqual(['1-1', '1-2-1', '1-2-2']);
  });

  it('drops unknown keys', () => {
    expect(normalizeToLeaves(data, new Set(['ghost'])).size).toBe(0);
  });
});

describe('computeFilteredKeys', () => {
  it('expands ancestor chain of a match', () => {
    const { matched, expand } = computeFilteredKeys(data, (n) =>
      n.label.includes('1-2-1'),
    );
    expect(matched.has('1-2-1')).toBe(true);
    expect(expand.has('1')).toBe(true);
    expect(expand.has('1-2')).toBe(true);
    expect(expand.has('2')).toBe(false);
  });

  it('returns empty sets when nothing matches', () => {
    const { matched, expand } = computeFilteredKeys(data, () => false);
    expect(matched.size).toBe(0);
    expect(expand.size).toBe(0);
  });
});
