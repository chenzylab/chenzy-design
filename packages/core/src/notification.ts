/**
 * createNotificationStore — framework-agnostic singleton notification queue.
 * Same queue + timer model as the toast store, but groups by 6 placements and
 * carries richer data (title/content/footer). Auto-dismiss with hover pause,
 * FIFO maxCount per placement, id-based dedup/update. No DOM, no framework deps.
 * See specs/components/feedback/Notification.spec.md §3.
 */
import { useId } from './id.js';

export type NotificationType = 'default' | 'success' | 'info' | 'warning' | 'error';
export type NotificationPlacement =
  | 'topLeft'
  | 'top'
  | 'topRight'
  | 'bottomLeft'
  | 'bottom'
  | 'bottomRight';
export type NotificationCloseReason = 'timeout' | 'manual' | 'replace' | 'destroyAll';
export type NotificationTheme = 'light' | 'dark';
export type NotificationDirection = 'ltr' | 'rtl';

export interface NotificationOptions {
  id?: string;
  title?: string;
  content?: string;
  type?: NotificationType;
  /** auto-dismiss seconds; 0 = persist */
  duration?: number;
  placement?: NotificationPlacement;
  closable?: boolean;
  pauseOnHover?: boolean;
  /** show a countdown progress bar that tracks the remaining auto-dismiss time */
  showProgress?: boolean;
  /** visual theme of the card */
  theme?: NotificationTheme;
  /** writing direction; 'rtl' mirrors the card layout and swaps left/right placement */
  direction?: NotificationDirection;
  /**
   * footer action area. Opaque to core (framework-agnostic) — the render layer
   * (svelte) treats it as a Snippet. Typed `unknown` here to avoid a framework dep.
   */
  footer?: unknown;
  onClose?: (id: string, reason: NotificationCloseReason) => void;
}

export interface NotificationItem {
  id: string;
  title: string;
  content: string;
  type: NotificationType;
  duration: number;
  placement: NotificationPlacement;
  closable: boolean;
  pauseOnHover: boolean;
  showProgress: boolean;
  theme: NotificationTheme;
  direction: NotificationDirection;
  footer: unknown;
  onClose: ((id: string, reason: NotificationCloseReason) => void) | undefined;
}

export interface NotificationStoreOptions {
  maxCount?: number;
  defaultDuration?: number;
  /** default writing direction applied to items that don't specify one */
  defaultDirection?: NotificationDirection;
}

export interface NotificationStore {
  getItems(): NotificationItem[];
  subscribe(listener: (items: NotificationItem[]) => void): () => void;
  open(options: NotificationOptions): string;
  close(id: string, reason?: NotificationCloseReason): void;
  destroyAll(placement?: NotificationPlacement): void;
  pause(id: string): void;
  resume(id: string): void;
  destroy(): void;
}

type TimerId = ReturnType<typeof setTimeout>;
interface TimerRecord {
  timer: TimerId | null;
  remaining: number;
  startedAt: number;
}

export function createNotificationStore(
  storeOptions: NotificationStoreOptions = {},
): NotificationStore {
  const { maxCount = 5, defaultDuration = 4.5, defaultDirection = 'ltr' } = storeOptions;

  let items: NotificationItem[] = [];
  const timers = new Map<string, TimerRecord>();
  const listeners = new Set<(items: NotificationItem[]) => void>();

  function emit(): void {
    const snapshot = items.slice();
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
    if (ms <= 0) return;
    const rec: TimerRecord = { timer: null, remaining: ms, startedAt: now() };
    rec.timer = setTimeout(() => close(id, 'timeout'), ms);
    timers.set(id, rec);
  }

  function close(id: string, reason: NotificationCloseReason = 'manual'): void {
    const item = items.find((t) => t.id === id);
    if (!item) return;
    clearTimer(id);
    timers.delete(id);
    items = items.filter((t) => t.id !== id);
    emit();
    item.onClose?.(id, reason);
  }

  function open(options: NotificationOptions): string {
    const id = options.id ?? useId('cd-notification');
    const placement = options.placement ?? 'topRight';
    const item: NotificationItem = {
      id,
      title: options.title ?? '',
      content: options.content ?? '',
      type: options.type ?? 'default',
      duration: options.duration ?? defaultDuration,
      placement,
      closable: options.closable ?? true,
      pauseOnHover: options.pauseOnHover ?? true,
      showProgress: options.showProgress ?? false,
      theme: options.theme ?? 'light',
      direction: options.direction ?? defaultDirection,
      footer: options.footer,
      onClose: options.onClose,
    };

    const existingIndex = items.findIndex((t) => t.id === id);
    if (existingIndex >= 0) {
      clearTimer(id);
      timers.delete(id);
      items = items.map((t, i) => (i === existingIndex ? item : t));
    } else {
      items = [...items, item];
      // FIFO per placement
      const samePlacement = items.filter((t) => t.placement === placement);
      if (samePlacement.length > maxCount) {
        const oldest = samePlacement[0]!;
        clearTimer(oldest.id);
        timers.delete(oldest.id);
        items = items.filter((t) => t.id !== oldest.id);
        oldest.onClose?.(oldest.id, 'replace');
      }
    }
    emit();
    startTimer(id, item.duration * 1000);
    return id;
  }

  function destroyAll(placement?: NotificationPlacement): void {
    const targets = placement ? items.filter((t) => t.placement === placement) : items.slice();
    for (const t of targets) {
      clearTimer(t.id);
      timers.delete(t.id);
    }
    const ids = new Set(targets.map((t) => t.id));
    items = items.filter((t) => !ids.has(t.id));
    emit();
    for (const t of targets) t.onClose?.(t.id, 'destroyAll');
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
    rec.timer = setTimeout(() => close(id, 'timeout'), rec.remaining);
  }

  return {
    getItems: () => items.slice(),
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    open,
    close,
    destroyAll,
    pause,
    resume,
    destroy() {
      for (const t of items) clearTimer(t.id);
      timers.clear();
      items = [];
      listeners.clear();
    },
  };
}
