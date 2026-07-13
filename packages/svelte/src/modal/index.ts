import ModalComponent from './Modal.svelte';
import { modal, destroyAll } from './command.svelte.js';
import { useModal } from './use-modal.svelte.js';
import type { ModalCommandConfig, ModalCommandHandle } from './command.svelte.js';
import type { ModalHookApi, ModalHolder } from './use-modal.svelte.js';

type ModalCommands = {
  confirm: (config: ModalCommandConfig) => ModalCommandHandle;
  info: (config: ModalCommandConfig) => ModalCommandHandle;
  success: (config: ModalCommandConfig) => ModalCommandHandle;
  warning: (config: ModalCommandConfig) => ModalCommandHandle;
  error: (config: ModalCommandConfig) => ModalCommandHandle;
  destroyAll: () => void;
  useModal: () => [ModalHookApi, ModalHolder];
};

/**
 * Modal —— 声明式组件 + 命令式工厂（Modal.confirm/info/success/warning/error/destroyAll）
 * + Modal.useModal（对齐 Semi，命令式弹窗继承 context）。
 * 同时保留独立的 `modal` 对象供解构使用；两者共享同一实现。
 */
export const Modal: typeof ModalComponent & ModalCommands = Object.assign(ModalComponent, {
  confirm: modal.confirm,
  info: modal.info,
  success: modal.success,
  warning: modal.warning,
  error: modal.error,
  destroyAll,
  useModal,
});

export { default as ModalContextHolder } from './ModalContextHolder.svelte';
export { meta as modalMeta } from './meta.js';
export {
  modal,
  type ModalCommandConfig,
  type ModalCommandHandle,
} from './command.svelte.js';
export { useModal, type ModalHookApi, type ModalHolder, type HookModalItem } from './use-modal.svelte.js';
