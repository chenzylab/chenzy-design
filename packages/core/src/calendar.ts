/**
 * createCalendar helpers — framework-agnostic month-view event grouping.
 * Pure functions only; reuses date.ts grid math. No DOM, no framework deps.
 * See specs/components/show/Calendar.spec.md §3 (month-view subset).
 */
import { isSameDay, startOfDay } from './date.js';

export type CalendarEventKey = string | number;

export interface CalendarEvent {
  key: CalendarEventKey;
  /** event start (inclusive) */
  start: Date;
  /** event end (inclusive day for multi-day; same day as start if omitted) */
  end?: Date;
  title: string;
  /** category accent color (any CSS color); render layer falls back to a token */
  color?: string;
  allDay?: boolean;
  disabled?: boolean;
}

/** Events visible on one day plus an overflow count after capping. */
export interface DayEvents {
  /** events shown (already capped to `maxPerDay`) */
  visible: CalendarEvent[];
  /** total events on the day (including hidden) */
  total: CalendarEvent[];
  /** how many events are hidden beyond the cap (total - visible) */
  overflow: number;
}

/** true if `date` falls within [start, end] (inclusive, day granularity). */
export function eventCoversDay(event: CalendarEvent, date: Date): boolean {
  const day = startOfDay(date).getTime();
  const start = startOfDay(event.start).getTime();
  const end = startOfDay(event.end ?? event.start).getTime();
  return day >= start && day <= end;
}

/**
 * Group events onto a specific day, sorted by start time, capped at `maxPerDay`.
 * Multi-day events appear on every day they cover.
 */
export function eventsForDay(
  events: readonly CalendarEvent[],
  date: Date,
  maxPerDay = Infinity,
): DayEvents {
  const total = events
    .filter((e) => eventCoversDay(e, date))
    .slice()
    .sort((a, b) => {
      // all-day events first, then by start time, then stable by key string
      if (!!a.allDay !== !!b.allDay) return a.allDay ? -1 : 1;
      const d = a.start.getTime() - b.start.getTime();
      if (d !== 0) return d;
      return String(a.key).localeCompare(String(b.key));
    });
  const cap = maxPerDay < 0 ? 0 : maxPerDay;
  const visible = total.slice(0, cap);
  return { visible, total, overflow: Math.max(0, total.length - visible.length) };
}

/**
 * Build a map (keyed by `YYYY-M-D`) of events-per-day for a set of cells,
 * so the render layer can look up each grid cell in O(1).
 */
export function groupEventsByDays(
  events: readonly CalendarEvent[],
  days: readonly Date[],
  maxPerDay = Infinity,
): Map<string, DayEvents> {
  const map = new Map<string, DayEvents>();
  for (const date of days) {
    map.set(dayKey(date), eventsForDay(events, date, maxPerDay));
  }
  return map;
}

/** stable per-day map key (local time) */
export function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

/** true if `date` is strictly before today (day granularity) */
export function isPastDay(date: Date, today: Date): boolean {
  return startOfDay(date).getTime() < startOfDay(today).getTime();
}

/** re-export for convenience so the render layer imports calendar bits from one place */
export { isSameDay };
