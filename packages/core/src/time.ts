/**
 * Framework-agnostic time-column utilities for TimePicker.
 * No DOM, no framework deps. See specs/components/input/TimePicker.spec.md §3/§4.
 * Pure column math only — display formatting is the render layer's job (Intl).
 */

/** AM/PM meridiem in 12-hour mode. */
export type Meridiem = 'am' | 'pm';

/** A single selectable option in a time column. */
export interface TimeOption {
  /** the underlying numeric value (hour 0-23 / 1-12, minute/second 0-59) */
  value: number;
  /** true when the value is disabled (placed by disabledXxx) */
  disabled: boolean;
}

/** Disabled-providers passed straight through from the component props. */
export interface DisabledTime {
  disabledHours?: () => number[];
  disabledMinutes?: (hour: number) => number[];
  disabledSeconds?: (hour: number, minute: number) => number[];
}

/**
 * Build a stepped numeric range `[0, max)`.
 * step ≤ 0 is treated as 1.
 */
export function buildRange(max: number, step: number): number[] {
  const safeStep = step > 0 ? Math.floor(step) : 1;
  const out: number[] = [];
  for (let i = 0; i < max; i += safeStep) out.push(i);
  return out;
}

/** Convert a 24-hour hour (0-23) to its 12-hour display hour (1-12). */
export function to12Hour(hour24: number): number {
  const h = ((hour24 % 24) + 24) % 24;
  const mod = h % 12;
  return mod === 0 ? 12 : mod;
}

/** Derive the meridiem ('am' | 'pm') of a 24-hour hour. */
export function meridiemOf(hour24: number): Meridiem {
  const h = ((hour24 % 24) + 24) % 24;
  return h < 12 ? 'am' : 'pm';
}

/**
 * Convert a 12-hour display hour (1-12) + meridiem back to a 24-hour hour (0-23).
 * Boundary rules: 12 AM → 0, 12 PM → 12.
 */
export function from12Hour(hour12: number, meridiem: Meridiem): number {
  const h = ((Math.floor(hour12) - 1 + 12) % 12) + 1; // clamp into 1-12
  const base = h % 12; // 12 → 0
  return meridiem === 'pm' ? base + 12 : base;
}

/**
 * Build the hour column options.
 * 24h mode: stepped values 0-23.
 * 12h mode: stepped values 1-12 (uses `to12Hour`/`from12Hour` semantics; value is the display hour).
 * `disabledHours` returns 24-hour numbers; in 12h mode it is mapped via the active meridiem.
 */
export function buildHourOptions(
  step: number,
  use12Hours: boolean,
  meridiem: Meridiem,
  disabledHours?: () => number[],
): TimeOption[] {
  const disabledSet = new Set(disabledHours ? disabledHours() : []);
  if (!use12Hours) {
    return buildRange(24, step).map((value) => ({ value, disabled: disabledSet.has(value) }));
  }
  const safeStep = step > 0 ? Math.floor(step) : 1;
  const out: TimeOption[] = [];
  for (let display = 1; display <= 12; display += safeStep) {
    const hour24 = from12Hour(display, meridiem);
    out.push({ value: display, disabled: disabledSet.has(hour24) });
  }
  return out;
}

/** Build the minute column options for a given (24-hour) hour. */
export function buildMinuteOptions(
  step: number,
  hour24: number,
  disabledMinutes?: (hour: number) => number[],
): TimeOption[] {
  const disabledSet = new Set(disabledMinutes ? disabledMinutes(hour24) : []);
  return buildRange(60, step).map((value) => ({ value, disabled: disabledSet.has(value) }));
}

/** Build the second column options for a given (24-hour) hour + minute. */
export function buildSecondOptions(
  step: number,
  hour24: number,
  minute: number,
  disabledSeconds?: (hour: number, minute: number) => number[],
): TimeOption[] {
  const disabledSet = new Set(disabledSeconds ? disabledSeconds(hour24, minute) : []);
  return buildRange(60, step).map((value) => ({ value, disabled: disabledSet.has(value) }));
}

/**
 * Drop disabled options when `hideDisabledOptions` is on; otherwise keep them all.
 * Pure: returns a new array.
 */
export function applyHideDisabled(options: TimeOption[], hideDisabledOptions: boolean): TimeOption[] {
  return hideDisabledOptions ? options.filter((o) => !o.disabled) : options;
}

/** true if the given 24-hour time is (partially) disabled by any provider. */
export function isTimeDisabled(hour24: number, minute: number, second: number, d: DisabledTime): boolean {
  if (d.disabledHours && d.disabledHours().includes(hour24)) return true;
  if (d.disabledMinutes && d.disabledMinutes(hour24).includes(minute)) return true;
  if (d.disabledSeconds && d.disabledSeconds(hour24, minute).includes(second)) return true;
  return false;
}

/**
 * A simple time triple in 24-hour internal representation.
 * Shared by the format string parse/serialize helpers below.
 */
export interface TimeParts {
  hour: number; // 0-23
  minute: number; // 0-59
  second: number; // 0-59
}

/**
 * Which columns a `format` string drives, plus whether AM/PM (12h) is requested.
 * Derived purely from the token string — the render layer uses this to decide
 * which columns to show instead of the boolean `showSecond` / `use12Hours` props.
 */
export interface FormatSpec {
  showHour: boolean;
  showMinute: boolean;
  showSecond: boolean;
  use12Hours: boolean;
}

/**
 * Parse a format string (e.g. 'HH:mm', 'hh:mm A', 'HH:mm:ss') into a column spec.
 * Recognized tokens: H/HH (24h hour), h/hh (12h hour), m/mm (minute), s/ss (second),
 * A/a (AM/PM meridiem). Lowercase `h` or an `A`/`a` token implies 12-hour mode.
 * Tokens inside any other characters (':', ' ', etc.) are treated as literals.
 */
export function parseFormatSpec(format: string): FormatSpec {
  const spec: FormatSpec = { showHour: false, showMinute: false, showSecond: false, use12Hours: false };
  // scan token runs of identical format letters
  const re = /H+|h+|m+|s+|A+|a+/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(format)) !== null) {
    const tok = match[0][0];
    switch (tok) {
      case 'H':
        spec.showHour = true;
        break;
      case 'h':
        spec.showHour = true;
        spec.use12Hours = true;
        break;
      case 'm':
        spec.showMinute = true;
        break;
      case 's':
        spec.showSecond = true;
        break;
      case 'A':
      case 'a':
        spec.use12Hours = true;
        break;
      default:
        break;
    }
  }
  return spec;
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

/**
 * Serialize a time triple to a string per the given format.
 * Token semantics: HH/H 24h hour (HH zero-padded), hh/h 12h hour, mm/m minute,
 * ss/s second, A → 'AM'/'PM', a → 'am'/'pm'. Unrecognized characters pass through.
 */
export function formatTime(parts: TimeParts, format: string): string {
  const { hour, minute, second } = parts;
  const h12 = to12Hour(hour);
  const mer = meridiemOf(hour);
  return format.replace(/H+|h+|m+|s+|A+|a+/g, (token) => {
    const tok = token[0];
    const padded = token.length >= 2;
    switch (tok) {
      case 'H':
        return padded ? pad2(hour) : `${hour}`;
      case 'h':
        return padded ? pad2(h12) : `${h12}`;
      case 'm':
        return padded ? pad2(minute) : `${minute}`;
      case 's':
        return padded ? pad2(second) : `${second}`;
      case 'A':
        return mer.toUpperCase();
      case 'a':
        return mer;
      default:
        return token;
    }
  });
}

/**
 * Parse a time string into a 24-hour {hour,minute,second} triple, or null when
 * unparseable. Tolerant: accepts 'HH:mm', 'HH:mm:ss', optional leading zeros, and
 * a trailing AM/PM marker (case-insensitive, e.g. '12:30 pm', '1:05:09AM').
 * When a meridiem is present the leading number is treated as a 12-hour hour.
 */
export function parseTimeString(input: string): TimeParts | null {
  const str = input.trim();
  if (!str) return null;
  const m = /^(\d{1,2})(?::(\d{1,2}))?(?::(\d{1,2}))?\s*([AaPp][Mm])?$/.exec(str);
  if (!m) return null;
  let hour = Number(m[1]);
  const minute = m[2] === undefined ? 0 : Number(m[2]);
  const second = m[3] === undefined ? 0 : Number(m[3]);
  const mer = m[4]?.toLowerCase();
  if (Number.isNaN(hour) || Number.isNaN(minute) || Number.isNaN(second)) return null;
  if (mer) {
    if (hour < 1 || hour > 12) return null;
    hour = from12Hour(hour, mer.startsWith('p') ? 'pm' : 'am');
  }
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59 || second < 0 || second > 59) return null;
  return { hour, minute, second };
}
