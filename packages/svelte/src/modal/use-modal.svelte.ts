/**
 * Modal.useModal —— 对齐 Semi @douyinfe/semi-ui/modal/useModal。
 * 返回 [modal, holder]：holder.items 传给 <ModalContextHolder {items}/> 渲染到组件树中你希望
 * 继承 context 的位置；命令式 modal.confirm/info/… 创建的 ConfirmModal 在该位置（组件树内）
 * 声明式渲染，从而继承该处的 Svelte context（LocaleProvider / ConfigProvider 等）——解决命令式
 * 弹窗读不到 context 的问题（与 Semi 同理；Semi 用 ReactNode contextHolder，本库因 Svelte
 * snippet 不能在 .ts 内定义，改为 holder.items + <ModalContextHolder>）。
 *
 * 与全局 `modal.confirm`（mount 到 body、脱离 context）的区别：此处在组件树内渲染、继承 context。
 */
import type { ModalCommandConfig, ModalCommandHandle } from './command.svelte.js';

type ConfirmType = 'confirm' | 'info' | 'success' | 'warning' | 'error';

export interface HookModalItem {
  id: number;
  type: ConfirmType;
  config: ModalCommandConfig;
  onClose: () => void;
}

type HookConfirmFn = (config: ModalCommandConfig) => ModalCommandHandle;

export interface ModalHookApi {
  confirm: HookConfirmFn;
  info: HookConfirmFn;
  success: HookConfirmFn;
  warning: HookConfirmFn;
  error: HookConfirmFn;
}

/** holder：传给 <ModalContextHolder {...holder} /> 的响应式弹窗列表载体。 */
export interface ModalHolder {
  readonly items: HookModalItem[];
}

let uuid = 0;

export function useModal(): [ModalHookApi, ModalHolder] {
  const items = $state<HookModalItem[]>([]);

  function remove(id: number): void {
    const idx = items.findIndex((it) => it.id === id);
    if (idx !== -1) items.splice(idx, 1);
  }

  function makeFn(type: ConfirmType, defaults?: Partial<ModalCommandConfig>): HookConfirmFn {
    return (config: ModalCommandConfig): ModalCommandHandle => {
      uuid += 1;
      const id = uuid;
      items.push({
        id,
        type,
        config: { ...defaults, ...config },
        onClose: () => remove(id),
      });
      return {
        destroy: () => remove(id),
        update: (next) => {
          const it = items.find((x) => x.id === id);
          if (it) it.config = { ...it.config, ...next };
        },
      };
    };
  }

  const api: ModalHookApi = {
    confirm: makeFn('confirm', { hasCancel: true }),
    info: makeFn('info'),
    success: makeFn('success'),
    warning: makeFn('warning'),
    error: makeFn('error'),
  };

  return [
    api,
    {
      get items() {
        return items;
      },
    },
  ];
}
