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
