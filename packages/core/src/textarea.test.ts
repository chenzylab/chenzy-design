import { describe, expect, it } from 'vitest';
import { computeAutosizeHeight, computeWrappedLineCount, countCharacters } from './textarea.js';

// row metrics: line 20px, padding 8px (4+4), border 2px (1+1).
// 1 row = 20 + 8 + 2 = 30; 3 rows = 60 + 10 = 70; 5 rows = 100 + 10 = 110.
const metrics = { lineHeight: 20, verticalPadding: 8, verticalBorder: 2 };

describe('computeAutosizeHeight', () => {
  it('grows to fit content between min and max', () => {
    const r = computeAutosizeHeight({ ...metrics, scrollHeight: 70, minRows: 1, maxRows: 5 });
    expect(r.height).toBe(70); // 3 rows worth of content
    expect(r.overflow).toBe(false);
  });

  it('clamps up to minRows when content is shorter', () => {
    // content 30px (1 row) but minRows 2 → 2 rows = 40 + 10 = 50
    const r = computeAutosizeHeight({ ...metrics, scrollHeight: 30, minRows: 2, maxRows: 6 });
    expect(r.height).toBe(50);
    expect(r.overflow).toBe(false);
  });

  it('caps at maxRows and flags overflow when content exceeds it', () => {
    // content 200px but maxRows 5 → cap 110, overflow true
    const r = computeAutosizeHeight({ ...metrics, scrollHeight: 200, minRows: 1, maxRows: 5 });
    expect(r.height).toBe(110);
    expect(r.overflow).toBe(true);
  });

  it('does not overflow when content exactly fills maxRows', () => {
    // exactly 5 rows = 110
    const r = computeAutosizeHeight({ ...metrics, scrollHeight: 110, minRows: 1, maxRows: 5 });
    expect(r.height).toBe(110);
    expect(r.overflow).toBe(false);
  });

  it('defaults minRows=1 and maxRows=Infinity (no cap, never overflow)', () => {
    const r = computeAutosizeHeight({ ...metrics, scrollHeight: 1000 });
    expect(r.height).toBe(1000);
    expect(r.overflow).toBe(false);
  });

  it('respects minRows even with default (Infinity) maxRows', () => {
    const r = computeAutosizeHeight({ ...metrics, scrollHeight: 20, minRows: 3 });
    expect(r.height).toBe(70); // 3 rows
  });
});

describe('computeWrappedLineCount', () => {
  it('single visual row when text fits within available width', () => {
    expect(computeWrappedLineCount(100, 200)).toBe(1);
    expect(computeWrappedLineCount(200, 200)).toBe(1); // exact fit
  });

  it('rounds up to the next visual row when text overflows (对齐 Semi Math.ceil)', () => {
    expect(computeWrappedLineCount(201, 200)).toBe(2);
    expect(computeWrappedLineCount(400, 200)).toBe(2);
    expect(computeWrappedLineCount(401, 200)).toBe(3);
  });

  it('empty text still occupies at least 1 row', () => {
    expect(computeWrappedLineCount(0, 200)).toBe(1);
  });

  it('non-positive available width clamps to 1 row (avoid divide-by-zero blowup)', () => {
    expect(computeWrappedLineCount(500, 0)).toBe(1);
    expect(computeWrappedLineCount(500, -10)).toBe(1);
  });
});

describe('countCharacters', () => {
  it('returns 0 for empty string', () => {
    expect(countCharacters('')).toBe(0);
    expect(countCharacters('', { graphemes: true })).toBe(0);
  });

  it('counts ASCII identically in both modes', () => {
    expect(countCharacters('hello')).toBe(5);
    expect(countCharacters('hello', { graphemes: true })).toBe(5);
  });

  it('counts CJK by code point in default mode', () => {
    expect(countCharacters('你好世界')).toBe(4);
  });

  it('default mode counts a single emoji by code point (spread)', () => {
    // 😀 is one code point → spread length 1
    expect(countCharacters('😀')).toBe(1);
  });

  it('default mode splits ZWJ emoji into multiple code points', () => {
    // 👨‍👩‍👧 = man + ZWJ + woman + ZWJ + girl → 5 code points via spread
    expect(countCharacters('👨‍👩‍👧')).toBe(5);
  });

  it('grapheme mode counts a ZWJ family emoji as one character', () => {
    expect(countCharacters('👨‍👩‍👧', { graphemes: true })).toBe(1);
  });

  it('grapheme mode counts a flag emoji as one character', () => {
    // 🇨🇳 is two regional-indicator code points → 1 grapheme
    expect(countCharacters('🇨🇳', { graphemes: true })).toBe(1);
  });

  it('grapheme mode counts combining marks as one character', () => {
    // 'e' + combining acute accent → 1 grapheme, 2 code points
    expect(countCharacters('é')).toBe(2);
    expect(countCharacters('é', { graphemes: true })).toBe(1);
  });

  it('grapheme mode counts mixed text correctly', () => {
    // a + family emoji + b → 3 graphemes
    expect(countCharacters('a👨‍👩‍👧b', { graphemes: true })).toBe(3);
  });
});
