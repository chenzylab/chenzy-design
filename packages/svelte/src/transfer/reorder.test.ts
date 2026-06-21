import { describe, it, expect } from 'vitest';
import { computeInsertSide, reorder } from './reorder.js';

describe('transfer/computeInsertSide', () => {
  it('上半区 → before，下半区 → after，中线归 after', () => {
    expect(computeInsertSide(0, 40)).toBe('before');
    expect(computeInsertSide(19, 40)).toBe('before');
    expect(computeInsertSide(20, 40)).toBe('after');
    expect(computeInsertSide(39, 40)).toBe('after');
  });
});

describe('transfer/reorder', () => {
  const base = ['a', 'b', 'c', 'd'];

  it('前移：把 c 放到 a 之前', () => {
    expect(reorder(base, 2, 0, 'before')).toEqual(['c', 'a', 'b', 'd']);
  });

  it('后移：把 a 放到 c 之后', () => {
    expect(reorder(base, 0, 2, 'after')).toEqual(['b', 'c', 'a', 'd']);
  });

  it('相邻互换：a 放到 b 之后', () => {
    expect(reorder(base, 0, 1, 'after')).toEqual(['b', 'a', 'c', 'd']);
  });

  it('移动后位置不变 → 返回浅拷贝且等值', () => {
    const out = reorder(base, 1, 1, 'before');
    expect(out).toEqual(base);
    expect(out).not.toBe(base);
  });

  it('放到自身之后等价于不动', () => {
    expect(reorder(base, 1, 0, 'after')).toEqual(base);
  });

  it('越界返回浅拷贝', () => {
    expect(reorder(base, -1, 2, 'before')).toEqual(base);
    expect(reorder(base, 0, 9, 'after')).toEqual(base);
  });

  it('不可变：不修改入参', () => {
    const copy = base.slice();
    reorder(base, 0, 3, 'after');
    expect(base).toEqual(copy);
  });

  it('末位拖到首位之前', () => {
    expect(reorder(base, 3, 0, 'before')).toEqual(['d', 'a', 'b', 'c']);
  });
});
