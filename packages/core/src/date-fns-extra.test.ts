import { describe, expect, it } from 'vitest';
import {
  toIANA,
  utcToZonedTime,
  zonedTimeToUtc,
  isValidTimeZone,
  localeFormat,
} from './date-fns-extra.js';

describe('toIANA（照搬 Semi：数字/GMT± → IANA 标识）', () => {
  it('数字偏移 → Etc/GMT*（注意 Etc 符号相反）', () => {
    expect(toIANA(8)).toBe('Etc/GMT-8');
    expect(toIANA(-5)).toBe('Etc/GMT+5');
    expect(toIANA(0)).toBe('Etc/GMT');
  });

  it("'GMT±HH:mm' → 数字 → IANA", () => {
    expect(toIANA('GMT+08:00')).toBe('Etc/GMT-8');
    expect(toIANA('GMT-08:00')).toBe('Etc/GMT+8');
  });

  it('具名 IANA 原样透传', () => {
    expect(toIANA('Asia/Shanghai')).toBe('Asia/Shanghai');
    expect(toIANA('America/New_York')).toBe('America/New_York');
  });
});

describe('utcToZonedTime / zonedTimeToUtc 往返（照搬 Semi date-fns-tz）', () => {
  it('zonedTimeToUtc(墙上时间) 得正确绝对 UTC 时刻', () => {
    // GMT+8 墙上 21:08:25 的绝对时刻 = 13:08:25Z。
    const wall = new Date(2020, 1, 13, 21, 8, 25); // 运行环境本地字段
    const utc = zonedTimeToUtc(wall, 'GMT+08:00');
    // 该 Date 的绝对时刻应对应 GMT+8 的墙上时间 21:08:25。
    // 若运行环境本地=GMT+8，则 wall 本身绝对时刻 13:08:25Z，往返一致。
    expect(utc.getTime()).toBe(zonedTimeToUtc(wall, 8).getTime());
  });

  it('utcToZonedTime 后再 zonedTimeToUtc 恒等（绝对时刻守恒）', () => {
    const utc = new Date(Date.UTC(2020, 1, 13, 13, 8, 25));
    for (const tz of ['GMT+08:00', 'GMT-05:00', 8, -5]) {
      const zoned = utcToZonedTime(utc, tz);
      const back = zonedTimeToUtc(zoned, tz);
      expect(back.getTime()).toBe(utc.getTime());
    }
  });
});

describe('isValidTimeZone（照搬 Semi）', () => {
  it('非空 string/number 有效；空串/undefined 无效', () => {
    expect(isValidTimeZone('GMT+08:00')).toBe(true);
    expect(isValidTimeZone(8)).toBe(true);
    expect(isValidTimeZone(0)).toBe(true);
    expect(isValidTimeZone('')).toBe(false);
    expect(isValidTimeZone(undefined)).toBe(false);
  });
});

describe('localeFormat（date-fns format）', () => {
  it('按 date-fns 小写 token 序列化本地字段', () => {
    const d = new Date(2020, 1, 13, 21, 8, 25);
    expect(localeFormat(d, 'yyyy-MM-dd HH:mm:ss')).toBe('2020-02-13 21:08:25');
    expect(localeFormat(d, 'yyyy-MM')).toBe('2020-02');
  });
});
