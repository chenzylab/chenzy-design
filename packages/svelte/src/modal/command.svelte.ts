/**
 * modal — 命令式 modal.confirm/info/success/warning/error 入口。
 * 每次调用 mount 一个独立 ConfirmModal 到 body 的临时 host，关闭后 unmount 并移除。
 * z-index 随打开计数递增以支持堆叠。复用基础 Modal（焦点捕获/滚动锁/Esc）。
 * `.svelte.ts` 以使用 $state props 容器支持 update。
 * See specs/components/feedback/Modal.spec.md（命令式工厂）。
 */

type ConfirmType = 'confirm' | 'info' | 'success' | 'warning' | 'error';

export interface ModalCommandConfig {
  title?: string;
  content?: string;
  okText?: string;
  cancelText?: string;
  showCancel?: boolean;
  width?: number | string;
  centered?: boolean;
  /** 返回 Promise 时确认按钮自动 loading，resolve 后关闭、reject 保持打开 */
  onOk?: () => void | Promise<unknown>;
  onCancel?: () => void;
}

export interface ModalCommandHandle {
  /** 立即销毁该弹框 */
  destroy: () => void;
  /** 更新已打开弹框的部分配置 */
  update: (next: Partial<ModalCommandConfig>) => void;
}

// z-index 基线（与 --cd-modal-z 一致），每开一个 +10 以堆叠。
const Z_BASE = 1000;
let openCount = 0;

function noop(): ModalCommandHandle {
  return { destroy: () => {}, update: () => {} };
}

function spawn(type: ConfirmType, config: ModalCommandConfig): ModalCommandHandle {
  if (typeof document === 'undefined') return noop();

  openCount += 1;
  const zIndex = Z_BASE + openCount * 10;

  const host = document.createElement('div');
  host.className = 'cd-modal-command-host';
  document.body.appendChild(host);

  let unmounted = false;
  let api: { destroy: () => void; update: (p: Partial<ModalCommandConfig>) => void } | null = null;

  function cleanup() {
    if (unmounted) return;
    unmounted = true;
    openCount = Math.max(0, openCount - 1);
    api?.destroy();
    if (host.parentNode) host.parentNode.removeChild(host);
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
      ...config,
      zIndex,
      onClose: () => cleanup(),
    });
    const instance = mount(ConfirmModal, { target: host, props });
    api = {
      destroy: () => unmount(instance, { outro: false }),
      update: (p) => Object.assign(props, p),
    };
  })();

  return {
    destroy: cleanup,
    update: (next) => api?.update(next),
  };
}

export const modal = {
  confirm: (config: ModalCommandConfig): ModalCommandHandle =>
    spawn('confirm', { showCancel: true, ...config }),
  info: (config: ModalCommandConfig): ModalCommandHandle => spawn('info', config),
  success: (config: ModalCommandConfig): ModalCommandHandle => spawn('success', config),
  warning: (config: ModalCommandConfig): ModalCommandHandle => spawn('warning', config),
  error: (config: ModalCommandConfig): ModalCommandHandle => spawn('error', config),
};
