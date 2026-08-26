<!--
  ConfirmModal — 命令式 modal.confirm/info/success/warning/error 的渲染外壳，
  严格镜像 Semi @douyinfe/semi-ui/modal/ConfirmModal。包裹基础 Modal，加 confirm class、
  类型图标（本库 @chenzy-design/icons 具名图标）+ title-text + content。
  onOk 返回 Promise 时自动 confirmLoading，resolve 后关闭、reject 复位保持打开（对齐 Semi）。
  仅供 command.svelte.ts mount 使用，不在 barrel 暴露为组件。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { Icon } from '@chenzy-design/icons';
  import { Modal } from './index.js';
  import { confirmTypeConfig } from './confirm.js';

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
    height?: number | string;
    centered?: boolean;
    /** 右上角关闭按钮（对齐 Semi 命令式走 Modal 默认 true） */
    closable?: boolean;
    /** 显式确认按钮 loading（缺省时异步 onOk 自动 pending loading） */
    confirmLoading?: boolean;
    footerFill?: boolean;
    mask?: boolean;
    /** 点遮罩关闭（对齐 Semi 命令式走 Modal 默认 true） */
    maskClosable?: boolean;
    maskStyle?: string;
    bodyStyle?: string;
    style?: string;
    class?: string;
    modalContentClass?: string;
    okButtonProps?: Record<string, unknown>;
    cancelButtonProps?: Record<string, unknown>;
    zIndex?: number;
    /** 返回 Promise 时自动 loading，resolve 关闭 / reject 复位 */
    onOk?: () => unknown;
    /** 返回 Promise 时取消按钮自动 loading，resolve 关闭 / reject 复位 */
    onCancel?: () => unknown;
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
    // 对齐 Semi Modal.tsx defaultProps.hasCancel=true：不分 type，命令式各静态方法
    // （confirm/info/success/warning/error）默认都带取消按钮——withWarning/withInfo/
    // withSuccess 等 confirm.tsx 里的装配函数都只覆盖 type/icon，不碰 hasCancel，
    // 全部继承同一份 defaultProps。本库原来写成 `type === 'confirm'`，导致
    // warning/info/success/error 四种类型默认少了取消按钮（真机验证到 AIChatDialogue
    // 删除确认用 modal.warning，footer 只剩一个「Confirm」，Semi 截图有「取消」+「确定」）。
    hasCancel = true,
    // 对齐 Semi：命令式无覆盖默认，走 Modal 默认（size small=448px、不居中、closable/maskClosable=true）。
    width = 448,
    height,
    centered = false,
    closable = true,
    confirmLoading,
    footerFill,
    mask,
    maskClosable = true,
    maskStyle,
    bodyStyle,
    style,
    class: className,
    modalContentClass,
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

  // 对齐 Semi confirm.tsx：仅 withError 覆盖确认按钮为 danger，withWarning 不覆盖。
  const effectiveOkType = $derived(okType ?? (confirmTypeConfig[type].okButtonType ?? 'primary'));

  const iconIsString = $derived(typeof icon === 'string');
  const TypeIcon = $derived(confirmTypeConfig[type].icon);

  // 仅透传已定义的可选 props（exactOptionalPropertyTypes：避免显式 undefined）。
  const optionalProps = $derived({
    ...(okText !== undefined ? { okText } : {}),
    ...(cancelText !== undefined ? { cancelText } : {}),
    ...(okButtonProps !== undefined ? { okButtonProps } : {}),
    ...(zIndex !== undefined ? { zIndex } : {}),
    ...(height !== undefined ? { height } : {}),
    ...(footerFill !== undefined ? { footerFill } : {}),
    ...(mask !== undefined ? { mask } : {}),
    ...(maskStyle !== undefined ? { maskStyle } : {}),
    ...(bodyStyle !== undefined ? { bodyStyle } : {}),
    ...(style !== undefined ? { style } : {}),
    ...(modalContentClass !== undefined ? { modalContentClass } : {}),
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

  // 对齐 Semi ConfirmModal handleCancel：onCancel 返回 Promise 时取消按钮 loading，resolve 关闭 / reject 保持打开。
  let cancelLoading = $state(false);
  async function handleCancel() {
    if (cancelLoading) return;
    const result = onCancel?.();
    if (result instanceof Promise) {
      cancelLoading = true;
      try {
        await result;
        close();
      } catch {
        cancelLoading = false;
      }
    } else {
      close();
    }
  }
</script>

<!--
  对齐 Semi ConfirmModal：icon/title 走 Modal 默认头部通道（icon-wrapper + Title + 关闭按钮），
  不再自定义 header 整体替换——否则 closable 关闭按钮不渲染（默认头部才含 closer）。
-->
<Modal
  class={['cd-modal-confirm', className].filter(Boolean).join(' ')}
  {visible}
  {width}
  {centered}
  {closable}
  {maskClosable}
  confirmLoading={confirmLoading ?? loading}
  okType={effectiveOkType}
  {hasCancel}
  onOk={handleOk}
  onCancel={handleCancel}
  cancelButtonProps={{ loading: cancelLoading, ...(cancelButtonProps ?? {}) }}
  icon={confirmIcon}
  {...optionalProps}
  {...(title != null ? { title: confirmTitle } : {})}
>
  {#if content}
    <div
      class={['cd-modal-confirm-content', 'cd-modal-confirm-content-withIcon']
        .filter(Boolean)
        .join(' ')}
    >
      {content}
    </div>
  {/if}
</Modal>

{#snippet confirmIcon()}
  <span class="cd-modal-confirm-icon cd-modal-{type}-icon">
    {#if iconIsString}
      <Icon svg={icon as string} size="extra-large" />
    {:else if icon}
      {@render (icon as Snippet)()}
    {:else}
      <TypeIcon size="extra-large" />
    {/if}
  </span>
{/snippet}

{#snippet confirmTitle()}
  <span class="cd-modal-confirm-title-text">{title}</span>
{/snippet}

<style>
  /* confirm 头部：更紧凑的底部间距（对齐 Semi .semi-modal-confirm .semi-modal-header marginBottom=8px）。 */
  :global(.cd-modal-confirm .cd-modal-header) {
    align-items: center;
    margin-bottom: var(--cd-spacing-modal-confirm-header-marginbottom);
  }
  /* 对齐 Semi .semi-modal-confirm-icon：inline-flex + 默认 primary 色，类型类覆盖。 */
  :global(.cd-modal-confirm-icon) {
    display: inline-flex;
    color: var(--cd-color-modal-primary-icon);
  }
  /* 类型图标色（对齐 Semi $color-modal_*-icon；.semi-modal-{type}-icon 覆盖 confirm 基础色） */
  :global(.cd-modal-info-icon) {
    color: var(--cd-color-modal-info-icon);
  }
  :global(.cd-modal-success-icon) {
    color: var(--cd-color-modal-success-icon);
  }
  :global(.cd-modal-error-icon) {
    color: var(--cd-color-modal-danger-icon);
  }
  :global(.cd-modal-warning-icon) {
    color: var(--cd-color-modal-warning-icon);
  }
  /* 命令式标题 span：字号/字重由外层 Title heading={5} 决定（对齐 Semi，不覆盖）。 */
  :global(.cd-modal-confirm-title-text) {
    color: var(--cd-color-modal-main-text);
  }
  :global(.cd-modal-confirm-content) {
    color: var(--cd-color-modal-main-text);
    /* Semi modal.scss:8 @include font-size-regular → 20px */
    line-height: var(--cd-line-height-regular);
  }
  :global(.cd-modal-confirm-content-withIcon) {
    margin-left: var(--cd-spacing-modal-content-withicon-marginleft);
  }

  /* —— RTL（对齐 Semi rtl.scss .semi-modal-confirm-rtl）——
     .cd-modal-rtl 挂在被包裹 Modal 自身根节点（与 .cd-modal-confirm 同一节点，见
     Modal.svelte rootCls），故此处沿用同一祖先类，不单独造 .cd-modal-confirm-rtl。 */
  :global(.cd-modal-rtl .cd-modal-confirm-content-withIcon) {
    margin-left: 0;
    margin-right: var(--cd-spacing-modal-content-withicon-marginleft);
  }
</style>
