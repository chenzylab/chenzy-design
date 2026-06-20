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

/** A unit of work the queue can run; resolves when the upload settles. */
export type UploadTask = () => void | Promise<void>;

export interface UploadQueue {
  /** Enqueue a task; runs immediately if a slot is free, else waits in FIFO order. */
  add: (task: UploadTask) => void;
  /** Number of tasks currently running. */
  readonly active: number;
  /** Number of tasks waiting for a free slot. */
  readonly pending: number;
}

/**
 * Concurrency-limited FIFO scheduler. At most `limit` tasks run at once;
 * when one settles, the next queued task starts (complete-one-refill-one).
 *
 * `limit <= 0` means unlimited — every task starts immediately, preserving
 * the no-throttle behaviour. Pure of any DOM: the render layer wraps each
 * XHR in a task whose promise settles on load/error/abort.
 */
export function createUploadQueue(limit = 0): UploadQueue {
  const waiting: UploadTask[] = [];
  let active = 0;
  const unlimited = limit <= 0;

  function runNext() {
    while ((unlimited || active < limit) && waiting.length > 0) {
      const task = waiting.shift()!;
      active++;
      // Normalise sync/async/throwing tasks into a single settle path.
      Promise.resolve()
        .then(task)
        .catch(() => {})
        .finally(() => {
          active--;
          runNext();
        });
    }
  }

  return {
    add(task: UploadTask) {
      waiting.push(task);
      runNext();
    },
    get active() {
      return active;
    },
    get pending() {
      return waiting.length;
    },
  };
}

/** Why a file failed size validation (or `null` when it passes). */
export type UploadSizeError = 'min' | 'max' | null;

/**
 * Validate one file's size against optional bounds (both in KB, matching the
 * `maxSize` / `minSize` props). Pure: the render layer maps the result onto
 * item status + an i18n message.
 *
 * - `max` when `maxSize` is set and `size > maxSize * 1024`.
 * - `min` when `minSize` is set and `size < minSize * 1024`.
 * - `null` otherwise (no bound set, or within range).
 *
 * `max` is checked first so a single offending file reports the upper bound
 * when both are somehow violated (cannot happen for a coherent min ≤ max).
 */
export function validateFileSize(
  bytes: number,
  opts: { minSize?: number | undefined; maxSize?: number | undefined } = {},
): UploadSizeError {
  const { minSize, maxSize } = opts;
  if (maxSize !== undefined && bytes > maxSize * 1024) return 'max';
  if (minSize !== undefined && bytes < minSize * 1024) return 'min';
  return null;
}

/**
 * Normalise a `beforeUpload` result into an action for one file.
 * - `false` → skip the file (treat as rejected/removed).
 * - `true` / `undefined` → upload the original file.
 * - a `File` → upload this (possibly transformed) file instead.
 */
export type BeforeUploadResult = boolean | File | void;

export interface BeforeUploadDecision {
  upload: boolean;
  /** The file to upload when `upload` is true (original or replacement). */
  file?: File;
}

export function resolveBeforeUpload(
  original: File,
  result: BeforeUploadResult,
): BeforeUploadDecision {
  if (result === false) return { upload: false };
  if (result instanceof File) return { upload: true, file: result };
  return { upload: true, file: original };
}
