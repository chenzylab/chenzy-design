import { describe, expect, it } from 'vitest';
import {
  clampPercent,
  getCirclePathProps,
  generateColor,
  getRootAriaProps,
} from './progress.js';

describe('clampPercent', () => {
  it('clamps to 0..100', () => {
    expect(clampPercent(50)).toBe(50);
    expect(clampPercent(-10)).toBe(0);
    expect(clampPercent(120)).toBe(100);
    expect(clampPercent(0)).toBe(0);
    expect(clampPercent(100)).toBe(100);
  });
});

describe('getCirclePathProps', () => {
  it('computes radius/circumference (Semi single-ring model)', () => {
    const p = getCirclePathProps({ width: 72, strokeWidth: 4, percent: 0 });
    expect(p.center).toBe(36);
    expect(p.radius).toBe(34); // (72 - 4) / 2
    expect(p.circumference).toBeCloseTo(2 * Math.PI * 34, 5);
    expect(p.strokeDasharray).toBe(`${p.circumference} ${p.circumference}`);
  });

  it('dashoffset is (1 - percent/100) * circumference', () => {
    const p0 = getCirclePathProps({ width: 72, strokeWidth: 4, percent: 0 });
    expect(p0.strokeDashoffset).toBeCloseTo(p0.circumference, 5);

    const p50 = getCirclePathProps({ width: 72, strokeWidth: 4, percent: 50 });
    expect(p50.strokeDashoffset).toBeCloseTo(p50.circumference * 0.5, 5);

    const p100 = getCirclePathProps({ width: 72, strokeWidth: 4, percent: 100 });
    expect(p100.strokeDashoffset).toBeCloseTo(0, 5);
  });

  it('clamps percent before computing offset', () => {
    const p = getCirclePathProps({ width: 100, strokeWidth: 6, percent: 150 });
    expect(p.strokeDashoffset).toBeCloseTo(0, 5);
  });
});

describe('generateColor (segmented stroke)', () => {
  const strokeArr = [
    { percent: 20, color: '#ff0000' },
    { percent: 60, color: '#00ff00' },
    { percent: 100, color: '#0000ff' },
  ];

  it('returns default when percent is below the first anchor', () => {
    expect(generateColor(strokeArr, 10, false)).toBe('var(--cd-color-success)');
  });

  it('returns the last colour when percent exceeds the last anchor', () => {
    expect(generateColor([{ percent: 50, color: '#ff0000' }], 80, false)).toBe('#ff0000ff');
  });

  it('returns exact colour on an anchor', () => {
    expect(generateColor(strokeArr, 60, false)).toBe('#00ff00ff');
  });

  it('non-gradient picks the lower anchor colour between anchors', () => {
    // 40 is between 20(#ff0000) and 60(#00ff00) → lower anchor red
    expect(generateColor(strokeArr, 40, false)).toBe('#ff0000ff');
  });

  it('gradient interpolates between two anchors', () => {
    const c = generateColor(strokeArr, 40, true);
    expect(typeof c).toBe('string');
    expect(c).toMatch(/^#[0-9a-f]{8}$/);
    // blended red→green: some green appears, red drops from ff
    expect(c).not.toBe('#ff0000ff');
  });

  it('accepts rgb/hsl colour inputs', () => {
    expect(generateColor([{ percent: 0, color: 'rgb(255, 0, 0)' }], 50, false)).toBe('#ff0000ff');
  });
});

describe('getRootAriaProps', () => {
  it('always emits valuenow (clamped)', () => {
    const a = getRootAriaProps({ percent: 42, label: '上传进度', valueText: '42% 完成' });
    expect(a.role).toBe('progressbar');
    expect(a['aria-valuenow']).toBe(42);
    expect(a['aria-valuemin']).toBe(0);
    expect(a['aria-valuemax']).toBe(100);
    expect(a['aria-valuetext']).toBe('42% 完成');
    expect(a['aria-label']).toBe('上传进度');
  });

  it('supports labelledby', () => {
    const a = getRootAriaProps({ percent: 30, labelledBy: 'lbl' });
    expect(a['aria-labelledby']).toBe('lbl');
    expect(a['aria-label']).toBeUndefined();
  });

  it('clamps valuenow', () => {
    expect(getRootAriaProps({ percent: 150 })['aria-valuenow']).toBe(100);
  });
});
