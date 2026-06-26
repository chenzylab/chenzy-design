/**
 * createToastStore — framework-agnostic singleton toast queue + timers.
 * Manages a list of toasts with auto-dismiss timers, hover pause/resume (by
 * remaining time), FIFO maxCount eviction, and id-based dedup/update. No DOM,
 * no framework deps. The svelte layer subscribes and renders.
 * See specs/components/feedback/Toast.spec.md §3.
 */
import { useId } from './id.js';

export type ToastType = 'info' | 'success' | 'warning' | 'error' | 'loading';
/**
 * 6 方位（对齐 Notification placement）。向后兼容：旧的 'top'/'bottom' 仍是合法值且默认 'top'。
 */
export type ToastPosition =
  | 'topLeft'
  | 'top'
  | 'topRight'
  | 'bottomLeft'
  | 'bottom'
  | 'bottomRight';
export type ToastCloseReason = 'timeout' | 'manual' | 'replace' | 'destroyAll';
export type ToastTheme = 'light' | 'dark';

export interface ToastOptions {
  id?: string;
  content: string;
  type?: ToastType;
  /** auto-dismiss seconds; 0 = persist (loading defaults to 0) */
  duration?: number;
  position?: ToastPosition;
  closable?: boolean;
  pauseOnHover?: boolean;
  /** visual theme of the card */
  theme?: ToastTheme;
  onClose?: (id: string, reason: ToastCloseReason) => void;
  /** 自定义图标（Snippet 或 false 隐藏图标），框架层消费。 */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon?: any;
  /** 是否显示关闭按钮（与 closable 等价，框架层别名）。 */
  showClose?: boolean;
  /** 内容区最大宽度（px 数字或 CSS 字符串），默认 450。 */
  textMaxWidth?: number | string;
  /** 堆叠显示模式（所有 toast 叠成一个卡片样式）。 */
  stack?: boolean;
}

export interface ToastItem {
  id: string;
  content: string;
  type: ToastType;
  duration: number;
  position: ToastPosition;
  closable: boolean;
  pauseOnHover: boolean;
  theme: ToastTheme;
  onClose: ((id: string, reason: ToastCloseReason) => void) | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  showClose: boolean;
  textMaxWidth: number | string;
  stack: boolean;
}

export interface ToastStoreOptions {
  maxCount?: number;
  defaultDuration?: number;
}

export interface ToastStore {
  getToasts(): ToastItem[];
  subscribe(listener: (toasts: ToastItem[]) => void): () => void;
  /** add or (if id exists) update a toast; returns its id */
  add(options: ToastOptions): string;
  remove(id: string, reason?: ToastCloseReason): void;
  removeAll(): void;
  pause(id: string): void;
  resume(id: string): void;
  destroy(): void;
}

type TimerId = ReturnType<typeof setTimeout>;

interface TimerRecord {
  timer: TimerId | null;
  remaining: number; // ms left
  startedAt: number; // ms timestamp when timer (re)started
}

export function createToastStore(storeOptions: ToastStoreOptions = {}): ToastStore {
  const { maxCount = 5, defaultDuration = 3 } = storeOptions;

  let toasts: ToastItem[] = [];
  const timers = new Map<string, TimerRecord>();
  const listeners = new Set<(toasts: ToastItem[]) => void>();

  function emit(): void {
    const snapshot = toasts.slice();
    for (const l of listeners) l(snapshot);
  }

  function now(): number {
    return Date.now();
  }

  function clearTimer(id: string): void {
    const rec = timers.get(id);
    if (rec?.timer != null) {
      clearTimeout(rec.timer);
      rec.timer = null;
    }
  }

  function startTimer(id: string, ms: number): void {
    if (ms <= 0) return; // persist
    const rec: TimerRecord = { timer: null, remaining: ms, startedAt: now() };
    rec.timer = setTimeout(() => remove(id, 'timeout'), ms);
    timers.set(id, rec);
  }

  function remove(id: string, reason: ToastCloseReason = 'manual'): void {
    const item = toasts.find((t) => t.id === id);
    if (!item) return;
    clearTimer(id);
    timers.delete(id);
    toasts = toasts.filter((t) => t.id !== id);
    emit();
    item.onClose?.(id, reason);
  }

  function add(options: ToastOptions): string {
    const id = options.id ?? useId('cd-toast');
    const type = options.type ?? 'info';
    // loading defaults to persist; others use provided duration or default
    const duration =
      options.duration ?? (type === 'loading' ? 0 : defaultDuration);
    const item: ToastItem = {
      id,
      content: options.content,
      type,
      duration,
      position: options.position ?? 'top',
      closable: options.closable ?? true,
      pauseOnHover: options.pauseOnHover ?? true,
      theme: options.theme ?? 'light',
      onClose: options.onClose,
      icon: options.icon,
      showClose: options.showClose ?? options.closable ?? true,
      textMaxWidth: options.textMaxWidth ?? 450,
      stack: options.stack ?? false,
    };

    const existingIndex = toasts.findIndex((t) => t.id === id);
    if (existingIndex >= 0) {
      // update in place, restart timer
      clearTimer(id);
      timers.delete(id);
      toasts = toasts.map((t, i) => (i === existingIndex ? item : t));
    } else {
      toasts = [...toasts, item];
      // FIFO eviction per position（对齐 Notification 按方位淘汰，支持多方位独立堆叠）。
      // 向后兼容：单方位（含旧的纯 top/bottom 用法）时与原全局 FIFO 行为一致。
      const samePosition = toasts.filter((t) => t.position === item.position);
      if (samePosition.length > maxCount) {
        const oldest = samePosition[0]!;
        clearTimer(oldest.id);
        timers.delete(oldest.id);
        toasts = toasts.filter((t) => t.id !== oldest.id);
        oldest.onClose?.(oldest.id, 'replace');
      }
    }
    emit();
    startTimer(id, duration * 1000);
    return id;
  }

  function removeAll(): void {
    const snapshot = toasts.slice();
    for (const t of snapshot) clearTimer(t.id);
    timers.clear();
    toasts = [];
    emit();
    for (const t of snapshot) t.onClose?.(t.id, 'destroyAll');
  }

  function pause(id: string): void {
    const rec = timers.get(id);
    if (!rec || rec.timer == null) return;
    clearTimeout(rec.timer);
    rec.remaining = Math.max(0, rec.remaining - (now() - rec.startedAt));
    rec.timer = null;
  }

  function resume(id: string): void {
    const rec = timers.get(id);
    if (!rec || rec.timer != null || rec.remaining <= 0) return;
    rec.startedAt = now();
    rec.timer = setTimeout(() => remove(id, 'timeout'), rec.remaining);
  }

  return {
    getToasts: () => toasts.slice(),
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    add,
    remove,
    removeAll,
    pause,
    resume,
    destroy() {
      for (const t of toasts) clearTimer(t.id);
      timers.clear();
      toasts = [];
      listeners.clear();
    },
  };
}
