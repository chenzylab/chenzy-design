import { describe, expect, it } from 'vitest';
import {
  fixedRange,
  buildOffsets,
  totalFromOffsets,
  offsetToIndex,
  dynamicRange,
  scrollOffsetForIndex,
  windowScrollTop,
} from './virtual-list.js';

describe('fixedRange', () => {
  it('computes visible range with overscan', () => {
    // itemSize 40, viewport 200 → 5 rows visible; overscan 2.
    const r = fixedRange(0, 200, 40, 1000, 2);
    expect(r.startIndex).toBe(0); // 0 - 2 clamped
    expect(r.endIndex).toBe(7); // ceil(200/40)=5 + 2
  });

  it('shifts with scrollTop', () => {
    const r = fixedRange(400, 200, 40, 1000, 2);
    expect(r.startIndex).toBe(8); // floor(400/40)=10 - 2
    expect(r.endIndex).toBe(17); // ceil(600/40)=15 + 2
  });

  it('clamps to count', () => {
    const r = fixedRange(99999, 200, 40, 10, 2);
    expect(r.startIndex).toBe(10);
    expect(r.endIndex).toBe(10);
  });

  it('handles degenerate inputs', () => {
    expect(fixedRange(0, 200, 0, 10, 2)).toEqual({ startIndex: 0, endIndex: 0 });
    expect(fixedRange(0, 200, 40, 0, 2)).toEqual({ startIndex: 0, endIndex: 0 });
  });
});

describe('buildOffsets / totalFromOffsets', () => {
  it('builds a prefix-sum table', () => {
    const offsets = buildOffsets([10, 20, 30]);
    expect(offsets).toEqual([0, 10, 30, 60]);
    expect(totalFromOffsets(offsets)).toBe(60);
  });

  it('treats negative / missing heights as 0', () => {
    const offsets = buildOffsets([10, -5, 30]);
    expect(offsets).toEqual([0, 10, 10, 40]);
  });

  it('empty', () => {
    expect(buildOffsets([])).toEqual([0]);
    expect(totalFromOffsets([])).toBe(0);
  });
});

describe('offsetToIndex (binary search)', () => {
  // heights: [10, 20, 30, 40] → offsets [0,10,30,60,100]
  const offsets = buildOffsets([10, 20, 30, 40]);

  it('finds the first item partially visible', () => {
    expect(offsetToIndex(offsets, 0)).toBe(0);
    expect(offsetToIndex(offsets, 5)).toBe(0); // within item 0
    expect(offsetToIndex(offsets, 10)).toBe(1); // exactly at item 1 top
    expect(offsetToIndex(offsets, 25)).toBe(1); // within item 1
    expect(offsetToIndex(offsets, 30)).toBe(2);
    expect(offsetToIndex(offsets, 59)).toBe(2);
    expect(offsetToIndex(offsets, 60)).toBe(3);
  });

  it('clamps beyond range and below 0', () => {
    expect(offsetToIndex(offsets, 9999)).toBe(3);
    expect(offsetToIndex(offsets, -50)).toBe(0);
  });

  it('empty table', () => {
    expect(offsetToIndex([0], 10)).toBe(0);
  });
});

describe('dynamicRange', () => {
  // 100 items, all 50px → offsets total 5000.
  const offsets = buildOffsets(Array.from({ length: 100 }, () => 50));

  it('matches fixed math when heights uniform', () => {
    const r = dynamicRange(offsets, 0, 200, 2);
    expect(r.startIndex).toBe(0);
    // first visible 0, last visible at 200 → item 4 (200 within item 4 top=200)
    // last = offsetToIndex(200) = 4, end = 4 + 1 + 2 = 7
    expect(r.endIndex).toBe(7);
  });

  it('shifts with scroll', () => {
    const r = dynamicRange(offsets, 500, 200, 2);
    // first = offsetToIndex(500) = 10, start = 8
    expect(r.startIndex).toBe(8);
    // last = offsetToIndex(700) = 14, end = 17
    expect(r.endIndex).toBe(17);
  });

  it('handles variable heights', () => {
    // [100, 100, 50, 50, 50, ...] mixed
    const mixed = buildOffsets([100, 100, 50, 50, 50, 50, 50]);
    // offsets: [0,100,200,250,300,350,400,450]
    const r = dynamicRange(mixed, 100, 100, 0);
    // first = offsetToIndex(100) = 1, last = offsetToIndex(200) = 2
    expect(r.startIndex).toBe(1);
    expect(r.endIndex).toBe(3);
  });

  it('empty', () => {
    expect(dynamicRange([0], 0, 200, 2)).toEqual({ startIndex: 0, endIndex: 0 });
  });
});

describe('windowScrollTop', () => {
  it('is 0 before the container has been scrolled past', () => {
    // container starts 500px down the document; window not scrolled.
    expect(windowScrollTop(500, 0, 4000)).toBe(0);
    // scrolled to the container top exactly.
    expect(windowScrollTop(500, 500, 4000)).toBe(0);
  });

  it('tracks how far the document scrolled past the container top', () => {
    expect(windowScrollTop(500, 800, 4000)).toBe(300);
    expect(windowScrollTop(0, 1000, 4000)).toBe(1000);
  });

  it('clamps to [0, total]', () => {
    expect(windowScrollTop(500, 200, 4000)).toBe(0); // negative → 0
    expect(windowScrollTop(0, 99999, 4000)).toBe(4000); // beyond total
  });

  it('handles total <= 0', () => {
    expect(windowScrollTop(0, 500, 0)).toBe(0);
  });

  it('feeds fixedRange like internal scrollTop does', () => {
    // container at doc-top 1000, window scrolled to 1400 → local 400.
    const local = windowScrollTop(1000, 1400, 40 * 1000);
    expect(local).toBe(400);
    const r = fixedRange(local, 200, 40, 1000, 2);
    expect(r.startIndex).toBe(8);
    expect(r.endIndex).toBe(17);
  });
});

describe('scrollOffsetForIndex', () => {
  // fixed: itemSize 40, viewport 200, total 1000*40 = 40000.
  it('align=start places the item leading edge at viewport start', () => {
    // index 10 → itemStart 400.
    expect(scrollOffsetForIndex(400, 40, 200, 40000, 'start')).toBe(400);
  });

  it('align=center centers the item', () => {
    // 400 - (200 - 40)/2 = 400 - 80 = 320.
    expect(scrollOffsetForIndex(400, 40, 200, 40000, 'center')).toBe(320);
  });

  it('align=end aligns trailing edges', () => {
    // 400 - (200 - 40) = 240.
    expect(scrollOffsetForIndex(400, 40, 200, 40000, 'end')).toBe(240);
  });

  it('defaults to start', () => {
    expect(scrollOffsetForIndex(400, 40, 200, 40000)).toBe(400);
  });

  it('clamps to the reachable scroll range', () => {
    // last item itemStart 39960; max scroll = 40000 - 200 = 39800.
    expect(scrollOffsetForIndex(39960, 40, 200, 40000, 'start')).toBe(39800);
    // negative target (center near top) clamps to 0.
    expect(scrollOffsetForIndex(0, 40, 200, 40000, 'center')).toBe(0);
  });

  it('works with dynamic offsets (itemStart from prefix-sum)', () => {
    const offsets = buildOffsets([100, 100, 50, 50, 50]); // [0,100,200,250,300,350]
    const total = totalFromOffsets(offsets); // 350
    // index 3 → itemStart offsets[3]=250, itemSize 50, viewport 120, total 350.
    // start: 250 clamped to max(0, 350-120)=230 → 230.
    expect(scrollOffsetForIndex(offsets[3]!, 50, 120, total, 'start')).toBe(230);
  });
});
