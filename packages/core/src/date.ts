/**
 * Framework-agnostic date utilities for DatePicker/Calendar.
 * No DOM, no framework deps. See specs/components/input/DatePicker.spec.md.
 * Pure calendar math only — formatting is the render layer's job (Intl).
 */

/** A cell in a month grid. */
export interface DayCell {
  date: Date;
  /** belongs to the displayed month (vs. leading/trailing days) */
  inMonth: boolean;
}

/** true if two dates fall on the same calendar day (local time) */
export function isSameDay(a: Date | null | undefined, b: Date | null | undefined): boolean {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** start of day (00:00:00.000) clone */
export function startOfDay(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

/** add (possibly negative) months, clamping the day to the target month length */
export function addMonths(d: Date, delta: number): Date {
  const r = new Date(d);
  const targetMonth = r.getMonth() + delta;
  r.setDate(1);
  r.setMonth(targetMonth);
  return r;
}

/**
 * Build a 6-row (42-cell) month grid for the month containing `cursor`.
 * @param weekStart 0 = Sunday (default), 1 = Monday
 */
export function getMonthGrid(cursor: Date, weekStart = 0): DayCell[] {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1);
  const firstWeekday = first.getDay(); // 0..6 (Sun..Sat)
  const lead = (firstWeekday - weekStart + 7) % 7;

  const cells: DayCell[] = [];
  // start `lead` days before the 1st
  const start = new Date(year, month, 1 - lead);
  for (let i = 0; i < 42; i += 1) {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    cells.push({ date, inMonth: date.getMonth() === month });
  }
  return cells;
}

/** ordered weekday indices given a week start (e.g. [1,2,3,4,5,6,0] for Monday-start) */
export function weekdayOrder(weekStart = 0): number[] {
  return Array.from({ length: 7 }, (_, i) => (i + weekStart) % 7);
}

/** add (possibly negative) weeks (7-day steps), preserving the day-of-week */
export function addWeeks(d: Date, delta: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + delta * 7);
}

/**
 * Build a single-week (7-cell) grid for the week containing `cursor`.
 * Every cell `inMonth` is relative to the month of `cursor`.
 * @param weekStart 0 = Sunday (default), 1 = Monday
 */
export function getWeekGrid(cursor: Date, weekStart = 0): DayCell[] {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const weekday = cursor.getDay(); // 0..6 (Sun..Sat)
  const lead = (weekday - weekStart + 7) % 7;
  const start = new Date(year, month, cursor.getDate() - lead);
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    return { date, inMonth: date.getMonth() === month };
  });
}
