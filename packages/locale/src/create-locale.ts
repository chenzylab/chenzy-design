/**
 * createLocale — locale resolution + Intl formatting with a fallback chain.
 * Builds a `t(key, params)` that walks dot-paths into the active bundle and
 * falls back to en_US, plus cached Intl date/number formatters. Used by
 * LocaleProvider / ConfigProvider via Svelte context. No DOM, no framework deps.
 * See specs/components/other/LocaleProvider.spec.md §3.
 */
import type { Locale } from './interface.js';
import { en_US } from './en_US.js';
import { interpolate } from './format.js';

export type Direction = 'ltr' | 'rtl';

export interface LocaleApi {
  /** active BCP-47 code */
  readonly code: string;
  /** text direction derived from the locale (or forced) */
  readonly direction: Direction;
  /** default IANA time zone applied to formatDate (undefined → runtime zone) */
  readonly timeZone?: string;
  /** default ISO 4217 currency for currency-style formatNumber */
  readonly currency?: string;
  /** translate a dot-path key (e.g. 'Modal.okText'); interpolates {params} */
  t(key: string, params?: Record<string, string | number>): string;
  formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string;
  formatNumber(value: number, options?: Intl.NumberFormatOptions): string;
}

export interface CreateLocaleOptions {
  /** the active locale bundle */
  locale: Locale;
  /** fallback bundle for missing keys (default en_US) */
  fallback?: Locale;
  /** force direction; omit to derive from `locale.rtl` */
  direction?: Direction | 'auto';
  /** default IANA time zone for formatDate (e.g. 'Asia/Shanghai'); per-call opts win */
  timeZone?: string;
  /** default ISO 4217 currency injected when formatNumber uses style:'currency' */
  currency?: string;
}

/** read a dot-path (e.g. 'Modal.okText') from a bundle; undefined if absent */
function readPath(bundle: unknown, key: string): string | undefined {
  let cur: unknown = bundle;
  for (const part of key.split('.')) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return typeof cur === 'string' ? cur : undefined;
}

export function createLocale(options: CreateLocaleOptions): LocaleApi {
  const { locale, fallback = en_US, timeZone, currency } = options;
  const code = locale.code;
  const direction: Direction =
    options.direction && options.direction !== 'auto'
      ? options.direction
      : locale.rtl
        ? 'rtl'
        : 'ltr';

  // Intl formatter caches keyed by serialized options — avoid rebuilding per call.
  const dateCache = new Map<string, Intl.DateTimeFormat>();
  const numberCache = new Map<string, Intl.NumberFormat>();

  function getDateFormatter(opts?: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
    // Inject the provider timeZone as a default; per-call opts.timeZone still wins.
    const merged: Intl.DateTimeFormatOptions | undefined =
      timeZone && !(opts && 'timeZone' in opts) ? { timeZone, ...opts } : opts;
    const cacheKey = JSON.stringify(merged ?? {});
    let fmt = dateCache.get(cacheKey);
    if (!fmt) {
      fmt = new Intl.DateTimeFormat(code, merged);
      dateCache.set(cacheKey, fmt);
    }
    return fmt;
  }
  function getNumberFormatter(opts?: Intl.NumberFormatOptions): Intl.NumberFormat {
    // When formatting as currency without an explicit code, fall back to the provider currency.
    const merged: Intl.NumberFormatOptions | undefined =
      currency && opts?.style === 'currency' && !opts.currency
        ? { ...opts, currency }
        : opts;
    const cacheKey = JSON.stringify(merged ?? {});
    let fmt = numberCache.get(cacheKey);
    if (!fmt) {
      fmt = new Intl.NumberFormat(code, merged);
      numberCache.set(cacheKey, fmt);
    }
    return fmt;
  }

  return {
    code,
    direction,
    ...(timeZone ? { timeZone } : {}),
    ...(currency ? { currency } : {}),
    t(key, params) {
      const raw = readPath(locale, key) ?? readPath(fallback, key) ?? key;
      return params ? interpolate(raw, params) : raw;
    },
    formatDate(date, opts) {
      return getDateFormatter(opts).format(date);
    },
    formatNumber(value, opts) {
      return getNumberFormatter(opts).format(value);
    },
  };
}
