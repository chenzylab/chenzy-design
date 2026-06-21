import { describe, expect, it } from 'vitest';
import {
  isSameDay,
  startOfDay,
  addMonths,
  addWeeks,
  addDays,
  getMonthGrid,
  getWeekGrid,
  getDayHours,
  weekdayOrder,
  daysBetween,
  formatDate,
  parseDateString,
} from './date.js';

describe('date utils', () => {
  it('isSameDay compares calendar day only', () => {
    expect(isSameDay(new Date(2024, 0, 1, 9), new Date(2024, 0, 1, 23))).toBe(true);
    expect(isSameDay(new Date(2024, 0, 1), new Date(2024, 0, 2))).toBe(false);
    expect(isSameDay(null, new Date())).toBe(false);
  });

  it('startOfDay zeroes the time', () => {
    const r = startOfDay(new Date(2024, 5, 15, 13, 30, 45));
    expect(r.getHours()).toBe(0);
    expect(r.getMinutes()).toBe(0);
    expect(r.getDate()).toBe(15);
  });

  it('addMonths handles year boundary and clamps day', () => {
    expect(addMonths(new Date(2024, 11, 10), 1).getMonth()).toBe(0); // Dec → Jan
    expect(addMonths(new Date(2024, 11, 10), 1).getFullYear()).toBe(2025);
    // Jan 31 + 1 month → Feb (clamped, never spills to March)
    expect(addMonths(new Date(2024, 0, 31), 1).getMonth()).toBe(1);
  });

  it('getMonthGrid yields 42 cells with correct in-month flags', () => {
    const cells = getMonthGrid(new Date(2024, 0, 15)); // Jan 2024, Sunday-start
    expect(cells).toHaveLength(42);
    const inMonth = cells.filter((c) => c.inMonth);
    expect(inMonth).toHaveLength(31); // January has 31 days
    expect(inMonth[0]?.date.getDate()).toBe(1);
  });

  it('getMonthGrid Monday-start shifts the lead', () => {
    // Jan 2024: 1st is a Monday → Monday-start grid begins exactly on the 1st
    const cells = getMonthGrid(new Date(2024, 0, 1), 1);
    expect(cells[0]?.date.getDate()).toBe(1);
    expect(cells[0]?.inMonth).toBe(true);
  });

  it('weekdayOrder rotates by week start', () => {
    expect(weekdayOrder(0)).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(weekdayOrder(1)).toEqual([1, 2, 3, 4, 5, 6, 0]);
  });

  it('addWeeks steps by 7 days and crosses months', () => {
    expect(addWeeks(new Date(2024, 0, 1), 1).getDate()).toBe(8);
    expect(addWeeks(new Date(2024, 0, 8), -1).getDate()).toBe(1);
    // Jan 29 + 1 week → Feb 5 (crosses month boundary)
    const r = addWeeks(new Date(2024, 0, 29), 1);
    expect(r.getMonth()).toBe(1);
    expect(r.getDate()).toBe(5);
  });

  it('getWeekGrid yields 7 cells starting on the week start', () => {
    // 2024-01-15 is a Monday; Sunday-start week begins 2024-01-14
    const sun = getWeekGrid(new Date(2024, 0, 15), 0);
    expect(sun).toHaveLength(7);
    expect(sun[0]?.date.getDate()).toBe(14);
    expect(sun[0]?.date.getDay()).toBe(0);
    expect(sun[6]?.date.getDate()).toBe(20);
    // Monday-start week containing the 15th begins on the 15th
    const mon = getWeekGrid(new Date(2024, 0, 15), 1);
    expect(mon[0]?.date.getDate()).toBe(15);
    expect(mon[0]?.date.getDay()).toBe(1);
  });

  it('getWeekGrid flags inMonth relative to cursor month', () => {
    // 2024-02-01 is a Thursday; Sunday-start week spills into late January
    const cells = getWeekGrid(new Date(2024, 1, 1), 0);
    expect(cells[0]?.date.getMonth()).toBe(0); // Jan 28
    expect(cells[0]?.inMonth).toBe(false);
    expect(cells.some((c) => c.inMonth)).toBe(true);
  });

  it('addDays steps by 1 day and crosses month boundaries', () => {
    expect(addDays(new Date(2024, 0, 1), 1).getDate()).toBe(2);
    expect(addDays(new Date(2024, 0, 1), -1).getMonth()).toBe(11); // Dec 31, 2023
    expect(addDays(new Date(2024, 0, 1), -1).getFullYear()).toBe(2023);
    // preserves time-of-day
    const t = addDays(new Date(2024, 0, 1, 13, 30), 1);
    expect(t.getHours()).toBe(13);
    expect(t.getMinutes()).toBe(30);
  });

  it('getDayHours yields one slot per hour in range on the cursor day', () => {
    const slots = getDayHours(new Date(2024, 5, 15, 8, 30));
    expect(slots).toHaveLength(24);
    expect(slots[0]?.hour).toBe(0);
    expect(slots[0]?.date.getHours()).toBe(0);
    expect(slots[0]?.date.getDate()).toBe(15);
    expect(slots[23]?.hour).toBe(23);
  });

  it('getDayHours honours and clamps a custom from/to range', () => {
    const slots = getDayHours(new Date(2024, 5, 15), 9, 11);
    expect(slots.map((s) => s.hour)).toEqual([9, 10, 11]);
    // out-of-bounds clamps into 0..23
    expect(getDayHours(new Date(2024, 5, 15), -5, 30)).toHaveLength(24);
  });

  it('daysBetween counts whole days ignoring time-of-day', () => {
    expect(daysBetween(new Date(2024, 0, 1, 23), new Date(2024, 0, 2, 1))).toBe(1);
    expect(daysBetween(new Date(2024, 0, 1), new Date(2024, 0, 1, 23))).toBe(0);
    expect(daysBetween(new Date(2024, 0, 10), new Date(2024, 0, 1))).toBe(-9);
    // crosses month boundary
    expect(daysBetween(new Date(2024, 0, 31), new Date(2024, 1, 2))).toBe(2);
  });
});

describe('formatDate', () => {
  it('formats common patterns with zero-padding', () => {
    const d = new Date(2024, 2, 7, 9, 5, 3);
    expect(formatDate(d, 'YYYY-MM-DD')).toBe('2024-03-07');
    expect(formatDate(d, 'YYYY/MM/DD HH:mm')).toBe('2024/03/07 09:05');
    expect(formatDate(d, 'YYYY-MM-DD HH:mm:ss')).toBe('2024-03-07 09:05:03');
  });

  it('emits non-token characters verbatim', () => {
    const d = new Date(2024, 11, 25);
    expect(formatDate(d, 'YYYY 年 MM 月 DD 日')).toBe('2024 年 12 月 25 日');
  });
});

describe('parseDateString', () => {
  it('round-trips with formatDate', () => {
    const d = new Date(2024, 2, 7, 9, 5, 0);
    const s = formatDate(d, 'YYYY-MM-DD HH:mm');
    const back = parseDateString(s, 'YYYY-MM-DD HH:mm');
    expect(back?.getTime()).toBe(d.getTime());
  });

  it('parses date-only patterns to start of day', () => {
    const r = parseDateString('2024/03/07', 'YYYY/MM/DD');
    expect(r?.getFullYear()).toBe(2024);
    expect(r?.getMonth()).toBe(2);
    expect(r?.getDate()).toBe(7);
    expect(r?.getHours()).toBe(0);
  });

  it('accepts single-digit fields where the pattern allows', () => {
    const r = parseDateString('2024-3-7', 'YYYY-MM-DD');
    expect(r?.getMonth()).toBe(2);
    expect(r?.getDate()).toBe(7);
  });

  it('rejects non-matching input and out-of-range fields', () => {
    expect(parseDateString('', 'YYYY-MM-DD')).toBeNull();
    expect(parseDateString('not a date', 'YYYY-MM-DD')).toBeNull();
    expect(parseDateString('2024-13-01', 'YYYY-MM-DD')).toBeNull();
    expect(parseDateString('2024-02-30', 'YYYY-MM-DD')).toBeNull(); // overflow rejected
    expect(parseDateString('2024-03-07 25:00', 'YYYY-MM-DD HH:mm')).toBeNull();
    expect(parseDateString('2024/03/07', 'YYYY-MM-DD')).toBeNull(); // wrong separators
  });
});
