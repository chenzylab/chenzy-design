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

/** Semi 分页折叠上限：可见页码 + 省略号总计 7；省略号后的隐藏页上限 100 万。 */
const PAGE_SHOW_MAX = 7;
const REST_PAGE_MAX_SIZE = 1_000_000;

/** Semi 分页页码列表：pageList 含 '...'，restLeft/restRight 为各省略号背后的隐藏页。 */
export interface SemiPageList {
  pageList: (number | '...')[];
  restLeft: number[];
  restRight: number[];
}

/**
 * 严格镜像 Semi `_updatePageList` 的折叠逻辑（t=总页数, c=当前页）：
 *  - t≤7：全展开
 *  - c<4：`1 2 3 4 … (t-1) t`
 *  - c=4：`1 2 3 4 5 … t`
 *  - 4<c<t-3：`1 … (c-1) c (c+1) … t`
 *  - t-3≤c≤t：`1 … (t-4)(t-3)(t-2)(t-1)(t)`
 * 截断符 + 数字总计 7 个。restLeft/restRight 为省略号 hover 弹层的隐藏页码。
 * 纯函数，页码数百万仍产出 O(1) 单元格。
 */
export function semiPageList(current: number, total: number): SemiPageList {
  const totalPageNum = Math.max(1, Number.isFinite(total) ? Math.trunc(total) : 1);
  const c = Math.min(Math.max(1, Number.isFinite(current) ? Math.trunc(current) : 1), totalPageNum);

  if (totalPageNum <= PAGE_SHOW_MAX) {
    return { pageList: numbers(1, totalPageNum), restLeft: [], restRight: [] };
  }
  if (c < 4) {
    return {
      pageList: [1, 2, 3, 4, '...', totalPageNum - 1, totalPageNum],
      restLeft: [],
      restRight: numbers(5, 4 + Math.min(totalPageNum - 6, REST_PAGE_MAX_SIZE)),
    };
  }
  if (c === 4) {
    return {
      pageList: [1, 2, 3, 4, 5, '...', totalPageNum],
      restLeft: [],
      restRight: numbers(6, 5 + Math.min(totalPageNum - 6, REST_PAGE_MAX_SIZE)),
    };
  }
  if (c < totalPageNum - 3) {
    return {
      pageList: [1, '...', c - 1, c, c + 1, '...', totalPageNum],
      restLeft: numbers(2, 1 + Math.min(c - 3, REST_PAGE_MAX_SIZE)),
      restRight: numbers(c + 2, c + 1 + Math.min(totalPageNum - c - 2, REST_PAGE_MAX_SIZE)),
    };
  }
  // t-3 ≤ c ≤ t
  const right = numbers(totalPageNum - 4, totalPageNum);
  return {
    pageList: [1, '...', ...right],
    restLeft: numbers(2, 1 + Math.min(right[0]! - 2, REST_PAGE_MAX_SIZE)),
    restRight: [],
  };
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
