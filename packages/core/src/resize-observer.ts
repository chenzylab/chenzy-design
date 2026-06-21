/**
 * createResizeObserver — framework-agnostic wrapper over native ResizeObserver.
 * Normalizes entries to a stable shape and degrades silently when unsupported
 * (SSR / old browsers). The svelte layer owns the element refs and lifecycle.
 * See specs/components/other/ResizeObserver.spec.md §3.
 *
 * 进阶子集：
 *   - throttle / debounce 节流去抖（命令式定时器 + cleanup，红线 #3）
 *   - 多目标（observe/unobserve 多个元素，回调按 target 路由）
 *   - 单例 observer 池 getGlobalResizeObserver()（多元素复用 1 个原生 observer）
 * 仍延后：device-pixel-content-box、window.resize 降级。
 */

export type ResizeBox = 'content-box' | 'border-box';

/** 节流/去抖调度策略。'none' = 原生即时（默认，向后兼容）。 */
export type ResizeSchedule =
  | { strategy: 'none' }
  | { strategy: 'throttle'; wait: number }
  | { strategy: 'debounce'; wait: number };

/** normalized size payload — consumers never call getBoundingClientRect */
export interface CDResizeEntry {
  target: Element;
  width: number;
  height: number;
  box: ResizeBox;
}

export interface ResizeObserverOptions {
  box?: ResizeBox;
  onResize: (entry: CDResizeEntry) => void;
  /**
   * 节流间隔(ms)，leading+trailing，0 即原生即时回调。与 debounce 互斥
   * （同时 >0 时 debounce 优先）。
   */
  throttle?: number;
  /** 防抖等待(ms)，trailing-only，0 关闭。与 throttle 互斥（优先于 throttle）。 */
  debounce?: number;
}

export interface ResizeObserverApi {
  readonly supported: boolean;
  observe(el: Element): void;
  unobserve(el: Element): void;
  disconnect(): void;
}

/** true when the native ResizeObserver is available (client only). */
export function isResizeObserverSupported(): boolean {
  return typeof globalThis !== 'undefined' && typeof globalThis.ResizeObserver === 'function';
}

/**
 * Normalize a native ResizeObserverEntry into CDResizeEntry. Prefers
 * borderBoxSize / contentBoxSize (avoids forced reflow) and falls back to
 * contentRect for older implementations.
 */
export function normalizeEntry(entry: ResizeObserverEntry, box: ResizeBox): CDResizeEntry {
  let width: number;
  let height: number;

  const boxSize =
    box === 'border-box'
      ? (entry.borderBoxSize as ReadonlyArray<ResizeObserverSize> | undefined)
      : (entry.contentBoxSize as ReadonlyArray<ResizeObserverSize> | undefined);

  if (boxSize && boxSize.length > 0) {
    width = boxSize[0]!.inlineSize;
    height = boxSize[0]!.blockSize;
  } else {
    // fallback: contentRect (content-box only; older Safari)
    width = entry.contentRect.width;
    height = entry.contentRect.height;
  }

  return { target: entry.target, width, height, box };
}

/**
 * 归一化节流/去抖配置为单一 schedule。纯函数、不依赖时钟（红线 #2 友好）。
 * debounce 优先于 throttle（spec：二者互斥，同时 >0 时 debounce 优先）。
 */
export function resolveSchedule(opts: {
  throttle?: number;
  debounce?: number;
}): ResizeSchedule {
  const debounce = opts.debounce ?? 0;
  const throttle = opts.throttle ?? 0;
  if (debounce > 0) return { strategy: 'debounce', wait: debounce };
  if (throttle > 0) return { strategy: 'throttle', wait: throttle };
  return { strategy: 'none' };
}

/**
 * createScheduler — 命令式定时器调度器。包裹一个回调，按 schedule 节流/去抖。
 * - none: 即时透传（零开销，向后兼容）。
 * - throttle: leading+trailing，窗口内丢弃中间帧，trailing 补发最后一帧。
 * - debounce: trailing-only，静默 wait 后才发最后一帧。
 * 返回 { run, flush, cancel }；cancel 必须在 cleanup 调用以清定时器（红线 #3）。
 *
 * 注意：run 接受一个无参 commit 闭包（最新值在调用方闭包里持有），
 * 调度器只负责"何时"调用，不持有业务数据。
 */
export function createScheduler(schedule: ResizeSchedule): {
  run: (commit: () => void) => void;
  flush: () => void;
  cancel: () => void;
} {
  if (schedule.strategy === 'none') {
    return {
      run: (commit) => commit(),
      flush: () => {},
      cancel: () => {},
    };
  }

  const wait = schedule.wait;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastInvoke = 0;
  let pending: (() => void) | null = null;

  const clear = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };

  const fire = () => {
    timer = null;
    const commit = pending;
    pending = null;
    lastInvoke = Date.now();
    commit?.();
  };

  if (schedule.strategy === 'debounce') {
    return {
      run(commit) {
        pending = commit;
        clear();
        timer = setTimeout(fire, wait);
      },
      flush() {
        if (pending) {
          clear();
          fire();
        }
      },
      cancel() {
        clear();
        pending = null;
      },
    };
  }

  // throttle: leading + trailing
  return {
    run(commit) {
      pending = commit;
      const now = Date.now();
      const remaining = wait - (now - lastInvoke);
      if (remaining <= 0) {
        clear();
        fire();
      } else if (timer === null) {
        timer = setTimeout(fire, remaining);
      }
    },
    flush() {
      if (pending) {
        clear();
        fire();
      }
    },
    cancel() {
      clear();
      pending = null;
    },
  };
}

export function createResizeObserver(options: ResizeObserverOptions): ResizeObserverApi {
  const { box = 'content-box', onResize } = options;
  const supported = isResizeObserverSupported();

  if (!supported) {
    return {
      supported: false,
      observe() {},
      unobserve() {},
      disconnect() {},
    };
  }

  const schedule = resolveSchedule(options);
  const scheduler = createScheduler(schedule);

  const ro = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const normalized = normalizeEntry(entry, box);
      // 调度器只决定"何时"，commit 闭包持有这一帧最新值。
      scheduler.run(() => onResize(normalized));
    }
  });

  return {
    supported: true,
    observe(el) {
      ro.observe(el, { box });
    },
    unobserve(el) {
      ro.unobserve(el);
    },
    disconnect() {
      scheduler.cancel();
      ro.disconnect();
    },
  };
}

/* -------------------------------------------------------------------------- *
 * 单例 observer 池：进程内复用一个原生 ResizeObserver 观测多元素，
 * 回调按 target 路由到各自订阅者。大列表/表格场景下避免 N 个 observer 开销
 * （spec §性能：100 目标仅 1 个原生 observer）。
 *
 * 每个 box 维度一个池实例（原生 observe 的 box 选项在订阅时确定，
 * 不同 box 需分桶）。节流/去抖由订阅方各自的 scheduler 负责，池只做分发。
 * -------------------------------------------------------------------------- */

type PoolListener = (entry: CDResizeEntry) => void;

interface ResizeObserverPool {
  readonly supported: boolean;
  subscribe(el: Element, listener: PoolListener): () => void;
}

const POOL_CACHE = new Map<ResizeBox, ResizeObserverPool>();

function createPool(box: ResizeBox): ResizeObserverPool {
  if (!isResizeObserverSupported()) {
    return { supported: false, subscribe: () => () => {} };
  }

  // 一个元素可被多处订阅（如组件 + action），listener 用 Set。
  const listeners = new Map<Element, Set<PoolListener>>();

  const ro = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const set = listeners.get(entry.target);
      if (!set || set.size === 0) continue;
      const normalized = normalizeEntry(entry, box);
      for (const fn of set) fn(normalized);
    }
  });

  return {
    supported: true,
    subscribe(el, listener) {
      let set = listeners.get(el);
      if (!set) {
        set = new Set();
        listeners.set(el, set);
        ro.observe(el, { box });
      }
      set.add(listener);

      return () => {
        const s = listeners.get(el);
        if (!s) return;
        s.delete(listener);
        if (s.size === 0) {
          listeners.delete(el);
          ro.unobserve(el);
        }
      };
    },
  };
}

/**
 * getGlobalResizeObserver — 取得指定 box 的进程内单例池。
 * 返回 { supported, subscribe }；subscribe 返回取消订阅函数（必须在 cleanup 调用）。
 * 节流/去抖请在订阅方包裹 createScheduler，池本身只做即时路由分发。
 */
export function getGlobalResizeObserver(box: ResizeBox = 'content-box'): {
  readonly supported: boolean;
  subscribe(el: Element, listener: PoolListener): () => void;
} {
  let pool = POOL_CACHE.get(box);
  if (!pool) {
    pool = createPool(box);
    POOL_CACHE.set(box, pool);
  }
  return pool;
}
