/**
 * Framework-agnostic Calendar event algorithms — aligned to Semi Design's
 * `@douyinfe/semi-foundation/calendar/eventUtil` + `foundation`.
 *
 * Four view modes: day / week / month / range. Pure functions only; no DOM,
 * no framework deps. The render layer (Calendar.svelte) supplies `children`
 * for each event and turns the numeric positions here into inline styles.
 *
 * Semi event model: an EventObject carries a `key` (required, unique) and an
 * optional `start` / `end` / `allDay`. Content is the render layer's business
 * (Semi: `children`); this module never touches it beyond passing it through.
 */
import { isSameDay, startOfDay } from './date.js';

export type CalendarEventKey = string | number;

/** Semi EventObject. `children` is opaque render content (any). */
export interface CalendarEvent {
  key: CalendarEventKey;
  start?: Date;
  end?: Date;
  allDay?: boolean;
  /** opaque render content (Semi: children); render layer owns it */
  children?: unknown;
  [x: string]: unknown;
}

// ============================ low-level date algebra ============================
// Calendar-only date helpers (Semi uses date-fns). Kept local so DatePicker's
// shared date.ts stays untouched. All local-time, pure.

const MS_DAY = 86_400_000;

export function addDaysLocal(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}
export function addHoursLocal(d: Date, n: number): Date {
  const r = new Date(d);
  r.setHours(r.getHours() + n);
  return r;
}
export function endOfDay(d: Date): Date {
  const r = new Date(d);
  r.setHours(23, 59, 59, 999);
  return r;
}
export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
export function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}
export function startOfWeek(d: Date, weekStartsOn: WeekStartsOn = 0): Date {
  const day = d.getDay();
  const diff = (day - weekStartsOn + 7) % 7;
  return startOfDay(addDaysLocal(d, -diff));
}
export function endOfWeek(d: Date, weekStartsOn: WeekStartsOn = 0): Date {
  return endOfDay(addDaysLocal(startOfWeek(d, weekStartsOn), 6));
}
export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}
export function isSameWeek(a: Date, b: Date, weekStartsOn: WeekStartsOn = 0): boolean {
  return isSameDay(startOfWeek(a, weekStartsOn), startOfWeek(b, weekStartsOn));
}
/** whole calendar days b - a (positive when b is later) */
export function differenceInCalendarDays(b: Date, a: Date): number {
  return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / MS_DAY);
}
export function isBefore(a: Date, b: Date): boolean {
  return a.getTime() < b.getTime();
}
export function isAfter(a: Date, b: Date): boolean {
  return a.getTime() > b.getTime();
}
export function isWeekend(d: Date): boolean {
  const day = d.getDay();
  return day === 0 || day === 6;
}
/** ISO-ish week-of-month index (1-based) for a date, given weekStartsOn */
export function getWeekOfMonth(date: Date, weekStartsOn: WeekStartsOn = 0): number {
  const firstOfMonth = startOfMonth(date);
  const firstWeekStart = startOfWeek(firstOfMonth, weekStartsOn);
  const diff = differenceInCalendarDays(startOfWeek(date, weekStartsOn), firstWeekStart);
  return Math.floor(diff / 7) + 1;
}
/** number of week rows the month spans, given weekStartsOn */
export function getWeeksInMonth(date: Date, weekStartsOn: WeekStartsOn = 0): number {
  const first = startOfMonth(date);
  const last = endOfMonth(date);
  const firstWeekStart = startOfWeek(first, weekStartsOn);
  const lastWeekStart = startOfWeek(last, weekStartsOn);
  return Math.round(differenceInCalendarDays(lastWeekStart, firstWeekStart) / 7) + 1;
}

export type WeekStartsOn = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const round = (value: number): number => Math.round(value * 1000) / 1000;

/** fraction of the day [0,1) at which `value`'s clock time falls (Semi getPos) */
export function getPos(value: Date): number {
  const currSec = (value.getHours() * 60 + value.getMinutes()) * 60 + value.getSeconds();
  return currSec / (24 * 60 * 60);
}

const isAllDayEvent = (e: CalendarEvent): boolean => 'allDay' in e && !!e.allDay;

const sortByStart = (a: CalendarEvent, b: CalendarEvent): number =>
  (a.start?.getTime() ?? 0) - (b.start?.getTime() ?? 0);

// ============================ event normalization (Semi parseEvent) ============================

interface DatedEvent extends CalendarEvent {
  /** the calendar day this (possibly split) copy belongs to */
  date: Date;
}

function copyEvent(
  event: CalendarEvent,
  date: Date,
  start?: Date,
  end?: Date,
  allDay = false,
): DatedEvent {
  return { ...event, date, ...(start ? { start } : {}), ...(end ? { end } : {}), allDay };
}

/**
 * Normalize a single event: if it has no start, default start = end - 1h (or
 * start-of-day if that would cross a day boundary); symmetric for missing end.
 * (Semi amendEvent)
 */
export function amendEvent(event: CalendarEvent): CalendarEvent | undefined {
  const { start, end } = event;
  if (!start && !end) return undefined;
  const e = { ...event };
  if (!start && end) {
    e.start = isSameDay(end, addHoursLocal(end, -1)) ? addHoursLocal(end, -1) : startOfDay(end);
  } else if (start) {
    e.end = isSameDay(start, addHoursLocal(start, 1)) ? addHoursLocal(start, 1) : endOfDay(start);
  }
  return e;
}

/** split a spanned all-day event into one copy per covered day (Semi parseAllDayEvent) */
export function parseAllDayEvent(
  event: CalendarEvent,
  allDay = true,
  currDate?: Date,
): DatedEvent[] {
  const res: DatedEvent[] = [];
  const { start, end } = event;
  if (start && end) {
    const diff = differenceInCalendarDays(end, start);
    for (let day = 0; day <= diff; day += 1) {
      res.push(copyEvent(event, addDaysLocal(start, day), undefined, undefined, allDay));
    }
  } else {
    const date = start ?? end ?? currDate ?? new Date();
    res.push(copyEvent(event, startOfDay(date), undefined, undefined, allDay));
  }
  return res;
}

/**
 * Split an event into per-day copies (Semi parseEvent). Same-day timed events
 * stay whole; timed events spanning < 24h split into a head (to end-of-day) and
 * a tail (start-of-next-day); longer/all-day span into daily all-day copies.
 */
export function parseEvent(event: CalendarEvent): DatedEvent[] {
  const e = { ...event };
  const { start, end } = e;
  let res: DatedEvent[] = [];
  if (isAllDayEvent(e)) return parseAllDayEvent(e);

  if (start && end) {
    const s = isBefore(start, end) ? start : end;
    const en = isBefore(start, end) ? end : start;
    e.start = s;
    e.end = en;
    if (isSameDay(s, en)) {
      res.push(copyEvent(e, startOfDay(s)));
    } else if (Math.abs(en.getTime() - s.getTime()) < MS_DAY) {
      res.push(copyEvent(e, startOfDay(s), undefined, endOfDay(s)));
      res.push(copyEvent(e, startOfDay(en), startOfDay(en)));
    } else {
      res = res.concat(parseAllDayEvent(e));
    }
  } else {
    const amend = amendEvent(e);
    if (amend) res.push(copyEvent(amend, startOfDay(amend.start as Date)));
  }
  return res;
}

/** split all events into all-day vs timed buckets (Semi _parseEvents) */
export function parseEvents(events: readonly CalendarEvent[]): {
  allDay: DatedEvent[];
  day: DatedEvent[];
} {
  const allDay: DatedEvent[] = [];
  const day: DatedEvent[] = [];
  for (const event of events) {
    for (const item of parseEvent(event)) {
      if (item.allDay) allDay.push(item);
      else day.push(item);
    }
  }
  return { allDay, day };
}

/** group dated events into a Map keyed by start-of-day string (Semi convertEventsArrToMap) */
export function convertEventsArrToMap(
  arr: readonly DatedEvent[],
  key: 'start' | 'date',
  normalize: ((v: Date) => Date) | null,
): Map<string, DatedEvent[]> {
  const res = new Map<string, DatedEvent[]>();
  for (const item of arr) {
    const val = (item[key] as Date) ?? item.date;
    const k = (normalize ? normalize(val) : val).toString();
    const bucket = res.get(k);
    if (bucket) bucket.push(item);
    else res.set(k, [item]);
  }
  return res;
}

// ============================ timed-event positioning (day/week/range) ============================

/** a timed event positioned on a single day's [0,1] vertical axis */
export interface PositionedDayEvent {
  key: CalendarEventKey;
  children: unknown;
  /** fraction [0,1] where the event starts on the day */
  startPos: number;
  /** fraction [0,1] where the event ends on the day */
  endPos: number;
  /** horizontal offset for side-by-side overlaps, e.g. "50%" or 0 */
  left: string | number;
  allDay: boolean;
}

/** compute a timed event's startPos/endPos on its day (Semi renderDailyEvent) */
export function renderDailyEvent(event: DatedEvent): {
  startPos: number;
  endPos: number;
  children: unknown;
  allDay: boolean;
  key: CalendarEventKey;
} {
  let { start, end } = event;
  let startPos: number;
  let endPos: number;
  if (isAllDayEvent(event)) {
    startPos = 0;
    endPos = 0;
  } else if (!start || !end) {
    const amend = amendEvent(event);
    endPos = getPos(amend!.end as Date);
    startPos = getPos(amend!.start as Date);
  } else {
    if (!isBefore(start, end)) [start, end] = [end, start];
    startPos = getPos(start);
    endPos = getPos(end);
  }
  return {
    key: event.key,
    startPos: round(startPos),
    endPos: round(endPos),
    children: event.children,
    allDay: !!event.allDay,
  };
}

/**
 * Timed events for one calendar day, positioned and offset for overlaps
 * (Semi getParseDailyEvents). Events sharing an identical [startPos,endPos]
 * are laid out side-by-side via the `left` percentage.
 */
export function getDailyEvents(
  events: readonly DatedEvent[],
  date: Date,
): { day: PositionedDayEvent[]; allDay: DatedEvent[] } {
  const key = startOfDay(date).toString();
  const parsed = parseEvents(events);
  const allDayMap = convertEventsArrToMap(parsed.allDay, 'date', startOfDay);
  const dayMap = convertEventsArrToMap(parsed.day, 'date', null);
  const allDay = allDayMap.get(key) ?? [];
  const dayRaw = dayMap.get(key) ?? [];

  const positioned = dayRaw.map(renderDailyEvent);
  // group by identical position span
  const spanGroups = new Map<string, number>();
  for (const item of positioned) {
    const gk = `${item.startPos}-${item.endPos}`;
    spanGroups.set(gk, (spanGroups.get(gk) ?? 0) + 1);
  }
  const countMap = new Map<string, number>();
  const day: PositionedDayEvent[] = positioned.map((item) => {
    const gk = `${item.startPos}-${item.endPos}`;
    const prev = countMap.get(gk);
    const cur = prev === undefined ? 0 : prev + 1;
    countMap.set(gk, cur);
    const groupSize = spanGroups.get(gk) ?? 1;
    const left = cur !== 0 ? `${(cur / groupSize) * 100}%` : 0;
    return { ...item, left };
  });
  return { day, allDay };
}

// ============================ all-day span layout (week/range top row) ============================

/** a spanned all-day event positioned across the week/range top row */
export interface PositionedSpanEvent {
  key: CalendarEventKey;
  children: unknown;
  /** fraction [0,1] of the row width where the bar starts */
  leftPos: number;
  /** fraction (0,1] of the row width the bar occupies */
  width: number;
  /** vertical stacking row index (0-based) */
  topInd: number;
}

const isDateInRange = (date: Date, start: Date, end: Date): boolean =>
  date.getTime() < end.getTime() && date.getTime() >= start.getTime();

const sortDateStr = (a: string, b: string): number =>
  isBefore(new Date(a), new Date(b)) ? -1 : 1;

/** filter a day-keyed event map to those overlapping [start,end) (Semi filterEvents) */
function filterEvents(
  events: Map<string, DatedEvent[]>,
  start: Date,
  end: Date,
): Map<string, DatedEvent[]> {
  const res = new Map<string, DatedEvent[]>();
  for (const day of events.keys()) {
    const item = events.get(day)!;
    const date = new Date(day);
    if (isDateInRange(date, start, end)) {
      res.set(day, res.has(day) ? [...res.get(day)!, ...item] : item);
    } else if (isBefore(end, date)) {
      // beyond range: drop
    } else {
      const filtered = item.filter((i) => !i.end || !isBefore(i.end, start));
      const k = start.toString();
      res.set(k, res.has(k) ? [...res.get(k)!, ...filtered] : item);
    }
  }
  return res;
}

/**
 * Arrange all-day/spanned events across a [rangeStart,rangeEnd) row, stacking
 * overlaps into rows and computing leftPos/width/topInd (Semi parseRangeAllDayEvent).
 * `parsed` is a working matrix [row][col]; returns it mutated.
 */
function parseRangeAllDayEvent(
  event: DatedEvent[],
  startDate: Date,
  rangeStart: Date,
  rangeEnd: Date,
  parsed: (PositionedSpanEvent | DatedEvent)[][],
): (PositionedSpanEvent | DatedEvent)[][] {
  const dateRangeLen = differenceInCalendarDays(rangeEnd, rangeStart);
  event
    .slice()
    .sort((a, b) => sortByStart(a, b))
    .forEach((item) => {
      const { end } = item;
      const j = differenceInCalendarDays(startDate, rangeStart);
      let i = 0;
      while (parsed[i] && parsed[i]![j]) i++;

      let dateLength: number;
      if (!end) {
        dateLength = 0;
      } else {
        dateLength = isDateInRange(end, rangeStart, rangeEnd)
          ? differenceInCalendarDays(end, startDate)
          : differenceInCalendarDays(rangeEnd, startDate);
      }

      const info: PositionedSpanEvent = {
        key: item.key,
        children: item.children,
        leftPos: round(j / dateRangeLen),
        width: Math.min(1 - round(j / dateRangeLen), round(((dateLength + 1) * 1) / dateRangeLen)),
        topInd: i,
      };

      for (let dist = 0; dist <= dateLength; dist += 1) {
        if (!parsed[i]) parsed[i] = [];
        parsed[i]![j + dist] = dist > 0 ? item : info;
      }
    });
  return parsed;
}

/** pull the positioned span events out of the working matrix */
function collectSpanEvents(parsed: (PositionedSpanEvent | DatedEvent)[][]): PositionedSpanEvent[] {
  const res: PositionedSpanEvent[] = [];
  for (const row of parsed) {
    if (!row) continue;
    for (const item of row) {
      if (item && 'leftPos' in item) res.push(item as PositionedSpanEvent);
    }
  }
  return res;
}

/**
 * Lay out all-day/spanned events across a date range (week or multi-day view).
 * `rangeStart` inclusive, `rangeEnd` exclusive (Semi's left-closed-right-open).
 */
export function parseSpanEvents(
  allDayEvents: readonly DatedEvent[],
  rangeStart: Date,
  rangeEnd: Date,
): PositionedSpanEvent[] {
  const map = convertEventsArrToMap(allDayEvents, 'start', startOfDay);
  const filtered = filterEvents(map, rangeStart, rangeEnd);
  let parsed: (PositionedSpanEvent | DatedEvent)[][] = [[]];
  [...filtered.keys()].sort(sortDateStr).forEach((k) => {
    const startDate = new Date(k);
    const curr = filtered.get(k)!.filter((e) => isSameDay(e.date, startDate));
    parsed = parseRangeAllDayEvent(curr, startDate, rangeStart, rangeEnd, parsed);
  });
  return collectSpanEvents(parsed);
}

/** week-scoped span layout (Semi parseWeeklyAllDayEvents) */
export function parseWeekSpanEvents(
  allDayEvents: readonly DatedEvent[],
  weekStart: Date,
  weekStartsOn: WeekStartsOn = 0,
): PositionedSpanEvent[] {
  return parseSpanEvents(
    allDayEvents,
    weekStart,
    addDaysLocal(endOfWeek(weekStart, weekStartsOn), 1),
  );
}

/** the all-day bucket (start-of-day keyed) for a set of events, for span layout */
export function allDayEventMap(events: readonly CalendarEvent[]): DatedEvent[] {
  return parseEvents(events).allDay;
}

/** number of stacking rows a span layout needs (Semi calcRowHeight) */
export function calcRowHeight(events: readonly PositionedSpanEvent[]): number {
  const tops = events.map((e) => e.topInd);
  return tops.length ? Math.max(...tops) + 1 : 1;
}

// ============================ month grid event layout ============================

/** one date cell descriptor for month/week header rendering */
export interface DateObj {
  ind: number;
  date: Date;
  dayString: string;
  weekday: string;
  isToday: boolean;
  isWeekend: boolean;
  isSameMonth?: boolean;
}

/**
 * Month event layout: for each week row (0-based), the events laid out as a
 * grid (day[]) plus a flat display list of positioned span bars, so the render
 * layer can cap to N per cell and show "+remaining". (Semi getParseMonthlyEvents)
 */
export interface MonthWeekEvents {
  /** display[col] → span events stacked in this week, by topInd */
  display: PositionedSpanEvent[];
  /** day[col][topInd] → event occupying that cell/row (for +N counting) */
  day: (PositionedSpanEvent | DatedEvent | undefined)[][];
}

function collectDailyEvents(
  events: (PositionedSpanEvent | DatedEvent)[][],
): (PositionedSpanEvent | DatedEvent | undefined)[][] {
  const collections: (PositionedSpanEvent | DatedEvent | undefined)[][] = [];
  events.forEach((row, rowInd) => {
    if (!row) return;
    row.forEach((event, ind) => {
      if (!collections[ind]) collections[ind] = [];
      collections[ind][rowInd] = event;
    });
  });
  return collections;
}

/**
 * Lay out a month's events by week row (Semi getParseMonthlyEvents). Returns a
 * map week-index → { day, display }. The render layer counts how many events a
 * given day cell holds beyond `itemLimit` for the "+N" affordance.
 */
export function getMonthEvents(
  events: readonly CalendarEvent[],
  displayValue: Date,
  weekStartsOn: WeekStartsOn = 0,
): Record<number, MonthWeekEvents> {
  const firstDayOfMonth = startOfMonth(displayValue);
  const lastDayOfMonth = endOfMonth(displayValue);
  const currDate = displayValue;

  const dated: DatedEvent[] = [];
  events
    .slice()
    .sort((a, b) => {
      if (a.start && b.start) {
        if (isBefore(a.start, b.start)) return -1;
        if (isAfter(a.start, b.start)) return 1;
      }
      return 0;
    })
    .forEach((event) => {
      dated.push(...parseAllDayEvent(event, event.allDay, currDate));
    });

  const perWeek: Record<number, DatedEvent[]> = {};
  const push = (item: DatedEvent, ind: number) => {
    if (perWeek[ind]) perWeek[ind].push(item);
    else perWeek[ind] = [item];
  };
  for (const item of dated) {
    if (isSameMonth(item.date, displayValue)) {
      push(item, getWeekOfMonth(item.date, weekStartsOn) - 1);
      continue;
    }
    if (isBefore(item.date, firstDayOfMonth)) {
      if (isSameWeek(item.date, firstDayOfMonth, weekStartsOn)) push(item, 0);
      continue;
    }
    if (isAfter(item.date, lastDayOfMonth)) {
      if (isSameWeek(item.date, lastDayOfMonth, weekStartsOn)) {
        push(item, getWeekOfMonth(lastDayOfMonth, weekStartsOn) - 1);
      }
    }
  }

  const result: Record<number, MonthWeekEvents> = {};
  for (const k of Object.keys(perWeek)) {
    const ind = Number(k);
    const week = perWeek[ind]!;
    const weekStart = startOfWeek(week[0]!.date, weekStartsOn);
    const weekEnd = addDaysLocal(endOfWeek(weekStart, weekStartsOn), 1);
    // filterEvents 把「起始在本周之前但延续进本周」的跨周长条重映射到 weekStart，
    // 否则这些片段的 start 键落在周外、被 isSameDay 过滤丢失（跨月长条中间周消失的根因，
    // 对齐 Semi filterWeeklyEvents）。
    const weekMap = filterEvents(
      convertEventsArrToMap(week, 'start', startOfDay),
      weekStart,
      weekEnd,
    );
    // parse span layout for this week
    let parsed: (PositionedSpanEvent | DatedEvent)[][] = [[]];
    [...weekMap.keys()].sort(sortDateStr).forEach((mk) => {
      const startDate = new Date(mk);
      const curr = weekMap.get(mk)!.filter((e) => isSameDay(e.date, startDate));
      parsed = parseRangeAllDayEvent(
        curr,
        startDate,
        weekStart,
        addDaysLocal(endOfWeek(weekStart, weekStartsOn), 1),
        parsed,
      );
    });
    result[ind] = {
      day: collectDailyEvents(parsed),
      display: collectSpanEvents(parsed),
    };
  }
  return result;
}

// ============================ re-exports ============================

export { isSameDay };
