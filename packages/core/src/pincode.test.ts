import { describe, expect, it } from 'vitest';
import {
  validateChar,
  inputModeForFormat,
  toValueList,
  fromValueList,
  isComplete,
  completeSingleInput,
  handleKeyDown,
  distributePaste,
} from './pincode.js';

describe('validateChar (four formats)', () => {
  it('number: only single digits', () => {
    expect(validateChar('0', 'number')).toBe(true);
    expect(validateChar('9', 'number')).toBe(true);
    expect(validateChar('a', 'number')).toBe(false);
    expect(validateChar('', 'number')).toBe(false);
    expect(validateChar('12', 'number')).toBe(false);
    expect(validateChar(' ', 'number')).toBe(false);
  });

  it('mixed: digits + latin letters (both cases)', () => {
    expect(validateChar('7', 'mixed')).toBe(true);
    expect(validateChar('a', 'mixed')).toBe(true);
    expect(validateChar('Z', 'mixed')).toBe(true);
    expect(validateChar('中', 'mixed')).toBe(false);
    expect(validateChar('-', 'mixed')).toBe(false);
    expect(validateChar('', 'mixed')).toBe(false);
  });

  it('RegExp: per-char test, stateless across calls', () => {
    const hex = /[0-9a-f]/g; // global flag must not leak lastIndex
    expect(validateChar('a', hex)).toBe(true);
    expect(validateChar('a', hex)).toBe(true); // still true (no lastIndex drift)
    expect(validateChar('g', hex)).toBe(false);
    expect(validateChar('', hex)).toBe(false);
    // anchored regex also works per single char
    expect(validateChar('5', /^[3-6]$/)).toBe(true);
    expect(validateChar('9', /^[3-6]$/)).toBe(false);
  });

  it('function: predicate per char', () => {
    const onlyOddDigits = (c: string) => '13579'.includes(c);
    expect(validateChar('3', onlyOddDigits)).toBe(true);
    expect(validateChar('4', onlyOddDigits)).toBe(false);
    expect(validateChar('', onlyOddDigits)).toBe(false);
  });

  it('defaults to number', () => {
    expect(validateChar('5')).toBe(true);
    expect(validateChar('x')).toBe(false);
  });
});

describe('inputModeForFormat', () => {
  it('numeric only for number format', () => {
    expect(inputModeForFormat('number')).toBe('numeric');
    expect(inputModeForFormat('mixed')).toBe('text');
    expect(inputModeForFormat(/[a-z]/)).toBe('text');
    expect(inputModeForFormat(() => true)).toBe('text');
  });
});

describe('toValueList / fromValueList / isComplete', () => {
  it('splits value into count cells, padding with empty', () => {
    expect(toValueList('12', 4)).toEqual(['1', '2', '', '']);
    expect(toValueList('123456', 4)).toEqual(['1', '2', '3', '4']); // truncates
    expect(toValueList('', 3)).toEqual(['', '', '']);
    expect(toValueList(undefined as unknown as string, 2)).toEqual(['', '']);
  });

  it('joins back and detects completeness', () => {
    expect(fromValueList(['1', '2', '3'])).toBe('123');
    expect(fromValueList(['1', '', '3'])).toBe('13');
    expect(isComplete(['1', '2', '3'], 3)).toBe(true);
    expect(isComplete(['1', '', '3'], 3)).toBe(false);
    expect(isComplete(['1', '2'], 3)).toBe(false);
  });
});

describe('completeSingleInput (advance + onComplete gate)', () => {
  it('writes a char and advances active index', () => {
    const r = completeSingleInput(['', '', '', ''], 4, 0, '1');
    expect(r.list).toEqual(['1', '', '', '']);
    expect(r.nextIndex).toBe(1);
    expect(r.completed).toBe(false);
  });

  it('last cell: index clamps and completed becomes true', () => {
    const r = completeSingleInput(['1', '2', '3', ''], 4, 3, '4');
    expect(r.list).toEqual(['1', '2', '3', '4']);
    expect(r.nextIndex).toBe(3); // clamped to last cell
    expect(r.completed).toBe(true);
  });

  it('overwriting an existing cell keeps others', () => {
    const r = completeSingleInput(['1', '2', '3', '4'], 4, 1, '9');
    expect(r.list).toEqual(['1', '9', '3', '4']);
    expect(r.completed).toBe(true);
  });

  it('does not mutate the input list', () => {
    const src = ['', '', ''];
    completeSingleInput(src, 3, 0, '5');
    expect(src).toEqual(['', '', '']);
  });
});

describe('handleKeyDown (arrows / backspace / delete boundaries)', () => {
  it('ArrowLeft / ArrowRight move within bounds', () => {
    expect(handleKeyDown('ArrowLeft', 2, 4)).toEqual({ type: 'focus', index: 1 });
    expect(handleKeyDown('ArrowRight', 2, 4)).toEqual({ type: 'focus', index: 3 });
    expect(handleKeyDown('ArrowLeft', 0, 4)).toEqual({ type: 'focus', index: 0 }); // clamp
    expect(handleKeyDown('ArrowRight', 3, 4)).toEqual({ type: 'focus', index: 3 }); // clamp
  });

  it('Backspace clears + moves back; Delete clears + moves forward', () => {
    expect(handleKeyDown('Backspace', 2, 4)).toEqual({ type: 'clear', index: 2, nextIndex: 1 });
    expect(handleKeyDown('Backspace', 0, 4)).toEqual({ type: 'clear', index: 0, nextIndex: 0 });
    expect(handleKeyDown('Delete', 2, 4)).toEqual({ type: 'clear', index: 2, nextIndex: 3 });
    expect(handleKeyDown('Delete', 3, 4)).toEqual({ type: 'clear', index: 3, nextIndex: 3 });
  });

  it('Home / End jump to boundaries', () => {
    expect(handleKeyDown('Home', 2, 4)).toEqual({ type: 'focus', index: 0 });
    expect(handleKeyDown('End', 1, 4)).toEqual({ type: 'focus', index: 3 });
  });

  it('RTL mirrors ArrowLeft / ArrowRight', () => {
    expect(handleKeyDown('ArrowLeft', 1, 4, true)).toEqual({ type: 'focus', index: 2 });
    expect(handleKeyDown('ArrowRight', 1, 4, true)).toEqual({ type: 'focus', index: 0 });
  });

  it('other keys → none', () => {
    expect(handleKeyDown('a', 1, 4)).toEqual({ type: 'none' });
    expect(handleKeyDown('Enter', 1, 4)).toEqual({ type: 'none' });
  });
});

describe('distributePaste (stops at illegal char + count truncation)', () => {
  it('distributes valid digits from start index', () => {
    const r = distributePaste(['', '', '', ''], 4, 0, '1234', 'number');
    expect(r.list).toEqual(['1', '2', '3', '4']);
    expect(r.nextIndex).toBe(3);
    expect(r.completed).toBe(true);
    expect(r.written).toBe(4);
  });

  it('stops at the first illegal char', () => {
    const r = distributePaste(['', '', '', ''], 4, 0, '12a4', 'number');
    expect(r.list).toEqual(['1', '2', '', '']);
    expect(r.written).toBe(2);
    expect(r.nextIndex).toBe(1);
    expect(r.completed).toBe(false);
  });

  it('truncates to count when text is longer', () => {
    const r = distributePaste(['', '', '', ''], 4, 0, '123456789', 'number');
    expect(r.list).toEqual(['1', '2', '3', '4']);
    expect(r.written).toBe(4);
    expect(r.completed).toBe(true);
  });

  it('distributes from a mid cell, filling remaining', () => {
    const r = distributePaste(['9', '', '', ''], 4, 1, '234', 'number');
    expect(r.list).toEqual(['9', '2', '3', '4']);
    expect(r.nextIndex).toBe(3);
    expect(r.completed).toBe(true);
  });

  it('respects mixed / RegExp / function formats', () => {
    expect(distributePaste(['', '', ''], 3, 0, 'a1B', 'mixed').list).toEqual(['a', '1', 'B']);
    expect(distributePaste(['', '', ''], 3, 0, 'abz', /[a-c]/).list).toEqual(['a', 'b', '']);
  });

  it('does not mutate the input list', () => {
    const src = ['', '', ''];
    distributePaste(src, 3, 0, '12', 'number');
    expect(src).toEqual(['', '', '']);
  });
});
