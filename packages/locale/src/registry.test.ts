import { afterEach, describe, expect, it } from 'vitest';
import {
  mergeLocale,
  registerLocale,
  unregisterLocale,
  resolveLocale,
} from './registry.js';
import { createLocale } from './create-locale.js';
import { zh_CN } from './zh_CN.js';
import { en_US } from './en_US.js';
import type { Locale } from './interface.js';

describe('mergeLocale (deep merge / inherit)', () => {
  it('child overrides parent per nested key, inherits the rest', () => {
    const merged = mergeLocale(en_US, { Modal: { okText: 'Confirm' } });
    expect(merged.Modal.okText).toBe('Confirm'); // overridden
    expect(merged.Modal.cancelText).toBe(en_US.Modal.cancelText); // inherited
    expect(merged.Input.clear).toBe(en_US.Input.clear); // untouched group inherited
  });

  it('replaces scalars (code/rtl) wholesale', () => {
    const merged = mergeLocale(en_US, { code: 'en-GB', rtl: true });
    expect(merged.code).toBe('en-GB');
    expect(merged.rtl).toBe(true);
  });

  it('is pure — mutates neither input', () => {
    const child = { Modal: { okText: 'X' } };
    const merged = mergeLocale(en_US, child);
    expect(en_US.Modal.okText).not.toBe('X');
    expect(merged).not.toBe(en_US);
    expect(merged.Modal).not.toBe(en_US.Modal);
  });

  it('skips undefined child values (keeps parent)', () => {
    const merged = mergeLocale(en_US, { Modal: undefined } as Record<string, unknown>);
    expect((merged as Locale).Modal.okText).toBe(en_US.Modal.okText);
  });

  it('merged bundle drives createLocale t() with inheritance', () => {
    const merged = mergeLocale(zh_CN, { Modal: { okText: 'OK!' } }) as Locale;
    const l = createLocale({ locale: merged });
    expect(l.t('Modal.okText')).toBe('OK!');
    expect(l.t('Modal.cancelText')).toBe('取消'); // inherited from zh_CN
  });
});

describe('resolveLocale (string-code resolution)', () => {
  it('passes object inputs through unchanged', () => {
    expect(resolveLocale(zh_CN)).toBe(zh_CN);
  });

  it('resolves built-in codes in both underscore and dash forms', () => {
    expect(resolveLocale('zh_CN')).toBe(zh_CN);
    expect(resolveLocale('zh-CN')).toBe(zh_CN);
    expect(resolveLocale('en_US')).toBe(en_US);
    expect(resolveLocale('en-US')).toBe(en_US);
  });

  it('returns undefined for unknown codes', () => {
    expect(resolveLocale('xx_YY')).toBeUndefined();
  });
});

describe('registerLocale', () => {
  afterEach(() => {
    unregisterLocale('fr_FR');
    unregisterLocale('zh_CN');
  });

  it('makes a custom pack resolvable by code (dash/underscore agnostic)', () => {
    const fr = { ...en_US, code: 'fr-FR', Modal: { ...en_US.Modal, okText: 'Confirmer' } };
    registerLocale('fr_FR', fr);
    expect(resolveLocale('fr_FR')).toBe(fr);
    expect(resolveLocale('fr-FR')).toBe(fr);
    expect(createLocale({ locale: resolveLocale('fr_FR')! }).t('Modal.okText')).toBe(
      'Confirmer',
    );
  });

  it('registered pack takes precedence over a built-in code', () => {
    const custom = { ...zh_CN, Modal: { ...zh_CN.Modal, okText: '好的' } };
    registerLocale('zh_CN', custom);
    expect(resolveLocale('zh_CN')).toBe(custom);
  });
});

describe('createLocale timeZone / currency', () => {
  it('exposes timeZone and currency on the api', () => {
    const l = createLocale({ locale: en_US, timeZone: 'Asia/Shanghai', currency: 'CNY' });
    expect(l.timeZone).toBe('Asia/Shanghai');
    expect(l.currency).toBe('CNY');
  });

  it('applies default currency to currency-style formatNumber', () => {
    const l = createLocale({ locale: en_US, currency: 'EUR' });
    const out = l.formatNumber(1234.5, { style: 'currency' });
    expect(out).toContain('1,234.5'); // amount present
    expect(out).toMatch(/€|EUR/); // euro symbol/code present
  });

  it('per-call currency option overrides the provider default', () => {
    const l = createLocale({ locale: en_US, currency: 'EUR' });
    const out = l.formatNumber(10, { style: 'currency', currency: 'USD' });
    expect(out).toMatch(/\$|USD/);
  });

  it('applies default timeZone to formatDate', () => {
    const l = createLocale({ locale: en_US, timeZone: 'UTC' });
    const utc = new Date(Date.UTC(2026, 0, 1, 0, 0, 0));
    const out = l.formatDate(utc, { hour: '2-digit', minute: '2-digit', hour12: false });
    expect(out).toContain('00:00');
  });
});
