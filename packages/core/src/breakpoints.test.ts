import { describe, expect, it } from 'vitest';
import {
  BREAKPOINTS,
  resolveActiveBreakpoint,
  resolveResponsiveValue,
} from './breakpoints.js';

describe('resolveActiveBreakpoint', () => {
  it('returns xs below the sm threshold', () => {
    expect(resolveActiveBreakpoint(0)).toBe('xs');
    expect(resolveActiveBreakpoint(575)).toBe('xs');
  });
  it('returns the exact tier at its min-width boundary', () => {
    expect(resolveActiveBreakpoint(BREAKPOINTS.sm)).toBe('sm');
    expect(resolveActiveBreakpoint(BREAKPOINTS.md)).toBe('md');
    expect(resolveActiveBreakpoint(BREAKPOINTS.lg)).toBe('lg');
    expect(resolveActiveBreakpoint(BREAKPOINTS.xl)).toBe('xl');
    expect(resolveActiveBreakpoint(BREAKPOINTS.xxl)).toBe('xxl');
  });
  it('returns the largest tier whose min-width is ≤ width', () => {
    expect(resolveActiveBreakpoint(700)).toBe('sm'); // 576 ≤ 700 < 768
    expect(resolveActiveBreakpoint(1000)).toBe('lg'); // 992 ≤ 1000 < 1200
    expect(resolveActiveBreakpoint(5000)).toBe('xxl');
  });
});

describe('resolveResponsiveValue', () => {
  it('returns the exact value when the active tier is set', () => {
    expect(resolveResponsiveValue({ xs: 24, md: 12 }, 'md', 0)).toBe(12);
  });
  it('cascades up from the nearest smaller tier (mobile-first)', () => {
    // lg unset → falls back to md
    expect(resolveResponsiveValue({ xs: 24, md: 12 }, 'lg', 0)).toBe(12);
    // xxl unset → cascades all the way to xs
    expect(resolveResponsiveValue({ xs: 24 }, 'xxl', 0)).toBe(24);
  });
  it('does NOT cascade down from a larger tier', () => {
    // only md set, active is sm → no smaller value → fallback
    expect(resolveResponsiveValue({ md: 12 }, 'sm', 99)).toBe(99);
  });
  it('returns the fallback when the map is empty', () => {
    expect(resolveResponsiveValue<number>({}, 'lg', 8)).toBe(8);
  });
  it('treats 0 as a present value (not missing)', () => {
    expect(resolveResponsiveValue({ xs: 0, lg: 6 }, 'sm', 99)).toBe(0);
  });
  it('works with object values (span/offset config)', () => {
    const cfg = { xs: { span: 24 }, lg: { span: 8, offset: 2 } };
    expect(resolveResponsiveValue(cfg, 'xl', { span: 24 })).toEqual({ span: 8, offset: 2 });
  });
});
