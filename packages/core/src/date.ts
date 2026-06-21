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

/** add (possibly negative) days, preserving the local time-of-day */
export function addDays(d: Date, delta: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + delta);
  return r;
}

/**
 * Build an ordered list of hour slots [from, to) for a single day's timeline.
 * Each slot's `date` is the start-of-hour Date on the day of `cursor`.
 * @param from first hour (inclusive), default 0
 * @param to last hour (inclusive), default 23
 */
export function getDayHours(cursor: Date, from = 0, to = 23): { hour: number; date: Date }[] {
  const lo = Math.max(0, Math.min(23, Math.floor(from)));
  const hi = Math.max(lo, Math.min(23, Math.floor(to)));
  const y = cursor.getFullYear();
  const m = cursor.getMonth();
  const d = cursor.getDate();
  return Array.from({ length: hi - lo + 1 }, (_, i) => {
    const hour = lo + i;
    return { hour, date: new Date(y, m, d, hour) };
  });
}

/**
 * Whole calendar days between two dates (b - a), ignoring time-of-day.
 * Positive when `b` is after `a`. Order-independent magnitude via Math.abs.
 */
export function daysBetween(a: Date, b: Date): number {
  const ms = startOfDay(b).getTime() - startOfDay(a).getTime();
  return Math.round(ms / 86_400_000);
}

/**
 * Token-based date formatting. Supported tokens (longest-match first):
 *   YYYY year (4)   MM month (01-12)   DD day (01-31)
 *   HH hour (00-23) mm minute (00-59)  ss second (00-59)
 * Any other characters in the pattern are emitted verbatim (separators,
 * literals). No locale/timezone math — uses the Date's local fields.
 */
export function formatDate(date: Date, pattern: string): string {
  const pad = (n: number, len = 2) => String(n).padStart(len, '0');
  const map: Record<string, string> = {
    YYYY: pad(date.getFullYear(), 4),
    MM: pad(date.getMonth() + 1),
    DD: pad(date.getDate()),
    HH: pad(date.getHours()),
    mm: pad(date.getMinutes()),
    ss: pad(date.getSeconds()),
  };
  return pattern.replace(/YYYY|MM|DD|HH|mm|ss/g, (t) => map[t] ?? t);
}

/**
 * Parse a string against a token pattern (mirror of {@link formatDate}).
 * Returns a local Date on success, or null when the input doesn't match the
 * pattern or yields an out-of-range field. Missing time tokens default to 0.
 * Non-token characters in the pattern must appear literally in the input.
 */
export function parseDateString(input: string, pattern: string): Date | null {
  if (!input) return null;
  const tokenRe = /YYYY|MM|DD|HH|mm|ss/g;
  const order: string[] = [];
  let regexSrc = '';
  let last = 0;
  const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  for (let m = tokenRe.exec(pattern); m; m = tokenRe.exec(pattern)) {
    regexSrc += escape(pattern.slice(last, m.index));
    const tok = m[0];
    order.push(tok);
    regexSrc += tok === 'YYYY' ? '(\\d{4})' : '(\\d{1,2})';
    last = tokenRe.lastIndex;
  }
  regexSrc += escape(pattern.slice(last));
  const match = new RegExp(`^${regexSrc}$`).exec(input.trim());
  if (!match) return null;

  const parts: Record<string, number> = {};
  order.forEach((tok, i) => {
    parts[tok] = Number(match[i + 1]);
  });

  const year = parts.YYYY ?? new Date().getFullYear();
  const month = parts.MM != null ? parts.MM - 1 : 0;
  const day = parts.DD ?? 1;
  const hour = parts.HH ?? 0;
  const minute = parts.mm ?? 0;
  const second = parts.ss ?? 0;

  if (month < 0 || month > 11) return null;
  if (day < 1 || day > 31) return null;
  if (hour > 23 || minute > 59 || second > 59) return null;

  const d = new Date(year, month, day, hour, minute, second, 0);
  // reject overflow normalization (e.g. Feb 30 → Mar 2)
  if (d.getFullYear() !== year || d.getMonth() !== month || d.getDate() !== day) {
    return null;
  }
  return d;
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
