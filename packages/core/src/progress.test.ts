import { describe, expect, it } from 'vitest';
import {
  clampPercent,
  resolveStatus,
  getCirclePathProps,
  getRootAriaProps,
} from './progress.js';

describe('clampPercent', () => {
  it('clamps to 0..100 and handles NaN', () => {
    expect(clampPercent(50)).toBe(50);
    expect(clampPercent(-10)).toBe(0);
    expect(clampPercent(120)).toBe(100);
    expect(clampPercent(Number.NaN)).toBe(0);
    expect(clampPercent(0)).toBe(0);
    expect(clampPercent(100)).toBe(100);
  });
});

describe('resolveStatus', () => {
  it('respects an explicit status', () => {
    expect(resolveStatus(100, 'error')).toBe('error');
    expect(resolveStatus(50, 'warning')).toBe('warning');
  });

  it('promotes to success when full and successWhenFull', () => {
    expect(resolveStatus(100, 'normal', true)).toBe('success');
    expect(resolveStatus(99, 'normal', true)).toBe('normal');
    expect(resolveStatus(100, 'normal', false)).toBe('normal');
  });
});

describe('getCirclePathProps', () => {
  it('computes radius/perimeter for a full circle', () => {
    const p = getCirclePathProps({ width: 120, strokeWidth: 8, percent: 0 });
    expect(p.center).toBe(60);
    expect(p.radius).toBe(56); // 60 - 8/2
    expect(p.circumference).toBeCloseTo(2 * Math.PI * 56, 5);
  });

  it('fill length is proportional to percent (full circle)', () => {
    const r = 56;
    const perim = 2 * Math.PI * r;
    const p = getCirclePathProps({ width: 120, strokeWidth: 8, percent: 50 });
    const fillLen = Number(p.fillDash.split(' ')[0]);
    expect(fillLen).toBeCloseTo(perim * 0.5, 4);
  });

  it('dashboard gap reduces the visible track length', () => {
    const r = 56;
    const perim = 2 * Math.PI * r;
    const p = getCirclePathProps({
      width: 120,
      strokeWidth: 8,
      percent: 100,
      gapDegree: 90,
    });
    // visible track = 270/360 of perimeter
    const trackLen = Number(p.trackDash.split(' ')[0]);
    expect(trackLen).toBeCloseTo(perim * (270 / 360), 4);
    // 100% fill covers the full visible track
    const fillLen = Number(p.fillDash.split(' ')[0]);
    expect(fillLen).toBeCloseTo(trackLen, 4);
  });

  it('rotation differs by gapPosition', () => {
    const top = getCirclePathProps({ width: 100, strokeWidth: 6, percent: 0, gapDegree: 60, gapPosition: 'top' });
    const bottom = getCirclePathProps({ width: 100, strokeWidth: 6, percent: 0, gapDegree: 60, gapPosition: 'bottom' });
    expect(top.rotation).not.toBe(bottom.rotation);
  });
});

describe('getRootAriaProps', () => {
  it('emits valuenow for determinate progress', () => {
    const a = getRootAriaProps({ percent: 42, label: '上传进度', valueText: '42% 完成' });
    expect(a.role).toBe('progressbar');
    expect(a['aria-valuenow']).toBe(42);
    expect(a['aria-valuemin']).toBe(0);
    expect(a['aria-valuemax']).toBe(100);
    expect(a['aria-valuetext']).toBe('42% 完成');
    expect(a['aria-label']).toBe('上传进度');
  });

  it('omits valuenow and sets busy when indeterminate', () => {
    const a = getRootAriaProps({ percent: 50, indeterminate: true });
    expect(a['aria-valuenow']).toBeUndefined();
    expect(a['aria-busy']).toBe(true);
  });

  it('clamps valuenow', () => {
    expect(getRootAriaProps({ percent: 150 })['aria-valuenow']).toBe(100);
  });
});
