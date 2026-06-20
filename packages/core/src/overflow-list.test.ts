import { describe, expect, it } from 'vitest';
import { computeVisibleCount, applyHysteresis, computeTabOverflow } from './overflow-list.js';

// five items, each 100px wide, gap 0 for easy arithmetic
const sizes = [100, 100, 100, 100, 100];

describe('computeVisibleCount', () => {
  it('shows everything when it all fits', () => {
    expect(computeVisibleCount({ itemSizes: sizes, containerSize: 500, overflowSize: 40, gap: 0 })).toEqual({
      visibleCount: 5,
      overflowCount: 0,
    });
    // exact fit
    expect(computeVisibleCount({ itemSizes: sizes, containerSize: 500, overflowSize: 40, gap: 0 }).overflowCount).toBe(0);
  });

  it('collapses when one px short, reserving the overflow node', () => {
    // 499 < 500 total → must collapse; reserve 40 for overflow node.
    // fit n items with +40: n=4 → 400+40=440 ≤ 499 ✓ ; n=5 not needed (collapse path)
    const r = computeVisibleCount({ itemSizes: sizes, containerSize: 499, overflowSize: 40, gap: 0 });
    expect(r).toEqual({ visibleCount: 4, overflowCount: 1 });
  });

  it('accounts for gaps', () => {
    // container 360, gap 10, overflow 40. all: 5*100+4*10=540 > 360 → collapse.
    // n items + reserved(40+10): n=2 → 200+10 +50 =260 ≤360 ; n=3 →300+20+50=370 >360 → visible 2
    const r = computeVisibleCount({ itemSizes: sizes, containerSize: 360, overflowSize: 40, gap: 10 });
    expect(r).toEqual({ visibleCount: 2, overflowCount: 3 });
  });

  it('handles total overflow (nothing fits with overflow node) → at least 0', () => {
    const r = computeVisibleCount({ itemSizes: sizes, containerSize: 50, overflowSize: 40, gap: 0 });
    expect(r.visibleCount).toBe(0);
    expect(r.overflowCount).toBe(5);
  });

  it('respects minVisibleItems (prefer overflow row over hiding too much)', () => {
    const r = computeVisibleCount({
      itemSizes: sizes,
      containerSize: 150,
      overflowSize: 40,
      gap: 0,
      minVisibleItems: 3,
    });
    expect(r.visibleCount).toBe(3);
    expect(r.overflowCount).toBe(2);
  });

  it('respects alwaysVisible indexes', () => {
    // container only fits 1 normally, but index 2 must stay visible → floor to 3
    const r = computeVisibleCount({
      itemSizes: sizes,
      containerSize: 150,
      overflowSize: 40,
      gap: 0,
      alwaysVisible: [2],
    });
    expect(r.visibleCount).toBe(3);
  });

  it('floor that covers all items removes overflow', () => {
    const r = computeVisibleCount({
      itemSizes: sizes,
      containerSize: 150,
      overflowSize: 40,
      gap: 0,
      minVisibleItems: 5,
    });
    expect(r).toEqual({ visibleCount: 5, overflowCount: 0 });
  });

  it('empty input', () => {
    expect(computeVisibleCount({ itemSizes: [], containerSize: 500, overflowSize: 40, gap: 0 })).toEqual({
      visibleCount: 0,
      overflowCount: 0,
    });
  });
});

describe('applyHysteresis', () => {
  it('keeps more items visible inside the dead-band', () => {
    // container wobbled by 5px (≤ threshold 8); next would collapse to 3, prev was 4 → keep 4
    expect(applyHysteresis(4, 3, 500, 495, 8)).toBe(4);
  });

  it('applies the new count for a real resize beyond threshold', () => {
    expect(applyHysteresis(4, 2, 500, 400, 8)).toBe(2);
  });

  it('no change when next equals prev', () => {
    expect(applyHysteresis(4, 4, 500, 498, 8)).toBe(4);
  });
});

describe('computeTabOverflow', () => {
  it('shows all tabs when everything fits', () => {
    expect(
      computeTabOverflow({ tabSizes: sizes, containerSize: 500, moreSize: 40, gap: 0 }),
    ).toEqual({ visibleIndexes: [0, 1, 2, 3, 4], overflowIndexes: [] });
  });

  it('collapses trailing tabs into overflow when short', () => {
    // 360, gap 10, more 40 → 2 leading fit (same math as computeVisibleCount)
    expect(
      computeTabOverflow({ tabSizes: sizes, containerSize: 360, moreSize: 40, gap: 10 }),
    ).toEqual({ visibleIndexes: [0, 1], overflowIndexes: [2, 3, 4] });
  });

  it('keeps the active tab visible by swapping it into the last visible slot', () => {
    // Only 2 leading tabs fit; active is index 4 (would overflow). Swap: drop
    // last visible (index 1), surface index 4 → visible {0,4}.
    expect(
      computeTabOverflow({
        tabSizes: sizes,
        containerSize: 360,
        moreSize: 40,
        gap: 10,
        activeIndex: 4,
      }),
    ).toEqual({ visibleIndexes: [0, 4], overflowIndexes: [1, 2, 3] });
  });

  it('does not swap when the active tab is already visible', () => {
    expect(
      computeTabOverflow({
        tabSizes: sizes,
        containerSize: 360,
        moreSize: 40,
        gap: 10,
        activeIndex: 0,
      }),
    ).toEqual({ visibleIndexes: [0, 1], overflowIndexes: [2, 3, 4] });
  });

  it('handles empty input', () => {
    expect(
      computeTabOverflow({ tabSizes: [], containerSize: 500, moreSize: 40, gap: 0 }),
    ).toEqual({ visibleIndexes: [], overflowIndexes: [] });
  });
});
