import { describe, expect, it } from 'vitest';
import { interpolate } from './format.js';

describe('interpolate', () => {
  it('replaces named placeholders', () => {
    expect(interpolate('共 {total} 条', { total: 5 })).toBe('共 5 条');
  });
  it('leaves unknown placeholders intact', () => {
    expect(interpolate('{a}-{b}', { a: 1 })).toBe('1-{b}');
  });
});
