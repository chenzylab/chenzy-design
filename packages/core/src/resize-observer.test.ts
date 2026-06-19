import { describe, expect, it, vi, afterEach } from 'vitest';
import {
  normalizeEntry,
  isResizeObserverSupported,
  createResizeObserver,
} from './resize-observer.js';

function makeEntry(over: Partial<ResizeObserverEntry>): ResizeObserverEntry {
  return {
    target: {} as Element,
    contentRect: { width: 0, height: 0 } as DOMRectReadOnly,
    borderBoxSize: [],
    contentBoxSize: [],
    devicePixelContentBoxSize: [],
    ...over,
  } as ResizeObserverEntry;
}

describe('normalizeEntry', () => {
  it('reads contentBoxSize for content-box', () => {
    const e = makeEntry({
      contentBoxSize: [{ inlineSize: 320, blockSize: 200 }] as ReadonlyArray<ResizeObserverSize> as never,
    });
    const r = normalizeEntry(e, 'content-box');
    expect(r).toMatchObject({ width: 320, height: 200, box: 'content-box' });
  });

  it('reads borderBoxSize for border-box', () => {
    const e = makeEntry({
      borderBoxSize: [{ inlineSize: 340, blockSize: 220 }] as ReadonlyArray<ResizeObserverSize> as never,
    });
    const r = normalizeEntry(e, 'border-box');
    expect(r).toMatchObject({ width: 340, height: 220, box: 'border-box' });
  });

  it('falls back to contentRect when box sizes are empty', () => {
    const e = makeEntry({ contentRect: { width: 100, height: 50 } as DOMRectReadOnly });
    const r = normalizeEntry(e, 'content-box');
    expect(r).toMatchObject({ width: 100, height: 50 });
  });
});

describe('isResizeObserverSupported', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('false when ResizeObserver absent', () => {
    vi.stubGlobal('ResizeObserver', undefined);
    expect(isResizeObserverSupported()).toBe(false);
  });

  it('true when ResizeObserver present', () => {
    vi.stubGlobal('ResizeObserver', class {});
    expect(isResizeObserverSupported()).toBe(true);
  });
});

describe('createResizeObserver (unsupported degrade)', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('returns a no-op api with supported=false when native is absent', () => {
    vi.stubGlobal('ResizeObserver', undefined);
    const api = createResizeObserver({ onResize: () => {} });
    expect(api.supported).toBe(false);
    // no-ops do not throw
    expect(() => {
      api.observe({} as Element);
      api.unobserve({} as Element);
      api.disconnect();
    }).not.toThrow();
  });

  it('observe/disconnect route through the native observer when supported', () => {
    const observe = vi.fn();
    const disconnect = vi.fn();
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe = observe;
        unobserve = vi.fn();
        disconnect = disconnect;
      },
    );
    const api = createResizeObserver({ onResize: () => {} });
    expect(api.supported).toBe(true);
    const el = {} as Element;
    api.observe(el);
    expect(observe).toHaveBeenCalledWith(el, { box: 'content-box' });
    api.disconnect();
    expect(disconnect).toHaveBeenCalled();
  });
});
