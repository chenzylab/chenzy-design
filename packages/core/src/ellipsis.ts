/**
 * createEllipsis — framework-agnostic truncation/expand logic for Typography.
 *
 * Two paths (per spec §9):
 *  - CSS clamp (default): no measurement at all — the render layer applies
 *    `-webkit-line-clamp`/`text-overflow`. This module only tracks `expanded`
 *    and the expand/collapse toggle; `truncated` stays unknown (CSS handles it).
 *  - Measurement path (expandable / suffix / showTooltip): the render layer
 *    feeds measured box metrics into `measure()`, which decides whether the
 *    content overflows (`truncated`). Pure decision — no DOM here; the svelte
 *    layer owns the ResizeObserver + rAF-throttled measurement (red line #3).
 *
 * Pure helpers (overflow decision, middle-truncation slicing) are independently
 * unit-tested. No framework deps, no DOM.
 * See specs/components/basic/Typography.spec.md §3, §4.3, §11.
 */

export type EllipsisPos = 'start' | 'middle' | 'end';

export interface EllipsisMeasureInput {
  /** rendered scroll height of the content (px) */
  scrollHeight: number;
  /** visible client height of the clamp box (px) */
  clientHeight: number;
  /** rendered scroll width (px) — used for single-row overflow detection */
  scrollWidth?: number;
  /** visible client width (px) */
  clientWidth?: number;
  /** number of clamp rows (1 = single line) */
  rows: number;
}

/**
 * Pure: decide whether content overflows its clamp box. For multi-row we compare
 * heights; for a single row we additionally allow a width comparison. A 1px
 * tolerance absorbs sub-pixel rounding so equal content is not flagged.
 */
export function isOverflowing(input: EllipsisMeasureInput): boolean {
  const TOL = 1;
  if (input.scrollHeight - input.clientHeight > TOL) return true;
  if (
    input.rows <= 1 &&
    input.scrollWidth !== undefined &&
    input.clientWidth !== undefined &&
    input.scrollWidth - input.clientWidth > TOL
  ) {
    return true;
  }
  return false;
}

/**
 * Pure: build a middle/start/end truncated string given a budget of visible
 * characters. Used only on the single-line precise path (pos: middle/start);
 * end truncation is normally left to CSS. Always inserts the ellipsis char.
 */
export function truncateText(
  text: string,
  maxChars: number,
  pos: EllipsisPos,
  ellipsis = '…',
): string {
  if (maxChars <= 0) return ellipsis;
  if (text.length <= maxChars) return text;
  const budget = Math.max(0, maxChars - ellipsis.length);
  if (pos === 'start') {
    return ellipsis + text.slice(text.length - budget);
  }
  if (pos === 'middle') {
    const head = Math.ceil(budget / 2);
    const tail = budget - head;
    return text.slice(0, head) + ellipsis + (tail > 0 ? text.slice(text.length - tail) : '');
  }
  // end
  return text.slice(0, budget) + ellipsis;
}

export interface EllipsisOptions {
  /** clamp rows (default 1) */
  rows?: number;
  /** whether an expand/collapse toggle is offered */
  expandable?: boolean;
  /** truncation position (single-line precise path); default 'end' */
  pos?: EllipsisPos;
  /** initial expanded state */
  defaultExpanded?: boolean;
  /** re-render hook fired when expanded/truncated changes */
  onChange?: (state: EllipsisSnapshot) => void;
  /** fired on expand/collapse toggle */
  onExpand?: (expanded: boolean) => void;
}

export interface EllipsisSnapshot {
  rows: number;
  expanded: boolean;
  /** null = unknown (CSS clamp path, not measured) */
  truncated: boolean | null;
}

export interface EllipsisApi {
  readonly rows: number;
  readonly expanded: boolean;
  readonly truncated: boolean | null;
  /** toggle expanded (no-op when not expandable) */
  toggle(): void;
  /** explicitly set expanded */
  setExpanded(next: boolean): void;
  /** feed measured metrics (measurement path) → updates `truncated` */
  measure(input: EllipsisMeasureInput): boolean;
}

export function createEllipsis(options: EllipsisOptions = {}): EllipsisApi {
  const rows = options.rows ?? 1;
  let expanded = options.defaultExpanded ?? false;
  let truncated: boolean | null = null;

  function emit(): void {
    options.onChange?.({ rows, expanded, truncated });
  }

  function setExpanded(next: boolean): void {
    if (!options.expandable || expanded === next) return;
    expanded = next;
    options.onExpand?.(expanded);
    emit();
  }

  return {
    get rows() {
      return rows;
    },
    get expanded() {
      return expanded;
    },
    get truncated() {
      return truncated;
    },
    toggle() {
      setExpanded(!expanded);
    },
    setExpanded,
    measure(input) {
      const next = isOverflowing(input);
      if (next !== truncated) {
        truncated = next;
        emit();
      }
      return next;
    },
  };
}
