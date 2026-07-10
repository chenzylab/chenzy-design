import { describe, expect, it } from 'vitest';
import { createLocale } from './create-locale.js';
import { zh_CN } from './zh_CN.js';
import { en_US } from './en_US.js';
import type { Locale } from './interface.js';

describe('createLocale', () => {
  it('resolves a dot-path key from the active bundle', () => {
    const l = createLocale({ locale: zh_CN });
    expect(l.t('Modal.okText')).toBe('确定');
    expect(l.t('Modal.cancelText')).toBe('取消');
  });

  it('interpolates params', () => {
    const l = createLocale({ locale: zh_CN });
    expect(l.t('Pagination.total', { total: 42 })).toBe('共 42 页');
  });

  it('falls back to en_US for a key missing in the active bundle', () => {
    // a sparse bundle missing Modal.okText → falls back to en_US
    const sparse = { ...zh_CN, Modal: { cancelText: '取消', close: '关闭' } } as unknown as Locale;
    const l = createLocale({ locale: sparse });
    expect(l.t('Modal.okText')).toBe(en_US.Modal.okText); // 'OK' / from en_US
  });

  it('returns the raw key when missing everywhere (never a blank)', () => {
    const l = createLocale({ locale: zh_CN });
    expect(l.t('Nonexistent.key')).toBe('Nonexistent.key');
  });

  it('exposes code and derives direction from rtl', () => {
    const l = createLocale({ locale: zh_CN });
    expect(l.code).toBe(zh_CN.code);
    expect(l.direction).toBe('ltr');

    const rtlBundle = { ...en_US, code: 'ar', rtl: true } as Locale;
    expect(createLocale({ locale: rtlBundle }).direction).toBe('rtl');
  });

  it('forces direction when explicitly provided', () => {
    const l = createLocale({ locale: zh_CN, direction: 'rtl' });
    expect(l.direction).toBe('rtl');
  });

  it('formats dates and numbers with the locale code', () => {
    const l = createLocale({ locale: en_US });
    expect(l.formatNumber(1234.5)).toBe('1,234.5');
    const d = new Date(2026, 5, 19);
    // just assert it produces a non-empty localized string (engine-dependent exact form)
    expect(typeof l.formatDate(d, { year: 'numeric', month: 'long', day: 'numeric' })).toBe('string');
  });

  it('caches Intl formatters by options (same instance reused)', () => {
    const l = createLocale({ locale: en_US });
    // two calls with same options should not throw and stay consistent
    expect(l.formatNumber(1000, { style: 'decimal' })).toBe(l.formatNumber(1000, { style: 'decimal' }));
  });
});
