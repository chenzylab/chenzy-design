import { describe, expect, it } from 'vitest';
import { computeAutosizeHeight } from './textarea.js';

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
