import { describe, expect, it } from 'vitest';
import {
  pageCount,
  clampPage,
  isPageInRange,
  clampPageSize,
  parseJumpInput,
  pageRange,
  type PageCell,
} from './pagination.js';

/** Compact a PageCell[] into a readable token list, e.g. [1,'<',5,'>',10]. */
function tokens(cells: PageCell[]): (number | string)[] {
  return cells.map((c) => (c.type === 'page' ? c.value : c.position === 'prev' ? '<' : '>'));
}

describe('pageCount', () => {
  it('computes ceil(total / pageSize)', () => {
    expect(pageCount(100, 10)).toBe(10);
    expect(pageCount(101, 10)).toBe(11);
    expect(pageCount(5, 10)).toBe(1);
  });

  it('is always at least 1', () => {
    expect(pageCount(0, 10)).toBe(1);
    expect(pageCount(-5, 10)).toBe(1);
  });

  it('guards invalid pageSize', () => {
    expect(pageCount(100, 0)).toBe(1);
    expect(pageCount(100, -10)).toBe(1);
    expect(pageCount(100, Number.NaN)).toBe(1);
    expect(pageCount(Number.POSITIVE_INFINITY, 10)).toBe(1);
  });
});

describe('clampPage', () => {
  it('returns the page unchanged when in range', () => {
    expect(clampPage(3, 100, 10)).toBe(3);
    expect(clampPage(1, 100, 10)).toBe(1);
    expect(clampPage(10, 100, 10)).toBe(10);
  });

  it('clamps below the lower bound to 1', () => {
    expect(clampPage(0, 100, 10)).toBe(1);
    expect(clampPage(-5, 100, 10)).toBe(1);
  });

  it('clamps above the upper bound to the last page', () => {
    expect(clampPage(11, 100, 10)).toBe(10);
    expect(clampPage(999, 100, 10)).toBe(10);
  });

  it('truncates non-integers', () => {
    expect(clampPage(3.9, 100, 10)).toBe(3);
  });

  it('falls back to 1 on non-finite input', () => {
    expect(clampPage(Number.NaN, 100, 10)).toBe(1);
    expect(clampPage(Number.POSITIVE_INFINITY, 100, 10)).toBe(1);
    expect(clampPage(Number.NEGATIVE_INFINITY, 100, 10)).toBe(1);
  });

  it('handles empty datasets (always page 1)', () => {
    expect(clampPage(5, 0, 10)).toBe(1);
  });
});

describe('isPageInRange', () => {
  it('flips at the boundaries', () => {
    expect(isPageInRange(0, 100, 10)).toBe(false);
    expect(isPageInRange(1, 100, 10)).toBe(true);
    expect(isPageInRange(10, 100, 10)).toBe(true);
    expect(isPageInRange(11, 100, 10)).toBe(false);
  });

  it('rejects non-integers', () => {
    expect(isPageInRange(3.5, 100, 10)).toBe(false);
    expect(isPageInRange(Number.NaN, 100, 10)).toBe(false);
  });
});

describe('clampPageSize', () => {
  const opts = [10, 20, 50, 100];

  it('keeps a valid option', () => {
    expect(clampPageSize(20, opts, 10)).toBe(20);
  });

  it('falls back when not in options', () => {
    expect(clampPageSize(7, opts, 10)).toBe(10);
  });

  it('falls back on invalid values', () => {
    expect(clampPageSize(0, opts, 10)).toBe(10);
    expect(clampPageSize(-5, opts, 10)).toBe(10);
    expect(clampPageSize(Number.NaN, opts, 10)).toBe(10);
  });

  it('allows any positive value when options is empty', () => {
    expect(clampPageSize(7, [], 10)).toBe(7);
    expect(clampPageSize(0, [], 10)).toBe(10);
  });
});

describe('parseJumpInput', () => {
  it('parses and returns an in-range page', () => {
    expect(parseJumpInput('3', 100, 10)).toBe(3);
  });

  it('clamps out-of-range input', () => {
    expect(parseJumpInput('999', 100, 10)).toBe(10);
    expect(parseJumpInput('0', 100, 10)).toBe(1);
    expect(parseJumpInput('-5', 100, 10)).toBe(1);
  });

  it('returns null for empty / non-numeric input', () => {
    expect(parseJumpInput('', 100, 10)).toBeNull();
    expect(parseJumpInput('   ', 100, 10)).toBeNull();
    expect(parseJumpInput('abc', 100, 10)).toBeNull();
    expect(parseJumpInput('1.5', 100, 10)).toBeNull();
    expect(parseJumpInput('3px', 100, 10)).toBeNull();
  });

  it('trims surrounding whitespace', () => {
    expect(parseJumpInput('  4  ', 100, 10)).toBe(4);
  });
});

describe('pageRange', () => {
  it('lists every page when the window covers them (no ellipsis)', () => {
    // default sibling=1, boundary=1 → list all when count <= 9
    expect(tokens(pageRange(1, 7))).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(tokens(pageRange(3, 5))).toEqual([1, 2, 3, 4, 5]);
    expect(tokens(pageRange(1, 1))).toEqual([1]);
  });

  it('folds the right side when current is near the start', () => {
    expect(tokens(pageRange(1, 10))).toEqual([1, 2, 3, 4, 5, '>', 10]);
    expect(tokens(pageRange(3, 10))).toEqual([1, 2, 3, 4, 5, '>', 10]);
  });

  it('folds the left side when current is near the end', () => {
    expect(tokens(pageRange(10, 10))).toEqual([1, '<', 6, 7, 8, 9, 10]);
    expect(tokens(pageRange(8, 10))).toEqual([1, '<', 6, 7, 8, 9, 10]);
  });

  it('folds both sides when current is in the middle', () => {
    expect(tokens(pageRange(5, 10))).toEqual([1, '<', 4, 5, 6, '>', 10]);
    expect(tokens(pageRange(50, 100))).toEqual([1, '<', 49, 50, 51, '>', 100]);
  });

  it('never renders an ellipsis that would hide only one page', () => {
    // gap between boundary(1) and sibling window would be a single page → show it
    expect(tokens(pageRange(4, 10))).toEqual([1, 2, 3, 4, 5, '>', 10]);
    expect(tokens(pageRange(7, 10))).toEqual([1, '<', 6, 7, 8, 9, 10]);
  });

  it('honours siblingCount', () => {
    // wider window keeps the left side contiguous (no left ellipsis needed)
    expect(tokens(pageRange(5, 20, 2))).toEqual([1, 2, 3, 4, 5, 6, 7, '>', 20]);
    expect(tokens(pageRange(10, 20, 2))).toEqual([1, '<', 8, 9, 10, 11, 12, '>', 20]);
    expect(tokens(pageRange(5, 20, 0))).toEqual([1, '<', 5, '>', 20]);
  });

  it('honours boundaryCount', () => {
    expect(tokens(pageRange(10, 20, 1, 2))).toEqual([1, 2, '<', 9, 10, 11, '>', 19, 20]);
    expect(tokens(pageRange(10, 20, 1, 0))).toEqual(['<', 9, 10, 11, '>']);
  });

  it('keeps cell count O(1) regardless of total pages', () => {
    const small = pageRange(500_000, 1_000_000);
    const huge = pageRange(500_000, 1_000_000_000);
    expect(small.length).toBe(huge.length);
    expect(tokens(small)).toEqual([1, '<', 499999, 500000, 500001, '>', 1000000]);
  });

  it('sanitises invalid inputs', () => {
    expect(tokens(pageRange(Number.NaN, 10))).toEqual([1, 2, 3, 4, 5, '>', 10]); // current→1
    expect(tokens(pageRange(99, 10))).toEqual([1, '<', 6, 7, 8, 9, 10]); // current clamped to 10
    expect(tokens(pageRange(5, 10, -1, -1))).toEqual(['<', 5, '>']); // sibling/boundary→0
    expect(tokens(pageRange(1, 0))).toEqual([1]); // count floored to 1
  });
});
