import ModalComponent from './Modal.svelte';
import { modal } from './command.svelte.js';
import type { ModalCommandConfig, ModalCommandHandle } from './command.svelte.js';

type ModalCommands = {
  confirm: (config: ModalCommandConfig) => ModalCommandHandle;
  info: (config: ModalCommandConfig) => ModalCommandHandle;
  success: (config: ModalCommandConfig) => ModalCommandHandle;
  warning: (config: ModalCommandConfig) => ModalCommandHandle;
  error: (config: ModalCommandConfig) => ModalCommandHandle;
};

/**
 * Modal —— 声明式组件 + 命令式工厂（Modal.confirm/info/success/warning/error）。
 * 同时保留独立的 `modal` 对象供解构使用；两者共享同一实现。
 */
export const Modal: typeof ModalComponent & ModalCommands = Object.assign(ModalComponent, {
  confirm: modal.confirm,
  info: modal.info,
  success: modal.success,
  warning: modal.warning,
  error: modal.error,
});

export { meta as modalMeta } from './meta.js';
export {
  modal,
  type ModalCommandConfig,
  type ModalCommandHandle,
} from './command.svelte.js';
