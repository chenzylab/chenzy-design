import { describe, expect, it } from 'vitest';
import { buildGroups, hasGroups, isGrouped, normalizeData } from './group.js';
import type { TransferGroup, TransferItem } from './types.js';

describe('transfer/group', () => {
  const flat: TransferItem[] = [
    { key: 'a', label: '北京' },
    { key: 'b', label: '上海' },
  ];
  const grouped: TransferGroup[] = [
    { title: '华东', items: [{ key: 'hz', label: '杭州' }, { key: 'sh', label: '上海' }] },
    { title: '华南', items: [{ key: 'gz', label: '广州' }] },
  ];

  it('isGrouped distinguishes flat vs grouped', () => {
    expect(isGrouped(flat)).toBe(false);
    expect(isGrouped(grouped)).toBe(true);
    expect(isGrouped([])).toBe(false);
  });

  it('normalizeData keeps flat data untouched', () => {
    expect(normalizeData(flat)).toEqual(flat);
    expect(hasGroups(normalizeData(flat))).toBe(false);
  });

  it('normalizeData flattens grouped data and stamps group from title', () => {
    const items = normalizeData(grouped);
    expect(items.map((i) => i.key)).toEqual(['hz', 'sh', 'gz']);
    expect(items.map((i) => i.group)).toEqual(['华东', '华东', '华南']);
    expect(hasGroups(items)).toBe(true);
  });

  it('group title wins over a pre-set group on item', () => {
    const src: TransferGroup[] = [
      { title: 'X', items: [{ key: '1', label: 'one', group: 'Y' }] },
    ];
    expect(normalizeData(src)[0]!.group).toBe('X');
  });

  it('buildGroups preserves first-seen order and drops empty groups', () => {
    const items = normalizeData(grouped);
    // simulate a filter that removes all of 华南
    const filtered = items.filter((i) => i.group === '华东');
    const out = buildGroups(filtered, 'fallback');
    expect(out.map((g) => g.title)).toEqual(['华东']);
    expect(out[0]!.items.map((i) => i.key)).toEqual(['hz', 'sh']);
  });

  it('buildGroups buckets ungrouped items under fallback title', () => {
    const out = buildGroups(flat, '源');
    expect(out).toHaveLength(1);
    expect(out[0]!.title).toBe('源');
    expect(out[0]!.items).toEqual(flat);
  });
});
