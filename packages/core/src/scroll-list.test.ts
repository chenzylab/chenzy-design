import { describe, expect, it } from 'vitest';
import {
  offsetToIndex,
  indexToOffset,
  indexOfValue,
  nextEnabledIndex,
  firstEnabledIndex,
  lastEnabledIndex,
  keyboardTarget,
  wrapIndex,
  cyclicVirtualCount,
  cyclicCenterIndex,
  cyclicRecenter,
  momentumStep,
  projectSettleIndex,
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

describe('cyclic 循环索引', () => {
  it('wrapIndex 正取模折回 [0,count)', () => {
    expect(wrapIndex(0, 24)).toBe(0);
    expect(wrapIndex(24, 24)).toBe(0);
    expect(wrapIndex(25, 24)).toBe(1);
    expect(wrapIndex(-1, 24)).toBe(23);
    expect(wrapIndex(-25, 24)).toBe(23);
    expect(wrapIndex(5, 0)).toBe(0);
  });

  it('cyclicVirtualCount 重复奇数份', () => {
    expect(cyclicVirtualCount(24, 5)).toBe(120);
    expect(cyclicVirtualCount(24, 4)).toBe(120); // 4 |1 = 5
    expect(cyclicVirtualCount(24, 1)).toBe(72); // min 3
    expect(cyclicVirtualCount(0, 5)).toBe(0);
  });

  it('cyclicCenterIndex 映射到中段', () => {
    // count=24, repeat=5 → mid=2 → 中段从 48 起
    expect(cyclicCenterIndex(9, 24, 5)).toBe(57);
    expect(cyclicCenterIndex(0, 24, 5)).toBe(48);
    expect(cyclicCenterIndex(24 + 9, 24, 5)).toBe(57); // 同余
  });

  it('cyclicRecenter 仅在边界外重定位', () => {
    // total=120, 安全区 [24,96)
    expect(cyclicRecenter(57, 24, 5)).toBe(57); // 区内不动
    expect(cyclicRecenter(10, 24, 5)).toBe(cyclicCenterIndex(10, 24, 5)); // 越下界
    expect(cyclicRecenter(100, 24, 5)).toBe(cyclicCenterIndex(wrapIndex(100, 24), 24, 5));
    // 重定位后必同余
    expect(wrapIndex(cyclicRecenter(5, 24, 5), 24)).toBe(5);
  });
});

describe('惯性物理 momentum', () => {
  it('momentumStep 按帧指数衰减且方向不变', () => {
    const s = momentumStep(1, 16.67, 0.95, 0.02);
    expect(s.velocity).toBeLessThan(1);
    expect(s.velocity).toBeGreaterThan(0);
    expect(s.delta).toBeGreaterThan(0);
    expect(s.done).toBe(false);
  });

  it('momentumStep 低于阈值标记 done', () => {
    const s = momentumStep(0.01, 16.67, 0.95, 0.02);
    expect(s.done).toBe(true);
  });

  it('momentumStep 负速度（向上）位移为负', () => {
    const s = momentumStep(-1, 16.67);
    expect(s.delta).toBeLessThan(0);
    expect(s.velocity).toBeGreaterThan(-1);
  });

  it('momentumStep 连续推进速度单调收敛到 0', () => {
    let v = 2;
    for (let i = 0; i < 200; i += 1) v = momentumStep(v, 16.67).velocity;
    expect(Math.abs(v)).toBeLessThan(0.02);
  });

  it('projectSettleIndex 含速度前瞻并 clamp', () => {
    // scrollTop 0，速度 0 → 行 0
    expect(projectSettleIndex(0, 0, 36, 24)).toBe(0);
    // scrollTop=360（行10），向下速度前瞻 80px：(360+80)/36≈12.2 → round 12
    expect(projectSettleIndex(360, 1, 36, 24, 80)).toBe(12);
    // clamp 到末行
    expect(projectSettleIndex(99999, 5, 36, 24)).toBe(23);
    // clamp 到首行
    expect(projectSettleIndex(0, -5, 36, 24)).toBe(0);
    expect(projectSettleIndex(0, 0, 0, 24)).toBe(0);
  });
});
