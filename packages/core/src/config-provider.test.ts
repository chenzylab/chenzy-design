import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  mergeConfig,
  DEFAULT_CONFIG,
  defaultResponsiveMap,
  EMPTY_SCREENS,
  registerMediaQuery,
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
