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

  it('merges className/style on overlap: className = prev || next, style shallow-merged (aligns Semi combineChunks)', () => {
    expect(
      mergeRanges([
        { start: 0, end: 4, className: 'a', style: { color: 'red', padding: 4 } },
        { start: 2, end: 6, className: 'b', style: { color: 'blue' } },
      ]),
    ).toEqual([
      { start: 0, end: 6, className: 'a', style: { color: 'blue', padding: 4 } },
    ]);
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
  it('finds all occurrences', () => {
    expect(findRanges('a-a-a', 'a')).toEqual([
      { start: 0, end: 1, className: undefined, style: undefined },
      { start: 2, end: 3, className: undefined, style: undefined },
      { start: 4, end: 5, className: undefined, style: undefined },
    ]);
  });

  it('is case-insensitive by default', () => {
    expect(findRanges('Foo', 'foo')).toEqual([
      { start: 0, end: 3, className: undefined, style: undefined },
    ]);
  });

  it('honors caseSensitive', () => {
    expect(findRanges('Foo foo', 'foo', { caseSensitive: true })).toEqual([
      { start: 4, end: 7, className: undefined, style: undefined },
    ]);
  });

  it('escapes regex special chars by default', () => {
    expect(findRanges('a.b a*b', '.')).toEqual([
      { start: 1, end: 2, className: undefined, style: undefined },
    ]);
  });

  it('treats words as regex when autoEscape=false', () => {
    expect(findRanges('a1b2', '\\d', { autoEscape: false })).toEqual([
      { start: 1, end: 2, className: undefined, style: undefined },
      { start: 3, end: 4, className: undefined, style: undefined },
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
      { start: 0, end: 3, className: undefined, style: undefined },
      { start: 8, end: 11, className: undefined, style: undefined },
    ]);
  });

  it('carries per-word className/style from object words (Semi v2.71 差异化样式)', () => {
    expect(
      findRanges('foo bar', [
        { text: 'foo', className: 'k1', style: { color: 'red' } },
        { text: 'bar', className: 'k2', style: { color: 'blue' } },
      ]),
    ).toEqual([
      { start: 0, end: 3, className: 'k1', style: { color: 'red' } },
      { start: 4, end: 7, className: 'k2', style: { color: 'blue' } },
    ]);
  });
});

describe('chunksFromRanges', () => {
  it('returns single unmatched chunk when no ranges', () => {
    expect(chunksFromRanges('hello', [])).toEqual([{ text: 'hello', highlight: false }]);
  });

  it('returns [] for empty source', () => {
    expect(chunksFromRanges('', [{ start: 0, end: 1 }])).toEqual([]);
  });

  it('splits into highlight/plain and preserves the whole string', () => {
    const chunks = chunksFromRanges('hello world', [{ start: 6, end: 11 }]);
    expect(chunks).toEqual([
      { text: 'hello ', highlight: false },
      { text: 'world', highlight: true, className: undefined, style: undefined },
    ]);
    expect(chunks.map((c) => c.text).join('')).toBe('hello world');
  });

  it('clamps out-of-bound ranges', () => {
    expect(chunksFromRanges('abc', [{ start: -2, end: 99 }])).toEqual([
      { text: 'abc', highlight: true, className: undefined, style: undefined },
    ]);
  });

  it('carries className/style to highlighted chunk', () => {
    expect(
      chunksFromRanges('hi there', [{ start: 3, end: 8, className: 'k', style: { color: 'red' } }]),
    ).toEqual([
      { text: 'hi ', highlight: false },
      { text: 'there', highlight: true, className: 'k', style: { color: 'red' } },
    ]);
  });
});

describe('highlightChunks (integration: overlap merge)', () => {
  it('default <mark> behavior for single word', () => {
    expect(highlightChunks('hello world', 'world')).toEqual([
      { text: 'hello ', highlight: false },
      { text: 'world', highlight: true, className: undefined, style: undefined },
    ]);
  });

  it('merges overlapping multi-word matches without nesting', () => {
    // "ab" matches [0,2], "bc" matches [1,3] → merged [0,3] = "abc"
    const chunks = highlightChunks('abcd', ['ab', 'bc']);
    expect(chunks).toEqual([
      { text: 'abc', highlight: true, className: undefined, style: undefined },
      { text: 'd', highlight: false },
    ]);
    // exactly one highlighted chunk: no double-wrap
    expect(chunks.filter((c) => c.highlight)).toHaveLength(1);
  });

  it('merges a contained word into the larger match', () => {
    // "ell" inside "hello"
    const chunks = highlightChunks('hello', ['hello', 'ell']);
    expect(chunks).toEqual([
      { text: 'hello', highlight: true, className: undefined, style: undefined },
    ]);
  });

  it('coalesces adjacent matches from different words', () => {
    // "foo" [0,3] + "bar" [3,6] are touching → single highlighted chunk "foobar"
    const chunks = highlightChunks('foobar', ['foo', 'bar']);
    expect(chunks).toEqual([
      { text: 'foobar', highlight: true, className: undefined, style: undefined },
    ]);
  });

  it('keeps disjoint multi-word matches separate', () => {
    expect(highlightChunks('foo x bar', ['foo', 'bar'])).toEqual([
      { text: 'foo', highlight: true, className: undefined, style: undefined },
      { text: ' x ', highlight: false },
      { text: 'bar', highlight: true, className: undefined, style: undefined },
    ]);
  });

  it('always reproduces the source by concatenation', () => {
    const src = 'the quick brown fox';
    const chunks = highlightChunks(src, ['quick', 'ick br', 'fox']);
    expect(chunks.map((c) => c.text).join('')).toBe(src);
  });

  it('carries differentiated styles per matched word (Semi v2.71 场景)', () => {
    const chunks = highlightChunks('Semi 设计系统', [
      { text: 'Semi', style: { color: 'red' }, className: 'k1' },
      { text: '设计系统', style: { color: 'blue' }, className: 'k2' },
    ]);
    expect(chunks).toEqual([
      { text: 'Semi', highlight: true, className: 'k1', style: { color: 'red' } },
      { text: ' ', highlight: false },
      { text: '设计系统', highlight: true, className: 'k2', style: { color: 'blue' } },
    ]);
  });
});
