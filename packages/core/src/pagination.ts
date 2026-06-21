/**
 * Pagination helpers — framework-agnostic page-count and boundary clamping.
 * Pure functions only; the render layer owns state, onChange dispatch and DOM.
 * See specs/components/navigation/Pagination.spec.md.
 */

/** Total page count for `total` items at `pageSize` per page. Always >= 1. */
export function pageCount(total: number, pageSize: number): number {
  if (!Number.isFinite(total) || total <= 0) return 1;
  if (!Number.isFinite(pageSize) || pageSize <= 0) return 1;
  return Math.max(1, Math.ceil(total / pageSize));
}

/**
 * Clamp a page number into the valid range [1, pageCount(total, pageSize)].
 * Non-finite / non-integer input falls back to page 1 (lower bound).
 */
export function clampPage(page: number, total: number, pageSize: number): number {
  const count = pageCount(total, pageSize);
  if (!Number.isFinite(page)) return 1;
  const intPage = Math.trunc(page);
  if (intPage < 1) return 1;
  if (intPage > count) return count;
  return intPage;
}

/** True when `page` is already a valid in-range page for the given dataset. */
export function isPageInRange(page: number, total: number, pageSize: number): boolean {
  if (!Number.isInteger(page)) return false;
  return page >= 1 && page <= pageCount(total, pageSize);
}

/**
 * Resolve a page-size value: keep it when it is a positive finite number that
 * appears in `options`; otherwise fall back to `fallback`. Used to guard the
 * size-changer / pageSize prop against invalid values.
 */
export function clampPageSize(size: number, options: number[], fallback: number): number {
  if (!Number.isFinite(size) || size <= 0) return fallback;
  const intSize = Math.trunc(size);
  if (options.length > 0 && !options.includes(intSize)) return fallback;
  return intSize;
}

/** A cell in the rendered page sequence: a concrete page or an ellipsis gap. */
export type PageCell =
  | { type: 'page'; value: number }
  | { type: 'ellipsis'; position: 'prev' | 'next' };

/**
 * Build the visible page sequence with ellipsis folding (AntD-style).
 *
 * Always keeps `boundaryCount` pages at each end and `siblingCount` pages on
 * either side of `current`; everything else collapses into an ellipsis cell.
 * An ellipsis is only emitted when it would hide at least two pages — when a
 * single page would be hidden it is rendered instead (no `… ` standing in for
 * one page). The result length is bounded and independent of `count` once it
 * exceeds the visible window, so a million pages still yields O(1) cells.
 *
 * Pure function of `(current, count, siblingCount, boundaryCount)` — safe to
 * call from the render layer / memoize. Inputs are sanitised: non-finite or
 * negative sibling/boundary counts fall back to 0, `current` is clamped into
 * `[1, count]`, `count` is floored at 1.
 */
export function pageRange(
  current: number,
  count: number,
  siblingCount = 1,
  boundaryCount = 1,
): PageCell[] {
  const total = Math.max(1, Number.isFinite(count) ? Math.trunc(count) : 1);
  const sibling = Math.max(0, Number.isFinite(siblingCount) ? Math.trunc(siblingCount) : 0);
  const boundary = Math.max(0, Number.isFinite(boundaryCount) ? Math.trunc(boundaryCount) : 0);
  const cur = Math.min(Math.max(1, Number.isFinite(current) ? Math.trunc(current) : 1), total);

  // When every page fits inside the visible window there is nothing to fold:
  // list them all. Window width = boundary*2 + sibling*2 + current + 2 ellipsis.
  if (boundary * 2 + sibling * 2 + 5 >= total) {
    return numbers(1, total).map((value) => ({ type: 'page', value }) as PageCell);
  }

  // Fixed-size leading / trailing boundary blocks (capped at total).
  const startPages = numbers(1, Math.min(boundary, total));
  const endPages = numbers(Math.max(total - boundary + 1, boundary + 1), total);

  // Sibling window around current, kept clamped so it never overlaps the
  // boundary blocks and keeps a constant width even at the very ends.
  const siblingsStart = Math.max(
    Math.min(cur - sibling, total - boundary - sibling * 2 - 1),
    boundary + 2,
  );
  const firstEndPage = endPages[0];
  const siblingsEnd = Math.min(
    Math.max(cur + sibling, boundary + sibling * 2 + 2),
    firstEndPage !== undefined ? firstEndPage - 2 : total - 1,
  );

  const items: (number | 'ellipsis-prev' | 'ellipsis-next')[] = [
    ...startPages,
    // left ellipsis, or the single page it would have hidden
    ...(siblingsStart > boundary + 2
      ? (['ellipsis-prev'] as const)
      : boundary + 1 < siblingsStart
        ? numbers(boundary + 1, siblingsStart - 1)
        : []),
    ...numbers(siblingsStart, siblingsEnd),
    // right ellipsis, or the single page it would have hidden
    ...(siblingsEnd < total - boundary - 1
      ? (['ellipsis-next'] as const)
      : total - boundary > siblingsEnd
        ? numbers(siblingsEnd + 1, total - boundary)
        : []),
    ...endPages,
  ];

  return items.map((it) =>
    typeof it === 'number'
      ? ({ type: 'page', value: it } as PageCell)
      : ({ type: 'ellipsis', position: it === 'ellipsis-prev' ? 'prev' : 'next' } as PageCell),
  );
}

/** Inclusive integer range `[start, end]`; empty when `start > end`. */
function numbers(start: number, end: number): number[] {
  if (start > end) return [];
  const out: number[] = [];
  for (let i = start; i <= end; i++) out.push(i);
  return out;
}

/**
 * Parse + clamp a quick-jumper text input into a valid page number.
 * Returns the clamped page, or `null` when the input is empty / non-numeric
 * (caller decides whether to ignore or surface a warning).
 */
export function parseJumpInput(
  raw: string,
  total: number,
  pageSize: number,
): number | null {
  const trimmed = raw.trim();
  if (trimmed === '') return null;
  if (!/^[+-]?\d+$/.test(trimmed)) return null;
  const n = Number.parseInt(trimmed, 10);
  if (Number.isNaN(n)) return null;
  return clampPage(n, total, pageSize);
}
