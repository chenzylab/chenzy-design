import { describe, expect, it } from 'vitest';
import {
  offsetToIndex,
  indexToOffset,
  indexOfValue,
  nextEnabledIndex,
  firstEnabledIndex,
  lastEnabledIndex,
  keyboardTarget,
  type ScrollListItem,
} from './scroll-list.js';

const items: ScrollListItem[] = [
  { value: 0, label: '0' },
  { value: 1, label: '1', disabled: true },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4', disabled: true },
  { value: 5, label: '5' },
];

describe('offset ↔ index', () => {
  it('rounds offset to nearest index and clamps', () => {
    expect(offsetToIndex(0, 36, 6)).toBe(0);
    expect(offsetToIndex(40, 36, 6)).toBe(1); // 40/36 ≈ 1.1 → 1
    expect(offsetToIndex(90, 36, 6)).toBe(3); // 90/36 = 2.5 → 3 (round half up)
    expect(offsetToIndex(9999, 36, 6)).toBe(5); // clamp to last
    expect(offsetToIndex(-50, 36, 6)).toBe(0); // clamp to first
  });

  it('indexToOffset centers an index', () => {
    expect(indexToOffset(0, 36)).toBe(0);
    expect(indexToOffset(3, 36)).toBe(108);
  });

  it('handles degenerate inputs', () => {
    expect(offsetToIndex(10, 0, 6)).toBe(0);
    expect(offsetToIndex(10, 36, 0)).toBe(0);
  });
});

describe('indexOfValue', () => {
  it('finds the index of a value', () => {
    expect(indexOfValue(items, 3)).toBe(3);
    expect(indexOfValue(items, 99)).toBe(-1);
    expect(indexOfValue(items, undefined)).toBe(-1);
  });
});

describe('enabled-index navigation (skips disabled)', () => {
  it('nextEnabledIndex skips disabled in both directions', () => {
    expect(nextEnabledIndex(items, 0, 1)).toBe(2); // skip disabled 1
    expect(nextEnabledIndex(items, 3, 1)).toBe(5); // skip disabled 4
    expect(nextEnabledIndex(items, 2, -1)).toBe(0); // skip disabled 1
  });

  it('returns the same index at a boundary', () => {
    expect(nextEnabledIndex(items, 5, 1)).toBe(5); // no enabled after
    expect(nextEnabledIndex(items, 0, -1)).toBe(0); // no enabled before
  });

  it('first/last enabled', () => {
    expect(firstEnabledIndex(items)).toBe(0);
    expect(lastEnabledIndex(items)).toBe(5);
    expect(firstEnabledIndex([{ value: 'x', label: 'x', disabled: true }])).toBe(-1);
  });
});

describe('keyboardTarget', () => {
  it('ArrowUp/Down skip disabled', () => {
    expect(keyboardTarget(items, 0, 'ArrowDown')).toBe(2);
    expect(keyboardTarget(items, 2, 'ArrowUp')).toBe(0);
  });

  it('Home/End jump to first/last enabled', () => {
    expect(keyboardTarget(items, 3, 'Home')).toBe(0);
    expect(keyboardTarget(items, 0, 'End')).toBe(5);
  });

  it('PageDown moves up to `page` enabled rows, stopping at boundary', () => {
    // from 0, page 3, enabled order: 0→2→3→5 ; 3 steps → 5
    expect(keyboardTarget(items, 0, 'PageDown', 3)).toBe(5);
    // from 0, page 2 → 0→2→3 → index 3
    expect(keyboardTarget(items, 0, 'PageDown', 2)).toBe(3);
  });

  it('PageUp stops at the first enabled', () => {
    expect(keyboardTarget(items, 5, 'PageUp', 10)).toBe(0);
  });
});
