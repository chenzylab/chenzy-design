/**
 * Toast — 命令式全局轻提示入口，严格对齐 Semi Design（semi-ui/toast/index.tsx 的
 * ToastList 静态方法 + ToastFactory）。
 * 每个 Toast 实例 = 模块级单例 store + 惰性挂载的单例 ToastContainer（首次调用时
 * mount 到 getPopupContainer() 或 body）。复用 @chenzy-design/core 的 createToastStore
 * （无框架依赖的队列 + 定时器，语义对齐 Semi foundation）。
 *
 * 对齐 Semi 顶层静态 API：info/success/warning/error/close/destroyAll/config
 * （Semi ToastList 无 open——open 只存在于 useToast() 返回的 hook api，见 useToast.ts）。
 * ToastFactory.create(config) 创建带独立 config 的新 Toast（对齐 Semi ToastFactory.create）。
 * See semi-ui/toast/index.tsx
 */
import {
  createToastStore,
  type ToastStore,
  type ToastOptions,
  type ToastType,
  type ToastTheme,
} from '@chenzy-design/core';
import { toOptions, type SvelteToastOptions, type OptsOrString } from './shared.js';
import { useToast } from './useToast.js';

/**
 * 全局配置（对齐 Semi ConfigProps）。容器经 mount() 挂在 Svelte 组件树之外，拿不到
 * ConfigProvider context，故位置偏移 / 挂载容器 / 默认值只能经此命令式入口配置：
 *  - top/bottom/left/right：wrapper 与视口边缘的偏移（CSS 值或数字像素）。
 *  - zIndex：wrapper z-index（对齐 Semi，默认 1010）。
 *  - theme：默认卡片主题（normal/light）。
 *  - duration：默认自动关闭秒数（0 = 常驻），可被单条 options.duration 覆盖。
 *  - getPopupContainer：容器宿主挂载目标（默认 body，对齐 Semi getPopupContainer）。
 */
export interface ToastConfig {
  top?: number | string;
  bottom?: number | string;
  left?: number | string;
  right?: number | string;
  zIndex?: number;
  theme?: ToastTheme;
  duration?: number;
  getPopupContainer?: () => HTMLElement | null | undefined;
}

export type { SvelteToastOptions, OptsOrString };

/** 位置偏移 + zIndex，供 ToastContainer 读取注入 wrapper inline style。 */
export type ToastPositionConfig = Pick<
  ToastConfig,
  'top' | 'bottom' | 'left' | 'right' | 'zIndex'
>;

/** 一个 Toast 实例的公开 API（对齐 Semi ToastList 静态方法集，无 open）。 */
export interface ToastInstanceApi {
  info: (opts: OptsOrString) => string;
  success: (opts: OptsOrString) => string;
  warning: (opts: OptsOrString) => string;
  error: (opts: OptsOrString) => string;
  close: (id: string) => void;
  destroyAll: () => void;
  config: (cfg: ToastConfig) => void;
}

/**
 * 创建一个 Toast 实例（默认单例与 ToastFactory.create 共用同一构造）。
 * 每个实例持有独立的 store、容器挂载状态、全局配置与位置偏移。
 */
function createToastInstance(initialConfig: ToastConfig = {}): ToastInstanceApi & {
  /** 供 ToastContainer 读取的位置配置 getter（挂在实例上，闭包隔离多实例）。 */
  __getPositionConfig: () => ToastPositionConfig;
} {
  let store: ToastStore | null = null;
  let containerMounted = false;
  let globalDuration = initialConfig.duration;
  let globalTheme = initialConfig.theme;
  let getPopupContainer = initialConfig.getPopupContainer;
  let positionConfig: ToastPositionConfig = {};
  {
    // 只放入 initialConfig 显式提供的键（避免 exactOptionalPropertyTypes 下写入 undefined 值）。
    if (initialConfig.top !== undefined) positionConfig.top = initialConfig.top;
    if (initialConfig.bottom !== undefined) positionConfig.bottom = initialConfig.bottom;
    if (initialConfig.left !== undefined) positionConfig.left = initialConfig.left;
    if (initialConfig.right !== undefined) positionConfig.right = initialConfig.right;
    if (initialConfig.zIndex !== undefined) positionConfig.zIndex = initialConfig.zIndex;
  }

  function ensureStore(): ToastStore {
    if (!store) {
      store = createToastStore({
        defaultDuration: globalDuration ?? 3,
        defaultTheme: globalTheme ?? 'normal',
      });
    }
    return store;
  }

  const getPositionConfig = (): ToastPositionConfig => positionConfig;

  async function ensureContainer(): Promise<void> {
    if (containerMounted || typeof document === 'undefined') return;
    containerMounted = true;
    const { mount } = await import('svelte');
    const { default: ToastContainer } = await import('./ToastContainer.svelte');
    const host = document.createElement('div');
    host.className = 'cd-toast-host';
    const target = getPopupContainer?.() ?? document.body;
    target.appendChild(host);
    mount(ToastContainer, {
      target: host,
      props: { store: ensureStore(), getPositionConfig },
    });
  }

  /** 剥离 getPopupContainer（仅首次挂载用，不进入 core item）。 */
  function toCoreOpts(opts: SvelteToastOptions): ToastOptions {
    const core = { ...opts } as SvelteToastOptions & { getPopupContainer?: unknown };
    delete core.getPopupContainer;
    return core as ToastOptions;
  }

  function show(type: ToastType, input: OptsOrString): string {
    const opts = toOptions(input);
    // 首条 toast 的 getPopupContainer 决定容器挂载点（对齐 Semi create）。
    if (!containerMounted && opts.getPopupContainer) getPopupContainer = opts.getPopupContainer;
    void ensureContainer();
    const s = ensureStore();
    const core = { ...toCoreOpts(opts), type };
    // 对齐 Semi create：已存在 id → 原地合并更新（restart timer），否则新增。
    if (opts.id && s.has(opts.id)) {
      s.update(opts.id, core);
      return opts.id;
    }
    return s.add(core);
  }

  function config(cfg: ToastConfig): void {
    if (cfg.duration !== undefined) globalDuration = cfg.duration;
    if (cfg.theme !== undefined) globalTheme = cfg.theme;
    if ('getPopupContainer' in cfg) getPopupContainer = cfg.getPopupContainer;
    const next: ToastPositionConfig = { ...positionConfig };
    if (cfg.top !== undefined) next.top = cfg.top;
    if (cfg.bottom !== undefined) next.bottom = cfg.bottom;
    if (cfg.left !== undefined) next.left = cfg.left;
    if (cfg.right !== undefined) next.right = cfg.right;
    if (cfg.zIndex !== undefined) next.zIndex = cfg.zIndex;
    positionConfig = next;
  }

  return {
    info: (opts) => show('info', opts),
    success: (opts) => show('success', opts),
    warning: (opts) => show('warning', opts),
    error: (opts) => show('error', opts),
    close: (id) => ensureStore().remove(id),
    destroyAll: () => ensureStore().removeAll(),
    config,
    __getPositionConfig: getPositionConfig,
  };
}

// —— 默认单例实例（对齐 Semi 默认导出的 Toast）——
const defaultInstance = createToastInstance();

/**
 * 默认全局 Toast（对齐 Semi 默认导出）。含 useToast Hook（挂静态方法上，对齐 Semi Toast.useToast）。
 */
export const Toast: ToastInstanceApi & {
  useToast: typeof useToast;
} = {
  info: defaultInstance.info,
  success: defaultInstance.success,
  warning: defaultInstance.warning,
  error: defaultInstance.error,
  close: defaultInstance.close,
  destroyAll: defaultInstance.destroyAll,
  config: defaultInstance.config,
  useToast,
};

/**
 * ToastFactory.create(config) — 创建带独立 config 的新 Toast（对齐 Semi ToastFactory.create）。
 * 常用于覆盖全局配置（如 getPopupContainer 指定自定义容器）。返回的实例含 useToast。
 */
export const ToastFactory = {
  create(config?: ToastConfig): ToastInstanceApi & { useToast: typeof useToast } {
    const inst = createToastInstance(config ?? {});
    return {
      info: inst.info,
      success: inst.success,
      warning: inst.warning,
      error: inst.error,
      close: inst.close,
      destroyAll: inst.destroyAll,
      config: inst.config,
      useToast,
    };
  },
};

// 供默认容器读取默认实例的位置配置。
export function getToastConfig(): ToastPositionConfig {
  return defaultInstance.__getPositionConfig();
}

export type { ToastHookApi } from './useToast.js';
export { useToast };
