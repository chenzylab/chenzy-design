import { describe, expect, it } from 'vitest';
import { toggleSelection, rangeSelection } from './list-selection.js';

describe('toggleSelection (single)', () => {
  it('selects only the clicked row', () => {
    const next = toggleSelection(new Set([1]), 2, 'single');
    expect([...next]).toEqual([2]);
  });

  it('clears when re-clicking the sole selected row', () => {
    const next = toggleSelection(new Set([2]), 2, 'single');
    expect(next.size).toBe(0);
  });

  it('replaces a different existing selection', () => {
    const next = toggleSelection(new Set([5, 6]), 6, 'single');
    expect([...next]).toEqual([6]);
  });

  it('does not mutate the input set', () => {
    const cur = new Set([1]);
    toggleSelection(cur, 2, 'single');
    expect([...cur]).toEqual([1]);
  });
});

describe('toggleSelection (multiple)', () => {
  it('adds an unselected key', () => {
    const next = toggleSelection(new Set([1]), 2, 'multiple');
    expect([...next].sort()).toEqual([1, 2]);
  });

  it('removes a selected key', () => {
    const next = toggleSelection(new Set([1, 2]), 2, 'multiple');
    expect([...next]).toEqual([1]);
  });

  it('does not mutate the input set', () => {
    const cur = new Set([1, 2]);
    toggleSelection(cur, 3, 'multiple');
    expect([...cur].sort()).toEqual([1, 2]);
  });
});

describe('rangeSelection', () => {
  const keys = ['a', 'b', 'c', 'd', 'e'];

  it('adds inclusive range between anchor and target', () => {
    const next = rangeSelection(new Set(['a']), keys, 1, 3);
    expect([...next].sort()).toEqual(['a', 'b', 'c', 'd']);
  });

  it('works regardless of click direction', () => {
    const next = rangeSelection(new Set(), keys, 3, 1);
    expect([...next].sort()).toEqual(['b', 'c', 'd']);
  });

  it('clamps out-of-bounds target index', () => {
    const next = rangeSelection(new Set(), keys, 0, 99);
    expect([...next].sort()).toEqual(['a', 'b', 'c', 'd', 'e']);
  });

  it('returns current copy when anchor missing', () => {
    const next = rangeSelection(new Set(['a']), keys, -1, 3);
    expect([...next]).toEqual(['a']);
  });

  it('does not mutate the input set', () => {
    const cur = new Set(['a']);
    rangeSelection(cur, keys, 1, 3);
    expect([...cur]).toEqual(['a']);
  });
});
