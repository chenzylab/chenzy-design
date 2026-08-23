/**
 * useToast — Svelte 版 Hook（对齐 Semi semi-ui/toast/useToast/index.tsx）。
 * 局部创建独立的 store + contextHolder，使经此 api 创建的 toast 渲染在 holder
 * 所在的组件树位置，继承该处上下文（如 LocaleProvider）。与全局单例（toast.ts）不同：
 * 本 Hook 的 store 与容器是局部的，不挂 body、不带 fixed wrapper（经 ToastHolder 渲染，
 * 对齐 Semi useToast/HookToast.tsx 不带 fixed wrapper 直接渲染卡片本身）。
 *
 * 用法：
 *   const [toast, contextHolder] = useToast();
 *   // 模板中：<ToastHolder store={contextHolder} />
 *   // 事件中：toast.success({ content })
 */
import { createToastStore, type ToastStore, type ToastOptions, type ToastType } from '@chenzy-design/core';
import { toOptions, type OptsOrString } from './shared.js';

/** useToast() 返回的 api（对齐 Semi：info/success/warning/error/open/close）。 */
export interface ToastHookApi {
  info: (opts: OptsOrString) => string;
  success: (opts: OptsOrString) => string;
  warning: (opts: OptsOrString) => string;
  error: (opts: OptsOrString) => string;
  /** 展示一条 type=default 的 toast（对齐 Semi useToast 的 open，顶层 Toast 无此方法）。 */
  open: (opts: OptsOrString) => string;
  close: (id: string) => void;
}

export function useToast(): [ToastHookApi, ToastStore] {
  const localStore = createToastStore({ defaultDuration: 3 });
  function localShow(type: ToastType, input: OptsOrString): string {
    const opts = toOptions(input);
    const core = { ...opts, type } as ToastOptions;
    if (opts.id && localStore.has(opts.id)) {
      localStore.update(opts.id, core);
      return opts.id;
    }
    return localStore.add(core);
  }
  const api: ToastHookApi = {
    info: (opts) => localShow('info', opts),
    success: (opts) => localShow('success', opts),
    warning: (opts) => localShow('warning', opts),
    error: (opts) => localShow('error', opts),
    open: (opts) => localShow('default', opts),
    close: (id) => localStore.remove(id),
  };
  return [api, localStore];
}
