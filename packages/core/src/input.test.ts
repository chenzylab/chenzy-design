import { describe, expect, it } from 'vitest';
import { truncateValueByLength, computeVisibleMinLength } from './input.js';

// 与 Input demo 同款：按 grapheme 计数，emoji（含组合 emoji）算 1。
const seg = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
const graphemeLength = (s: string) => [...seg.segment(s)].length;

describe('truncateValueByLength', () => {
  it('无 getValueLength 时按 UTF-16 length 截断', () => {
    expect(truncateValueByLength({ value: 'abcdef', maxLength: 3 })).toBe('abc');
    expect(truncateValueByLength({ value: 'abc', maxLength: 10 })).toBe('abc');
  });

  it('emoji：按可见长度截断，10 个 💖（length=20）截到恰好 10 个', () => {
    const input = '💖'.repeat(15); // 15 grapheme, 30 code units
    const out = truncateValueByLength({ value: input, maxLength: 10, getValueLength: graphemeLength });
    expect(graphemeLength(out)).toBe(10);
    expect(out.length).toBe(20); // 10 个 💖 × 2 code units
    expect(out).toBe('💖'.repeat(10));
  });

  it('未超长时原样返回', () => {
    const input = '💖'.repeat(3);
    expect(truncateValueByLength({ value: input, maxLength: 10, getValueLength: graphemeLength })).toBe(input);
  });

  it('组合 emoji（👨‍👩‍👧‍👦 ZWJ 序列）：可见长度不超过 maxLength（Semi 二分核心保证）', () => {
    // 注：Semi 的二分 truncateValue 以「可见长度 ≤ maxLength 的最长 UTF-16 前缀」为准。
    // 对带尾随 ZWJ 的残缺序列，segmenter 仍计为 1 grapheme，故截断点可能落在 ZWJ 内部
    // （末尾留一个残缺码点，可见长度仍 = maxLength）。这是 Semi 原版同款行为，逐字复刻对齐。
    // 本用例只验证 Semi 保证的不变量：可见长度不超过上限。
    const family = '👨‍👩‍👧‍👦';
    const input = family.repeat(4);
    const out = truncateValueByLength({ value: input, maxLength: 2, getValueLength: graphemeLength });
    expect(graphemeLength(out)).toBeLessThanOrEqual(2);
    expect(out.startsWith(family)).toBe(true); // 至少第一个家庭 emoji 完整
  });

  it('maxLength=0 截为空串', () => {
    expect(truncateValueByLength({ value: '💖💖', maxLength: 0, getValueLength: graphemeLength })).toBe('');
  });
});

describe('computeVisibleMinLength', () => {
  it('无 getValueLength 时返回原 minLength', () => {
    expect(computeVisibleMinLength({ value: 'ab', minLength: 4 })).toBe(4);
  });

  it('可见长度不足时换算：newMin = utf16Length + (minLength - visibleLength)', () => {
    // 3 个 💖 = visibleLength 3, utf16 length 6, minLength 4
    // → 6 + (4 - 3) = 7（浏览器按 utf16 minlength=7 校验，等价于要求可见 4 个）
    const value = '💖'.repeat(3);
    expect(computeVisibleMinLength({ value, minLength: 4, getValueLength: graphemeLength })).toBe(7);
  });

  it('普通字符可见长度 = utf16 长度时，换算值 = minLength', () => {
    // 'abc' visible 3, utf16 3, minLength 4 → 3 + (4-3) = 4
    expect(computeVisibleMinLength({ value: 'abc', minLength: 4, getValueLength: graphemeLength })).toBe(4);
  });

  it('已达最小长度时返回原 minLength（不再抬高阈值）', () => {
    const value = '💖'.repeat(5); // visible 5 >= minLength 4
    expect(computeVisibleMinLength({ value, minLength: 4, getValueLength: graphemeLength })).toBe(4);
  });
});
