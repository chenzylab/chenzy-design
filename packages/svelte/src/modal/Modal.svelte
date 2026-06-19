<!--
  Modal — see specs/components/feedback/Modal.spec.md
  基础子集：fixed 遮罩+面板（无 portal），role=dialog aria-modal，
  useFocusTrap 焦点捕获+归还、useDismiss Esc 关闭、useScrollLock 锁背景滚动，
  遮罩点击关闭、ok/cancel 按钮、自定义尾部、reduced-motion。
  TODO(延后): portal-to-body / getContainer、命令式工厂 (Modal.confirm)、
  destroyOnClose、堆叠 z-index 管理、拖拽。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { useId, useFocusTrap, useDismiss, useScrollLock } from '@chenzy-design/core';
  import { Button } from '../button/index.js';

  type OkType = 'primary' | 'danger';

  interface Props {
    open?: boolean;
    title?: string;
    titleSnippet?: Snippet;
    width?: number | string;
    centered?: boolean;
    closable?: boolean;
    maskClosable?: boolean;
    keyboard?: boolean;
    confirmLoading?: boolean;
    okText?: string;
    cancelText?: string;
    okType?: OkType;
    footer?: Snippet<[{ ok: () => void; cancel: () => void }]> | null;
    children?: Snippet;
    ariaLabel?: string;
    onOk?: () => void;
    onCancel?: () => void;
    onOpenChange?: (open: boolean) => void;
    onAfterClose?: () => void;
    class?: string;
  }

  let {
    open,
    title,
    titleSnippet,
    width = 448,
    centered = false,
    closable = true,
    maskClosable = true,
    keyboard = true,
    confirmLoading = false,
    okText = '确定',
    cancelText = '取消',
    okType = 'primary',
    footer,
    children,
    ariaLabel,
    onOk,
    onCancel,
    onOpenChange,
    onAfterClose,
    class: className,
  }: Props = $props();

  const titleId = useId('cd-modal-title');

  // --- 受控 open (红线 #1)：不无条件回写 open，仅 onOpenChange/onCancel ---
  const isControlled = $derived(open !== undefined);
  let innerOpen = $state(getInitialOpen());
  const isOpen = $derived(isControlled ? !!open : innerOpen);

  function getInitialOpen(): boolean {
    return false;
  }

  const hasTitle = $derived(Boolean(titleSnippet) || Boolean(title));

  const widthStyle = $derived(typeof width === 'number' ? `${width}px` : width);

  const panelCls = $derived(['cd-modal', className].filter(Boolean).join(' '));

  function cancel() {
    if (!isControlled) innerOpen = false;
    onOpenChange?.(false);
    onCancel?.();
    if (onAfterClose) queueMicrotask(() => onAfterClose?.());
  }

  function ok() {
    onOk?.();
    // 折中：非受控模式 ok 后自动关闭；受控模式由 onOk 回调控制 open
    if (!isControlled) {
      innerOpen = false;
      onOpenChange?.(false);
    }
  }

  function onMaskClick(e: MouseEvent) {
    if (maskClosable && e.target === e.currentTarget) {
      cancel();
    }
  }

  // --- 浮层命令式编排 (红线 #3)：open 且面板就绪时，
  //     activate focus-trap、绑 dismiss(Esc)、加 scroll-lock；
  //     cleanup 里 deactivate(归还焦点)、解绑 dismiss、release scroll-lock ---
  let panelEl = $state<HTMLElement | null>(null);

  $effect(() => {
    if (!isOpen || !panelEl) return;
    const trap = useFocusTrap(panelEl);
    trap.activate();
    const releaseScroll = useScrollLock();
    let undismiss = () => {};
    if (keyboard) {
      undismiss = useDismiss(panelEl, {
        onDismiss: () => cancel(),
        escape: true,
        outsideClick: false,
      });
    }
    return () => {
      undismiss();
      releaseScroll();
      trap.deactivate();
    };
  });
</script>

{#if isOpen}
  <!-- 遮罩 role=presentation：点击关闭为鼠标增强，键盘等价为 Esc（focus-trap + useDismiss 提供） -->
  <div
    class="cd-modal-mask"
    class:cd-modal-mask--centered={centered}
    onclick={onMaskClick}
    role="presentation"
  >
    <div
      class={panelCls}
      bind:this={panelEl}
      role="dialog"
      aria-modal="true"
      aria-labelledby={hasTitle ? titleId : undefined}
      aria-label={hasTitle ? undefined : ariaLabel}
      style="inline-size: {widthStyle}"
    >
      {#if hasTitle || closable}
        <header class="cd-modal__header">
          {#if hasTitle}
            <h2 id={titleId} class="cd-modal__title">
              {#if titleSnippet}
                {@render titleSnippet()}
              {:else}
                {title}
              {/if}
            </h2>
          {:else}
            <span></span>
          {/if}
          {#if closable}
            <button
              type="button"
              class="cd-modal__close"
              aria-label="关闭"
              onclick={cancel}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3 3l10 10M13 3L3 13"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          {/if}
        </header>
      {/if}

      <div class="cd-modal__body">
        {@render children?.()}
      </div>

      {#if footer !== null}
        <footer class="cd-modal__footer">
          {#if footer}
            {@render footer({ ok, cancel })}
          {:else}
            <Button onclick={cancel}>{cancelText}</Button>
            <Button type={okType} onclick={ok} loading={confirmLoading}>
              {okText}
            </Button>
          {/if}
        </footer>
      {/if}
    </div>
  </div>
{/if}

<style>
  .cd-modal-mask {
    position: fixed;
    inset: 0;
    z-index: var(--cd-modal-z);
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: var(--cd-modal-padding);
    background: var(--cd-modal-mask-bg);
    overflow: auto;
  }
  .cd-modal-mask--centered {
    align-items: center;
  }
  .cd-modal {
    box-sizing: border-box;
    max-inline-size: 90vw;
    max-block-size: 90vh;
    margin-block-start: 100px;
    padding: var(--cd-modal-padding);
    background: var(--cd-modal-bg);
    border-radius: var(--cd-modal-radius);
    box-shadow: var(--cd-modal-shadow);
    overflow: auto;
  }
  .cd-modal-mask--centered .cd-modal {
    margin-block-start: 0;
  }
  .cd-modal__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--cd-modal-header-gap);
    margin-block-end: var(--cd-modal-header-gap);
  }
  .cd-modal__title {
    margin: 0;
    color: var(--cd-modal-title-color);
    font-size: var(--cd-modal-title-size);
    font-weight: 600;
    line-height: 1.4;
  }
  .cd-modal__close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: 28px;
    block-size: 28px;
    padding: 0;
    border: none;
    border-radius: var(--cd-modal-radius);
    background: transparent;
    color: var(--cd-modal-close-color);
    cursor: pointer;
  }
  .cd-modal__close:hover {
    background: var(--cd-modal-close-hover-bg);
  }
  .cd-modal__close:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-modal__body {
    color: var(--cd-modal-body-color);
  }
  .cd-modal__footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--cd-modal-footer-gap);
    margin-block-start: var(--cd-modal-padding);
  }

  @media (prefers-reduced-motion: reduce) {
    .cd-modal-mask,
    .cd-modal {
      animation: none;
    }
  }
</style>
