import { describe, expect, it } from 'vitest';
import {
  getFileSize,
  endsWith,
  isUploadOk,
  validateFileSize,
  computeUploadPercent,
  isImageFile,
  checkFileFormat,
} from './utils.js';

describe('getFileSize', () => {
  it('formats bytes under 1KB with 2 decimals', () => {
    expect(getFileSize(0)).toBe('0.00KB');
    expect(getFileSize(512)).toBe('0.50KB');
  });
  it('formats 1KB..1MB with 1 decimal', () => {
    expect(getFileSize(1024)).toBe('1.0KB');
    expect(getFileSize(1536)).toBe('1.5KB');
    expect(getFileSize(1048575)).toBe('1024.0KB');
  });
  it('formats >=1MB with 1 decimal', () => {
    expect(getFileSize(1048576)).toBe('1.0MB');
    expect(getFileSize(1572864)).toBe('1.5MB');
  });
});

describe('endsWith', () => {
  it('matches a literal suffix', () => {
    expect(endsWith('report.pdf', '.pdf')).toBe(true);
    expect(endsWith('report.pdf', '.doc')).toBe(false);
  });
});

describe('isUploadOk', () => {
  it('treats 2xx as success', () => {
    expect(isUploadOk(200)).toBe(true);
    expect(isUploadOk(201)).toBe(true);
    expect(isUploadOk(299)).toBe(true);
  });
  it('treats non-2xx as failure', () => {
    expect(isUploadOk(199)).toBe(false);
    expect(isUploadOk(300)).toBe(false);
    expect(isUploadOk(404)).toBe(false);
    expect(isUploadOk(500)).toBe(false);
  });
});

describe('validateFileSize', () => {
  it('passes when no bounds are set', () => {
    expect(validateFileSize(0)).toBeNull();
    expect(validateFileSize(10 * 1024 * 1024, {})).toBeNull();
  });

  it('reports "max" when over maxSize (KB)', () => {
    // maxSize 100KB → boundary is 102400 bytes.
    expect(validateFileSize(102_401, { maxSize: 100 })).toBe('max');
    expect(validateFileSize(102_400, { maxSize: 100 })).toBeNull();
    expect(validateFileSize(50_000, { maxSize: 100 })).toBeNull();
  });

  it('reports "min" when under minSize (KB)', () => {
    // minSize 10KB → boundary is 10240 bytes.
    expect(validateFileSize(10_239, { minSize: 10 })).toBe('min');
    expect(validateFileSize(10_240, { minSize: 10 })).toBeNull();
    expect(validateFileSize(50_000, { minSize: 10 })).toBeNull();
  });

  it('passes within [minSize, maxSize]', () => {
    expect(validateFileSize(50_000, { minSize: 10, maxSize: 100 })).toBeNull();
  });

  it('checks max before min', () => {
    // size below min AND above max is impossible for min<=max; verify max wins
    // when both technically match a degenerate inverted range.
    expect(validateFileSize(200_000, { minSize: 300, maxSize: 100 })).toBe('max');
  });

  it('treats 0-byte files as under any minSize', () => {
    expect(validateFileSize(0, { minSize: 1 })).toBe('min');
  });
});

describe('computeUploadPercent', () => {
  // Semi PROGRESS_COEFFICIENT=0.95: XHR progress never visually reaches 100%
  // until the explicit `success` status sets it (matches foundation.handleProgress).
  it('computes percent scaled by 0.95, rounded to nearest integer', () => {
    expect(computeUploadPercent(50, 200)).toBe(24); // 25 * 0.95 = 23.75 → 24
    expect(computeUploadPercent(200, 200)).toBe(95); // 100 * 0.95 = 95
    expect(computeUploadPercent(0, 200)).toBe(0);
  });
  it('clamps into [0,100]', () => {
    expect(computeUploadPercent(300, 200)).toBe(100);
    expect(computeUploadPercent(-10, 200)).toBe(0);
  });
  it('returns 0 when total is 0 or negative (avoid divide-by-zero)', () => {
    expect(computeUploadPercent(10, 0)).toBe(0);
    expect(computeUploadPercent(10, -5)).toBe(0);
  });
});

describe('isImageFile', () => {
  it('matches common image MIME types by suffix (Semi isImage regex)', () => {
    expect(isImageFile({ type: 'image/png' })).toBe(true);
    expect(isImageFile({ type: 'image/jpeg' })).toBe(true);
    expect(isImageFile({ type: 'image/webp' })).toBe(true);
  });
  it('does NOT match image/svg+xml (Semi regex quirk: ends in "xml" not "svg")', () => {
    // 逐行对齐 Semi isImage：/(webp|svg|png|gif|jpg|jpeg|bmp|dpg)$/i — svg+xml 结尾是
    // "xml" 不是 "svg"，Semi 本身也不识别此 MIME 为图片。忠实移植，非本库 bug。
    expect(isImageFile({ type: 'image/svg+xml' })).toBe(false);
  });
  it('rejects non-image MIME types', () => {
    expect(isImageFile({ type: 'application/pdf' })).toBe(false);
    expect(isImageFile({ type: 'text/plain' })).toBe(false);
  });
});

describe('checkFileFormat', () => {
  it('matches by file extension', () => {
    expect(checkFileFormat('.pdf', { name: 'report.pdf', type: 'application/pdf' })).toBe(true);
    expect(checkFileFormat('.pdf', { name: 'report.doc', type: 'application/msword' })).toBe(false);
  });
  it('matches by MIME wildcard', () => {
    expect(checkFileFormat('image/*', { name: 'a.png', type: 'image/png' })).toBe(true);
    expect(checkFileFormat('image/*', { name: 'a.pdf', type: 'application/pdf' })).toBe(false);
  });
  it('matches by exact MIME type', () => {
    expect(checkFileFormat('application/pdf', { name: 'a.pdf', type: 'application/pdf' })).toBe(true);
  });
  it('matches any of a comma-separated list', () => {
    expect(checkFileFormat('.pdf,.doc,image/*', { name: 'a.png', type: 'image/png' })).toBe(true);
  });
});
