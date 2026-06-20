import { describe, expect, it } from 'vitest';
import {
  chunksFromRanges,
  findRanges,
  highlightChunks,
  mergeRanges,
  type HighlightRange,
} from './highlight.js';

describe('mergeRanges', () => {
  it('returns empty for empty input', () => {
    expect(mergeRanges([])).toEqual([]);
  });

  it('drops zero-length / inverted ranges', () => {
    expect(mergeRanges([{ start: 3, end: 3 }, { start: 5, end: 2 }])).toEqual([]);
  });

  it('sorts disjoint ranges', () => {
    expect(
      mergeRanges([
        { start: 5, end: 7 },
        { start: 0, end: 2 },
      ]),
    ).toEqual([
      { start: 0, end: 2 },
      { start: 5, end: 7 },
    ]);
  });

  it('merges overlapping ranges', () => {
    expect(
      mergeRanges([
        { start: 0, end: 4 },
        { start: 2, end: 6 },
      ]),
    ).toEqual([{ start: 0, end: 6 }]);
  });

  it('merges adjacent (touching) ranges', () => {
    expect(
      mergeRanges([
        { start: 0, end: 3 },
        { start: 3, end: 6 },
      ]),
    ).toEqual([{ start: 0, end: 6 }]);
  });

  it('absorbs a contained range', () => {
    expect(
      mergeRanges([
        { start: 0, end: 10 },
        { start: 3, end: 5 },
      ]),
    ).toEqual([{ start: 0, end: 10 }]);
  });

  it('collapses duplicates', () => {
    expect(
      mergeRanges([
        { start: 1, end: 4 },
        { start: 1, end: 4 },
      ]),
    ).toEqual([{ start: 1, end: 4 }]);
  });

  it('does not mutate the input array', () => {
    const input: HighlightRange[] = [
      { start: 5, end: 7 },
      { start: 0, end: 2 },
    ];
    const snapshot = JSON.parse(JSON.stringify(input));
    mergeRanges(input);
    expect(input).toEqual(snapshot);
  });
});

describe('findRanges', () => {
  it('finds all occurrences by default', () => {
    expect(findRanges('a-a-a', 'a')).toEqual([
      { start: 0, end: 1 },
      { start: 2, end: 3 },
      { start: 4, end: 5 },
    ]);
  });

  it('honors highlightAll=false (first only)', () => {
    expect(findRanges('a-a-a', 'a', { highlightAll: false })).toEqual([{ start: 0, end: 1 }]);
  });

  it('is case-insensitive by default', () => {
    expect(findRanges('Foo', 'foo')).toEqual([{ start: 0, end: 3 }]);
  });

  it('honors caseSensitive', () => {
    expect(findRanges('Foo foo', 'foo', { caseSensitive: true })).toEqual([{ start: 4, end: 7 }]);
  });

  it('escapes regex special chars by default', () => {
    expect(findRanges('a.b a*b', '.')).toEqual([{ start: 1, end: 2 }]);
  });

  it('treats words as regex when autoEscape=false', () => {
    expect(findRanges('a1b2', '\\d', { autoEscape: false })).toEqual([
      { start: 1, end: 2 },
      { start: 3, end: 4 },
    ]);
  });

  it('returns [] for invalid regex source (autoEscape misuse)', () => {
    expect(findRanges('abc', '(', { autoEscape: false })).toEqual([]);
  });

  it('returns [] when no words or empty source', () => {
    expect(findRanges('', 'a')).toEqual([]);
    expect(findRanges('abc', [])).toEqual([]);
    expect(findRanges('abc', ['', ''])).toEqual([]);
  });

  it('finds multiple words', () => {
    expect(findRanges('foo bar baz', ['foo', 'baz'])).toEqual([
      { start: 0, end: 3 },
      { start: 8, end: 11 },
    ]);
  });
});

describe('chunksFromRanges', () => {
  it('returns single unmatched chunk when no ranges', () => {
    expect(chunksFromRanges('hello', [])).toEqual([{ text: 'hello', matched: false }]);
  });

  it('returns [] for empty source', () => {
    expect(chunksFromRanges('', [{ start: 0, end: 1 }])).toEqual([]);
  });

  it('splits into matched/unmatched and preserves the whole string', () => {
    const chunks = chunksFromRanges('hello world', [{ start: 6, end: 11 }]);
    expect(chunks).toEqual([
      { text: 'hello ', matched: false },
      { text: 'world', matched: true },
    ]);
    expect(chunks.map((c) => c.text).join('')).toBe('hello world');
  });

  it('clamps out-of-bound ranges', () => {
    expect(chunksFromRanges('abc', [{ start: -2, end: 99 }])).toEqual([
      { text: 'abc', matched: true },
    ]);
  });
});

describe('highlightChunks (integration: overlap merge)', () => {
  it('default <mark> behavior unchanged for single word', () => {
    expect(highlightChunks('hello world', 'world')).toEqual([
      { text: 'hello ', matched: false },
      { text: 'world', matched: true },
    ]);
  });

  it('merges overlapping multi-word matches without nesting', () => {
    // "ab" matches [0,2], "bc" matches [1,3] → merged [0,3] = "abc"
    const chunks = highlightChunks('abcd', ['ab', 'bc']);
    expect(chunks).toEqual([
      { text: 'abc', matched: true },
      { text: 'd', matched: false },
    ]);
    // exactly one matched chunk: no double-wrap
    expect(chunks.filter((c) => c.matched)).toHaveLength(1);
  });

  it('merges a contained word into the larger match', () => {
    // "ell" inside "hello"
    const chunks = highlightChunks('hello', ['hello', 'ell']);
    expect(chunks).toEqual([{ text: 'hello', matched: true }]);
  });

  it('coalesces adjacent matches from different words', () => {
    // "foo" [0,3] + "bar" [3,6] are touching → single matched chunk "foobar"
    const chunks = highlightChunks('foobar', ['foo', 'bar']);
    expect(chunks).toEqual([{ text: 'foobar', matched: true }]);
  });

  it('keeps disjoint multi-word matches separate', () => {
    expect(highlightChunks('foo x bar', ['foo', 'bar'])).toEqual([
      { text: 'foo', matched: true },
      { text: ' x ', matched: false },
      { text: 'bar', matched: true },
    ]);
  });

  it('always reproduces the source by concatenation', () => {
    const src = 'the quick brown fox';
    const chunks = highlightChunks(src, ['quick', 'ick br', 'fox']);
    expect(chunks.map((c) => c.text).join('')).toBe(src);
  });
});
