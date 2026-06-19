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

let store: ToastStore | null = null;
let containerMounted = false;

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
  return s.add({ content, type, ...opts });
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
    return ensureStore().add(opts);
  },
  /** 手动关闭指定 toast。 */
  close: (id: string): void => ensureStore().remove(id, 'manual'),
  /** 按同 id 更新一条 toast（store.add 对已存在 id 走原地更新 + 重启定时器）。 */
  update: (id: string, opts: Partial<ToastOptions>): string => {
    void ensureContainer();
    return ensureStore().add({ ...opts, id, content: opts.content ?? '' });
  },
  /** 清空全部 toast。 */
  destroyAll: (): void => ensureStore().removeAll(),
};
