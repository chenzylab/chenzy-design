import { describe, expect, it } from 'vitest';
import { formatNumeral, formatNumber, roundTo } from './numeral.js';

describe('roundTo', () => {
  it('rounds/floors/ceils to precision', () => {
    expect(roundTo(1.2345, 2, 'round')).toBe(1.23);
    expect(roundTo(1.2355, 2, 'round')).toBe(1.24);
    expect(roundTo(1.239, 2, 'floor')).toBe(1.23);
    expect(roundTo(1.231, 2, 'ceil')).toBe(1.24);
    expect(roundTo(1.9, 0, 'floor')).toBe(1);
    expect(roundTo(1.1, 0, 'ceil')).toBe(2);
  });
});

describe('formatNumber — rules', () => {
  it('text: rounds to precision', () => {
    expect(formatNumber(16.111, 'text', 1, 'round')).toBe('16.1');
    expect(formatNumber(16.111, 'text', 0, 'round')).toBe('16');
  });
  it('percentages: ×100 + %', () => {
    expect(formatNumber(0.915, 'percentages', 2, 'round')).toBe('91.50%');
    expect(formatNumber(0.6, 'percentages', 0, 'round')).toBe('60%');
  });
  it('exponential: scientific notation', () => {
    expect(formatNumber(1000, 'exponential', 1, 'round')).toBe('1.0e+3');
  });
  it('bytes-decimal: 1KB = 1000B', () => {
    expect(formatNumber(1000, 'bytes-decimal', 2, 'floor')).toBe('1.00 KB');
    expect(formatNumber(1_500_000, 'bytes-decimal', 2, 'floor')).toBe('1.50 MB');
  });
  it('bytes-binary: 1KiB = 1024B', () => {
    expect(formatNumber(1024, 'bytes-binary', 2, 'floor')).toBe('1.00 KiB');
    expect(formatNumber(1024 * 1024, 'bytes-binary', 2, 'floor')).toBe('1.00 MiB');
  });
  it('bytes: negative preserved', () => {
    expect(formatNumber(-2000, 'bytes-decimal', 1, 'floor')).toBe('-2.0 KB');
  });
});

describe('formatNumeral — text scanning', () => {
  it('rewrites numbers in place (text rule)', () => {
    expect(formatNumeral('点赞量：1.6111e1 K', { precision: 1 })).toBe('点赞量：16.1 K');
  });
  it('percentages in sentence', () => {
    expect(formatNumeral('胜率是0.6，输的概率是0.4', { rule: 'percentages' })).toBe(
      '胜率是60%，输的概率是40%',
    );
  });
  it('numbers rule keeps only numbers', () => {
    expect(formatNumeral('2.4444e2', { rule: 'numbers', precision: 1 })).toBe('244.4');
    expect(formatNumeral('a 12 b 34', { rule: 'numbers', precision: 0 })).toBe('12,34');
  });
  it('bytes-decimal in sentence', () => {
    expect(formatNumeral('已使用: 1000', { rule: 'bytes-decimal', precision: 2, truncate: 'floor' })).toBe(
      '已使用: 1.00 KB',
    );
  });
  it('custom parser overrides rule', () => {
    const parser = (s: string) => s.replace(/\d+/g, (m) => `${m}+`);
    expect(formatNumeral('7100 stars', { parser, rule: 'percentages' })).toBe('7100+ stars');
  });
  it('no numbers → unchanged (text rule)', () => {
    expect(formatNumeral('no digits here', {})).toBe('no digits here');
  });
});
