<!--
  ConfirmModal — 命令式 modal.confirm/info/... 的渲染外壳。
  包装基础 Modal，加类型图标 + 标题/内容；onOk 返回 Promise 时自动 confirmLoading，
  resolve 后关闭、reject 复位保持打开。仅供 command.ts mount 使用，不在 barrel 暴露为组件。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { Modal } from './index.js';
  import { Button } from '../button/index.js';
  import { useLocale } from '../locale-provider/index.js';

  type ConfirmType = 'confirm' | 'info' | 'success' | 'warning' | 'error';

  interface Props {
    type?: ConfirmType;
    title?: string;
    content?: string;
    okText?: string;
    cancelText?: string;
    /** confirm 显示取消按钮；info/success/warning/error 默认单按钮 */
    showCancel?: boolean;
    width?: number | string;
    centered?: boolean;
    zIndex?: number;
    /** 返回 Promise 时自动 loading，resolve 关闭 / reject 复位 */
    onOk?: () => void | Promise<unknown>;
    onCancel?: () => void;
    /** 关闭动画结束后由宿主卸载用 */
    onClose?: () => void;
    /** 自定义图标（Snippet），覆盖内置类型图标 */
    icon?: Snippet;
  }

  let {
    type = 'confirm',
    title,
    content,
    okText,
    cancelText,
    showCancel = type === 'confirm',
    width = 416,
    centered = true,
    zIndex,
    onOk,
    onCancel,
    onClose,
    icon,
  }: Props = $props();

  const loc = useLocale();

  let open = $state(true);
  let loading = $state(false);

  const okType = $derived<'primary' | 'danger'>(
    type === 'error' || type === 'warning' ? 'danger' : 'primary',
  );

  function close() {
    open = false;
    // 静态显示无动画，关闭后下一微任务通知宿主卸载
    queueMicrotask(() => onClose?.());
  }

  async function handleOk() {
    if (loading) return;
    const result = onOk?.();
    if (result instanceof Promise) {
      loading = true;
      try {
        await result;
        close();
      } catch {
        loading = false; // reject：复位，保持打开
      }
    } else {
      close();
    }
  }

  function handleCancel() {
    onCancel?.();
    close();
  }
</script>

<div class="cd-confirm-modal" style={zIndex !== undefined ? `--cd-modal-z:${zIndex}` : undefined}>
  <Modal
    {open}
    title={title ?? ''}
    {width}
    {centered}
    closable={false}
    maskClosable={false}
    confirmLoading={loading}
    onOk={handleOk}
    onCancel={handleCancel}
  >
    {#snippet footer()}
      {#if showCancel}
        <Button onclick={handleCancel} disabled={loading}>
          {cancelText ?? loc().t('Modal.cancelText')}
        </Button>
      {/if}
      <Button type={okType} loading={loading} onclick={handleOk}>
        {okText ?? loc().t('Modal.okText')}
      </Button>
    {/snippet}
    <div class="cd-confirm-modal__body">
      <span class="cd-confirm-modal__icon cd-confirm-modal__icon--{type}" aria-hidden="true">
        {#if icon}
          {@render icon()}
        {:else if type === 'success'}
          <svg width="22" height="22" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5" />
            <path d="M5 8.2 7 10.2 11 5.8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        {:else if type === 'error'}
          <svg width="22" height="22" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5" />
            <path d="M5.5 5.5 10.5 10.5M10.5 5.5 5.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        {:else if type === 'warning' || type === 'confirm'}
          <svg width="22" height="22" viewBox="0 0 16 16" fill="none">
            <path d="M8 2 1.5 13.5h13L8 2Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
            <path d="M8 6.3v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            <circle cx="8" cy="11.4" r="0.85" fill="currentColor" />
          </svg>
        {:else}
          <svg width="22" height="22" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5" />
            <path d="M8 7.2v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            <circle cx="8" cy="4.7" r="0.9" fill="currentColor" />
          </svg>
        {/if}
      </span>
      {#if content}
        <p class="cd-confirm-modal__content">{content}</p>
      {/if}
    </div>
  </Modal>
</div>

<style>
  .cd-confirm-modal__body {
    display: flex;
    gap: var(--cd-spacing-3);
    align-items: flex-start;
  }
  .cd-confirm-modal__icon {
    display: inline-flex;
    flex-shrink: 0;
    line-height: 1;
  }
  .cd-confirm-modal__icon--success {
    color: var(--cd-color-success);
  }
  .cd-confirm-modal__icon--error {
    color: var(--cd-color-danger);
  }
  .cd-confirm-modal__icon--warning,
  .cd-confirm-modal__icon--confirm {
    color: var(--cd-color-warning);
  }
  .cd-confirm-modal__icon--info {
    color: var(--cd-color-primary);
  }
  .cd-confirm-modal__content {
    margin: 0;
    color: var(--cd-color-text-1);
    line-height: 1.6;
  }
</style>
