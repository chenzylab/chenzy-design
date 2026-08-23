/**
 * Toast 命令式入口共享的类型与工具，供 toast.ts（全局单例 + ToastFactory）与
 * useToast.ts（Hook）共用，避免二者互相 import 造成循环依赖。
 */
import { getGlobalDefaults, type ToastOptions } from '@chenzy-design/core';

/**
 * Svelte 命令式选项（对齐 Semi ToastReactProps）。content/icon 可为 string 文本或
 * Svelte Snippet（对齐 Semi ReactNode）。允许传 string 简写（对齐 Semi info(opts|string)）。
 * 额外的 getPopupContainer（per-toast）：首条 toast 的该值决定容器挂载点（对齐 Semi）。
 */
export type SvelteToastOptions = Omit<ToastOptions, 'type'> & {
  getPopupContainer?: () => HTMLElement | null | undefined;
};

/** info/success/warning/error（含 useToast 的 open）的入参：完整 options 或 string 简写。 */
export type OptsOrString = SvelteToastOptions | string;

export function toOptions(input: OptsOrString): SvelteToastOptions {
  const own = typeof input === 'string' ? { content: input } : input;
  // cdGlobal 全局默认 props（对齐 Semi：命令式入口读 semiGlobal 的 overrideDefaultProps.Toast
  // 再与用户 options 合并）。用户显式传的键恒覆盖全局默认。
  return { ...getGlobalDefaults('Toast'), ...own } as SvelteToastOptions;
}
