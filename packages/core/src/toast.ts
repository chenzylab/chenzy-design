/**
 * createToastStore — framework-agnostic toast queue + timers, 严格对齐 Semi Design
 * （semi-foundation/toast/toastFoundation.ts + toastListFoundation.ts）。
 * 管理一列 toast，自动关闭定时器、hover 暂停/恢复（mouseenter clear → mouseleave restart，
 * 对齐 Semi）、按 id 去重/更新（updateToast 原地合并 + restartCloseTimer）。无 DOM、无框架依赖。
 * svelte 层订阅并渲染。
 *
 * 对齐 Semi：无 position（wrapper 固定顶部居中，config 的 top/left/bottom/right 由容器整体偏移）、
 * 无 maxCount 淘汰（Semi 不限制数量，多条靠 stack 折叠）、type 为 info/success/warning/error/default、
 * theme 为 normal/light、onClose 为 () => void（无 reason 参数）。
 */
import { useId } from './id.js';

/** 对齐 Semi strings.types（warning/success/info/error/default）。 */
export type ToastType = 'info' | 'success' | 'warning' | 'error' | 'default';
/** 对齐 Semi strings.themes（normal/light）。 */
export type ToastTheme = 'normal' | 'light';
export type ToastDirection = 'ltr' | 'rtl';

export interface ToastOptions {
  id?: string;
  content: unknown;
  type?: ToastType;
  /** 自动关闭秒数；0 = 不自动关闭（对齐 Semi duration）。 */
  duration?: number;
  /** 是否显示关闭按钮（对齐 Semi showClose）。 */
  showClose?: boolean;
  /** 内容区最大宽度（px 数字或 CSS 字符串），对齐 Semi textMaxWidth，默认 450。 */
  textMaxWidth?: number | string;
  /** 卡片主题（对齐 Semi theme，normal/light）。 */
  theme?: ToastTheme;
  /** 是否堆叠 Toast（对齐 Semi stack，多条叠一摞、hover 展开）。 */
  stack?: boolean;
  /** 书写方向（对齐 Semi direction）。 */
  direction?: ToastDirection;
  /** 关闭回调（对齐 Semi onClose，无参数）。 */
  onClose?: () => void;
  /** 自定义图标（Snippet 或 ReactNode 对齐；框架层消费）。 */
  icon?: unknown;
}

export interface ToastItem {
  id: string;
  content: unknown;
  type: ToastType;
  duration: number;
  showClose: boolean;
  textMaxWidth: number | string;
  theme: ToastTheme;
  stack: boolean;
  direction: ToastDirection;
  onClose: (() => void) | undefined;
  icon: unknown;
}

export interface ToastStoreOptions {
  defaultDuration?: number;
  defaultTheme?: ToastTheme;
  defaultDirection?: ToastDirection;
}

export interface ToastStore {
  getToasts(): ToastItem[];
  subscribe(listener: (toasts: ToastItem[]) => void): () => void;
  /** 是否已存在该 id（对齐 Semi has）。 */
  has(id: string): boolean;
  /** 新增一条 toast，返回其 id（对齐 Semi addToast）。 */
  add(options: ToastOptions): string;
  /** 按 id 原地更新一条 toast 并重启定时器（对齐 Semi updateToast + restartCloseTimer）。 */
  update(id: string, options: ToastOptions): void;
  remove(id: string): void;
  removeAll(): void;
  /** 悬停暂停定时器（对齐 Semi clearCloseTimer_）。 */
  pause(id: string): void;
  /** 离开恢复定时器，从头完整计时（对齐 Semi startCloseTimer_ / restartCloseTimer）。 */
  resume(id: string): void;
  destroy(): void;
}

type TimerId = ReturnType<typeof setTimeout>;

export function createToastStore(storeOptions: ToastStoreOptions = {}): ToastStore {
  const {
    defaultDuration = 3,
    defaultTheme = 'normal',
    defaultDirection = 'ltr',
  } = storeOptions;

  let toasts: ToastItem[] = [];
  const timers = new Map<string, TimerId>();
  const listeners = new Set<(toasts: ToastItem[]) => void>();

  function emit(): void {
    const snapshot = toasts.slice();
    for (const l of listeners) l(snapshot);
  }

  function clearTimer(id: string): void {
    const timer = timers.get(id);
    if (timer != null) {
      clearTimeout(timer);
      timers.delete(id);
    }
  }

  // 对齐 Semi startCloseTimer_：duration 为正数才计时，否则常驻。
  function startTimer(id: string, duration: number): void {
    if (duration && duration > 0) {
      timers.set(
        id,
        setTimeout(() => remove(id), duration * 1000),
      );
    }
  }

  function normalize(options: ToastOptions, id: string): ToastItem {
    const type = options.type ?? 'default';
    return {
      id,
      content: options.content,
      type,
      duration: options.duration ?? defaultDuration,
      showClose: options.showClose ?? true,
      textMaxWidth: options.textMaxWidth ?? 450,
      theme: options.theme ?? defaultTheme,
      stack: options.stack ?? false,
      direction: options.direction ?? defaultDirection,
      onClose: options.onClose,
      icon: options.icon,
    };
  }

  function remove(id: string): void {
    const item = toasts.find((t) => t.id === id);
    if (!item) return;
    clearTimer(id);
    toasts = toasts.filter((t) => t.id !== id);
    emit();
    item.onClose?.();
  }

  function add(options: ToastOptions): string {
    const id = options.id ?? useId('cd-toast');
    const item = normalize(options, id);
    clearTimer(id);
    toasts = [...toasts.filter((t) => t.id !== id), item];
    emit();
    startTimer(id, item.duration);
    return id;
  }

  // 对齐 Semi updateToast：以旧 item 为基础覆盖新提供的字段，保留次序，重启定时器。
  // 仅覆盖 options 显式提供（非 undefined）的键，其余沿用旧值（不经 ToastOptions 往返，
  // 避免 exactOptionalPropertyTypes 下 onClose 可选性冲突）。
  function update(id: string, options: ToastOptions): void {
    const idx = toasts.findIndex((t) => t.id === id);
    if (idx < 0) return;
    const prev = toasts[idx]!;
    const merged: ToastItem = {
      id,
      content: options.content ?? prev.content,
      type: options.type ?? prev.type,
      duration: options.duration ?? prev.duration,
      showClose: options.showClose ?? prev.showClose,
      textMaxWidth: options.textMaxWidth ?? prev.textMaxWidth,
      theme: options.theme ?? prev.theme,
      stack: options.stack ?? prev.stack,
      direction: options.direction ?? prev.direction,
      onClose: options.onClose ?? prev.onClose,
      icon: options.icon ?? prev.icon,
    };
    toasts = toasts.map((t, i) => (i === idx ? merged : t));
    emit();
    clearTimer(id);
    startTimer(id, merged.duration);
  }

  function removeAll(): void {
    const snapshot = toasts.slice();
    for (const t of snapshot) clearTimer(t.id);
    toasts = [];
    emit();
    for (const t of snapshot) t.onClose?.();
  }

  // 对齐 Semi clearCloseTimer_：hover 暂停即清定时器（不记剩余时间）。
  function pause(id: string): void {
    clearTimer(id);
  }

  // 对齐 Semi startCloseTimer_（mouseleave）：从头完整计时。
  function resume(id: string): void {
    if (timers.has(id)) return;
    const item = toasts.find((t) => t.id === id);
    if (!item) return;
    startTimer(id, item.duration);
  }

  return {
    getToasts: () => toasts.slice(),
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    has: (id) => toasts.some((t) => t.id === id),
    add,
    update,
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
