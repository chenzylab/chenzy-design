import { describe, expect, it } from 'vitest';
import { getMiddle, getAspectHW } from './utils.js';

describe('cropper utils', () => {
  it('getMiddle clamps to [min, max]', () => {
    expect(getMiddle(5, [0, 10])).toBe(5);
    expect(getMiddle(-3, [0, 10])).toBe(0);
    expect(getMiddle(99, [0, 10])).toBe(10);
  });

  it('getAspectHW fits a box to a target aspect (w/h)', () => {
    // wide outer box, aspect 1 → shrink width to match height
    expect(getAspectHW(200, 100, 1)).toEqual([100, 100]);
    // tall outer box, aspect 2 → shrink height to match width
    expect(getAspectHW(100, 200, 2)).toEqual([100, 50]);
  });
});
