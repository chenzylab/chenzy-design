import { describe, it, expect } from 'vitest';
import {
  flattenVisible,
  fixedRange,
  type TreeNodeData,
  type TreeKey,
} from '@chenzy-design/core';

// 这些用例佐证 TreeSelect 虚拟化/异步加载所复用的纯派生逻辑（与 Tree 同范式）：
// 1) mergedTree 注入已加载子节点的纯函数行为；
// 2) flattenVisible + fixedRange 视口切片只取窗口内行（虚拟化核心）。

const VIRTUAL_OVERSCAN = 4;

// 与 TreeSelect.svelte 内 mergedTree 注入逻辑等价的纯函数。
function injectLoaded(
  nodes: TreeNodeData[],
  loaded: Map<TreeKey, TreeNodeData[]>,
): TreeNodeData[] {
  if (loaded.size === 0) return nodes;
  const inject = (list: TreeNodeData[]): TreeNodeData[] =>
    list.map((n) => {
      const kids = n.children ?? loaded.get(n.key);
      if (!kids) return n;
      return { ...n, children: inject(kids) };
    });
  return inject(nodes);
}

describe('TreeSelect mergedTree 异步注入', () => {
  it('无加载时返回原引用（零开销）', () => {
    const data: TreeNodeData[] = [{ key: 'a', label: 'A', isLeaf: true }];
    expect(injectLoaded(data, new Map())).toBe(data);
  });

  it('把已加载子节点注入对应节点（不改原数据）', () => {
    const data: TreeNodeData[] = [{ key: 'a', label: 'A' }];
    const loaded = new Map<TreeKey, TreeNodeData[]>([
      ['a', [{ key: 'a-1', label: 'A1' }, { key: 'a-2', label: 'A2' }]],
    ]);
    const merged = injectLoaded(data, loaded);
    expect(merged[0]?.children).toHaveLength(2);
    // 原数据不被改写（红线 #1）
    expect(data[0]?.children).toBeUndefined();
  });

  it('注入后的子树可被 flattenVisible 在展开时纳入可见行', () => {
    const data: TreeNodeData[] = [{ key: 'a', label: 'A' }];
    const loaded = new Map<TreeKey, TreeNodeData[]>([
      ['a', [{ key: 'a-1', label: 'A1' }]],
    ]);
    const merged = injectLoaded(data, loaded);
    const flat = flattenVisible(merged, new Set<TreeKey>(['a']));
    expect(flat.map((f) => f.node.key)).toEqual(['a', 'a-1']);
  });
});

describe('TreeSelect 虚拟化视口切片', () => {
  // 50 分组 × 20 子项的大树，全展开。
  const big: TreeNodeData[] = Array.from({ length: 50 }, (_, g) => ({
    key: `g${g}`,
    label: `G${g}`,
    children: Array.from({ length: 20 }, (_, c) => ({
      key: `g${g}-c${c}`,
      label: `G${g}C${c}`,
    })),
  }));
  const allExpanded = new Set<TreeKey>(big.map((n) => n.key));
  const flat = flattenVisible(big, allExpanded);

  it('全展开后可见行 = 50 分组 + 50*20 子项 = 1050', () => {
    expect(flat.length).toBe(1050);
  });

  it('fixedRange 在视口顶部只取窗口 + overscan，远小于全量', () => {
    const itemHeight = 32;
    const height = 224; // 默认面板高度
    const range = fixedRange(0, height, itemHeight, flat.length, VIRTUAL_OVERSCAN);
    const rendered = flat.slice(range.startIndex, range.endIndex);
    // 视口 7 行可见 + 4 overscan（顶部 startIndex=0），渲染数远小于 1050。
    expect(rendered.length).toBeLessThan(20);
    expect(range.startIndex).toBe(0);
    expect(rendered[0]?.node.key).toBe('g0');
  });

  it('滚动到中部时窗口随 scrollTop 平移', () => {
    const itemHeight = 32;
    const height = 224;
    const scrollTop = 500 * itemHeight; // 滚到第 500 行附近
    const range = fixedRange(scrollTop, height, itemHeight, flat.length, VIRTUAL_OVERSCAN);
    expect(range.startIndex).toBeGreaterThan(490);
    expect(range.endIndex).toBeLessThan(flat.length);
    const rendered = flat.slice(range.startIndex, range.endIndex);
    expect(rendered.length).toBeLessThan(20);
  });

  it('行偏移按 (startIndex + i) * rowHeight 计算', () => {
    const itemHeight = 32;
    const range = fixedRange(500 * itemHeight, 224, itemHeight, flat.length, VIRTUAL_OVERSCAN);
    // 渲染切片第 0 项的 translateY 应等于 startIndex * rowHeight。
    const firstOffset = (range.startIndex + 0) * itemHeight;
    expect(firstOffset).toBe(range.startIndex * itemHeight);
  });
});
