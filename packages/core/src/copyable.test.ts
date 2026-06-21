// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createCopyable, writeClipboard } from './copyable.js';

describe('writeClipboard', () => {
  const origNav = globalThis.navigator;
  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(globalThis, 'navigator', { value: origNav, configurable: true });
  });

  it('uses navigator.clipboard.writeText when available', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(globalThis, 'navigator', {
      value: { clipboard: { writeText } },
      configurable: true,
    });
    const ok = await writeClipboard('hello');
    expect(ok).toBe(true);
    expect(writeText).toHaveBeenCalledWith('hello');
  });

  it('falls back to execCommand when clipboard API throws', async () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: { clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) } },
      configurable: true,
    });
    const exec = vi.fn().mockReturnValue(true);
    // jsdom provides document; stub execCommand
    (document as unknown as { execCommand: unknown }).execCommand = exec;
    const ok = await writeClipboard('fallback');
    expect(ok).toBe(true);
    expect(exec).toHaveBeenCalledWith('copy');
  });

  it('returns false when both strategies fail', async () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: { clipboard: { writeText: vi.fn().mockRejectedValue(new Error('x')) } },
      configurable: true,
    });
    (document as unknown as { execCommand: unknown }).execCommand = vi.fn().mockReturnValue(false);
    const ok = await writeClipboard('nope');
    expect(ok).toBe(false);
  });
});

describe('createCopyable', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Object.defineProperty(globalThis, 'navigator', {
      value: { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } },
      configurable: true,
    });
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('flips copied true on success and fires onCopy + onChange', async () => {
    const onCopy = vi.fn();
    const onChange = vi.fn();
    const c = createCopyable({ content: 'abc', onCopy, onChange, resetDelay: 1000 });
    const ok = await c.copy();
    expect(ok).toBe(true);
    expect(c.copied).toBe(true);
    expect(onCopy).toHaveBeenCalledWith('abc');
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('auto-resets copied after resetDelay', async () => {
    const c = createCopyable({ content: 'abc', resetDelay: 1000 });
    await c.copy();
    expect(c.copied).toBe(true);
    vi.advanceTimersByTime(1000);
    expect(c.copied).toBe(false);
  });

  it('copy(content) overrides the default content', async () => {
    const onCopy = vi.fn();
    const c = createCopyable({ content: 'default', onCopy });
    await c.copy('explicit');
    expect(onCopy).toHaveBeenCalledWith('explicit');
  });

  it('reset clears timer and flag', async () => {
    const c = createCopyable({ content: 'abc', resetDelay: 5000 });
    await c.copy();
    c.reset();
    expect(c.copied).toBe(false);
  });

  it('fires onError and stays not-copied on failure', async () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: { clipboard: { writeText: vi.fn().mockRejectedValue(new Error('x')) } },
      configurable: true,
    });
    (document as unknown as { execCommand: unknown }).execCommand = vi.fn().mockReturnValue(false);
    const onError = vi.fn();
    const c = createCopyable({ content: 'abc', onError });
    const ok = await c.copy();
    expect(ok).toBe(false);
    expect(c.copied).toBe(false);
    expect(onError).toHaveBeenCalled();
  });
});
