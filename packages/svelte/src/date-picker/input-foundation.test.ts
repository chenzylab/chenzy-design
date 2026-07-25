/**
 * input-foundation（inset）逻辑测试 —— 对齐 Semi inputFoundation inset 数据流。
 * concatInsetInputValue / getInsetInputValue / handleInsetInputChange / getInsetInputPlaceholder。
 */
import { describe, it, expect } from 'vitest';
import { createInputFoundation } from './input-foundation.js';

const RANGE_SEP = ' ~ ';

describe('input-foundation inset 数据流', () => {
  it('concatInsetInputValue：date 取 monthLeft.dateInput', () => {
    const f = createInputFoundation(() => ({ type: 'date', rangeSeparator: RANGE_SEP }));
    const iv = { monthLeft: { dateInput: '2026-01-15', timeInput: '' }, monthRight: { dateInput: '', timeInput: '' } };
    expect(f.concatInsetInputValue({ insetInputValue: iv })).toBe('2026-01-15');
  });

  it('concatInsetInputValue：dateRange 用 rangeSeparator 拼两端', () => {
    const f = createInputFoundation(() => ({ type: 'dateRange', rangeSeparator: RANGE_SEP }));
    const iv = {
      monthLeft: { dateInput: '2026-01-10', timeInput: '' },
      monthRight: { dateInput: '2026-01-20', timeInput: '' },
    };
    expect(f.concatInsetInputValue({ insetInputValue: iv })).toBe('2026-01-10 ~ 2026-01-20');
  });

  it('concatInsetInputValue：dateTime 拼 date + time', () => {
    const f = createInputFoundation(() => ({ type: 'dateTime', rangeSeparator: RANGE_SEP }));
    const iv = {
      monthLeft: { dateInput: '2026-01-15', timeInput: '10:30:00' },
      monthRight: { dateInput: '', timeInput: '' },
    };
    expect(f.concatInsetInputValue({ insetInputValue: iv })).toBe('2026-01-15 10:30:00');
  });

  it('getInsetInputValue：由 value 反解 insetInputValue（date）', () => {
    const f = createInputFoundation(() => ({ type: 'date', format: 'yyyy-MM-dd', rangeSeparator: RANGE_SEP }));
    const iv = f.getInsetInputValue({ value: [new Date(2026, 0, 15)] });
    expect(iv.monthLeft.dateInput).toBe('2026-01-15');
  });

  it('getInsetInputValue：dateRange 由 value 反解两端', () => {
    const f = createInputFoundation(() => ({ type: 'dateRange', format: 'yyyy-MM-dd', rangeSeparator: RANGE_SEP }));
    const iv = f.getInsetInputValue({ value: [new Date(2026, 0, 10), new Date(2026, 0, 20)] });
    expect(iv.monthLeft.dateInput).toBe('2026-01-10');
    expect(iv.monthRight.dateInput).toBe('2026-01-20');
  });

  it('handleInsetInputChange：改 monthLeft.dateInput → 拼串 + 解析回', () => {
    const f = createInputFoundation(() => ({ type: 'date', format: 'yyyy-MM-dd', rangeSeparator: RANGE_SEP }));
    const start = f.emptyInsetInputValue();
    const res = f.handleInsetInputChange({
      value: '2026-01-15',
      valuePath: 'monthLeft.dateInput',
      insetInputValue: start,
    });
    expect(res.insetInputValue.monthLeft.dateInput).toBe('2026-01-15');
    expect(res.insetInputStr).toBe('2026-01-15');
  });

  it('handleInsetInputChange：dateTime 输完日期自动补时间', () => {
    const f = createInputFoundation(() => ({
      type: 'dateTime',
      format: 'yyyy-MM-dd HH:mm:ss',
      rangeSeparator: RANGE_SEP,
      defaultPickerValue: new Date(2026, 0, 1, 8, 0, 0),
    }));
    const start = f.emptyInsetInputValue();
    const res = f.handleInsetInputChange({
      value: '2026-01-15',
      valuePath: 'monthLeft.dateInput',
      insetInputValue: start,
    });
    // 日期长度=10 且合法 → 补默认时间（08:00:00）。
    expect(res.insetInputValue.monthLeft.dateInput).toBe('2026-01-15');
    expect(res.insetInputValue.monthLeft.timeInput).toBe('08:00:00');
  });

  it('getInsetInputPlaceholder：dateTime 拆 date/time 占位符', () => {
    const f = createInputFoundation(() => ({ type: 'dateTime', format: 'yyyy-MM-dd HH:mm:ss', rangeSeparator: RANGE_SEP }));
    const ph = f.getInsetInputPlaceholder();
    expect(ph.datePlaceholder).toBe('yyyy-MM-dd');
    expect(ph.timePlaceholder).toBe('HH:mm:ss');
  });
});
