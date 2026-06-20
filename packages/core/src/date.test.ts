import { describe, expect, it } from 'vitest';
import {
  isSameDay,
  startOfDay,
  addMonths,
  addWeeks,
  getMonthGrid,
  getWeekGrid,
  weekdayOrder,
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
});
