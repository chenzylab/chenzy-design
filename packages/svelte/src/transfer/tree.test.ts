import { describe, expect, it } from 'vitest';
import { flattenLeaves } from './tree.js';
import type { TransferTreeNode } from './types.js';

describe('transfer/tree', () => {
  const tree: TransferTreeNode[] = [
    {
      key: 'east',
      label: '华东',
      children: [
        { key: 'hz', label: '杭州' },
        { key: 'sh', label: '上海' },
      ],
    },
    {
      key: 'south',
      label: '华南',
      disabled: true,
      children: [{ key: 'gz', label: '广州' }],
    },
    { key: 'solo', label: '独立项' },
  ];

  it('flattenLeaves returns leaf items and inherits parent disabled', () => {
    const leaves = flattenLeaves(tree);
    expect(leaves.map((l) => l.key)).toEqual(['hz', 'sh', 'gz', 'solo']);
    expect(leaves.find((l) => l.key === 'gz')?.disabled).toBe(true);
    expect(leaves.find((l) => l.key === 'hz')?.disabled).toBe(false);
  });

  it('flattenLeaves keeps value field when node has one', () => {
    const withValue: TransferTreeNode[] = [
      { key: 'a', value: 'val-a', label: 'A', children: [{ key: 'a1', value: 'val-a1', label: 'A1' }] },
    ];
    const leaves = flattenLeaves(withValue);
    expect(leaves[0]).toEqual({ key: 'a1', value: 'val-a1', label: 'A1', disabled: false });
  });
});
