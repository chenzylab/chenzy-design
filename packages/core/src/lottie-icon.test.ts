import { describe, expect, it } from 'vitest';
import {
  resolveSize,
  resolveAnimated,
  shouldAutoplay,
  resolveSegments,
  isLottieSrc,
} from './lottie-icon.js';

describe('resolveSize', () => {
  it('maps size tokens to px', () => {
    expect(resolveSize('small')).toBe(16);
    expect(resolveSize('default')).toBe(20);
    expect(resolveSize('large')).toBe(24);
  });
  it('passes through raw numbers', () => {
    expect(resolveSize(48)).toBe(48);
  });
});

describe('resolveAnimated', () => {
  it('explicit reducedMotion prop wins over system', () => {
    expect(resolveAnimated(true, false)).toBe(false); // forced reduce → not animated
    expect(resolveAnimated(false, true)).toBe(true); // forced motion → animated despite system
  });
  it('follows system when prop is undefined', () => {
    expect(resolveAnimated(undefined, false)).toBe(true); // system not reduced → animated
    expect(resolveAnimated(undefined, true)).toBe(false); // system reduced → not animated
  });
});

describe('shouldAutoplay', () => {
  it('auto + autoplay + animated → true', () => {
    expect(shouldAutoplay('auto', true, true)).toBe(true);
  });
  it('not animated (reduced-motion) → never autoplay', () => {
    expect(shouldAutoplay('auto', true, false)).toBe(false);
  });
  it('autoplay=false → no autoplay', () => {
    expect(shouldAutoplay('auto', false, true)).toBe(false);
  });
  it('hover/manual triggers never autoplay', () => {
    expect(shouldAutoplay('hover', true, true)).toBe(false);
    expect(shouldAutoplay('manual', true, true)).toBe(false);
  });
});

describe('resolveSegments', () => {
  it('passes through a numeric frame pair', () => {
    expect(resolveSegments([10, 60], null)).toEqual([10, 60]);
  });
  it('returns null for undefined / invalid pairs', () => {
    expect(resolveSegments(undefined, null)).toBeNull();
    // @ts-expect-error invalid tuple
    expect(resolveSegments(['a', 'b'], null)).toBeNull();
    expect(resolveSegments([NaN, 5], null)).toBeNull();
  });
  it('resolves a named marker against data.markers (tm + dr)', () => {
    const data = { markers: [{ cm: 'hover', tm: 30, dr: 20 }, { cm: 'idle', tm: 0, dr: 30 }] };
    expect(resolveSegments('hover', data)).toEqual([30, 50]);
    expect(resolveSegments('idle', data)).toEqual([0, 30]);
  });
  it('returns null when marker missing or no markers', () => {
    expect(resolveSegments('nope', { markers: [{ cm: 'x', tm: 1, dr: 1 }] })).toBeNull();
    expect(resolveSegments('x', {})).toBeNull();
    expect(resolveSegments('x', null)).toBeNull();
  });
  it('treats marker without dr as a zero-length point', () => {
    expect(resolveSegments('p', { markers: [{ cm: 'p', tm: 12 }] })).toEqual([12, 12]);
  });
});

describe('isLottieSrc', () => {
  it('true for non-empty strings', () => {
    expect(isLottieSrc('https://x/a.json')).toBe(true);
    expect(isLottieSrc('  /local.json ')).toBe(true);
  });
  it('false for empty / non-string', () => {
    expect(isLottieSrc('')).toBe(false);
    expect(isLottieSrc('   ')).toBe(false);
    expect(isLottieSrc(undefined)).toBe(false);
    expect(isLottieSrc({})).toBe(false);
  });
});
