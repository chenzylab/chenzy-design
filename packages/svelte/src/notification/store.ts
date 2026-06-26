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
 *  - top/bottom/left/right：六方位容器与视口边缘的偏移（CSS 像素字符串或数字）。
 *  - zIndex：通知容器层叠优先级。
 *  - duration：全局默认自动关闭秒数（0 = 常驻），可被单条 options.duration 覆盖。
 * 须在首条通知前调用方对挂载点生效（容器惰性挂载且单例，仅挂一次）。
 */
export interface NotificationConfig {
  direction?: NotificationDirection;
  getPopupContainer?: () => HTMLElement | null | undefined;
  /** 通知容器距视口顶部偏移（CSS 值，如 '24px' 或数字像素），适用于 topLeft/top/topRight 方位 */
  top?: number | string;
  /** 通知容器距视口底部偏移 */
  bottom?: number | string;
  /** 通知容器距视口左侧偏移 */
  left?: number | string;
  /** 通知容器距视口右侧偏移 */
  right?: number | string;
  /** 通知容器 z-index */
  zIndex?: number;
  /** 全局默认自动关闭秒数（0 = 常驻）；可被单条 notification.xxx({ duration }) 覆盖 */
  duration?: number;
}

let store: NotificationStore | null = null;
let containerMounted = false;
let globalDirection: NotificationDirection = 'ltr';
let getPopupContainer: (() => HTMLElement | null | undefined) | undefined;
let globalDuration: number | undefined;
// 位置偏移：由 NotificationContainer 读取并注入 CSS custom property。
type PositionOffsets = Pick<NotificationConfig, 'top' | 'bottom' | 'left' | 'right' | 'zIndex'>;
let positionOffsets: PositionOffsets = {};

/**
 * Svelte 层扩展选项（core NotificationOptions 的超集）：
 *  - showClose: closable 的别名（Semi 文档用 showClose），两者等价，showClose 优先。
 *  - onCloseClick: 仅在用户点击关闭按钮时触发（与 onClose 区分：onClose 在任何关闭方式时触发）。
 */
export interface SvelteNotificationOptions extends NotificationOptions {
  /** closable 的别名（Semi 文档用 showClose）；showClose 优先于 closable */
  showClose?: boolean;
  /** 仅在用户点击关闭按钮时触发；onClose 在所有关闭方式（timeout/manual/replace/destroyAll）时触发 */
  onCloseClick?: (id: string) => void;
}

// onCloseClick 回调按 id 存储在模块级 Map，NotificationContainer 关闭按钮点击时查找并调用。
export const onCloseClickMap = new Map<string, (id: string) => void>();

/** 位置偏移 getter：供 NotificationContainer 读取并注入 inline style（config() 后生效）。 */
export function getPositionOffsets(): Pick<NotificationConfig, 'top' | 'bottom' | 'left' | 'right' | 'zIndex'> {
  return positionOffsets;
}

function ensureStore(): NotificationStore {
  if (!store) {
    store = createNotificationStore({
      maxCount: 5,
      defaultDuration: globalDuration ?? 4.5,
    });
  }
  return store;
}

/**
 * 把全局 direction 作为默认注入未显式指定方向的选项（per-item direction 仍优先）。
 * 同时解析 showClose 别名（→ closable）；onCloseClick 单独处理。
 */
interface ResolvedOpts {
  coreOpts: NotificationOptions;
  onCloseClick: ((id: string) => void) | undefined;
}

function resolveOpts(opts: SvelteNotificationOptions): ResolvedOpts {
  // Cast via unknown to tolerate svelte-check false positives when @chenzy-design/core is not built.
  type CoreOpts = NotificationOptions & Record<string, unknown>;
  const { showClose, onCloseClick, ...rest } = opts as SvelteNotificationOptions & Record<string, unknown>;
  // showClose 优先于 closable；都未传则 core 默认 true。
  const closable = showClose !== undefined ? showClose : (rest as CoreOpts).closable;
  const coreOpts: NotificationOptions = {
    ...(rest as NotificationOptions),
    ...(closable !== undefined ? { closable } : {}),
    direction: (opts as CoreOpts).direction !== undefined
      ? (opts as CoreOpts).direction as string
      : globalDirection,
  } as NotificationOptions;
  // 若有 onCloseClick，在 onClose 钩子中清理 map（防内存泄漏）。
  if (onCloseClick) {
    const origOnClose = (coreOpts as CoreOpts).onClose as ((id: string, r: unknown) => void) | undefined;
    (coreOpts as CoreOpts).onClose = (closedId: string, reason: unknown) => {
      onCloseClickMap.delete(closedId);
      origOnClose?.(closedId, reason);
    };
  }
  return { coreOpts, onCloseClick };
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

function show(type: NotificationType, opts: SvelteNotificationOptions): string {
  const s = ensureStore();
  void ensureContainer();
  const merged: SvelteNotificationOptions = { ...opts };
  (merged as NotificationOptions).type = type;
  const { coreOpts, onCloseClick } = resolveOpts(merged);
  const id = s.open(coreOpts);
  if (onCloseClick) onCloseClickMap.set(id, onCloseClick);
  return id;
}

export const notification = {
  /**
   * 配置全局通知行为：direction（默认书写方向）、getPopupContainer（容器挂载目标）、
   * top/bottom/left/right/zIndex（容器位置偏移）、duration（全局默认自动关闭秒数）。
   * 命令式单例特性——须在首条通知前调用方对挂载点生效。向后兼容：不调用即 ltr + body。
   */
  config: (cfg: NotificationConfig): void => {
    if (cfg.direction !== undefined) globalDirection = cfg.direction;
    if ('getPopupContainer' in cfg) getPopupContainer = cfg.getPopupContainer;
    if (cfg.duration !== undefined) globalDuration = cfg.duration;
    const next: PositionOffsets = {};
    if (cfg.top !== undefined) next.top = cfg.top;
    if (cfg.bottom !== undefined) next.bottom = cfg.bottom;
    if (cfg.left !== undefined) next.left = cfg.left;
    if (cfg.right !== undefined) next.right = cfg.right;
    if (cfg.zIndex !== undefined) next.zIndex = cfg.zIndex;
    positionOffsets = next;
  },
  /** 完整选项打开一条通知，返回其 id。 */
  open: (opts: SvelteNotificationOptions): string => {
    void ensureContainer();
    const { coreOpts, onCloseClick } = resolveOpts(opts);
    const id = ensureStore().open(coreOpts);
    if (onCloseClick) onCloseClickMap.set(id, onCloseClick);
    return id;
  },
  success: (opts: SvelteNotificationOptions): string => show('success', opts),
  info: (opts: SvelteNotificationOptions): string => show('info', opts),
  warning: (opts: SvelteNotificationOptions): string => show('warning', opts),
  error: (opts: SvelteNotificationOptions): string => show('error', opts),
  /** 手动关闭指定通知。 */
  close: (id: string): void => ensureStore().close(id, 'manual'),
  /** 按同 id 更新一条通知（store.open 对已存在 id 走原地更新 + 重启定时器）。 */
  update: (id: string, opts: SvelteNotificationOptions): string => {
    void ensureContainer();
    const merged: SvelteNotificationOptions = { ...opts };
    (merged as NotificationOptions).id = id;
    const { coreOpts, onCloseClick } = resolveOpts(merged);
    const newId = ensureStore().open(coreOpts);
    if (onCloseClick) onCloseClickMap.set(newId, onCloseClick);
    return newId;
  },
  /** 清空全部通知，或仅清空指定方位。 */
  destroyAll: (placement?: NotificationPlacement): void =>
    ensureStore().destroyAll(placement),
};
