/**
 * createNotificationStore — framework-agnostic singleton notification queue.
 * 严格对齐 Semi Design（semi-foundation/notification）：notificationListFoundation
 * 的 add/has/update/remove/destroyAll + notificationFoundation 的 start/clear/restart
 * close timer 语义。无框架依赖：无 DOM、无 UI 关注点。
 *
 * 对齐要点（对照 Semi）：
 *  - duration 单位秒，默认 3；仅 duration>0 时自动关闭（duration=0 常驻）。
 *  - hover 行为：pause() 清定时器；resume() 重新完整计时（对齐 Semi startCloseTimer，
 *    非恢复剩余时间）。
 *  - open()：已存在 id → 原地合并更新 + 重启定时器（对齐 has→update→restartCloseTimer）；
 *    否则新增，新通知置于队首（对齐 addNotice [opts, ...notices]）。
 *  - 无 maxCount（Semi 无此能力）。
 * See semi-foundation/notification/notificationListFoundation.ts & notificationFoundation.ts
 */
import { useId } from './id.js';

export type NotificationType = 'default' | 'success' | 'info' | 'warning' | 'error';
export type NotificationPosition =
  | 'top'
  | 'bottom'
  | 'topLeft'
  | 'topRight'
  | 'bottomLeft'
  | 'bottomRight';
/** 填充样式：normal（默认白色）| light（多色浅填充），对齐 Semi theme。 */
export type NotificationTheme = 'normal' | 'light';
export type NotificationDirection = 'ltr' | 'rtl';

export interface NotificationOptions {
  id?: string;
  title?: unknown;
  content?: unknown;
  type?: NotificationType;
  /** auto-dismiss seconds; 0 = persist（对齐 Semi 默认 3） */
  duration?: number;
  position?: NotificationPosition;
  /** 是否展示关闭按钮（对齐 Semi showClose，默认 true） */
  showClose?: boolean;
  /** 填充样式（对齐 Semi theme，默认 normal） */
  theme?: NotificationTheme;
  /** 自定义左上角图标（渲染层 Snippet；core 用 unknown 透传，无框架依赖） */
  icon?: unknown;
  /** 弹层 z-index（对齐 Semi，默认 1010，首次生效） */
  zIndex?: number;
  /** 书写方向（对齐 Semi direction，默认 ltr） */
  direction?: NotificationDirection;
  /** 点击通知的回调（对齐 Semi onClick） */
  onClick?: (e: unknown) => void;
  /** 通知关闭回调（主动关闭、延时到达关闭都会触发，对齐 Semi onClose） */
  onClose?: () => void;
  /** 主动点击关闭按钮时的回调（对齐 Semi onCloseClick） */
  onCloseClick?: (id: string) => void;
}

export interface NotificationItem {
  id: string;
  title: unknown;
  content: unknown;
  type: NotificationType;
  duration: number;
  position: NotificationPosition;
  showClose: boolean;
  theme: NotificationTheme;
  icon: unknown;
  zIndex: number | undefined;
  direction: NotificationDirection;
  onClick: ((e: unknown) => void) | undefined;
  onClose: (() => void) | undefined;
  onCloseClick: ((id: string) => void) | undefined;
}

export interface NotificationStoreOptions {
  /** 默认自动关闭秒数（对齐 Semi defaultConfig.duration = 3） */
  defaultDuration?: number;
  /** 默认弹出位置（对齐 Semi defaultConfig.position = 'topRight'） */
  defaultPosition?: NotificationPosition;
  /** 默认书写方向 */
  defaultDirection?: NotificationDirection;
}

export interface NotificationStore {
  getItems(): NotificationItem[];
  subscribe(listener: (items: NotificationItem[]) => void): () => void;
  /** 新增或按 id 原地更新一条通知，返回 id（对齐 Semi addNotice/update）。 */
  open(options: NotificationOptions): string;
  has(id: string): boolean;
  close(id: string): void;
  destroyAll(): void;
  /** hover 进入：清定时器（对齐 Semi clearCloseTimer）。 */
  pause(id: string): void;
  /** hover 离开：重新完整计时（对齐 Semi startCloseTimer）。 */
  resume(id: string): void;
  destroy(): void;
}

type TimerId = ReturnType<typeof setTimeout>;

export function createNotificationStore(
  storeOptions: NotificationStoreOptions = {},
): NotificationStore {
  const {
    defaultDuration = 3,
    defaultPosition = 'topRight',
    defaultDirection = 'ltr',
  } = storeOptions;

  let items: NotificationItem[] = [];
  const timers = new Map<string, TimerId>();
  const listeners = new Set<(items: NotificationItem[]) => void>();

  function emit(): void {
    const snapshot = items.slice();
    for (const l of listeners) l(snapshot);
  }
  function clearTimer(id: string): void {
    const t = timers.get(id);
    if (t != null) {
      clearTimeout(t);
      timers.delete(id);
    }
  }
  /** 对齐 Semi _startCloseTimer：仅 duration>0 时启动整段计时。 */
  function startTimer(item: NotificationItem): void {
    if (item.duration && item.duration > 0) {
      const t = setTimeout(() => close(item.id), item.duration * 1000);
      timers.set(item.id, t);
    }
  }

  function normalize(options: NotificationOptions, id: string): NotificationItem {
    return {
      id,
      title: options.title ?? '',
      content: options.content ?? '',
      type: options.type ?? 'default',
      duration: options.duration ?? defaultDuration,
      position: options.position ?? defaultPosition,
      showClose: options.showClose ?? true,
      theme: options.theme ?? 'normal',
      icon: options.icon,
      zIndex: options.zIndex,
      direction: options.direction ?? defaultDirection,
      onClick: options.onClick,
      onClose: options.onClose,
      onCloseClick: options.onCloseClick,
    };
  }

  function close(id: string): void {
    const item = items.find((t) => t.id === id);
    if (!item) return;
    clearTimer(id);
    items = items.filter((t) => t.id !== id);
    emit();
    item.onClose?.();
  }

  function open(options: NotificationOptions): string {
    const id = options.id ?? useId('cd-notification');
    const existingIndex = items.findIndex((t) => t.id === id);

    if (existingIndex >= 0) {
      // 对齐 Semi update：原地合并旧 item 属性 + 新 options（仅覆盖显式传入的键），并重启定时器。
      const prev = items[existingIndex]!;
      const merged = mergeUpdate(prev, options);
      clearTimer(id);
      items = items.map((t, i) => (i === existingIndex ? merged : t));
      emit();
      startTimer(merged);
      return id;
    }

    const item = normalize(options, id);
    // 对齐 Semi addNotice：新通知置于队首。
    items = [item, ...items];
    emit();
    startTimer(item);
    return id;
  }

  /** 对齐 Semi update：以已存在的 item 为基底，仅覆盖 options 中显式传入的键。 */
  function mergeUpdate(prev: NotificationItem, options: NotificationOptions): NotificationItem {
    return {
      id: prev.id,
      title: options.title ?? prev.title,
      content: options.content ?? prev.content,
      type: options.type ?? prev.type,
      duration: options.duration ?? prev.duration,
      position: options.position ?? prev.position,
      showClose: options.showClose ?? prev.showClose,
      theme: options.theme ?? prev.theme,
      icon: options.icon ?? prev.icon,
      zIndex: options.zIndex ?? prev.zIndex,
      direction: options.direction ?? prev.direction,
      onClick: options.onClick ?? prev.onClick,
      onClose: options.onClose ?? prev.onClose,
      onCloseClick: options.onCloseClick ?? prev.onCloseClick,
    };
  }

  function destroyAll(): void {
    const targets = items.slice();
    for (const t of targets) clearTimer(t.id);
    items = [];
    emit();
    for (const t of targets) t.onClose?.();
  }

  function pause(id: string): void {
    // 对齐 Semi clearCloseTimer：hover 进入清除定时器。
    clearTimer(id);
  }
  function resume(id: string): void {
    // 对齐 Semi startCloseTimer：hover 离开重新完整计时。
    if (timers.has(id)) return;
    const item = items.find((t) => t.id === id);
    if (item) startTimer(item);
  }

  return {
    getItems: () => items.slice(),
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    open,
    has: (id) => items.some((t) => t.id === id),
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
