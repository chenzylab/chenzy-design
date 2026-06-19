/**
 * upload — framework-agnostic helpers for file upload progress/state.
 * Pure functions; the render layer owns the XHR. See specs/components/input/Upload.spec.md.
 */

/**
 * Percent complete (0–100, integer) from loaded/total bytes. Clamps to [0,100];
 * returns 0 when total is 0/unknown (避免除零得到 NaN/Infinity)。
 */
export function computeUploadPercent(loaded: number, total: number): number {
  if (total <= 0) return 0;
  const pct = Math.round((loaded / total) * 100);
  return Math.min(100, Math.max(0, pct));
}

/** Whether an HTTP status code counts as a successful upload (2xx). */
export function isUploadOk(status: number): boolean {
  return status >= 200 && status < 300;
}
