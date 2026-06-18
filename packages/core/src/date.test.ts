import { describe, expect, it } from 'vitest';
import { isSameDay, startOfDay, addMonths, getMonthGrid, weekdayOrder } from './date.js';

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
});
