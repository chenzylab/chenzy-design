import { describe, it, expect, beforeEach } from 'vitest';
import {
  roundToPrecision,
  decimalsOfNumber,
  addNumberStep,
  formatWithLocale,
  __resetNumberFormatCache,
} from './index.js';

describe('roundToPrecision', () => {
  it('rounds to given decimals', () => {
    expect(roundToPrecision(1.2345, 2)).toBe(1.23);
    expect(roundToPrecision(1.235, 2)).toBe(1.24);
  });

  it('passes through when precision undefined', () => {
    expect(roundToPrecision(1.2345)).toBe(1.2345);
  });
});

describe('decimalsOfNumber', () => {
  it('counts decimals', () => {
    expect(decimalsOfNumber(1)).toBe(0);
    expect(decimalsOfNumber(1.5)).toBe(1);
    expect(decimalsOfNumber(0.001)).toBe(3);
  });
});

describe('addNumberStep', () => {
  it('avoids float drift', () => {
    expect(addNumberStep(0.1, 0.2)).toBe(0.3);
    expect(addNumberStep(0.3, -0.1)).toBe(0.2);
  });

  it('handles integers', () => {
    expect(addNumberStep(5, 1)).toBe(6);
    expect(addNumberStep(5, -10)).toBe(-5);
  });
});

describe('formatWithLocale', () => {
  beforeEach(() => __resetNumberFormatCache());

  it('formats with grouping per locale', () => {
    expect(formatWithLocale(1234567, 'en-US')).toBe('1,234,567');
  });

  it('honors options', () => {
    expect(formatWithLocale(0.5, 'en-US', { style: 'percent' })).toBe('50%');
  });

  it('caches instances per (locale, options)', () => {
    const a = formatWithLocale(1, 'en-US');
    const b = formatWithLocale(2, 'en-US');
    expect(a).toBe('1');
    expect(b).toBe('2');
  });
});
