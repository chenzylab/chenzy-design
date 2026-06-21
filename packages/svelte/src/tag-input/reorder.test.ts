import { describe, expect, it } from 'vitest';
import { computeInsertSide, reorder } from './reorder.js';

describe('tag-input/reorder', () => {
  describe('computeInsertSide', () => {
    it('left half → before', () => {
      expect(computeInsertSide(0, 100)).toBe('before');
      expect(computeInsertSide(49, 100)).toBe('before');
    });
    it('mid and right half → after', () => {
      expect(computeInsertSide(50, 100)).toBe('after');
      expect(computeInsertSide(99, 100)).toBe('after');
    });
  });

  describe('reorder', () => {
    const list = ['a', 'b', 'c', 'd'];

    it('moves an item forward (before a later target)', () => {
      expect(reorder(list, 0, 2, 'before')).toEqual(['b', 'a', 'c', 'd']);
    });

    it('moves an item forward (after a later target)', () => {
      expect(reorder(list, 0, 2, 'after')).toEqual(['b', 'c', 'a', 'd']);
    });

    it('moves an item backward (before an earlier target)', () => {
      expect(reorder(list, 3, 1, 'before')).toEqual(['a', 'd', 'b', 'c']);
    });

    it('moves an item backward (after an earlier target)', () => {
      expect(reorder(list, 3, 1, 'after')).toEqual(['a', 'b', 'd', 'c']);
    });

    it('moves to the very end', () => {
      expect(reorder(list, 0, 3, 'after')).toEqual(['b', 'c', 'd', 'a']);
    });

    it('moves to the very start', () => {
      expect(reorder(list, 3, 0, 'before')).toEqual(['d', 'a', 'b', 'c']);
    });

    it('no-op when result position equals source (drop after previous neighbor)', () => {
      expect(reorder(list, 1, 0, 'after')).toEqual(list);
      expect(reorder(list, 1, 2, 'before')).toEqual(list);
    });

    it('returns a new array (immutable)', () => {
      const out = reorder(list, 0, 1, 'after');
      expect(out).not.toBe(list);
      expect(list).toEqual(['a', 'b', 'c', 'd']);
    });

    it('out-of-range indices return a copy unchanged', () => {
      expect(reorder(list, -1, 2, 'before')).toEqual(list);
      expect(reorder(list, 0, 9, 'after')).toEqual(list);
    });
  });
});
