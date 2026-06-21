/**
 * Locale registry + deep merge — pure helpers backing string-code resolution
 * and nested-provider inheritance for LocaleProvider / ConfigProvider.
 *
 * - `mergeLocale(parent, child)`: deep-merge two (possibly partial) bundles so a
 *   nested provider inherits parent strings and only overrides the keys it sets.
 * - `registerLocale(code, bundle)` / `resolveLocale(input)`: map a string code
 *   (e.g. 'zh_CN', 'en-US') to a bundle, looking through registered packs then
 *   the built-ins (zh_CN / en_US). Used so `locale` may be a string or object.
 *
 * No DOM, no framework deps — fully unit-testable.
 * See specs/components/other/LocaleProvider.spec.md §3.
 */
import type { Locale } from './interface.js';
import { zh_CN } from './zh_CN.js';
import { en_US } from './en_US.js';

/** A partial language pack — a nested provider may override only some keys. */
export type PartialLocale = {
  [K in keyof Locale]?: Locale[K] extends object ? Partial<Locale[K]> : Locale[K];
};

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/**
 * Deep-merge two locale bundles. `child` wins per-key; keys absent from `child`
 * are inherited from `parent`. Nested objects (Modal, Input, …) merge recursively;
 * scalars (`code`, `rtl`) and any non-object value are replaced wholesale.
 * Pure: returns a fresh object, mutates neither input.
 */
export function mergeLocale<P extends PartialLocale, C extends PartialLocale>(
  parent: P,
  child: C,
): P & C {
  const out: Record<string, unknown> = { ...(parent as Record<string, unknown>) };
  for (const key of Object.keys(child as Record<string, unknown>)) {
    const cv = (child as Record<string, unknown>)[key];
    const pv = out[key];
    if (cv === undefined) continue;
    out[key] = isPlainObject(pv) && isPlainObject(cv) ? mergeLocale(pv, cv) : cv;
  }
  return out as P & C;
}

/** Built-in packs, keyed by both `zh_CN`/`en_US` and `zh-CN`/`en-US` forms. */
const BUILTIN: Record<string, Locale> = {
  zh_CN,
  'zh-CN': zh_CN,
  en_US,
  'en-US': en_US,
};

/** User-registered packs (registerLocale), looked up before built-ins. */
const registry = new Map<string, Locale>();

/** Normalize a code so 'zh-CN' and 'zh_CN' resolve to the same entry. */
function normCode(code: string): string {
  return code.replace(/-/g, '_');
}

/**
 * Register a custom language pack under a string code (e.g. registerLocale('fr_FR', fr)).
 * Later registration under the same (normalized) code overrides the earlier one.
 * Registered packs take precedence over built-ins during resolution.
 */
export function registerLocale(code: string, bundle: Locale): void {
  registry.set(normCode(code), bundle);
}

/** Remove a previously registered pack. Mainly for tests / teardown. */
export function unregisterLocale(code: string): void {
  registry.delete(normCode(code));
}

/**
 * Resolve a `locale` input to a bundle. Objects pass through unchanged; strings
 * are looked up in the registry first, then the built-ins (both `zh_CN` and
 * `zh-CN` spellings). Unknown codes return `undefined` (caller decides fallback).
 */
export function resolveLocale(input: Locale | string): Locale | undefined {
  if (typeof input !== 'string') return input;
  const norm = normCode(input);
  return registry.get(norm) ?? BUILTIN[input] ?? BUILTIN[norm];
}
