import { describe, expect, it } from 'vitest';
import {
  eventCoversDay,
  eventsForDay,
  groupEventsByDays,
  timelineForDay,
  dayKey,
  isPastDay,
  type CalendarEvent,
} from './calendar.js';

const d = (y: number, m: number, day: number, h = 0): Date => new Date(y, m, day, h);

const events: CalendarEvent[] = [
  { key: 'a', start: d(2026, 5, 10, 9), title: '会议 A' },
  { key: 'b', start: d(2026, 5, 10, 14), title: '会议 B' },
  { key: 'c', start: d(2026, 5, 10, 8), title: '全天 C', allDay: true },
  { key: 'd', start: d(2026, 5, 10), end: d(2026, 5, 12), title: '跨天 D' },
  { key: 'e', start: d(2026, 5, 20), title: '会议 E' },
];

describe('eventCoversDay', () => {
  it('matches a same-day event', () => {
    expect(eventCoversDay(events[0]!, d(2026, 5, 10))).toBe(true);
    expect(eventCoversDay(events[0]!, d(2026, 5, 11))).toBe(false);
  });

  it('matches every day a multi-day event spans (inclusive)', () => {
    const md = events[3]!;
    expect(eventCoversDay(md, d(2026, 5, 10))).toBe(true);
    expect(eventCoversDay(md, d(2026, 5, 11))).toBe(true);
    expect(eventCoversDay(md, d(2026, 5, 12))).toBe(true);
    expect(eventCoversDay(md, d(2026, 5, 13))).toBe(false);
  });
});

describe('eventsForDay', () => {
  it('collects all events on a day, all-day first then by start time', () => {
    const day = eventsForDay(events, d(2026, 5, 10));
    expect(day.total.map((e) => e.key)).toEqual(['c', 'd', 'a', 'b']);
    // c is allDay → first; d has start 00:00 → before a(09:00); a before b(14:00)
    expect(day.overflow).toBe(0);
  });

  it('caps to maxPerDay and reports overflow', () => {
    const day = eventsForDay(events, d(2026, 5, 10), 2);
    expect(day.visible.map((e) => e.key)).toEqual(['c', 'd']);
    expect(day.overflow).toBe(2);
  });

  it('returns empty for a day with no events', () => {
    const day = eventsForDay(events, d(2026, 5, 1));
    expect(day.total).toEqual([]);
    expect(day.overflow).toBe(0);
  });
});

describe('groupEventsByDays', () => {
  it('builds an O(1) lookup map keyed by day', () => {
    const days = [d(2026, 5, 10), d(2026, 5, 11), d(2026, 5, 20)];
    const map = groupEventsByDays(events, days, 3);
    expect(map.get(dayKey(d(2026, 5, 10)))?.total.length).toBe(4);
    expect(map.get(dayKey(d(2026, 5, 11)))?.total.map((e) => e.key)).toEqual(['d']);
    expect(map.get(dayKey(d(2026, 5, 20)))?.total.map((e) => e.key)).toEqual(['e']);
  });
});

describe('timelineForDay', () => {
  it('buckets timed events by their start hour, sorted by start time', () => {
    const tl = timelineForDay(events, d(2026, 5, 10));
    // a@09 and b@14 are timed; c is allDay; d is multi-day starting same day 00:00
    expect(tl.byHour.get(9)?.map((e) => e.key)).toEqual(['a']);
    expect(tl.byHour.get(14)?.map((e) => e.key)).toEqual(['b']);
    expect(tl.byHour.get(0)?.map((e) => e.key)).toEqual(['d']); // 00:00 start
  });

  it('puts all-day events into the allDay bucket', () => {
    const tl = timelineForDay(events, d(2026, 5, 10));
    expect(tl.allDay.map((e) => e.key)).toEqual(['c']);
  });

  it('routes multi-day events to allDay on continuation days (start on another day)', () => {
    const tl = timelineForDay(events, d(2026, 5, 11));
    // event d covers the 11th but starts on the 10th → all-day on the 11th
    expect(tl.allDay.map((e) => e.key)).toEqual(['d']);
    expect([...tl.byHour.keys()]).toEqual([]);
  });

  it('clamps event hours into the visible from/to range', () => {
    const late: CalendarEvent[] = [{ key: 'z', start: d(2026, 5, 10, 22), title: '深夜' }];
    const tl = timelineForDay(late, d(2026, 5, 10), 8, 18);
    expect(tl.byHour.get(18)?.map((e) => e.key)).toEqual(['z']);
  });

  it('returns empty buckets for a day with no events', () => {
    const tl = timelineForDay(events, d(2026, 5, 1));
    expect(tl.allDay).toEqual([]);
    expect(tl.byHour.size).toBe(0);
  });
});

describe('isPastDay', () => {
  it('compares at day granularity', () => {
    const today = d(2026, 5, 15, 12);
    expect(isPastDay(d(2026, 5, 14), today)).toBe(true);
    expect(isPastDay(d(2026, 5, 15, 23), today)).toBe(false); // same day
    expect(isPastDay(d(2026, 5, 16), today)).toBe(false);
  });
});
