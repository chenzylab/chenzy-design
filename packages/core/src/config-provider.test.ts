import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  mergeConfig,
  DEFAULT_CONFIG,
  defaultResponsiveMap,
  EMPTY_SCREENS,
  registerMediaQuery,
  zonedWallTime,
  parseTimeZoneOffsetMinutes,
} from './config-provider.js';

describe('mergeConfig', () => {
  it('returns parent values when child provides nothing', () => {
    expect(mergeConfig(DEFAULT_CONFIG, {})).toEqual(DEFAULT_CONFIG);
  });

  it('overrides only explicitly-provided fields', () => {
    const merged = mergeConfig(DEFAULT_CONFIG, { direction: 'rtl' });
    expect(merged.direction).toBe('rtl');
    expect(merged.timeZone).toBeUndefined(); // inherited
  });

  it('omitted fields inherit the parent (not overwritten)', () => {
    const parent = { ...DEFAULT_CONFIG, direction: 'rtl' as const, timeZone: 'Asia/Shanghai' };
    // child omits both → they inherit
    const merged = mergeConfig(parent, {});
    expect(merged.direction).toBe('rtl');
    expect(merged.timeZone).toBe('Asia/Shanghai');
  });

  it('nested merge: inner only overrides timeZone, keeps outer direction', () => {
    const outer = mergeConfig(DEFAULT_CONFIG, { direction: 'rtl' });
    const inner = mergeConfig(outer, { timeZone: 'GMT+08:00' });
    expect(inner).toEqual({ direction: 'rtl', timeZone: 'GMT+08:00' });
  });

  it('accepts numeric timeZone', () => {
    expect(mergeConfig(DEFAULT_CONFIG, { timeZone: -9.5 }).timeZone).toBe(-9.5);
  });

  it('default direction is ltr', () => {
    expect(DEFAULT_CONFIG.direction).toBe('ltr');
  });
});

describe('parseTimeZoneOffsetMinutes', () => {
  it('数字小时偏移 → 分钟', () => {
    expect(parseTimeZoneOffsetMinutes(8)).toBe(480);
    expect(parseTimeZoneOffsetMinutes(-5)).toBe(-300);
    expect(parseTimeZoneOffsetMinutes(0)).toBe(0);
    expect(parseTimeZoneOffsetMinutes(5.5)).toBe(330);
  });

  it("'GMT±HH:mm' → 分钟", () => {
    expect(parseTimeZoneOffsetMinutes('GMT+08:00')).toBe(480);
    expect(parseTimeZoneOffsetMinutes('GMT-08:00')).toBe(-480);
    expect(parseTimeZoneOffsetMinutes('GMT+05:30')).toBe(330);
    expect(parseTimeZoneOffsetMinutes('GMT+00:00')).toBe(0);
  });

  it('具名 IANA / 非法串 → undefined（回退不转换）', () => {
    expect(parseTimeZoneOffsetMinutes('Asia/Shanghai')).toBeUndefined();
    expect(parseTimeZoneOffsetMinutes('UTC')).toBeUndefined();
    expect(parseTimeZoneOffsetMinutes('nonsense')).toBeUndefined();
    expect(parseTimeZoneOffsetMinutes(Number.NaN)).toBeUndefined();
  });
});

describe('zonedWallTime', () => {
  it('墙上时间字段等于目标时区当地时间（东八区与西八区相差 16h）', () => {
    // 2020-02-13T13:08:25.265Z（UTC）
    const utc = new Date(1581599305265);
    const east8 = zonedWallTime(utc, 'GMT+08:00');
    const west8 = zonedWallTime(utc, 'GMT-08:00');
    // 东八区当地 = UTC+8 = 21:08:25；西八区 = UTC-8 = 05:08:25
    expect(east8.getHours() - west8.getHours()).toBe(16);
    // 用 UTC 字段读回：east8 读出的 UTC 字段即东八区墙上时间
    expect(east8.getTime() - west8.getTime()).toBe(16 * 60 * 60 * 1000);
  });

  it('无法解析的时区原样返回入参（不做转换）', () => {
    const d = new Date(1581599305265);
    expect(zonedWallTime(d, 'Asia/Shanghai')).toBe(d);
    expect(zonedWallTime(d, undefined)).toBe(d);
  });
});

describe('defaultResponsiveMap', () => {
  it('mirrors Semi breakpoints', () => {
    expect(defaultResponsiveMap).toEqual({
      xs: '(max-width: 575px)',
      sm: '(min-width: 576px)',
      md: '(min-width: 768px)',
      lg: '(min-width: 992px)',
      xl: '(min-width: 1200px)',
      xxl: '(min-width: 1600px)',
    });
  });

  it('EMPTY_SCREENS all false', () => {
    expect(Object.values(EMPTY_SCREENS).every((v) => v === false)).toBe(true);
  });
});

describe('registerMediaQuery', () => {
  let listeners: Array<(e: { matches: boolean }) => void>;
  let matchesValue: boolean;
  let addSpy: ReturnType<typeof vi.fn>;
  let removeSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    listeners = [];
    matchesValue = false;
    addSpy = vi.fn((_type: string, cb: (e: { matches: boolean }) => void) => listeners.push(cb));
    removeSpy = vi.fn();
    // registerMediaQuery 读的是 window.matchMedia；core 单测在 node 环境无 window，
    // 显式注入一个带 matchMedia 的 window（无 addListener，走 addEventListener 分支）。
    vi.stubGlobal('window', {
      matchMedia: vi.fn((_media: string) => ({
        get matches() {
          return matchesValue;
        },
        addEventListener: addSpy,
        removeEventListener: removeSpy,
      })),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('callInInit fires immediately with current state', () => {
    const match = vi.fn();
    const unmatch = vi.fn();
    matchesValue = true;
    registerMediaQuery('(min-width: 768px)', { match, unmatch });
    expect(match).toHaveBeenCalledTimes(1);
    expect(unmatch).not.toHaveBeenCalled();
  });

  it('callInInit=false does not fire on register', () => {
    const match = vi.fn();
    registerMediaQuery('(min-width: 768px)', { match, callInInit: false });
    expect(match).not.toHaveBeenCalled();
  });

  it('change event dispatches match/unmatch and unregister removes listener', () => {
    const match = vi.fn();
    const unmatch = vi.fn();
    const off = registerMediaQuery('(min-width: 768px)', { match, unmatch, callInInit: false });
    listeners.forEach((cb) => cb({ matches: true }));
    expect(match).toHaveBeenCalledTimes(1);
    listeners.forEach((cb) => cb({ matches: false }));
    expect(unmatch).toHaveBeenCalledTimes(1);
    off();
    expect(removeSpy).toHaveBeenCalledTimes(1);
  });

  it('SSR-safe: no window returns noop', () => {
    vi.stubGlobal('window', undefined);
    const off = registerMediaQuery('(min-width: 768px)', { match: vi.fn() });
    expect(typeof off).toBe('function');
    expect(() => off()).not.toThrow();
  });
});
