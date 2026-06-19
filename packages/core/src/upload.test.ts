import { describe, expect, it } from 'vitest';
import { computeUploadPercent, isUploadOk } from './upload.js';

describe('computeUploadPercent', () => {
  it('computes integer percent from loaded/total', () => {
    expect(computeUploadPercent(50, 200)).toBe(25);
    expect(computeUploadPercent(200, 200)).toBe(100);
    expect(computeUploadPercent(0, 200)).toBe(0);
  });
  it('rounds to the nearest integer', () => {
    expect(computeUploadPercent(1, 3)).toBe(33);
    expect(computeUploadPercent(2, 3)).toBe(67);
  });
  it('clamps into [0,100]', () => {
    expect(computeUploadPercent(300, 200)).toBe(100);
    expect(computeUploadPercent(-10, 200)).toBe(0);
  });
  it('returns 0 when total is 0 or negative (avoid divide-by-zero)', () => {
    expect(computeUploadPercent(10, 0)).toBe(0);
    expect(computeUploadPercent(10, -5)).toBe(0);
  });
});

describe('isUploadOk', () => {
  it('treats 2xx as success', () => {
    expect(isUploadOk(200)).toBe(true);
    expect(isUploadOk(201)).toBe(true);
    expect(isUploadOk(299)).toBe(true);
  });
  it('treats non-2xx as failure', () => {
    expect(isUploadOk(199)).toBe(false);
    expect(isUploadOk(300)).toBe(false);
    expect(isUploadOk(404)).toBe(false);
    expect(isUploadOk(500)).toBe(false);
  });
});
