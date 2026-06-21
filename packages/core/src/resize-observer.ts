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
 *   - window.resize 降级（fallbackToWindow：原生不可用或显式开启时近似监听）
 *   - onResizeStart / onResizeEnd：连续变化首帧 / 静默结束（纯状态机 + 命令式静默计时器）
 */

export type ResizeBox =
  | 'content-box'
  | 'border-box'
  | 'device-pixel-content-box';

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
  /**
   * 一段连续尺寸变化的首帧触发（不在 resizing 态时收到首个 resize）。
   * 用于"调整中"态（如显示尺寸 badge）。
   */
  onResizeStart?: ((entry: CDResizeEntry) => void) | undefined;
  /**
   * 连续变化结束后（静默 resizeEndDelay 无新 resize）触发，payload 为最后一帧。
   * 用于"调整完成"提交。
   */
  onResizeEnd?: ((entry: CDResizeEntry) => void) | undefined;
  /**
   * onResizeEnd 静默判定窗口(ms)，0 表示沿用 schedule wait（无则默认 RESIZE_END_DELAY）。
   * 仅当传了 onResizeStart / onResizeEnd 时生效。
   */
  resizeEndDelay?: number;
  /**
   * 原生 ResizeObserver 不可用（SSR/老环境）或显式开启时，降级监听 window.resize，
   * 在每次 window resize 用 getBoundingClientRect 重新测量已注册目标并上报（精度较低）。
   * 默认 false：不支持环境静默降级（不监听、不抛错）。
   */
  fallbackToWindow?: boolean;
}

/** onResizeEnd 默认静默窗口(ms)，约一次拖拽停顿。 */
const RESIZE_END_DELAY = 150;

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

  let boxSize: ReadonlyArray<ResizeObserverSize> | undefined;
  if (box === 'border-box') {
    boxSize = entry.borderBoxSize as ReadonlyArray<ResizeObserverSize> | undefined;
  } else if (box === 'device-pixel-content-box') {
    // 物理像素内容盒（含 DPR 缩放），仅新式浏览器支持；
    // 不可用时回退 contentBoxSize（CSS 像素），再回退 contentRect。
    boxSize =
      (entry.devicePixelContentBoxSize as
        | ReadonlyArray<ResizeObserverSize>
        | undefined) ??
      (entry.contentBoxSize as ReadonlyArray<ResizeObserverSize> | undefined);
  } else {
    boxSize = entry.contentBoxSize as ReadonlyArray<ResizeObserverSize> | undefined;
  }

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
 * advanceResizePhase — start/end 状态机的纯函数核心（红线 #2，不依赖时钟/计时器）。
 * 给定"当前是否处于 resizing 态"与一个新到达的 resize 事件，返回新状态及应派发的
 * 边界事件标记。计时器（决定何时进入 'end'）由命令式调用方持有，本函数只描述跃迁：
 *   - 不在 resizing 态收到 resize → start，进入 resizing 态。
 *   - 已在 resizing 态收到 resize → 无边界事件（仅续期，态不变）。
 * 'end' 的跃迁见 endResizePhase（由静默计时器触发）。
 */
export function advanceResizePhase(resizing: boolean): {
  resizing: boolean;
  emitStart: boolean;
} {
  if (!resizing) return { resizing: true, emitStart: true };
  return { resizing: true, emitStart: false };
}

/**
 * endResizePhase — 静默计时器到点时的纯跃迁：若处于 resizing 态则结束并标记派发 end。
 * 非 resizing 态（无在途变化）则不派发，幂等。
 */
export function endResizePhase(resizing: boolean): {
  resizing: boolean;
  emitEnd: boolean;
} {
  if (resizing) return { resizing: false, emitEnd: true };
  return { resizing: false, emitEnd: false };
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
  const { box = 'content-box', onResize, onResizeStart, onResizeEnd } = options;
  const nativeSupported = isResizeObserverSupported();
  const hasWindow =
    typeof globalThis !== 'undefined' &&
    typeof (globalThis as { addEventListener?: unknown }).addEventListener ===
      'function';
  // 走 window.resize 降级的条件：环境有 window，且（显式开启 fallbackToWindow 或原生不可用）。
  const useWindowFallback =
    hasWindow && (options.fallbackToWindow === true || !nativeSupported);

  // SSR / 既无原生 RO 又无 window（或未开启 fallback）：静默 no-op。
  if (!nativeSupported && !useWindowFallback) {
    return {
      supported: false,
      observe() {},
      unobserve() {},
      disconnect() {},
    };
  }

  const schedule = resolveSchedule(options);
  const scheduler = createScheduler(schedule);

  /* ---- start/end 状态机：纯跃迁 + 命令式静默计时器（红线 #2/#3） ---- */
  const wantBoundary = !!onResizeStart || !!onResizeEnd;
  const endDelay =
    (options.resizeEndDelay && options.resizeEndDelay > 0
      ? options.resizeEndDelay
      : schedule.strategy !== 'none'
        ? schedule.wait
        : 0) || RESIZE_END_DELAY;
  let resizing = false;
  let lastEntry: CDResizeEntry | null = null;
  let endTimer: ReturnType<typeof setTimeout> | null = null;

  const clearEndTimer = () => {
    if (endTimer !== null) {
      clearTimeout(endTimer);
      endTimer = null;
    }
  };

  const fireEnd = () => {
    endTimer = null;
    const next = endResizePhase(resizing);
    resizing = next.resizing;
    if (next.emitEnd && lastEntry) onResizeEnd?.(lastEntry);
  };

  // 经调度后真正向外提交一帧：onResize + 维护 start/end 边界。
  const commit = (entry: CDResizeEntry) => {
    onResize(entry);
    if (!wantBoundary) return;
    lastEntry = entry;
    const next = advanceResizePhase(resizing);
    resizing = next.resizing;
    if (next.emitStart) onResizeStart?.(entry);
    clearEndTimer();
    endTimer = setTimeout(fireEnd, endDelay);
  };

  const dispatch = (entry: CDResizeEntry) => {
    // 调度器只决定"何时"，commit 闭包持有这一帧最新值。
    scheduler.run(() => commit(entry));
  };

  /* ---- 降级路径：监听 window.resize，对已注册目标 getBoundingClientRect 重测 ---- */
  if (useWindowFallback) {
    const win = globalThis as {
      addEventListener(type: 'resize', cb: () => void): void;
      removeEventListener(type: 'resize', cb: () => void): void;
    };
    const targets = new Set<Element>();

    const measureAll = () => {
      for (const el of targets) {
        const rect = el.getBoundingClientRect();
        dispatch({
          target: el,
          width: rect.width,
          height: rect.height,
          box,
        });
      }
    };

    const onWindowResize = () => measureAll();

    // 初始测量异步定时器集合（observeOnMount 近似）。须在 disconnect 时清理（红线 #3）。
    const initialTimers = new Set<ReturnType<typeof setTimeout>>();

    return {
      supported: false, // 降级模式：原生 RO 不可用，supported 仍报 false（语义一致）
      observe(el) {
        const first = targets.size === 0;
        targets.add(el);
        if (first) {
          win.addEventListener('resize', onWindowResize);
        }
        // 近似 observeOnMount：注册后测一次当前尺寸。
        // 红线 #2：observe() 由 svelte 层在挂载 $effect 内同步调用，若此处同步 dispatch
        // 会在该 effect 执行期内写入组件 width/height $state（且用户 onResize 常回写父级
        // $state），与原生 ResizeObserver「observe 时不同步回调」语义不符，且会触发
        // effect_update_depth_exceeded 自循环。故首测延后到下一宏任务（脱离当前 effect 的
        // 同步执行栈），与原生异步首帧语义对齐。
        const t = setTimeout(() => {
          initialTimers.delete(t);
          if (!targets.has(el)) return;
          const rect = el.getBoundingClientRect();
          dispatch({ target: el, width: rect.width, height: rect.height, box });
        }, 0);
        initialTimers.add(t);
      },
      unobserve(el) {
        targets.delete(el);
        if (targets.size === 0) {
          win.removeEventListener('resize', onWindowResize);
        }
      },
      disconnect() {
        scheduler.cancel();
        clearEndTimer();
        for (const t of initialTimers) clearTimeout(t);
        initialTimers.clear();
        targets.clear();
        win.removeEventListener('resize', onWindowResize);
      },
    };
  }

  const ro = new ResizeObserver((entries) => {
    for (const entry of entries) {
      dispatch(normalizeEntry(entry, box));
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
      clearEndTimer();
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
