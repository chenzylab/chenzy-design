import { describe, expect, it } from 'vitest';
import { easeInOutCubic, isAboveThreshold, scrollPositionAt } from './back-top.js';

describe('easeInOutCubic', () => {
  it('clamps endpoints', () => {
    expect(easeInOutCubic(0)).toBe(0);
    expect(easeInOutCubic(1)).toBe(1);
    expect(easeInOutCubic(-0.5)).toBe(0);
    expect(easeInOutCubic(2)).toBe(1);
  });

  it('is symmetric around the midpoint', () => {
    expect(easeInOutCubic(0.5)).toBeCloseTo(0.5, 5);
    // ease(t) + ease(1-t) === 1 for cubic in-out
    expect(easeInOutCubic(0.25) + easeInOutCubic(0.75)).toBeCloseTo(1, 5);
  });

  it('eases slowly at the start', () => {
    // at t=0.25 the cubic-in segment is well below linear 0.25
    expect(easeInOutCubic(0.25)).toBeLessThan(0.25);
  });
});

describe('isAboveThreshold', () => {
  it('flips exactly at the threshold', () => {
    expect(isAboveThreshold(399, 400)).toBe(false);
    expect(isAboveThreshold(400, 400)).toBe(true);
    expect(isAboveThreshold(401, 400)).toBe(true);
  });
});

describe('scrollPositionAt', () => {
  it('starts at `from` and ends at 0', () => {
    expect(scrollPositionAt(800, 0, 450)).toBe(800);
    expect(scrollPositionAt(800, 450, 450)).toBe(0);
    expect(scrollPositionAt(800, 1000, 450)).toBe(0); // past end clamps
  });

  it('duration 0 jumps straight to 0', () => {
    expect(scrollPositionAt(800, 0, 0)).toBe(0);
  });

  it('is monotonically decreasing', () => {
    const a = scrollPositionAt(1000, 100, 450);
    const b = scrollPositionAt(1000, 200, 450);
    const c = scrollPositionAt(1000, 300, 450);
    expect(a).toBeGreaterThan(b);
    expect(b).toBeGreaterThan(c);
  });
});
