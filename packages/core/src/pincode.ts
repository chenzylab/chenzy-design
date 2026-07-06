/**
 * createPinCode helpers — framework-agnostic primitives for PinCode (OTP / 分格验证码).
 * Pure functions only: per-char validation by format, single-cell completion with
 * advance + onComplete detection, keyboard navigation (←→/Backspace/Delete) with
 * boundary clamping, and paste distribution that stops at the first illegal char.
 * The svelte layer owns the DOM, focus movement and composition state; it delegates
 * validation / index math here so the logic stays testable across frameworks.
 * See specs/components/input/PinCode.spec.md §3.
 */

/** Per-cell input format. `number` = digits only; `mixed` = digits + latin letters. */
export type PinCodeFormat = 'number' | 'mixed' | RegExp | ((char: string) => boolean);

const NUMBER_RE = /^[0-9]$/;
const MIXED_RE = /^[0-9a-zA-Z]$/;

/**
 * validateChar — is a single character allowed under `format`?
 * Only ever receives (and should be tested with) single-character strings; empty
 * string and multi-char strings are rejected. RegExp formats are applied per char
 * (the caller splits input before validating).
 */
export function validateChar(char: string, format: PinCodeFormat = 'number'): boolean {
  if (char.length !== 1) return false;
  if (format === 'number') return NUMBER_RE.test(char);
  if (format === 'mixed') return MIXED_RE.test(char);
  if (typeof format === 'function') return format(char);
  // RegExp: test the single char. `.test` on a global regex advances lastIndex,
  // so build a fresh, non-stateful test to stay pure.
  return new RegExp(format.source, format.flags.replace(/[gy]/g, '')).test(char);
}

/** inputMode hint derived from format (numeric for digit-only, text otherwise). */
export function inputModeForFormat(format: PinCodeFormat): 'numeric' | 'text' {
  return format === 'number' ? 'numeric' : 'text';
}

/** Normalize a raw string into a fixed-length cell list (`''` for empty cells). */
export function toValueList(value: string, count: number): string[] {
  const chars = [...(value ?? '')];
  const list: string[] = [];
  for (let i = 0; i < count; i += 1) list[i] = chars[i] ?? '';
  return list;
}

/** Join a cell list back into a single string (empty cells contribute ''). */
export function fromValueList(list: readonly string[]): string {
  return list.join('');
}

/** Are all `count` cells filled? Used to gate onComplete. */
export function isComplete(list: readonly string[], count: number): boolean {
  if (list.length < count) return false;
  for (let i = 0; i < count; i += 1) {
    if (list[i] === '' || list[i] == null) return false;
  }
  return true;
}

/** Result of writing one legal char into a cell. */
export interface CompleteSingleResult {
  /** New cell list after writing. */
  list: string[];
  /** Index that should receive focus next (clamped to last cell). */
  nextIndex: number;
  /** Whether all cells are now filled (caller fires onComplete + blurs). */
  completed: boolean;
}

/**
 * completeSingleInput — write one already-validated char into cell `index`,
 * advance the active index by one (clamped to the last cell), and report whether
 * the whole code is now filled. Pure: returns a fresh list.
 */
export function completeSingleInput(
  list: readonly string[],
  count: number,
  index: number,
  char: string,
): CompleteSingleResult {
  const next = toValueList(fromValueList(list), count);
  next[index] = char;
  const nextIndex = Math.min(index + 1, count - 1);
  return { list: next, nextIndex, completed: isComplete(next, count) };
}

/** Keyboard action derived from a key press on a cell (framework applies it). */
export type PinCodeKeyAction =
  | { type: 'focus'; index: number }
  | { type: 'clear'; index: number; nextIndex: number }
  | { type: 'none' };

/**
 * handleKeyDown — map arrow / Backspace / Delete on cell `index` to an action.
 * - ArrowLeft/Right: move focus one cell, clamped to [0, count-1] (no wrap).
 * - Backspace: clear current cell, move focus back one cell (clamped to 0).
 * - Delete: clear current cell, move focus forward one cell (clamped to count-1).
 * Other keys → `none` (character entry handled separately via input events).
 * `rtl` mirrors ArrowLeft/Right (logical order stays start→end).
 */
export function handleKeyDown(
  key: string,
  index: number,
  count: number,
  rtl = false,
): PinCodeKeyAction {
  const left = rtl ? 'ArrowRight' : 'ArrowLeft';
  const right = rtl ? 'ArrowLeft' : 'ArrowRight';
  switch (key) {
    case left:
      return { type: 'focus', index: Math.max(0, index - 1) };
    case right:
      return { type: 'focus', index: Math.min(count - 1, index + 1) };
    case 'Backspace':
      return { type: 'clear', index, nextIndex: Math.max(0, index - 1) };
    case 'Delete':
      return { type: 'clear', index, nextIndex: Math.min(count - 1, index + 1) };
    case 'Home':
      return { type: 'focus', index: 0 };
    case 'End':
      return { type: 'focus', index: count - 1 };
    default:
      return { type: 'none' };
  }
}

/** Result of distributing pasted text across cells starting at `startIndex`. */
export interface DistributePasteResult {
  /** New cell list after distribution. */
  list: string[];
  /** Index that should receive focus after paste (last written cell, clamped). */
  nextIndex: number;
  /** Whether all cells are now filled. */
  completed: boolean;
  /** How many chars were actually written (stops early on illegal char / overflow). */
  written: number;
}

/**
 * distributePaste — spread `text` char-by-char into cells from `startIndex`,
 * validating each char against `format`. Stops at the first illegal char or when
 * the last cell is filled (whichever comes first). Pure: returns a fresh list.
 */
export function distributePaste(
  list: readonly string[],
  count: number,
  startIndex: number,
  text: string,
  format: PinCodeFormat = 'number',
): DistributePasteResult {
  const next = toValueList(fromValueList(list), count);
  let cursor = startIndex;
  let written = 0;
  for (const char of [...text]) {
    if (cursor >= count) break;
    if (!validateChar(char, format)) break;
    next[cursor] = char;
    cursor += 1;
    written += 1;
  }
  // Focus lands on the last written cell (or the start cell if nothing written),
  // clamped so it never exceeds the last cell.
  const nextIndex = Math.min(Math.max(startIndex, cursor - 1), count - 1);
  return { list: next, nextIndex, completed: isComplete(next, count), written };
}
