/**
 * createInputNumber helpers — framework-agnostic numeric primitives for InputNumber.
 * Pure functions only (clamp/boundaryMode, precision round, float-safe step,
 * locale-aware default formatting). The svelte layer owns DOM, listeners and
 * the editing-text state machine; it delegates the math here so it stays testable.
 * See specs/components/input/InputNumber.spec.md §3.
 */

/** Boundary handling: 'clamp' pins to [min,max]; 'strict' rejects out-of-range. */
export type BoundaryMode = 'clamp' | 'strict';

/**
 * clampWithMode — apply min/max according to boundaryMode.
 * - 'clamp': returns the value pinned into [min,max].
 * - 'strict': returns null when `n` lies outside [min,max] (caller rolls back).
 */
export function clampWithMode(
  n: number,
  min: number,
  max: number,
  mode: BoundaryMode = 'clamp',
): number | null {
  if (mode === 'strict') {
    if (n < min || n > max) return null;
    return n;
  }
  return Math.min(max, Math.max(min, n));
}

/** Which boundary (if any) `n` touches/exceeds given [min,max]. */
export function boundaryHitOf(n: number, min: number, max: number): 'min' | 'max' | null {
  if (n <= min && Number.isFinite(min)) return 'min';
  if (n >= max && Number.isFinite(max)) return 'max';
  return null;
}

/** round `n` to `precision` decimal places (undefined → unchanged). */
export function roundToPrecision(n: number, precision?: number): number {
  if (precision === undefined) return n;
  const factor = 10 ** precision;
  return Math.round(n * factor) / factor;
}

/** count of decimal places in a number's default string form. */
export function decimalsOf(n: number): number {
  const s = String(n);
  const dot = s.indexOf('.');
  return dot === -1 ? 0 : s.length - dot - 1;
}

/**
 * addStep — float-safe addition using integer scaling, avoiding 0.1+0.2 drift.
 */
export function addStep(base: number, delta: number): number {
  const decimals = Math.max(decimalsOf(base), decimalsOf(delta));
  const factor = 10 ** decimals;
  return (Math.round(base * factor) + Math.round(delta * factor)) / factor;
}

const numberFormatCache = new Map<string, Intl.NumberFormat>();

/**
 * formatWithLocale — default display string for a value using Intl.NumberFormat,
 * cached per (locale, options). Used only when a `locale` is supplied and no
 * custom formatter is given; otherwise the svelte layer keeps `String(n)`.
 */
export function formatWithLocale(
  n: number,
  locale: string,
  options?: Intl.NumberFormatOptions,
): string {
  const key = `${locale}|${JSON.stringify(options ?? {})}`;
  let fmt = numberFormatCache.get(key);
  if (!fmt) {
    fmt = new Intl.NumberFormat(locale, options);
    numberFormatCache.set(key, fmt);
  }
  return fmt.format(n);
}

/** reset the Intl format cache (test determinism). */
export function __resetNumberFormatCache(): void {
  numberFormatCache.clear();
}
