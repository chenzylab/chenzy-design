import { describe, expect, it } from 'vitest';
import {
  computeUploadPercent,
  isUploadOk,
  createUploadQueue,
  resolveBeforeUpload,
  validateFileSize,
} from './upload.js';

/** A deferred whose promise resolves only when `resolve()` is called. */
function defer() {
  let resolve!: () => void;
  const promise = new Promise<void>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

describe('computeUploadPercent', () => {
  it('computes integer percent from loaded/total', () => {
    expect(computeUploadPercent(50, 200)).toBe(25);
    expect(computeUploadPercent(200, 200)).toBe(100);
    expect(computeUploadPercent(0, 200)).toBe(0);
  });
  it('rounds to the nearest integer', () => {
    expect(computeUploadPercent(1, 3)).toBe(33);
    expect(computeUploadPercent(2, 3)).toBe(67);
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

describe('createUploadQueue', () => {
  it('never runs more than `limit` tasks at once', async () => {
    const q = createUploadQueue(2);
    const defers = [defer(), defer(), defer(), defer()];
    const started: number[] = [];

    defers.forEach((d, i) => {
      q.add(() => {
        started.push(i);
        return d.promise;
      });
    });

    // Synchronously, only the first 2 may start; the rest queue.
    await Promise.resolve();
    expect(started).toEqual([0, 1]);
    expect(q.active).toBe(2);
    expect(q.pending).toBe(2);
  });

  it('refills a freed slot when a task completes (FIFO order)', async () => {
    const q = createUploadQueue(2);
    const defers = [defer(), defer(), defer(), defer()];
    const started: number[] = [];

    defers.forEach((d, i) => {
      q.add(() => {
        started.push(i);
        return d.promise;
      });
    });

    await Promise.resolve();
    expect(started).toEqual([0, 1]);

    // Finish task 0 → task 2 should start.
    defers[0]!.resolve();
    await new Promise((r) => setTimeout(r, 0));
    expect(started).toEqual([0, 1, 2]);

    // Finish task 1 → task 3 should start.
    defers[1]!.resolve();
    await new Promise((r) => setTimeout(r, 0));
    expect(started).toEqual([0, 1, 2, 3]);
    expect(q.pending).toBe(0);
  });

  it('runs everything immediately when limit <= 0 (unlimited)', async () => {
    const q = createUploadQueue(0);
    const defers = [defer(), defer(), defer()];
    const started: number[] = [];
    defers.forEach((d, i) => {
      q.add(() => {
        started.push(i);
        return d.promise;
      });
    });
    await Promise.resolve();
    expect(started).toEqual([0, 1, 2]);
    expect(q.active).toBe(3);
    expect(q.pending).toBe(0);
  });

  it('keeps draining even if a task rejects', async () => {
    const q = createUploadQueue(1);
    const started: number[] = [];
    q.add(() => {
      started.push(0);
      return Promise.reject(new Error('boom'));
    });
    q.add(() => {
      started.push(1);
    });

    // Let the rejected task settle and the next one run.
    await new Promise((r) => setTimeout(r, 0));
    expect(started).toEqual([0, 1]);
    expect(q.active).toBe(0);
    expect(q.pending).toBe(0);
  });

  it('handles synchronous tasks', async () => {
    const q = createUploadQueue(2);
    const ran: number[] = [];
    for (let i = 0; i < 5; i++) q.add(() => void ran.push(i));
    await new Promise((r) => setTimeout(r, 0));
    expect(ran).toEqual([0, 1, 2, 3, 4]);
    expect(q.active).toBe(0);
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

describe('resolveBeforeUpload', () => {
  const original = new File(['a'], 'a.txt');

  it('uploads the original on true / undefined', () => {
    expect(resolveBeforeUpload(original, true)).toEqual({ upload: true, file: original });
    expect(resolveBeforeUpload(original, undefined)).toEqual({ upload: true, file: original });
  });

  it('skips the file on false', () => {
    expect(resolveBeforeUpload(original, false)).toEqual({ upload: false });
  });

  it('replaces with a returned File', () => {
    const replacement = new File(['bb'], 'b.txt');
    expect(resolveBeforeUpload(original, replacement)).toEqual({
      upload: true,
      file: replacement,
    });
  });
});
