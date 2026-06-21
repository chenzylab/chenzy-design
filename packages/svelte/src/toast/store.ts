/**
 * Toast — 命令式全局轻提示入口。
 * 模块级单例 store + 惰性挂载的单例 ToastContainer（首次调用时 mount 到 body）。
 * 复用 @chenzy-design/core 的 createToastStore（无框架依赖的队列 + 定时器）。
 * See specs/components/feedback/Toast.spec.md
 */
import {
  createToastStore,
  type ToastStore,
  type ToastOptions,
  type ToastType,
} from '@chenzy-design/core';
import { createLocale, en_US, type LocaleApi } from '@chenzy-design/locale';
import { announce } from './live-region.js';

let store: ToastStore | null = null;
let containerMounted = false;

// promise 默认文案的回退 locale（与 useLocale 一致用 en_US 构造，模块级单例）。
// 命令式入口在组件树之外，拿不到 LocaleProvider context，故默认文案走此回退实例；
// 调用方可经 messages 显式覆盖任一文案。
let fallbackLocale: LocaleApi | undefined;
function getFallbackLocale(): LocaleApi {
  if (!fallbackLocale) fallbackLocale = createLocale({ locale: en_US });
  return fallbackLocale;
}

function ensureStore(): ToastStore {
  if (!store) store = createToastStore({ maxCount: 5, defaultDuration: 3 });
  return store;
}

/**
 * 惰性挂载容器：首次调用时动态 import + mount ToastContainer 到 body。
 * mount 是 async（动态 import），但调用方的 s.add 已同步把数据写进 store；
 * 容器在 mount 时立即同步读一次 store.getToasts()，不会丢首条 toast。
 */
async function ensureContainer(): Promise<void> {
  if (containerMounted || typeof document === 'undefined') return;
  containerMounted = true;
  const { mount } = await import('svelte');
  const { default: ToastContainer } = await import('./ToastContainer.svelte');
  const host = document.createElement('div');
  host.className = 'cd-toast-host';
  document.body.appendChild(host);
  mount(ToastContainer, { target: host, props: { store: ensureStore() } });
}

function show(
  type: ToastType,
  content: string,
  opts: Partial<Omit<ToastOptions, 'content'>> = {},
): string {
  const s = ensureStore();
  void ensureContainer();
  const id = s.add({ content, type, ...opts });
  // a11y：把文案写入单例 live region 供屏幕阅读器播报（卡片本身不再带 role/aria-live）。
  announce(content, type);
  return id;
}

/**
 * Toast.promise 文案：可为静态字符串，或接收 resolve 值 / reject 原因的函数（对齐 sonner / AntD）。
 */
type PromiseMessage<T> = string | ((value: T) => string);

export interface ToastPromiseMessages<T> {
  /** pending 阶段文案；省略走 locale 默认 promiseLoading */
  loading?: string;
  /** resolve 文案；省略走 locale 默认 promiseSuccess */
  success?: PromiseMessage<T>;
  /** reject 文案；省略走 locale 默认 promiseError */
  error?: PromiseMessage<unknown>;
}

/** 透传给底层 toast 的额外选项（position/theme/duration 等），content/type 由 promise 阶段接管。 */
type PromiseToastOptions = Partial<Omit<ToastOptions, 'content' | 'type' | 'id'>>;

function resolveMessage<T>(msg: PromiseMessage<T> | undefined, value: T, fallback: string): string {
  if (msg === undefined) return fallback;
  return typeof msg === 'function' ? msg(value) : msg;
}

export const Toast = {
  info: (content: string, opts?: Partial<Omit<ToastOptions, 'content'>>) =>
    show('info', content, opts),
  success: (content: string, opts?: Partial<Omit<ToastOptions, 'content'>>) =>
    show('success', content, opts),
  warning: (content: string, opts?: Partial<Omit<ToastOptions, 'content'>>) =>
    show('warning', content, opts),
  error: (content: string, opts?: Partial<Omit<ToastOptions, 'content'>>) =>
    show('error', content, opts),
  loading: (content: string, opts?: Partial<Omit<ToastOptions, 'content'>>) =>
    show('loading', content, opts),
  /** 完整选项打开一条 toast，返回其 id。 */
  open: (opts: ToastOptions): string => {
    void ensureContainer();
    const id = ensureStore().add(opts);
    announce(opts.content, opts.type ?? 'info');
    return id;
  },
  /**
   * promise API：传入 Promise，pending 显示 loading toast，resolve→success、reject→error 切文案。
   * 返回原 Promise 以便继续链式/await（对齐 sonner / AntD message.promise）。
   *
   * 红线 #3：单条 toast 经同 id update 命令式切换状态（loading→success/error），
   * 计时由底层 store 接管（loading 持久 duration:0，success/error 用默认 3s 自动关闭）；
   * .then/.catch 是 Promise 自身的生命周期回调，无需额外手动 cleanup（toast 自身定时器在 store 内 cleanup）。
   * 默认文案经 @chenzy-design/locale（回退 en_US，无 Provider context）；调用方可经 messages 覆盖。
   */
  promise: <T>(
    promise: Promise<T>,
    messages: ToastPromiseMessages<T> = {},
    opts: PromiseToastOptions = {},
  ): Promise<T> => {
    const s = ensureStore();
    void ensureContainer();
    const t = getFallbackLocale().t;
    const loadingText = messages.loading ?? t('Toast.promiseLoading');
    // loading 阶段：持久（duration 0），不可关闭，交给 resolve/reject 接管。
    const id = s.add({
      ...opts,
      content: loadingText,
      type: 'loading',
      duration: 0,
      closable: opts.closable ?? false,
    });
    announce(loadingText, 'loading');

    const settle = (type: ToastType, content: string): void => {
      // 同 id update：原地把 loading 切为 success/error 并重启定时器（默认 3s 自动关闭）。
      s.add({ ...opts, id, content, type });
      announce(content, type);
    };

    return promise.then(
      (value) => {
        settle('success', resolveMessage(messages.success, value, t('Toast.promiseSuccess')));
        return value;
      },
      (reason: unknown) => {
        settle('error', resolveMessage(messages.error, reason, t('Toast.promiseError')));
        throw reason;
      },
    );
  },
  /** 手动关闭指定 toast。 */
  close: (id: string): void => ensureStore().remove(id, 'manual'),
  /** 按同 id 更新一条 toast（store.add 对已存在 id 走原地更新 + 重启定时器）。 */
  update: (id: string, opts: Partial<ToastOptions>): string => {
    void ensureContainer();
    const content = opts.content ?? '';
    const result = ensureStore().add({ ...opts, id, content });
    // 仅在有新文案时播报，避免空字符串无意义地刷新 region。
    if (content) announce(content, opts.type ?? 'info');
    return result;
  },
  /** 清空全部 toast。 */
  destroyAll: (): void => ensureStore().removeAll(),
};
