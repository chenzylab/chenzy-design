import { describe, expect, it } from 'vitest';
import {
  pageCount,
  clampPage,
  isPageInRange,
  clampPageSize,
  parseJumpInput,
} from './pagination.js';

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
