/**
 * Notification — 命令式全局通知提醒框入口，严格对齐 Semi Design
 * （semi-ui/notification/index.tsx 的静态方法 + config + useNotification）。
 * 模块级单例 store + 惰性挂载的单例 NotificationContainer（首次调用时 mount 到
 * getPopupContainer() 或 body）。复用 @chenzy-design/core 的 createNotificationStore
 * （无框架依赖的队列 + 定时器，语义对齐 Semi foundation）。
 *
 * 对齐 Semi 静态 API：open/info/success/warning/error/close/destroyAll/config/useNotification。
 * See semi-ui/notification/index.tsx
 */
import {
  createNotificationStore,
  type NotificationStore,
  type NotificationOptions,
  type NotificationType,
  type NotificationPosition,
  type NotificationDirection,
} from '@chenzy-design/core';

/**
 * 全局配置（对齐 Semi Notification.config）。容器经 mount() 挂在 Svelte 组件树之外，
 * 拿不到 ConfigProvider context，故位置偏移 / 挂载容器只能经此命令式入口配置：
 *  - top/bottom/left/right：list 与视口边缘的偏移（CSS 值或数字像素），首次生效。
 *  - position：默认弹出位置（对齐 Semi defaultConfig.position）。
 *  - duration：默认自动关闭秒数（0 = 常驻），可被单条 options.duration 覆盖。
 *  - zIndex：通知列表 z-index（对齐 Semi，默认 1010，首次生效）。
 *  - direction：默认书写方向（Svelte 命令式入口特有；per-item direction 优先）。
 *  - getPopupContainer：容器宿主挂载目标（默认 body，对齐 Semi getPopupContainer）。
 */
export interface NotificationConfig {
  top?: number | string;
  bottom?: number | string;
  left?: number | string;
  right?: number | string;
  position?: NotificationPosition;
  duration?: number;
  zIndex?: number;
  direction?: NotificationDirection;
  getPopupContainer?: () => HTMLElement | null | undefined;
}

/**
 * Svelte 命令式选项（对齐 Semi NoticeProps）。title/content/icon 可为 string 文本或
 * Svelte Snippet（对齐 Semi ReactNode）；其余与 core NotificationOptions 一致。
 * 额外的 getPopupContainer（per-notice）：首条通知的该值决定容器挂载点（对齐 Semi）。
 */
export type SvelteNotificationOptions = NotificationOptions & {
  getPopupContainer?: () => HTMLElement | null | undefined;
};

let store: NotificationStore | null = null;
let containerMounted = false;
let globalDuration: number | undefined;
let globalPosition: NotificationPosition | undefined;
let globalDirection: NotificationDirection = 'ltr';
let getPopupContainer: (() => HTMLElement | null | undefined) | undefined;

// 位置偏移：由 NotificationContainer 读取并注入 list inline style。
type PositionOffsets = Pick<NotificationConfig, 'top' | 'bottom' | 'left' | 'right' | 'zIndex'>;
let positionOffsets: PositionOffsets = {};

/** 位置偏移 getter：供 NotificationContainer 读取并注入 inline style（config() 后生效）。 */
export function getPositionOffsets(): PositionOffsets {
  return positionOffsets;
}

function ensureStore(): NotificationStore {
  if (!store) {
    store = createNotificationStore({
      defaultDuration: globalDuration ?? 3,
      defaultPosition: globalPosition ?? 'topRight',
      defaultDirection: globalDirection,
    });
  }
  return store;
}

/**
 * 惰性挂载容器：首次调用时动态 import + mount NotificationContainer 到
 * getPopupContainer() 指定容器（默认 body）。mount 是 async（动态 import），
 * 但调用方的 s.open 已同步把数据写进 store；容器 mount 时立即同步读一次 store.getItems()，
 * 不会丢首条通知。
 */
async function ensureContainer(): Promise<void> {
  if (containerMounted || typeof document === 'undefined') return;
  containerMounted = true;
  const { mount } = await import('svelte');
  const { default: NotificationContainer } = await import('./NotificationContainer.svelte');
  const host = document.createElement('div');
  host.className = 'cd-notification-wrapper';
  const target = getPopupContainer?.() ?? document.body;
  target.appendChild(host);
  mount(NotificationContainer, { target: host, props: { store: ensureStore() } });
}

/** 剥离 getPopupContainer（仅首次挂载用，不进入 core item）。 */
function toCoreOpts(opts: SvelteNotificationOptions): NotificationOptions {
  const core = { ...opts };
  delete core.getPopupContainer;
  return core as NotificationOptions;
}

function show(type: NotificationType, opts: SvelteNotificationOptions): string {
  // 首条通知的 getPopupContainer / zIndex 决定容器挂载点与 wrapper z-index
  // （对齐 Semi addNotice：div.style.zIndex = notice.zIndex ?? defaultConfig.zIndex，首次一次生效）。
  if (!containerMounted && opts.getPopupContainer) getPopupContainer = opts.getPopupContainer;
  if (!containerMounted && typeof opts.zIndex === 'number' && positionOffsets.zIndex === undefined) {
    positionOffsets = { ...positionOffsets, zIndex: opts.zIndex };
  }
  void ensureContainer();
  return ensureStore().open({ ...toCoreOpts(opts), type });
}

export const notification = {
  /**
   * 配置全局通知行为（对齐 Semi Notification.config）：top/bottom/left/right/zIndex（位置偏移，
   * 首次生效）、position（默认位置）、duration（默认自动关闭秒数）、direction（默认方向）、
   * getPopupContainer（容器挂载目标）。须在首条通知前调用方对挂载点 / 偏移生效。
   */
  config: (cfg: NotificationConfig): void => {
    if (cfg.duration !== undefined) globalDuration = cfg.duration;
    if (cfg.position !== undefined) globalPosition = cfg.position;
    if (cfg.direction !== undefined) globalDirection = cfg.direction;
    if ('getPopupContainer' in cfg) getPopupContainer = cfg.getPopupContainer;
    const next: PositionOffsets = {};
    if (cfg.top !== undefined) next.top = cfg.top;
    if (cfg.bottom !== undefined) next.bottom = cfg.bottom;
    if (cfg.left !== undefined) next.left = cfg.left;
    if (cfg.right !== undefined) next.right = cfg.right;
    if (cfg.zIndex !== undefined) next.zIndex = cfg.zIndex;
    positionOffsets = next;
  },
  /** 展示一条通知（type=default），返回其 id（对齐 Semi open；已存在 id 原地更新）。 */
  open: (opts: SvelteNotificationOptions): string => show('default', opts),
  success: (opts: SvelteNotificationOptions): string => show('success', opts),
  info: (opts: SvelteNotificationOptions): string => show('info', opts),
  warning: (opts: SvelteNotificationOptions): string => show('warning', opts),
  error: (opts: SvelteNotificationOptions): string => show('error', opts),
  /** 手动关闭指定通知（对齐 Semi close）。 */
  close: (id: string): void => ensureStore().close(id),
  /** 清空全部通知（对齐 Semi destroyAll）。 */
  destroyAll: (): void => ensureStore().destroyAll(),
};

/** useNotification Hook 返回的 api（对齐 Semi：info/success/warning/error/open/close）。 */
export interface NotificationHookApi {
  open: (opts: SvelteNotificationOptions) => string;
  success: (opts: SvelteNotificationOptions) => string;
  info: (opts: SvelteNotificationOptions) => string;
  warning: (opts: SvelteNotificationOptions) => string;
  error: (opts: SvelteNotificationOptions) => string;
  close: (id: string) => void;
}

/**
 * useNotification — Svelte 版 Hook（对齐 Semi Notification.useNotification）。
 * 返回 [api, holderStore]：
 *  - api：info/success/warning/error/open/close（局部，不含全局的 config/destroyAll）；
 *  - holderStore：传给 <NotificationHolder store={holderStore} /> 渲染在组件树内，
 *    使经此 api 创建的通知渲染在 holder 所在位置，继承该处上下文（如 LocaleProvider）。
 * 与全局单例不同：本 Hook 的 store 与容器是局部的，不挂 body。
 * 用法：
 *   const [api, holderStore] = useNotification();
 *   // 模板中：<NotificationHolder store={holderStore} />
 *   // 事件中：api.info({ title, content })
 */
export function useNotification(): [NotificationHookApi, NotificationStore] {
  const localStore = createNotificationStore({
    defaultDuration: 3,
    defaultPosition: 'topRight',
  });
  const api: NotificationHookApi = {
    open: (opts) => localStore.open({ ...toCoreOpts(opts), type: 'default' }),
    success: (opts) => localStore.open({ ...toCoreOpts(opts), type: 'success' }),
    info: (opts) => localStore.open({ ...toCoreOpts(opts), type: 'info' }),
    warning: (opts) => localStore.open({ ...toCoreOpts(opts), type: 'warning' }),
    error: (opts) => localStore.open({ ...toCoreOpts(opts), type: 'error' }),
    close: (id) => localStore.close(id),
  };
  return [api, localStore];
}
