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

/** Events laid out on a single day's hour timeline. */
export interface DayTimeline {
  /** all-day events + events that cover the day without a concrete hour (e.g. multi-day) */
  allDay: CalendarEvent[];
  /** map of hour (0..23) → timed events starting in that hour, sorted by start time */
  byHour: Map<number, CalendarEvent[]>;
}

/**
 * Split a day's events into an all-day bucket and per-hour buckets for the
 * day timeline (`mode='day'`). An event is "timed" on `date` only when it
 * actually starts on that calendar day and is not flagged `allDay`; its hour
 * is clamped into [fromHour, toHour]. Everything else covering the day (all-day
 * flagged, or multi-day events whose start falls on another day) goes to
 * `allDay`. Pure: no DOM, no mutation of inputs.
 */
export function timelineForDay(
  events: readonly CalendarEvent[],
  date: Date,
  fromHour = 0,
  toHour = 23,
): DayTimeline {
  const lo = Math.max(0, Math.min(23, Math.floor(fromHour)));
  const hi = Math.max(lo, Math.min(23, Math.floor(toHour)));
  const covering = events.filter((e) => eventCoversDay(e, date));
  const allDay: CalendarEvent[] = [];
  const timed: { hour: number; event: CalendarEvent }[] = [];
  for (const e of covering) {
    if (e.allDay || !isSameDay(e.start, date)) {
      allDay.push(e);
      continue;
    }
    const hour = Math.max(lo, Math.min(hi, e.start.getHours()));
    timed.push({ hour, event: e });
  }
  timed.sort((a, b) => {
    const d = a.event.start.getTime() - b.event.start.getTime();
    if (d !== 0) return d;
    return String(a.event.key).localeCompare(String(b.event.key));
  });
  const byHour = new Map<number, CalendarEvent[]>();
  for (const { hour, event } of timed) {
    const list = byHour.get(hour);
    if (list) list.push(event);
    else byHour.set(hour, [event]);
  }
  return { allDay, byHour };
}

/** re-export for convenience so the render layer imports calendar bits from one place */
export { isSameDay };
