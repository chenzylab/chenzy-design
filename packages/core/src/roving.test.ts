import { describe, expect, it } from 'vitest';
import { rovingKeyFromEvent, nextRovingIndex } from './roving.js';

describe('rovingKeyFromEvent', () => {
  it('maps vertical and horizontal arrows', () => {
    expect(rovingKeyFromEvent('ArrowUp')).toBe('prev');
    expect(rovingKeyFromEvent('ArrowLeft')).toBe('prev');
    expect(rovingKeyFromEvent('ArrowDown')).toBe('next');
    expect(rovingKeyFromEvent('ArrowRight')).toBe('next');
  });
  it('maps Home/End', () => {
    expect(rovingKeyFromEvent('Home')).toBe('first');
    expect(rovingKeyFromEvent('End')).toBe('last');
  });
  it('returns null for non-navigation keys', () => {
    expect(rovingKeyFromEvent('Enter')).toBeNull();
    expect(rovingKeyFromEvent(' ')).toBeNull();
    expect(rovingKeyFromEvent('a')).toBeNull();
  });
});

describe('nextRovingIndex', () => {
  it('moves next/prev within bounds', () => {
    expect(nextRovingIndex(0, 5, 'next')).toBe(1);
    expect(nextRovingIndex(3, 5, 'prev')).toBe(2);
  });
  it('clamps at ends without wrap', () => {
    expect(nextRovingIndex(4, 5, 'next')).toBe(4);
    expect(nextRovingIndex(0, 5, 'prev')).toBe(0);
  });
  it('wraps at ends when wrap=true', () => {
    expect(nextRovingIndex(4, 5, 'next', true)).toBe(0);
    expect(nextRovingIndex(0, 5, 'prev', true)).toBe(4);
  });
  it('first/last jump to ends', () => {
    expect(nextRovingIndex(2, 5, 'first')).toBe(0);
    expect(nextRovingIndex(2, 5, 'last')).toBe(4);
  });
  it('treats negative current as 0', () => {
    expect(nextRovingIndex(-1, 5, 'next')).toBe(1);
    expect(nextRovingIndex(-1, 5, 'prev')).toBe(0);
  });
  it('returns -1 when empty', () => {
    expect(nextRovingIndex(0, 0, 'next')).toBe(-1);
  });
  it('clamps out-of-range current', () => {
    expect(nextRovingIndex(99, 5, 'prev')).toBe(3);
  });
});
