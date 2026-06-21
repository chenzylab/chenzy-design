/**
 * textarea — framework-agnostic autosize height math for <textarea>.
 * Pure: given the measured scrollHeight (with box-sizing: border-box, i.e. the
 * content height the browser reports) plus the row metrics, returns the height
 * to apply and whether vertical scrolling is needed (maxRows reached). No DOM.
 * The render layer measures scrollHeight and applies the result.
 * See specs/components/input/Input.spec.md (TextArea autosize).
 */

export interface AutosizeInput {
  /** measured content height (px), e.g. textarea.scrollHeight with border-box */
  scrollHeight: number;
  /** single line height (px), from computed line-height */
  lineHeight: number;
  /** total vertical padding (top + bottom, px) */
  verticalPadding: number;
  /** total vertical border (top + bottom, px) */
  verticalBorder: number;
  /** minimum visible rows (default 1) */
  minRows?: number;
  /** maximum visible rows before scrolling (default Infinity) */
  maxRows?: number;
}

export interface AutosizeResult {
  /** height (px) to apply to the textarea (border-box) */
  height: number;
  /** whether content exceeds maxRows and vertical scroll is needed */
  overflow: boolean;
}

/** border-box height for a given number of text rows. */
function heightForRows(
  rows: number,
  lineHeight: number,
  verticalPadding: number,
  verticalBorder: number,
): number {
  return rows * lineHeight + verticalPadding + verticalBorder;
}

/**
 * Compute the autosize height. Clamps the content-driven height into
 * [minRows, maxRows]; sets overflow=true only when the natural content exceeds
 * the maxRows cap (so the caller can switch overflow-y to auto).
 */
export function computeAutosizeHeight(input: AutosizeInput): AutosizeResult {
  const { scrollHeight, lineHeight, verticalPadding, verticalBorder } = input;
  const minRows = input.minRows ?? 1;
  const maxRows = input.maxRows ?? Number.POSITIVE_INFINITY;

  const minHeight = heightForRows(minRows, lineHeight, verticalPadding, verticalBorder);
  const maxHeight = Number.isFinite(maxRows)
    ? heightForRows(maxRows, lineHeight, verticalPadding, verticalBorder)
    : Number.POSITIVE_INFINITY;

  // scrollHeight already includes padding (border-box reporting); it is the
  // natural content height. Clamp it into [minHeight, maxHeight].
  const natural = scrollHeight;
  const overflow = natural > maxHeight;
  const height = Math.min(Math.max(natural, minHeight), maxHeight);

  return { height, overflow };
}

// --- character counting -----------------------------------------------------

/**
 * Lazily-built, locale-keyed cache of `Intl.Segmenter` instances. The Segmenter
 * is only constructed when grapheme counting is actually requested (perf budget:
 * default length counting has zero extra cost). One instance per locale is reused.
 */
const segmenterCache = new Map<string, Intl.Segmenter | null>();

function getGraphemeSegmenter(locale?: string): Intl.Segmenter | null {
  const key = locale ?? '';
  if (segmenterCache.has(key)) return segmenterCache.get(key) ?? null;
  let seg: Intl.Segmenter | null = null;
  // Intl.Segmenter is widely supported but guard for older runtimes/SSR.
  if (typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function') {
    seg = new Intl.Segmenter(locale, { granularity: 'grapheme' });
  }
  segmenterCache.set(key, seg);
  return seg;
}

/**
 * Count the visible characters of a string. Pure (no DOM).
 *
 * - `graphemes: false` (default) → spread-based code-point count (`[...s].length`),
 *   matching the existing behaviour; zero extra cost.
 * - `graphemes: true` → counts user-perceived characters via `Intl.Segmenter`
 *   (correctly handles emoji, ZWJ sequences, combining marks, flags). Falls back
 *   to the code-point count when `Intl.Segmenter` is unavailable.
 */
export function countCharacters(
  value: string,
  options?: { graphemes?: boolean; locale?: string },
): number {
  if (!value) return 0;
  if (!options?.graphemes) return [...value].length;
  const seg = getGraphemeSegmenter(options.locale);
  if (!seg) return [...value].length;
  let n = 0;
  // Iterate segments; the iterator yields one entry per grapheme cluster.
  const iter = seg.segment(value)[Symbol.iterator]();
  while (!iter.next().done) n++;
  return n;
}
