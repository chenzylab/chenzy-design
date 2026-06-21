import { describe, expect, it } from 'vitest';
import {
  buildRange,
  to12Hour,
  meridiemOf,
  from12Hour,
  buildHourOptions,
  buildMinuteOptions,
  buildSecondOptions,
  applyHideDisabled,
  isTimeDisabled,
  parseFormatSpec,
  formatTime,
  parseTimeString,
  type TimeOption,
} from './time.js';

describe('buildRange', () => {
  it('builds stepped ranges and treats step ≤ 0 as 1', () => {
    expect(buildRange(5, 1)).toEqual([0, 1, 2, 3, 4]);
    expect(buildRange(10, 3)).toEqual([0, 3, 6, 9]);
    expect(buildRange(4, 0)).toEqual([0, 1, 2, 3]);
    expect(buildRange(4, -2)).toEqual([0, 1, 2, 3]);
  });
});

describe('12h ↔ 24h conversion boundaries', () => {
  it('to12Hour maps 0/12 → 12 and others mod 12', () => {
    expect(to12Hour(0)).toBe(12); // 12 AM
    expect(to12Hour(12)).toBe(12); // 12 PM
    expect(to12Hour(1)).toBe(1);
    expect(to12Hour(13)).toBe(1);
    expect(to12Hour(23)).toBe(11);
  });

  it('meridiemOf splits am/pm at noon', () => {
    expect(meridiemOf(0)).toBe('am');
    expect(meridiemOf(11)).toBe('am');
    expect(meridiemOf(12)).toBe('pm');
    expect(meridiemOf(23)).toBe('pm');
  });

  it('from12Hour: 12 AM → 0, 12 PM → 12', () => {
    expect(from12Hour(12, 'am')).toBe(0);
    expect(from12Hour(12, 'pm')).toBe(12);
    expect(from12Hour(1, 'am')).toBe(1);
    expect(from12Hour(1, 'pm')).toBe(13);
    expect(from12Hour(11, 'pm')).toBe(23);
  });

  it('round-trips every 24h hour', () => {
    for (let h = 0; h < 24; h += 1) {
      expect(from12Hour(to12Hour(h), meridiemOf(h))).toBe(h);
    }
  });
});

describe('buildHourOptions', () => {
  it('24h mode: 0-23 stepped, disabled flagged by 24h numbers', () => {
    const opts = buildHourOptions(1, false, 'am', () => [0, 5]);
    expect(opts).toHaveLength(24);
    expect(opts[0]).toEqual({ value: 0, disabled: true });
    expect(opts[5]).toEqual({ value: 5, disabled: true });
    expect(opts[1]?.disabled).toBe(false);
  });

  it('12h mode: 1-12 display values, disabled mapped via meridiem', () => {
    // disable 13 (= 1 PM). In pm meridiem, display hour 1 should be disabled.
    const pm = buildHourOptions(1, true, 'pm', () => [13]);
    expect(pm.map((o) => o.value)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(pm.find((o) => o.value === 1)?.disabled).toBe(true);
    // in am meridiem, display hour 1 = 01:00, not disabled
    const am = buildHourOptions(1, true, 'am', () => [13]);
    expect(am.find((o) => o.value === 1)?.disabled).toBe(false);
  });

  it('12h mode: disabling 0 (12 AM) flags display hour 12 in am', () => {
    const am = buildHourOptions(1, true, 'am', () => [0]);
    expect(am.find((o) => o.value === 12)?.disabled).toBe(true);
  });
});

describe('buildMinuteOptions / buildSecondOptions', () => {
  it('minutes flagged per-hour', () => {
    const opts = buildMinuteOptions(15, 9, (h) => (h === 9 ? [30] : []));
    expect(opts.map((o) => o.value)).toEqual([0, 15, 30, 45]);
    expect(opts.find((o) => o.value === 30)?.disabled).toBe(true);
    expect(opts.find((o) => o.value === 0)?.disabled).toBe(false);
  });

  it('seconds flagged per hour+minute', () => {
    const opts = buildSecondOptions(30, 9, 30, (h, m) => (h === 9 && m === 30 ? [0] : []));
    expect(opts.map((o) => o.value)).toEqual([0, 30]);
    expect(opts.find((o) => o.value === 0)?.disabled).toBe(true);
  });
});

describe('applyHideDisabled', () => {
  const opts: TimeOption[] = [
    { value: 0, disabled: false },
    { value: 1, disabled: true },
    { value: 2, disabled: false },
  ];
  it('keeps all when off', () => {
    expect(applyHideDisabled(opts, false)).toHaveLength(3);
  });
  it('drops disabled when on', () => {
    const r = applyHideDisabled(opts, true);
    expect(r.map((o) => o.value)).toEqual([0, 2]);
  });
});

describe('isTimeDisabled', () => {
  it('returns true if any column provider disables the time', () => {
    expect(isTimeDisabled(5, 0, 0, { disabledHours: () => [5] })).toBe(true);
    expect(isTimeDisabled(9, 30, 0, { disabledMinutes: (h) => (h === 9 ? [30] : []) })).toBe(true);
    expect(isTimeDisabled(9, 30, 15, { disabledSeconds: () => [15] })).toBe(true);
    expect(isTimeDisabled(9, 31, 0, { disabledMinutes: (h) => (h === 9 ? [30] : []) })).toBe(false);
    expect(isTimeDisabled(1, 2, 3, {})).toBe(false);
  });
});

describe('parseFormatSpec', () => {
  it('HH:mm:ss → hour+minute+second, 24h', () => {
    expect(parseFormatSpec('HH:mm:ss')).toEqual({
      showHour: true,
      showMinute: true,
      showSecond: true,
      use12Hours: false,
    });
  });

  it('HH:mm drops second', () => {
    expect(parseFormatSpec('HH:mm')).toEqual({
      showHour: true,
      showMinute: true,
      showSecond: false,
      use12Hours: false,
    });
  });

  it('lowercase h implies 12h', () => {
    expect(parseFormatSpec('hh:mm')).toMatchObject({ use12Hours: true, showSecond: false });
  });

  it('A token implies 12h even with uppercase H', () => {
    expect(parseFormatSpec('hh:mm A')).toMatchObject({ use12Hours: true, showMinute: true });
    expect(parseFormatSpec('h:mm a')).toMatchObject({ use12Hours: true });
  });
});

describe('formatTime', () => {
  it('zero-pads HH:mm:ss', () => {
    expect(formatTime({ hour: 9, minute: 5, second: 3 }, 'HH:mm:ss')).toBe('09:05:03');
  });

  it('single-letter tokens are unpadded', () => {
    expect(formatTime({ hour: 9, minute: 5, second: 3 }, 'H:m:s')).toBe('9:5:3');
  });

  it('12h with meridiem token', () => {
    expect(formatTime({ hour: 13, minute: 30, second: 0 }, 'hh:mm A')).toBe('01:30 PM');
    expect(formatTime({ hour: 0, minute: 0, second: 0 }, 'h:mm a')).toBe('12:00 am');
  });

  it('passes literals through', () => {
    expect(formatTime({ hour: 8, minute: 0, second: 0 }, 'HH时mm分')).toBe('08时00分');
  });
});

describe('parseTimeString', () => {
  it('parses HH:mm:ss', () => {
    expect(parseTimeString('12:30:45')).toEqual({ hour: 12, minute: 30, second: 45 });
  });

  it('parses HH:mm with second defaulting to 0', () => {
    expect(parseTimeString('08:05')).toEqual({ hour: 8, minute: 5, second: 0 });
  });

  it('tolerates missing leading zeros and whitespace', () => {
    expect(parseTimeString(' 1:5:9 ')).toEqual({ hour: 1, minute: 5, second: 9 });
  });

  it('parses trailing meridiem as 12h hour', () => {
    expect(parseTimeString('12:30 pm')).toEqual({ hour: 12, minute: 30, second: 0 });
    expect(parseTimeString('12:00am')).toEqual({ hour: 0, minute: 0, second: 0 });
    expect(parseTimeString('1:05:09AM')).toEqual({ hour: 1, minute: 5, second: 9 });
  });

  it('returns null on invalid input', () => {
    expect(parseTimeString('')).toBeNull();
    expect(parseTimeString('25:00')).toBeNull();
    expect(parseTimeString('10:75')).toBeNull();
    expect(parseTimeString('13:00 pm')).toBeNull(); // hour out of 1-12 with meridiem
    expect(parseTimeString('abc')).toBeNull();
  });
});
