import { describe, expect, it } from 'vitest';
import { collectLeafKeys, flattenLeaves, isTreeData } from './tree.js';
import type { TransferItem, TransferTreeNode } from './types.js';

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
  const flat: TransferItem[] = [
    { key: 'a', label: '北京' },
    { key: 'b', label: '上海' },
  ];

  it('isTreeData detects tree vs flat', () => {
    expect(isTreeData(tree)).toBe(true);
    expect(isTreeData(flat)).toBe(false);
    expect(isTreeData([])).toBe(false);
  });

  it('collectLeafKeys returns only leaves in document order', () => {
    expect(collectLeafKeys(tree)).toEqual(['hz', 'sh', 'gz', 'solo']);
  });

  it('flattenLeaves returns leaf items and inherits parent disabled', () => {
    const leaves = flattenLeaves(tree);
    expect(leaves.map((l) => l.key)).toEqual(['hz', 'sh', 'gz', 'solo']);
    expect(leaves.find((l) => l.key === 'gz')?.disabled).toBe(true);
    expect(leaves.find((l) => l.key === 'hz')?.disabled).toBe(false);
  });
});
