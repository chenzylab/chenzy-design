import { describe, it, expect, vi } from 'vitest';
import { createEllipsis, isOverflowing, truncateText, fitTruncatedText } from './ellipsis.js';

describe('isOverflowing', () => {
  it('multi-row: scrollHeight exceeds clientHeight → true', () => {
    expect(isOverflowing({ scrollHeight: 60, clientHeight: 40, rows: 2 })).toBe(true);
  });
  it('multi-row: equal heights → false (within tolerance)', () => {
    expect(isOverflowing({ scrollHeight: 40, clientHeight: 40, rows: 2 })).toBe(false);
  });
  it('single-row: width overflow → true', () => {
    expect(
      isOverflowing({ scrollHeight: 20, clientHeight: 20, scrollWidth: 200, clientWidth: 100, rows: 1 }),
    ).toBe(true);
  });
  it('single-row: width fits → false', () => {
    expect(
      isOverflowing({ scrollHeight: 20, clientHeight: 20, scrollWidth: 90, clientWidth: 100, rows: 1 }),
    ).toBe(false);
  });
  it('1px sub-pixel tolerance not flagged', () => {
    expect(isOverflowing({ scrollHeight: 41, clientHeight: 40, rows: 2 })).toBe(false);
  });
});

describe('truncateText', () => {
  it('returns full text when within budget', () => {
    expect(truncateText('hi', 10, 'end')).toBe('hi');
  });
  it('end truncation appends ellipsis', () => {
    expect(truncateText('abcdefgh', 5, 'end')).toBe('abcd…');
  });
  it('start truncation prepends ellipsis', () => {
    expect(truncateText('abcdefgh', 5, 'start')).toBe('…efgh');
  });
  it('middle truncation splits around ellipsis', () => {
    const out = truncateText('abcdefgh', 5, 'middle');
    expect(out).toContain('…');
    expect(out.length).toBe(5);
  });
  it('maxChars <= 0 → ellipsis only', () => {
    expect(truncateText('abc', 0, 'end')).toBe('…');
  });
});

describe('fitTruncatedText', () => {
  // Model width as char count: candidate "fits" when its length <= capacity.
  const fitsByLen = (capacity: number) => (candidate: string) => candidate.length <= capacity;

  it('returns full text unchanged when it fits', () => {
    expect(fitTruncatedText('abcdef', 'end', () => true)).toBe('abcdef');
  });
  it('empty text returned as-is', () => {
    expect(fitTruncatedText('', 'middle', () => false)).toBe('');
  });
  it('end: binary-searches the largest fitting budget', () => {
    // capacity 5 → truncateText('abcdefgh',5,'end') = 'abcd…'
    expect(fitTruncatedText('abcdefgh', 'end', fitsByLen(5))).toBe('abcd…');
  });
  it('middle: keeps head + tail around ellipsis and fits capacity', () => {
    const out = fitTruncatedText('abcdefghij', 'middle', fitsByLen(5));
    expect(out).toContain('…');
    expect(out.length).toBeLessThanOrEqual(5);
    // head from start, tail from end
    expect(out.startsWith('a')).toBe(true);
    expect(out.endsWith('j')).toBe(true);
  });
  it('start: keeps tail after ellipsis', () => {
    const out = fitTruncatedText('abcdefghij', 'start', fitsByLen(5));
    expect(out.startsWith('…')).toBe(true);
    expect(out.endsWith('j')).toBe(true);
    expect(out.length).toBeLessThanOrEqual(5);
  });
  it('nothing fits → ellipsis floor', () => {
    expect(fitTruncatedText('abcdef', 'end', () => false)).toBe('…');
  });
  it('wider capacity yields more visible chars than a narrow one', () => {
    const narrow = fitTruncatedText('abcdefghijklmnop', 'end', fitsByLen(4));
    const wide = fitTruncatedText('abcdefghijklmnop', 'end', fitsByLen(9));
    expect(wide.length).toBeGreaterThan(narrow.length);
  });
});

describe('createEllipsis', () => {
  it('truncated starts unknown (null) on CSS clamp path', () => {
    const e = createEllipsis({ rows: 2 });
    expect(e.truncated).toBeNull();
  });

  it('toggle is a no-op when not expandable', () => {
    const onExpand = vi.fn();
    const e = createEllipsis({ rows: 2, onExpand });
    e.toggle();
    expect(e.expanded).toBe(false);
    expect(onExpand).not.toHaveBeenCalled();
  });

  it('expandable allows expanding but not collapsing back (no collapsible)', () => {
    const onExpand = vi.fn();
    const e = createEllipsis({ rows: 2, expandable: true, onExpand });
    e.toggle();
    expect(e.expanded).toBe(true);
    expect(onExpand).toHaveBeenCalledWith(true);
    // without collapsible, collapsing back is a no-op (Semi semantics)
    e.toggle();
    expect(e.expanded).toBe(true);
    expect(onExpand).toHaveBeenCalledTimes(1);
  });

  it('collapsible allows collapsing back after expansion', () => {
    const onExpand = vi.fn();
    const e = createEllipsis({ rows: 2, expandable: true, collapsible: true, onExpand });
    e.toggle();
    expect(e.expanded).toBe(true);
    e.toggle();
    expect(e.expanded).toBe(false);
    expect(onExpand).toHaveBeenLastCalledWith(false);
    expect(onExpand).toHaveBeenCalledTimes(2);
  });

  it('collapsible without expandable cannot expand initially', () => {
    const e = createEllipsis({ rows: 2, collapsible: true });
    e.toggle();
    expect(e.expanded).toBe(false);
  });

  it('measure updates truncated and fires onChange', () => {
    const onChange = vi.fn();
    const e = createEllipsis({ rows: 2, expandable: true, onChange });
    const r = e.measure({ scrollHeight: 80, clientHeight: 40, rows: 2 });
    expect(r).toBe(true);
    expect(e.truncated).toBe(true);
    expect(onChange).toHaveBeenCalled();
  });

  it('measure does not re-emit when truncated is unchanged', () => {
    const onChange = vi.fn();
    const e = createEllipsis({ rows: 2, onChange });
    e.measure({ scrollHeight: 80, clientHeight: 40, rows: 2 });
    onChange.mockClear();
    e.measure({ scrollHeight: 80, clientHeight: 40, rows: 2 });
    expect(onChange).not.toHaveBeenCalled();
  });
});
