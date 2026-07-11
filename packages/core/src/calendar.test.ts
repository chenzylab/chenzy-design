import { describe, expect, it } from 'vitest';
import {
  getPos,
  round,
  amendEvent,
  parseEvent,
  parseEvents,
  renderDailyEvent,
  getDailyEvents,
  parseSpanEvents,
  parseWeekSpanEvents,
  allDayEventMap,
  calcRowHeight,
  getMonthEvents,
  differenceInCalendarDays,
  startOfWeek,
  endOfWeek,
  getWeekOfMonth,
  getWeeksInMonth,
  type CalendarEvent,
} from './calendar.js';

const d = (y: number, m: number, day: number, h = 0, min = 0): Date =>
  new Date(y, m, day, h, min);

describe('getPos', () => {
  it('maps clock time to a [0,1) day fraction', () => {
    expect(getPos(d(2026, 5, 10, 0, 0))).toBe(0);
    expect(getPos(d(2026, 5, 10, 12, 0))).toBe(0.5);
    expect(round(getPos(d(2026, 5, 10, 6, 0)))).toBe(0.25);
  });
});

describe('date algebra', () => {
  it('differenceInCalendarDays ignores time-of-day', () => {
    expect(differenceInCalendarDays(d(2026, 5, 12, 1), d(2026, 5, 10, 23))).toBe(2);
  });
  it('startOfWeek / endOfWeek respect weekStartsOn', () => {
    // 2026-06-10 is a Wednesday
    expect(startOfWeek(d(2026, 5, 10), 0).getDay()).toBe(0); // Sunday
    expect(startOfWeek(d(2026, 5, 10), 1).getDay()).toBe(1); // Monday
    expect(endOfWeek(d(2026, 5, 10), 0).getDay()).toBe(6); // Saturday
  });
  it('getWeekOfMonth / getWeeksInMonth', () => {
    expect(getWeekOfMonth(d(2026, 5, 1), 0)).toBe(1);
    expect(getWeeksInMonth(d(2026, 5, 1), 0)).toBeGreaterThanOrEqual(4);
  });
});

describe('amendEvent', () => {
  it('fills a missing end as start + 1h when same day', () => {
    const e = amendEvent({ key: 'a', start: d(2026, 5, 10, 9) })!;
    expect(e.end).toEqual(d(2026, 5, 10, 10));
  });
  it('fills a missing start as end - 1h when same day', () => {
    const e = amendEvent({ key: 'a', end: d(2026, 5, 10, 9) })!;
    expect(e.start).toEqual(d(2026, 5, 10, 8));
  });
  it('returns undefined when neither start nor end given', () => {
    expect(amendEvent({ key: 'a' })).toBeUndefined();
  });
});

describe('parseEvent', () => {
  it('keeps a same-day timed event whole, keyed to its day', () => {
    const res = parseEvent({ key: 'a', start: d(2026, 5, 10, 9), end: d(2026, 5, 10, 10) });
    expect(res).toHaveLength(1);
    expect(res[0]!.date).toEqual(d(2026, 5, 10));
  });
  it('splits a <24h cross-midnight event into a head and tail day', () => {
    const res = parseEvent({ key: 'a', start: d(2026, 5, 10, 20), end: d(2026, 5, 11, 6) });
    expect(res).toHaveLength(2);
    expect(res.map((r) => r.date.getDate())).toEqual([10, 11]);
  });
  it('splits a long span into one all-day copy per covered day', () => {
    const res = parseEvent({ key: 'a', start: d(2026, 5, 10), end: d(2026, 5, 12) });
    expect(res.map((r) => r.date.getDate())).toEqual([10, 11, 12]);
    expect(res.every((r) => r.allDay)).toBe(true);
  });
  it('routes allDay events through parseAllDayEvent', () => {
    const res = parseEvent({ key: 'a', start: d(2026, 5, 10), allDay: true });
    expect(res).toHaveLength(1);
    expect(res[0]!.allDay).toBe(true);
  });
});

describe('parseEvents', () => {
  it('separates all-day from timed', () => {
    const events: CalendarEvent[] = [
      { key: 'a', start: d(2026, 5, 10, 9), end: d(2026, 5, 10, 10) },
      { key: 'b', start: d(2026, 5, 10), allDay: true },
    ];
    const { allDay, day } = parseEvents(events);
    expect(allDay.map((e) => e.key)).toEqual(['b']);
    expect(day.map((e) => e.key)).toEqual(['a']);
  });
});

describe('renderDailyEvent', () => {
  it('computes startPos/endPos from clock times', () => {
    const dated = parseEvent({ key: 'a', start: d(2026, 5, 10, 6), end: d(2026, 5, 10, 12) })[0]!;
    const r = renderDailyEvent(dated);
    expect(r.startPos).toBe(0.25);
    expect(r.endPos).toBe(0.5);
  });
});

describe('getDailyEvents', () => {
  it('positions timed events and offsets identical spans side-by-side', () => {
    const events: CalendarEvent[] = [
      { key: 'a', start: d(2026, 5, 10, 9), end: d(2026, 5, 10, 10) },
      { key: 'b', start: d(2026, 5, 10, 9), end: d(2026, 5, 10, 10) },
      { key: 'c', start: d(2026, 5, 10, 14), end: d(2026, 5, 10, 15) },
    ];
    const { day } = getDailyEvents(parseEvents(events).day, d(2026, 5, 10));
    const a = day.find((e) => e.key === 'a')!;
    const b = day.find((e) => e.key === 'b')!;
    expect(a.left).toBe(0); // first in its span group
    expect(b.left).toBe('50%'); // second of two → offset 50%
  });
  it('surfaces all-day events for the day in its allDay bucket', () => {
    const events: CalendarEvent[] = [{ key: 'c', start: d(2026, 5, 10), allDay: true }];
    const { allDay } = getDailyEvents(parseEvents(events).allDay, d(2026, 5, 10));
    expect(allDay.map((e) => e.key)).toEqual(['c']);
  });
});

describe('parseSpanEvents', () => {
  it('lays spanned all-day events across a range with leftPos/width/topInd', () => {
    const events: CalendarEvent[] = [
      { key: 'a', start: d(2026, 5, 10), end: d(2026, 5, 12), allDay: true },
    ];
    const spans = parseSpanEvents(allDayEventMap(events), d(2026, 5, 10), d(2026, 5, 17));
    expect(spans).toHaveLength(1);
    expect(spans[0]!.leftPos).toBe(0);
    expect(spans[0]!.topInd).toBe(0);
    expect(spans[0]!.width).toBeGreaterThan(0);
  });
  it('stacks overlapping spans on separate rows', () => {
    const events: CalendarEvent[] = [
      { key: 'a', start: d(2026, 5, 10), end: d(2026, 5, 13), allDay: true },
      { key: 'b', start: d(2026, 5, 11), end: d(2026, 5, 14), allDay: true },
    ];
    const spans = parseSpanEvents(allDayEventMap(events), d(2026, 5, 10), d(2026, 5, 17));
    const tops = spans.map((s) => s.topInd).sort();
    expect(tops).toEqual([0, 1]);
  });
});

describe('parseWeekSpanEvents', () => {
  it('clips a span to the week window', () => {
    const events: CalendarEvent[] = [
      { key: 'a', start: d(2026, 5, 8), end: d(2026, 5, 20), allDay: true },
    ];
    const weekStart = startOfWeek(d(2026, 5, 10), 0);
    const spans = parseWeekSpanEvents(allDayEventMap(events), weekStart, 0);
    expect(spans.length).toBeGreaterThan(0);
    expect(spans[0]!.width).toBeLessThanOrEqual(1);
  });
});

describe('calcRowHeight', () => {
  it('returns 1 for empty and max(topInd)+1 otherwise', () => {
    expect(calcRowHeight([])).toBe(1);
    expect(
      calcRowHeight([
        { key: 'a', children: null, leftPos: 0, width: 0.5, topInd: 0 },
        { key: 'b', children: null, leftPos: 0, width: 0.5, topInd: 2 },
      ]),
    ).toBe(3);
  });
});

describe('getMonthEvents', () => {
  it('buckets events by week row of the month', () => {
    const events: CalendarEvent[] = [
      { key: 'a', start: d(2026, 5, 3), end: d(2026, 5, 3) },
      { key: 'b', start: d(2026, 5, 20), end: d(2026, 5, 20) },
    ];
    const byWeek = getMonthEvents(events, d(2026, 5, 15), 0);
    const weeks = Object.keys(byWeek).map(Number);
    expect(weeks.length).toBeGreaterThanOrEqual(2);
    // every week has both display + day matrices
    for (const w of weeks) {
      expect(byWeek[w]!.display).toBeDefined();
      expect(byWeek[w]!.day).toBeDefined();
    }
  });

  it('a cross-month long span appears in every week it covers (filterWeeklyEvents remap)', () => {
    // 6/25 → 7/26 covers all of July; must show on each July week row, not just the first.
    const events: CalendarEvent[] = [
      { key: 'long', start: d(2019, 5, 25, 14, 45), end: d(2019, 6, 26, 6, 18) },
    ];
    const byWeek = getMonthEvents(events, d(2019, 6, 23), 0);
    const weeksWithLong = Object.values(byWeek).filter((w) =>
      w.display.some((s) => s.key === 'long'),
    );
    // July 2019 spans 5 week rows; the long span covers the first 4 (up to 7/26).
    expect(weeksWithLong.length).toBeGreaterThanOrEqual(4);
    // in each covered week it occupies topInd 0 and starts at the week's left edge.
    for (const w of weeksWithLong) {
      const bar = w.display.find((s) => s.key === 'long')!;
      expect(bar.topInd).toBe(0);
      expect(bar.leftPos).toBe(0);
    }
  });
});
