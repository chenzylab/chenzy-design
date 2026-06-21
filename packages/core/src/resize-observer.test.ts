import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest';
import {
  normalizeEntry,
  isResizeObserverSupported,
  createResizeObserver,
  resolveSchedule,
  createScheduler,
  advanceResizePhase,
  endResizePhase,
  getGlobalResizeObserver,
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

describe('resolveSchedule', () => {
  it('defaults to none when neither set', () => {
    expect(resolveSchedule({})).toEqual({ strategy: 'none' });
    expect(resolveSchedule({ throttle: 0, debounce: 0 })).toEqual({ strategy: 'none' });
  });

  it('maps throttle when only throttle > 0', () => {
    expect(resolveSchedule({ throttle: 16 })).toEqual({ strategy: 'throttle', wait: 16 });
  });

  it('maps debounce when only debounce > 0', () => {
    expect(resolveSchedule({ debounce: 100 })).toEqual({ strategy: 'debounce', wait: 100 });
  });

  it('debounce wins when both set (mutually exclusive)', () => {
    expect(resolveSchedule({ throttle: 16, debounce: 100 })).toEqual({
      strategy: 'debounce',
      wait: 100,
    });
  });
});

describe('createScheduler', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('none: invokes synchronously every time', () => {
    const fn = vi.fn();
    const s = createScheduler({ strategy: 'none' });
    s.run(fn);
    s.run(fn);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('throttle: leading fire then trailing, drops middle frames', () => {
    const fn = vi.fn();
    const s = createScheduler({ strategy: 'throttle', wait: 100 });
    s.run(() => fn(1)); // leading — fires now
    expect(fn).toHaveBeenCalledTimes(1);
    s.run(() => fn(2)); // within window — scheduled trailing
    s.run(() => fn(3)); // within window — replaces pending
    expect(fn).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(100);
    // trailing fires with the latest (3)
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith(3);
  });

  it('throttle: respects wait between leading fires', () => {
    const fn = vi.fn();
    const s = createScheduler({ strategy: 'throttle', wait: 100 });
    s.run(fn);
    expect(fn).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(100); // trailing window passes (no extra pending after fire? pending was same)
    // advance real-ish clock so next run is a fresh leading
    vi.advanceTimersByTime(200);
    s.run(fn);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('debounce: only trailing fires after silence', () => {
    const fn = vi.fn();
    const s = createScheduler({ strategy: 'debounce', wait: 100 });
    s.run(() => fn(1));
    s.run(() => fn(2));
    s.run(() => fn(3));
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(99);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenLastCalledWith(3);
  });

  it('cancel clears the pending timer (no fire)', () => {
    const fn = vi.fn();
    const s = createScheduler({ strategy: 'debounce', wait: 100 });
    s.run(fn);
    s.cancel();
    vi.advanceTimersByTime(200);
    expect(fn).not.toHaveBeenCalled();
  });

  it('flush fires the pending commit immediately', () => {
    const fn = vi.fn();
    const s = createScheduler({ strategy: 'debounce', wait: 100 });
    s.run(fn);
    s.flush();
    expect(fn).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledTimes(1); // not fired twice
  });
});

describe('createResizeObserver (scheduling)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('debounces native callbacks', () => {
    vi.useFakeTimers();
    let trigger!: (entries: ResizeObserverEntry[]) => void;
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(cb: (e: ResizeObserverEntry[]) => void) {
          trigger = cb;
        }
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    const onResize = vi.fn();
    createResizeObserver({ onResize, debounce: 100 });
    const e = makeEntry({ contentRect: { width: 10, height: 10 } as DOMRectReadOnly });
    trigger([e]);
    trigger([e]);
    expect(onResize).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    expect(onResize).toHaveBeenCalledTimes(1);
  });
});

describe('advanceResizePhase / endResizePhase (start/end 纯状态机)', () => {
  it('first resize while idle → emitStart and enters resizing', () => {
    expect(advanceResizePhase(false)).toEqual({ resizing: true, emitStart: true });
  });

  it('subsequent resize while resizing → no start, stays resizing', () => {
    expect(advanceResizePhase(true)).toEqual({ resizing: true, emitStart: false });
  });

  it('silence while resizing → emitEnd and leaves resizing', () => {
    expect(endResizePhase(true)).toEqual({ resizing: false, emitEnd: true });
  });

  it('silence while idle → no end (idempotent)', () => {
    expect(endResizePhase(false)).toEqual({ resizing: false, emitEnd: false });
  });

  it('full cycle: start once, end once across a burst', () => {
    let state = false;
    let starts = 0;
    let ends = 0;
    // burst of three resizes
    for (let i = 0; i < 3; i++) {
      const a = advanceResizePhase(state);
      state = a.resizing;
      if (a.emitStart) starts += 1;
    }
    const e = endResizePhase(state);
    state = e.resizing;
    if (e.emitEnd) ends += 1;
    expect(starts).toBe(1);
    expect(ends).toBe(1);
    expect(state).toBe(false);
  });
});

describe('createResizeObserver (start/end events)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('fires onResizeStart once on first frame, onResizeEnd after silence', () => {
    vi.useFakeTimers();
    let trigger!: (entries: ResizeObserverEntry[]) => void;
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(cb: (e: ResizeObserverEntry[]) => void) {
          trigger = cb;
        }
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    const onResizeStart = vi.fn();
    const onResizeEnd = vi.fn();
    createResizeObserver({
      onResize: () => {},
      onResizeStart,
      onResizeEnd,
      resizeEndDelay: 100,
    });
    const e = makeEntry({ contentRect: { width: 10, height: 10 } as DOMRectReadOnly });
    trigger([e]);
    trigger([e]);
    trigger([e]);
    expect(onResizeStart).toHaveBeenCalledTimes(1);
    expect(onResizeEnd).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    expect(onResizeEnd).toHaveBeenCalledTimes(1);
    // a fresh burst → start again
    trigger([e]);
    expect(onResizeStart).toHaveBeenCalledTimes(2);
  });

  it('does not arm timers when no start/end handlers given (backward compat)', () => {
    vi.useFakeTimers();
    let trigger!: (entries: ResizeObserverEntry[]) => void;
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(cb: (e: ResizeObserverEntry[]) => void) {
          trigger = cb;
        }
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    const onResize = vi.fn();
    createResizeObserver({ onResize });
    const e = makeEntry({ contentRect: { width: 1, height: 1 } as DOMRectReadOnly });
    trigger([e]);
    expect(onResize).toHaveBeenCalledTimes(1);
    // no pending timers expected
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('createResizeObserver (fallbackToWindow)', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('uses window.resize when native is absent', () => {
    vi.stubGlobal('ResizeObserver', undefined);
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();
    vi.stubGlobal('addEventListener', addEventListener);
    vi.stubGlobal('removeEventListener', removeEventListener);

    const onResize = vi.fn();
    const api = createResizeObserver({ onResize, fallbackToWindow: true });
    expect(api.supported).toBe(false);

    const el = {
      getBoundingClientRect: () => ({ width: 42, height: 24 }),
    } as unknown as Element;
    api.observe(el);
    // 红线 #2：observe() 不同步回调（与原生 RO 一致，避免在挂载 effect 内同步写 state
    // 形成 effect_update_depth_exceeded）；首测延后到下一宏任务。
    expect(onResize).not.toHaveBeenCalled();
    expect(addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));

    // 推进宏任务 → 初始测量到达
    vi.runAllTimers();
    expect(onResize).toHaveBeenCalledTimes(1);
    expect(onResize).toHaveBeenLastCalledWith(
      expect.objectContaining({ width: 42, height: 24 }),
    );

    // simulate a window resize → re-measure
    const handler = addEventListener.mock.calls[0]![1] as () => void;
    handler();
    expect(onResize).toHaveBeenCalledTimes(2);

    api.disconnect();
    expect(removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
  });

  it('explicit fallbackToWindow=true wins even if native exists', () => {
    const observe = vi.fn();
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe = observe;
        unobserve = vi.fn();
        disconnect = vi.fn();
      },
    );
    vi.stubGlobal('addEventListener', vi.fn());
    vi.stubGlobal('removeEventListener', vi.fn());
    const api = createResizeObserver({ onResize: () => {}, fallbackToWindow: true });
    const el = {
      getBoundingClientRect: () => ({ width: 1, height: 1 }),
    } as unknown as Element;
    api.observe(el);
    // native observer not used in fallback mode
    expect(observe).not.toHaveBeenCalled();
  });

  it('stays no-op when unsupported and fallbackToWindow is off', () => {
    vi.stubGlobal('ResizeObserver', undefined);
    vi.stubGlobal('addEventListener', undefined);
    const onResize = vi.fn();
    const api = createResizeObserver({ onResize });
    expect(api.supported).toBe(false);
    expect(() => api.observe({} as Element)).not.toThrow();
    expect(onResize).not.toHaveBeenCalled();
  });
});

describe('getGlobalResizeObserver (singleton pool)', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('degrades to no-op when unsupported', () => {
    vi.stubGlobal('ResizeObserver', undefined);
    const pool = getGlobalResizeObserver('content-box');
    expect(pool.supported).toBe(false);
    const off = pool.subscribe({} as Element, () => {});
    expect(() => off()).not.toThrow();
  });

  it('reuses one native observer for N targets and routes by target', () => {
    const observe = vi.fn();
    const unobserve = vi.fn();
    let instances = 0;
    let trigger!: (entries: ResizeObserverEntry[]) => void;
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(cb: (e: ResizeObserverEntry[]) => void) {
          instances += 1;
          trigger = cb;
        }
        observe = observe;
        unobserve = unobserve;
        disconnect = vi.fn();
      },
    );
    // fresh box bucket to avoid cross-test cache (border-box unused elsewhere)
    const pool = getGlobalResizeObserver('border-box');
    const a = { id: 'a' } as unknown as Element;
    const b = { id: 'b' } as unknown as Element;
    const onA = vi.fn();
    const onB = vi.fn();
    const offA = pool.subscribe(a, onA);
    pool.subscribe(b, onB);
    expect(observe).toHaveBeenCalledTimes(2);
    expect(instances).toBe(1);

    trigger([
      makeEntry({ target: a, borderBoxSize: [{ inlineSize: 1, blockSize: 2 }] as never }),
    ]);
    expect(onA).toHaveBeenCalledTimes(1);
    expect(onB).not.toHaveBeenCalled();

    offA();
    expect(unobserve).toHaveBeenCalledWith(a);
  });
});
