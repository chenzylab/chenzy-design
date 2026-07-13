<!--
  ConfirmModal — 命令式 modal.confirm/info/success/warning/error 的渲染外壳，
  严格镜像 Semi @douyinfe/semi-ui/modal/ConfirmModal。包裹基础 Modal，加 confirm class、
  类型图标（本库 @chenzy-design/icons 具名图标）+ title-text + content。
  onOk 返回 Promise 时自动 confirmLoading，resolve 后关闭、reject 复位保持打开（对齐 Semi）。
  仅供 command.svelte.ts mount 使用，不在 barrel 暴露为组件。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import {
    Icon,
    IconInfoCircle,
    IconTickCircle,
    IconAlertTriangle,
    IconAlertCircle,
    IconHelpCircle,
  } from '@chenzy-design/icons';
  import { Modal } from './index.js';

  type ConfirmType = 'confirm' | 'info' | 'success' | 'warning' | 'error';

  interface Props {
    type?: ConfirmType;
    title?: string;
    content?: string;
    okText?: string;
    cancelText?: string;
    okType?: 'primary' | 'secondary' | 'tertiary' | 'warning' | 'danger';
    /** confirm 显示取消按钮；info/success/warning/error 默认单按钮 */
    hasCancel?: boolean;
    width?: number | string;
    centered?: boolean;
    okButtonProps?: Record<string, unknown>;
    cancelButtonProps?: Record<string, unknown>;
    zIndex?: number;
    /** 返回 Promise 时自动 loading，resolve 关闭 / reject 复位 */
    onOk?: () => void | Promise<unknown>;
    onCancel?: () => void;
    /** 关闭后由宿主卸载用 */
    onClose?: () => void;
    /** 自定义图标：命令式传 svg 字符串，声明式可传 Snippet；覆盖内置类型图标 */
    icon?: string | Snippet;
  }

  let {
    type = 'confirm',
    title,
    content,
    okText,
    cancelText,
    okType,
    hasCancel = type === 'confirm',
    width = 420,
    centered = true,
    okButtonProps,
    cancelButtonProps,
    zIndex,
    onOk,
    onCancel,
    onClose,
    icon,
  }: Props = $props();

  let visible = $state(true);
  let loading = $state(false);

  // error/warning 用 danger 确认按钮（对齐 Semi withError okButtonProps.type='danger'）。
  const effectiveOkType = $derived(okType ?? (type === 'error' || type === 'warning' ? 'danger' : 'primary'));

  const iconIsString = $derived(typeof icon === 'string');

  // 仅透传已定义的可选 props（exactOptionalPropertyTypes：避免显式 undefined）。
  const optionalProps = $derived({
    ...(okText !== undefined ? { okText } : {}),
    ...(cancelText !== undefined ? { cancelText } : {}),
    ...(okButtonProps !== undefined ? { okButtonProps } : {}),
    ...(cancelButtonProps !== undefined ? { cancelButtonProps } : {}),
    ...(zIndex !== undefined ? { zIndex } : {}),
  });

  function close() {
    visible = false;
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

<Modal
  class="cd-modal-confirm"
  {visible}
  {width}
  {centered}
  closable={false}
  maskClosable={false}
  confirmLoading={loading}
  okType={effectiveOkType}
  {hasCancel}
  onOk={handleOk}
  onCancel={handleCancel}
  {...optionalProps}
>
  {#snippet header()}
    <!-- confirm 头部：icon-wrapper（类型图标）+ title-text，margin-bottom 更紧凑（对齐 Semi confirm header）。 -->
    <div class="cd-modal-header cd-modal-confirm-header">
      <span class="cd-modal-icon-wrapper cd-modal-confirm-icon cd-modal-{type}-icon">
        {#if iconIsString}
          <Icon svg={icon as string} size="extra-large" />
        {:else if icon}
          {@render (icon as Snippet)()}
        {:else if type === 'info'}
          <IconInfoCircle size="extra-large" />
        {:else if type === 'success'}
          <IconTickCircle size="extra-large" />
        {:else if type === 'warning'}
          <IconAlertTriangle size="extra-large" />
        {:else if type === 'error'}
          <IconAlertCircle size="extra-large" />
        {:else}
          <IconHelpCircle size="extra-large" />
        {/if}
      </span>
      {#if title != null}
        <span class="cd-modal-confirm-title-text">{title}</span>
      {/if}
    </div>
  {/snippet}
  {#if content}
    <div class="cd-modal-confirm-content cd-modal-confirm-content-withIcon">{content}</div>
  {/if}
</Modal>

<style>
  /* confirm 头部：更紧凑的底部间距（对齐 Semi $spacing-modal_confirm_header-marginBottom = 8px）。 */
  :global(.cd-modal-confirm-header) {
    align-items: center;
    margin-bottom: var(--cd-spacing-modal-confirm-header-marginbottom) !important;
  }
  :global(.cd-modal-confirm-icon) {
    display: inline-flex;
    margin-right: var(--cd-spacing-modal-confirm-icon-wrapper-marginright);
  }
  /* 类型图标色（对齐 Semi $color-modal_*-icon） */
  :global(.cd-modal-info-icon) {
    color: var(--cd-color-modal-info-icon);
  }
  :global(.cd-modal-success-icon) {
    color: var(--cd-color-modal-success-icon);
  }
  :global(.cd-modal-error-icon) {
    color: var(--cd-color-modal-danger-icon);
  }
  :global(.cd-modal-warning-icon),
  :global(.cd-modal-confirm-icon.cd-modal-confirm-icon) {
    color: var(--cd-color-modal-warning-icon);
  }
  :global(.cd-modal-warning-icon) {
    color: var(--cd-color-modal-warning-icon);
  }
  :global(.cd-modal-confirm-title-text) {
    font-size: var(--cd-font-modal-header-fontsize);
    font-weight: var(--cd-font-modal-header-fontweight);
    color: var(--cd-color-modal-main-text);
  }
  :global(.cd-modal-confirm-content) {
    color: var(--cd-color-modal-main-text);
    line-height: 1.6;
  }
  :global(.cd-modal-confirm-content-withIcon) {
    margin-left: var(--cd-spacing-modal-content-withicon-marginleft);
  }
</style>
