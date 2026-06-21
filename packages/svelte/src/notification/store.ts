/**
 * Notification — 命令式全局通知提醒框入口。
 * 模块级单例 store + 惰性挂载的单例 NotificationContainer（首次调用时 mount 到 body）。
 * 复用 @chenzy-design/core 的 createNotificationStore（无框架依赖的队列 + 定时器）。
 * 与 Toast 同构，差异：数据含 title + content、6 方位独立堆叠、无 loading 类型；
 * 命令式入参是 NotificationOptions 配置对象（不像 Toast 首参是 string）。
 * See specs/components/feedback/Notification.spec.md
 */
import {
  createNotificationStore,
  type NotificationStore,
  type NotificationOptions,
  type NotificationType,
  type NotificationPlacement,
  type NotificationDirection,
} from '@chenzy-design/core';

/**
 * 全局通知配置（命令式单例特有）。容器经 mount() 挂在 Svelte 组件树之外，
 * 拿不到 ConfigProvider context，故 RTL / 挂载容器只能经此命令式入口配置：
 *  - direction：未显式指定 direction 的通知的默认书写方向（rtl 镜像布局并左右互换方位）。
 *  - getPopupContainer：容器宿主挂载目标（默认 body），对齐 Modal/Dropdown getContainer。
 * 须在首条通知前调用方对挂载点生效（容器惰性挂载且单例，仅挂一次）。
 */
export interface NotificationConfig {
  direction?: NotificationDirection;
  getPopupContainer?: () => HTMLElement | null | undefined;
}

let store: NotificationStore | null = null;
let containerMounted = false;
let globalDirection: NotificationDirection = 'ltr';
let getPopupContainer: (() => HTMLElement | null | undefined) | undefined;

function ensureStore(): NotificationStore {
  if (!store) store = createNotificationStore({ maxCount: 5, defaultDuration: 4.5 });
  return store;
}

// 把全局 direction 作为默认注入未显式指定方向的选项（per-item direction 仍优先）。
function withDefaults(opts: NotificationOptions): NotificationOptions {
  return opts.direction === undefined ? { ...opts, direction: globalDirection } : opts;
}

/**
 * 惰性挂载容器：首次调用时动态 import + mount NotificationContainer 到 body。
 * mount 是 async（动态 import），但调用方的 s.open 已同步把数据写进 store；
 * 容器在 mount 时立即同步读一次 store.getItems()，不会丢首条通知。
 */
async function ensureContainer(): Promise<void> {
  if (containerMounted || typeof document === 'undefined') return;
  containerMounted = true;
  const { mount } = await import('svelte');
  const { default: NotificationContainer } = await import('./NotificationContainer.svelte');
  const host = document.createElement('div');
  host.className = 'cd-notification-host';
  // 挂载到 getPopupContainer() 指定容器（默认 body），对齐 Modal/Dropdown getContainer。
  const target = getPopupContainer?.() ?? document.body;
  target.appendChild(host);
  mount(NotificationContainer, { target: host, props: { store: ensureStore() } });
}

function show(type: NotificationType, opts: NotificationOptions): string {
  const s = ensureStore();
  void ensureContainer();
  return s.open(withDefaults({ ...opts, type }));
}

export const notification = {
  /**
   * 配置全局通知行为：direction（默认书写方向）、getPopupContainer（容器挂载目标）。
   * 命令式单例特性——须在首条通知前调用方对挂载点生效。向后兼容：不调用即 ltr + body。
   */
  config: (cfg: NotificationConfig): void => {
    if (cfg.direction !== undefined) globalDirection = cfg.direction;
    if ('getPopupContainer' in cfg) getPopupContainer = cfg.getPopupContainer;
  },
  /** 完整选项打开一条通知，返回其 id。 */
  open: (opts: NotificationOptions): string => {
    void ensureContainer();
    return ensureStore().open(withDefaults(opts));
  },
  success: (opts: NotificationOptions): string => show('success', opts),
  info: (opts: NotificationOptions): string => show('info', opts),
  warning: (opts: NotificationOptions): string => show('warning', opts),
  error: (opts: NotificationOptions): string => show('error', opts),
  /** 手动关闭指定通知。 */
  close: (id: string): void => ensureStore().close(id, 'manual'),
  /** 按同 id 更新一条通知（store.open 对已存在 id 走原地更新 + 重启定时器）。 */
  update: (id: string, opts: NotificationOptions): string => {
    void ensureContainer();
    return ensureStore().open(withDefaults({ ...opts, id }));
  },
  /** 清空全部通知，或仅清空指定方位。 */
  destroyAll: (placement?: NotificationPlacement): void =>
    ensureStore().destroyAll(placement),
};
