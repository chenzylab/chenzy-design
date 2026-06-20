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
  computeDropPosition,
  isAncestorOrSelf,
  siblingKeys,
  accordionExpand,
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

  it('reports isLast and ancestorIsLast for tree guide lines', () => {
    const flat = flattenVisible(data, new Set(['1', '1-2']));
    const byKey = (k: string) => flat.find((f) => f.node.key === k);
    // root '1' has sibling '2' after it → not last; root level has no ancestors
    expect(byKey('1')?.isLast).toBe(false);
    expect(byKey('1')?.ancestorIsLast).toEqual([]);
    // '1-2' is the last child of '1'; its ancestor '1' was NOT last
    expect(byKey('1-2')?.isLast).toBe(true);
    expect(byKey('1-2')?.ancestorIsLast).toEqual([false]);
    // '1-2-1' ancestors: '1'(false) then '1-2'(true)
    expect(byKey('1-2-1')?.ancestorIsLast).toEqual([false, true]);
    expect(byKey('1-2-1')?.isLast).toBe(false);
    // last root '2'
    expect(byKey('2')?.isLast).toBe(true);
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

describe('computeDropPosition', () => {
  it('splits a 32px row into before / inside / after thirds', () => {
    expect(computeDropPosition(4, 32)).toBe('before'); // < 8 (1/4)
    expect(computeDropPosition(16, 32)).toBe('inside'); // middle
    expect(computeDropPosition(28, 32)).toBe('after'); // > 24 (3/4)
  });

  it('boundaries: edges fold to inside', () => {
    expect(computeDropPosition(8, 32)).toBe('inside'); // not < 8
    expect(computeDropPosition(24, 32)).toBe('inside'); // not > 24
  });

  it('clamps out-of-range offsets', () => {
    expect(computeDropPosition(-10, 32)).toBe('before');
    expect(computeDropPosition(999, 32)).toBe('after');
  });

  it('only before/after when inside not allowed (leaf target)', () => {
    expect(computeDropPosition(10, 32, false)).toBe('before');
    expect(computeDropPosition(20, 32, false)).toBe('after');
    expect(computeDropPosition(16, 32, false)).toBe('after'); // exactly half → after
  });

  it('degenerate row height returns after', () => {
    expect(computeDropPosition(0, 0)).toBe('after');
  });
});

describe('isAncestorOrSelf', () => {
  it('is true for the same key', () => {
    expect(isAncestorOrSelf(data, '1', '1')).toBe(true);
  });

  it('is true for a descendant', () => {
    expect(isAncestorOrSelf(data, '1', '1-1')).toBe(true);
    expect(isAncestorOrSelf(data, '1', '1-2-1')).toBe(true);
  });

  it('is false for unrelated nodes', () => {
    expect(isAncestorOrSelf(data, '1-1', '1')).toBe(false);
    expect(isAncestorOrSelf(data, '2', '1-1')).toBe(false);
  });
});

describe('siblingKeys', () => {
  it('returns root siblings excluding self', () => {
    expect(siblingKeys(data, '1')).toEqual(['2']);
    expect(siblingKeys(data, '2')).toEqual(['1']);
  });
  it('returns same-parent siblings excluding self', () => {
    expect(siblingKeys(data, '1-1')).toEqual(['1-2']);
    expect(siblingKeys(data, '1-2')).toEqual(['1-1']);
  });
  it('returns deeper-level siblings', () => {
    expect(siblingKeys(data, '1-2-1')).toEqual(['1-2-2']);
  });
  it('returns empty for unknown key', () => {
    expect(siblingKeys(data, 'nope')).toEqual([]);
  });
});

describe('accordionExpand', () => {
  it('adds key and removes its siblings', () => {
    // expand 1-2 while 1-1 already expanded → 1-1 collapses
    const next = accordionExpand(data, new Set(['1', '1-1']), '1-2');
    expect([...next].sort()).toEqual(['1', '1-2']);
  });
  it('keeps non-sibling expanded nodes (different level not mutually exclusive)', () => {
    // 1 (root) expanded, expand 1-2-1 deep child → root 1 untouched
    const next = accordionExpand(data, new Set(['1', '1-2']), '1-2-1');
    expect([...next].sort()).toEqual(['1', '1-2', '1-2-1']);
  });
  it('collapses other root when expanding a root', () => {
    const next = accordionExpand(data, new Set(['2']), '1');
    expect([...next]).toEqual(['1']);
  });
  it('does not mutate the input set', () => {
    const input = new Set(['1', '1-1']);
    accordionExpand(data, input, '1-2');
    expect([...input].sort()).toEqual(['1', '1-1']);
  });
});
