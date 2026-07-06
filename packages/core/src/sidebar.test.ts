import { describe, it, expect } from 'vitest';
import { parseSideBarWidth, clampSideBarWidth } from './sidebar.js';

describe('parseSideBarWidth', () => {
  it('returns numbers as-is', () => {
    expect(parseSideBarWidth(400)).toBe(400);
    expect(parseSideBarWidth(0)).toBe(0);
  });
  it('parses px strings', () => {
    expect(parseSideBarWidth('320px')).toBe(320);
  });
  it('parses bare numeric strings', () => {
    expect(parseSideBarWidth('250')).toBe(250);
  });
  it('returns undefined for nullish / non-finite', () => {
    expect(parseSideBarWidth(undefined)).toBeUndefined();
    expect(parseSideBarWidth('auto')).toBeUndefined();
    expect(parseSideBarWidth(Number.NaN)).toBeUndefined();
  });
});

describe('clampSideBarWidth', () => {
  it('clamps to min', () => {
    expect(clampSideBarWidth(100, 150, undefined)).toBe(150);
  });
  it('clamps to max', () => {
    expect(clampSideBarWidth(900, undefined, 600)).toBe(600);
  });
  it('passes through when in range', () => {
    expect(clampSideBarWidth(300, 150, 600)).toBe(300);
  });
  it('handles both bounds undefined', () => {
    expect(clampSideBarWidth(300, undefined, undefined)).toBe(300);
  });
});
