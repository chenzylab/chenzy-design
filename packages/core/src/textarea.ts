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
