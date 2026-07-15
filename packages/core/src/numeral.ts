/**
 * numeral — framework-agnostic number-formatting for Typography.Numeral
 * (aligned to Semi Typography Numeral). Scans a text string for numeric tokens
 * and rewrites each according to `rule` + `precision` + `truncate`, or hands the
 * whole string to a custom `parser`. No framework deps.
 *
 * See specs/components/basic/Typography.spec.md.
 */

/** Parse rule (aligned to Semi). */
export type NumeralRule =
  | 'text'
  | 'numbers'
  | 'bytes-decimal'
  | 'bytes-binary'
  | 'percentages'
  | 'exponential';

/** Rounding mode for the retained decimal places. */
export type NumeralTruncate = 'ceil' | 'floor' | 'round';

export interface NumeralOptions {
  rule?: NumeralRule;
  /** Decimal places to keep. */
  precision?: number;
  /** How to round the kept decimals (Math.ceil/floor/round). */
  truncate?: NumeralTruncate;
  /** Custom parser — takes precedence over `rule`. */
  parser?: (raw: string) => string;
}

const BYTES_DECIMAL_UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
const BYTES_BINARY_UNITS = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

/** Round `n` to `precision` decimals using the given truncate mode. */
export function roundTo(n: number, precision: number, truncate: NumeralTruncate): number {
  const factor = Math.pow(10, precision);
  const fn = truncate === 'ceil' ? Math.ceil : truncate === 'floor' ? Math.floor : Math.round;
  return fn(n * factor) / factor;
}

/** Format a single number per rule/precision/truncate. */
export function formatNumber(
  n: number,
  rule: NumeralRule,
  precision: number,
  truncate: NumeralTruncate,
): string {
  switch (rule) {
    case 'percentages': {
      const v = roundTo(n * 100, precision, truncate);
      return `${v.toFixed(precision)}%`;
    }
    case 'exponential': {
      return n.toExponential(precision);
    }
    case 'bytes-decimal':
    case 'bytes-binary': {
      const base = rule === 'bytes-decimal' ? 1000 : 1024;
      const units = rule === 'bytes-decimal' ? BYTES_DECIMAL_UNITS : BYTES_BINARY_UNITS;
      const neg = n < 0;
      let v = Math.abs(n);
      let i = 0;
      while (v >= base && i < units.length - 1) {
        v /= base;
        i += 1;
      }
      const rounded = roundTo(v, precision, truncate);
      return `${neg ? '-' : ''}${rounded.toFixed(precision)} ${units[i]}`;
    }
    case 'numbers':
    case 'text':
    default: {
      const v = roundTo(n, precision, truncate);
      return v.toFixed(precision);
    }
  }
}

// Matches a numeric token, including scientific notation (e.g. 1.6111e1) and sign.
const NUMBER_RE = /-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g;

/**
 * formatNumeral — rewrite every numeric token in `text` per the options.
 * `rule: 'numbers'` keeps only the numbers (drops surrounding non-numeric text);
 * all other rules rewrite numbers in place. `parser` overrides everything.
 */
export function formatNumeral(text: string, options: NumeralOptions = {}): string {
  const { rule = 'text', precision = 0, truncate = 'round', parser } = options;
  if (parser) return parser(text);

  if (rule === 'numbers') {
    // Extract numbers only, formatted, comma-joined (对齐 Semi formatNumeral: join(',')).
    const nums = text.match(NUMBER_RE) ?? [];
    return nums.map((m) => formatNumber(Number(m), 'numbers', precision, truncate)).join(',');
  }

  return text.replace(NUMBER_RE, (m) => formatNumber(Number(m), rule, precision, truncate));
}
