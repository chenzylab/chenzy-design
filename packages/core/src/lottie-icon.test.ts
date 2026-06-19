import { describe, expect, it } from 'vitest';
import { resolveSize, resolveAnimated, shouldAutoplay } from './lottie-icon.js';

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
