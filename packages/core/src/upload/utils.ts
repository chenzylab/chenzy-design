/**
 * Upload utils — ported from Semi semi-foundation/upload/utils.ts.
 * Pure functions; no DOM state. See specs/components/input/Upload.spec.md §3.
 */

import { byteKB, byteMB } from './constants.js';

/**
 * Format a byte count into Semi's display string (matches Semi getFileSize exactly):
 * - `< 1KB` → `"N.NNKB"` (2 decimals, may be <1)
 * - `1KB..1MB` → `"N.NKB"` (1 decimal)
 * - `>= 1MB` → `"N.NMB"` (1 decimal)
 */
export function getFileSize(bytes: number): string {
  if (bytes < byteKB) return `${(bytes / byteKB).toFixed(2)}KB`;
  if (bytes < byteMB) return `${(bytes / byteKB).toFixed(1)}KB`;
  return `${(bytes / byteMB).toFixed(1)}MB`;
}

/** Whether `str` ends with `suffix` (Semi endsWith, avoids String.prototype.endsWith polyfill concerns). */
export function endsWith(str: string, suffix: string): boolean {
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

/**
 * Whether an HTTP status code counts as a successful upload (2xx).
 * (formerly `isUploadOk`)
 */
export function isUploadOk(status: number): boolean {
  return status >= 200 && status < 300;
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
 */
export function validateFileSize(
  bytes: number,
  opts: { minSize?: number | undefined; maxSize?: number | undefined } = {},
): UploadSizeError {
  const { minSize, maxSize } = opts;
  if (maxSize !== undefined && bytes > maxSize * byteKB) return 'max';
  if (minSize !== undefined && bytes < minSize * byteKB) return 'min';
  return null;
}

/**
 * Percent complete (0–100, integer) from loaded/total bytes, scaled by Semi's
 * PROGRESS_COEFFICIENT (0.95) so the bar never visually reaches 100% until the
 * `success` status sets it explicitly. Clamps to [0,100]; returns 0 when total
 * is 0/unknown.
 */
export function computeUploadPercent(loaded: number, total: number): number {
  if (total <= 0) return 0;
  const pct = Math.round((loaded / total) * 100 * 0.95);
  return Math.min(100, Math.max(0, pct));
}

/** A file-like input carrying an optional pre-assigned uid (Semi CustomFile). */
export interface CustomFile extends File {
  uid?: string;
}

/**
 * Whether `file` is treated as an image for preview purposes (Semi isImage,
 * matches by file.type suffix — matches webp/svg/png/gif/jpg/jpeg/bmp/dpg).
 */
export function isImageFile(file: { type: string }): boolean {
  return /(webp|svg|png|gif|jpg|jpeg|bmp|dpg)$/i.test(file.type);
}

/**
 * Accept-list matching (Semi checkFileFormat): supports `.ext` suffix,
 * `type/*` wildcard, and exact `type/subtype` MIME strings.
 */
export function checkFileFormat(accept: string, file: { name: string; type: string }): boolean {
  const acceptTypes = accept
    .split(',')
    .map((type) => type.trim())
    .filter(Boolean);
  const mimeType = file.type || '';
  const baseMimeType = mimeType.replace(/\/.*$/, '');

  return acceptTypes.some((type) => {
    if (type.charAt(0) === '.') {
      const fileName = file.name || '';
      const acceptExtension = type.split('.').pop()!.toLowerCase();
      return endsWith(fileName.toLowerCase(), acceptExtension);
    }
    if (/\/\*$/.test(type)) {
      const acceptBaseMimeType = type.replace(/\/.*$/, '');
      return baseMimeType === acceptBaseMimeType;
    }
    if (/^[^/]+\/[^/]+$/.test(type)) {
      return mimeType === type;
    }
    return false;
  });
}

/** Minimal shape of the two FileSystem entry APIs used by directory drag-drop. */
export interface DirEntryLike {
  isFile: boolean;
  isDirectory: boolean;
  name: string;
  fullPath?: string;
  file?: (success: (file: File) => void, error: (err: unknown) => void) => void;
  createReader?: () => { readEntries: (success: (entries: DirEntryLike[]) => void, error: (err: unknown) => void) => void };
}

/** Read all entries of a directory reader (paginated readEntries → flat list). (Semi loopFiles) */
export async function loopFiles(item: DirEntryLike): Promise<DirEntryLike[]> {
  return new Promise((resolve, reject) => {
    const dirReader = item.createReader?.();
    if (!dirReader) {
      resolve([]);
      return;
    }
    let fileList: DirEntryLike[] = [];
    function sequence(): void {
      dirReader!.readEntries((entries) => {
        fileList = fileList.concat(entries);
        if (entries.length === 0) {
          resolve(fileList);
        } else {
          sequence();
        }
      }, reject);
    }
    sequence();
  });
}

/**
 * Recursively resolve a DataTransferItemList (directory drag-drop) into a flat
 * File[] list, stamping `webkitRelativePath` when the browser doesn't already
 * provide one. (Semi mapFileTree)
 */
export async function mapFileTree(
  items: Array<{ webkitGetAsEntry: () => DirEntryLike | null }>,
): Promise<File[]> {
  const promises: Array<Promise<File>> = [];
  async function traverse(item: DirEntryLike, path = ''): Promise<void> {
    if (item.isFile) {
      promises.push(
        new Promise<File>((resolve, reject) => {
          item.file?.((file) => {
            if (item.fullPath && !file.webkitRelativePath) {
              Object.defineProperty(file, 'webkitRelativePath', {
                value: item.fullPath!.replace(/^\//, ''),
                writable: false,
                configurable: true,
              });
            }
            resolve(file);
          }, reject);
        }),
      );
    } else if (item.isDirectory) {
      const entries = await loopFiles(item);
      for (const entry of entries) {
        await traverse(entry, `${path}${item.name}/`);
      }
    }
  }
  try {
    const entries = items.map((i) => i.webkitGetAsEntry()).filter((e): e is DirEntryLike => e !== null);
    await Promise.all(entries.map((e) => traverse(e)));
    return await Promise.all(promises);
  } catch {
    return [];
  }
}
