/**
 * modal — 命令式 modal.confirm/info/success/warning/error 入口。
 * 每次调用 mount 一个独立 ConfirmModal 到 body 的临时 host，关闭后 unmount 并移除。
 * z-index 随打开计数递增以支持堆叠。复用基础 Modal（焦点捕获/滚动锁/Esc）。
 * `.svelte.ts` 以使用 $state props 容器支持 update。
 * See specs/components/feedback/Modal.spec.md（命令式工厂）。
 */

import { acquireZIndex } from './z-stack.js';

type ConfirmType = 'confirm' | 'info' | 'success' | 'warning' | 'error';

// Module-level registry of all active handles for destroyAll()
const activeHandles = new Set<ModalCommandHandle>();

export interface ModalCommandConfig {
  title?: string;
  content?: string;
  okText?: string;
  cancelText?: string;
  okType?: 'primary' | 'secondary' | 'tertiary' | 'warning' | 'danger';
  /** 是否显示取消按钮（对齐 Semi hasCancel；confirm 默认 true，其余默认 false） */
  hasCancel?: boolean;
  width?: number | string;
  height?: number | string;
  centered?: boolean;
  /** 是否显示右上角关闭按钮。对齐 Semi closable。 */
  closable?: boolean;
  /** 确认按钮 loading（显式受控；缺省时异步 onOk 自动 pending loading）。对齐 Semi confirmLoading。 */
  confirmLoading?: boolean;
  /** 底部按钮撑满。对齐 Semi footerFill。 */
  footerFill?: boolean;
  /** 是否显示遮罩。对齐 Semi mask。 */
  mask?: boolean;
  /** 点遮罩关闭。对齐 Semi maskClosable。 */
  maskClosable?: boolean;
  /** 遮罩内联样式。对齐 Semi maskStyle。 */
  maskStyle?: string;
  /** 内容区内联样式。对齐 Semi bodyStyle。 */
  bodyStyle?: string;
  /** 根节点内联样式。对齐 Semi style。 */
  style?: string;
  /** 根节点类名。对齐 Semi className（本库 Svelte 惯例用 class）。 */
  class?: string;
  /** 内容区类名。对齐 Semi modalContentClass。 */
  modalContentClass?: string;
  zIndex?: number;
  okButtonProps?: Record<string, unknown>;
  cancelButtonProps?: Record<string, unknown>;
  /** 自定义类型图标（SVG 字符串或 Snippet 场景由渲染层处理；命令式传 svg 字符串） */
  icon?: string;
  /** 返回 Promise 时确认按钮自动 loading，resolve 后关闭、reject 保持打开 */
  onOk?: () => unknown;
  /** 返回 Promise 时取消按钮自动 loading，resolve 后关闭、reject 保持打开 */
  onCancel?: () => unknown;
}

export interface ModalCommandHandle {
  /** 立即销毁该弹框 */
  destroy: () => void;
  /** 更新已打开弹框的部分配置 */
  update: (next: Partial<ModalCommandConfig>) => void;
}

function noop(): ModalCommandHandle {
  return { destroy: () => {}, update: () => {} };
}

function spawn(type: ConfirmType, config: ModalCommandConfig): ModalCommandHandle {
  if (typeof document === 'undefined') return noop();

  const { zIndex, release } = acquireZIndex();

  const host = document.createElement('div');
  host.className = 'cd-modal-command-host';
  document.body.appendChild(host);

  let unmounted = false;
  let api: { destroy: () => void; update: (p: Partial<ModalCommandConfig>) => void } | null = null;

  function cleanup() {
    if (unmounted) return;
    unmounted = true;
    release();
    api?.destroy();
    if (host.parentNode) host.parentNode.removeChild(host);
    activeHandles.delete(handle);
  }

  void (async () => {
    const { mount, unmount } = await import('svelte');
    const { default: ConfirmModal } = await import('./ConfirmModal.svelte');
    if (unmounted) {
      if (host.parentNode) host.parentNode.removeChild(host);
      return;
    }
    const props = $state({
      type,
      // 用户显式传 zIndex 优先，否则用堆叠计数器分配值。
      zIndex,
      ...config,
      onClose: () => cleanup(),
    });
    const instance = mount(ConfirmModal, { target: host, props });
    api = {
      destroy: () => unmount(instance, { outro: false }),
      update: (p) => Object.assign(props, p),
    };
  })();

  const handle: ModalCommandHandle = {
    destroy: cleanup,
    update: (next) => api?.update(next),
  };
  activeHandles.add(handle);
  return handle;
}

export function destroyAll(): void {
  for (const handle of [...activeHandles]) {
    handle.destroy();
  }
}

export const modal = {
  confirm: (config: ModalCommandConfig): ModalCommandHandle =>
    spawn('confirm', { hasCancel: true, ...config }),
  info: (config: ModalCommandConfig): ModalCommandHandle => spawn('info', config),
  success: (config: ModalCommandConfig): ModalCommandHandle => spawn('success', config),
  warning: (config: ModalCommandConfig): ModalCommandHandle => spawn('warning', config),
  error: (config: ModalCommandConfig): ModalCommandHandle => spawn('error', config),
  destroyAll,
};
