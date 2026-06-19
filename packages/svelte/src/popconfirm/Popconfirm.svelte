<!--
  Popconfirm — 气泡确认（feedback）。
  锚定触发元素的就地二次确认：title/content + 危险分级 type，确认/取消双按钮，
  placement 4 向纯 CSS 锚定，role=dialog non-modal。
  复用 core 原语：useId、useDismiss（外部点击/Esc 关闭）、useFocusTrap（焦点捕获+归还）。
  浮层静态显示（{#if isOpen} 直接挂载），无入场动画，reduced-motion 友好。
  TODO(延后): 12 向位置全集、hover 触发、异步 confirm loading、portal/getContainer、
  Esc 与 outsideClick 来源细分。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { useId, useDismiss, useFocusTrap } from '@chenzy-design/core';
  import { Button } from '../button/index.js';
  import { useLocale } from '../locale-provider/index.js';

  type PopType = 'default' | 'danger' | 'warning';
  type Placement = 'top' | 'bottom' | 'left' | 'right';
  type OkType = 'primary' | 'danger';
  type DismissReason = 'trigger' | 'confirm' | 'cancel' | 'esc' | 'outsideClick';

  interface Props {
    open?: boolean;
    defaultOpen?: boolean;
    title?: string;
    titleSnippet?: Snippet;
    content?: string;
    contentSnippet?: Snippet;
    type?: PopType;
    icon?: Snippet | false;
    okText?: string;
    cancelText?: string;
    okType?: OkType;
    showCancel?: boolean;
    placement?: Placement;
    disabled?: boolean;
    closeOnEsc?: boolean;
    closeOnOutsideClick?: boolean;
    trigger?: Snippet;
    onOpenChange?: (info: { open: boolean; reason: DismissReason }) => void;
    onConfirm?: () => void;
    onCancel?: () => void;
    class?: string;
  }

  let {
    open,
    defaultOpen = false,
    title,
    titleSnippet,
    content,
    contentSnippet,
    type = 'default',
    icon,
    okText,
    cancelText,
    okType,
    showCancel = true,
    placement = 'top',
    disabled = false,
    closeOnEsc = true,
    closeOnOutsideClick = true,
    trigger,
    onOpenChange,
    onConfirm,
    onCancel,
    class: className,
  }: Props = $props();

  const loc = useLocale();

  const popupId = useId('cd-popconfirm-popup');
  const titleId = useId('cd-popconfirm-title');
  const contentId = useId('cd-popconfirm-content');

  // --- 受控 open (红线 #1)：不无条件回写 open，仅 onOpenChange ---
  const isControlled = $derived(open !== undefined);
  let innerOpen = $state(getInitialOpen());
  const isOpen = $derived(isControlled ? !!open : innerOpen);

  function getInitialOpen(): boolean {
    return defaultOpen;
  }

  const resolvedOkType = $derived<OkType>(
    okType ?? (type === 'danger' ? 'danger' : 'primary'),
  );

  const hasContent = $derived(Boolean(contentSnippet) || Boolean(content));

  const popupCls = $derived(
    [
      'cd-popconfirm__popup',
      `cd-popconfirm__popup--${placement}`,
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );

  function setOpen(next: boolean, reason: DismissReason) {
    if (!isControlled) innerOpen = next;
    onOpenChange?.({ open: next, reason });
  }

  function onTriggerClick() {
    if (disabled) return;
    setOpen(!isOpen, 'trigger');
  }

  function onTriggerKeydown(e: KeyboardEvent) {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen(!isOpen, 'trigger');
    }
  }

  function confirm() {
    onConfirm?.();
    setOpen(false, 'confirm');
  }

  function cancel() {
    onCancel?.();
    setOpen(false, 'cancel');
  }

  // 外部点击/Esc 统一按取消处理（reason 暂统一 outsideClick，来源细分 TODO）
  function dismiss() {
    onCancel?.();
    setOpen(false, 'outsideClick');
  }

  // --- 浮层命令式编排 (红线 #3)：open 且浮层就绪时，
  //     activate focus-trap（焦点移入浮层）、绑 dismiss(Esc/外部点击)；
  //     cleanup 里 undismiss、deactivate(归还焦点) ---
  let popupEl = $state<HTMLElement | null>(null);
  let rootEl = $state<HTMLElement | null>(null);

  $effect(() => {
    if (!isOpen || !popupEl) return;
    const trap = useFocusTrap(popupEl);
    trap.activate();
    let undismiss = () => {};
    // outsideClick 判定基于 rootEl（含触发器+浮层）：点触发器在 rootEl 内不触发
    // dismiss，由触发器 onclick 自行 toggle；点 rootEl 外部才视为取消。
    if (closeOnEsc || closeOnOutsideClick) {
      undismiss = useDismiss(rootEl ?? popupEl, {
        onDismiss: dismiss,
        escape: closeOnEsc,
        outsideClick: closeOnOutsideClick,
      });
    }
    return () => {
      undismiss();
      trap.deactivate();
    };
  });
</script>

<div class="cd-popconfirm" bind:this={rootEl}>
  <div
    class="cd-popconfirm__trigger"
    role="button"
    tabindex={disabled ? -1 : 0}
    aria-haspopup="dialog"
    aria-expanded={isOpen}
    aria-controls={isOpen ? popupId : undefined}
    aria-disabled={disabled || undefined}
    onclick={onTriggerClick}
    onkeydown={onTriggerKeydown}
  >
    {@render trigger?.()}
  </div>

  {#if isOpen}
    <div
      class={popupCls}
      id={popupId}
      bind:this={popupEl}
      role="dialog"
      aria-labelledby={titleId}
      aria-describedby={hasContent ? contentId : undefined}
    >
      <div class="cd-popconfirm__arrow" aria-hidden="true"></div>
      <div class="cd-popconfirm__body">
        {#if icon !== false}
          <span
            class="cd-popconfirm__icon cd-popconfirm__icon--{type}"
            aria-hidden="true"
          >
            {#if typeof icon === 'function'}
              {@render icon()}
            {:else if type === 'danger'}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5" />
                <path
                  d="M8 4.5v4.2"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
                <circle cx="8" cy="11.3" r="0.9" fill="currentColor" />
              </svg>
            {:else if type === 'warning'}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 2 1.5 13.5h13L8 2Z"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linejoin="round"
                />
                <path
                  d="M8 6.3v3"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
                <circle cx="8" cy="11.4" r="0.85" fill="currentColor" />
              </svg>
            {:else}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5" />
                <path
                  d="M8 7.2v4"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
                <circle cx="8" cy="4.7" r="0.9" fill="currentColor" />
              </svg>
            {/if}
          </span>
        {/if}
        <div class="cd-popconfirm__content-wrap">
          <div id={titleId} class="cd-popconfirm__title">
            {#if titleSnippet}
              {@render titleSnippet()}
            {:else}
              {title}
            {/if}
          </div>
          {#if hasContent}
            <div id={contentId} class="cd-popconfirm__content">
              {#if contentSnippet}
                {@render contentSnippet()}
              {:else}
                {content}
              {/if}
            </div>
          {/if}
        </div>
      </div>
      <div class="cd-popconfirm__footer">
        {#if showCancel}
          <Button size="small" onclick={cancel}>{cancelText ?? loc().t('Popconfirm.cancel')}</Button>
        {/if}
        <Button size="small" type={resolvedOkType} onclick={confirm}>
          {okText ?? loc().t('Popconfirm.confirm')}
        </Button>
      </div>
    </div>
  {/if}
</div>

<style>
  .cd-popconfirm {
    position: relative;
    display: inline-block;
  }
  .cd-popconfirm__trigger {
    display: inline-flex;
    align-items: center;
    cursor: pointer;
  }
  .cd-popconfirm__trigger:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
    border-radius: var(--cd-radius-1);
  }
  .cd-popconfirm__trigger[aria-disabled='true'] {
    cursor: not-allowed;
  }

  .cd-popconfirm__popup {
    position: absolute;
    z-index: var(--cd-popconfirm-z);
    inline-size: max-content;
    max-inline-size: var(--cd-popconfirm-max-width);
    padding: var(--cd-popconfirm-padding);
    background: var(--cd-popconfirm-bg);
    border-radius: var(--cd-popconfirm-radius);
    box-shadow: var(--cd-popconfirm-shadow);
  }

  /* placement 锚定：inset + margin（间距用 arrow-size） */
  .cd-popconfirm__popup--top {
    inset-block-end: 100%;
    inset-inline-start: 50%;
    transform: translateX(-50%);
    margin-block-end: var(--cd-popconfirm-arrow-size);
  }
  .cd-popconfirm__popup--bottom {
    inset-block-start: 100%;
    inset-inline-start: 50%;
    transform: translateX(-50%);
    margin-block-start: var(--cd-popconfirm-arrow-size);
  }
  .cd-popconfirm__popup--left {
    inset-inline-end: 100%;
    inset-block-start: 50%;
    transform: translateY(-50%);
    margin-inline-end: var(--cd-popconfirm-arrow-size);
  }
  .cd-popconfirm__popup--right {
    inset-inline-start: 100%;
    inset-block-start: 50%;
    transform: translateY(-50%);
    margin-inline-start: var(--cd-popconfirm-arrow-size);
  }

  /* arrow：旋转 45° 的纯色方块，定位到浮层贴触发器一侧的中点 */
  .cd-popconfirm__arrow {
    position: absolute;
    inline-size: var(--cd-popconfirm-arrow-size);
    block-size: var(--cd-popconfirm-arrow-size);
    background: var(--cd-popconfirm-bg);
    transform: rotate(45deg);
  }
  .cd-popconfirm__popup--top .cd-popconfirm__arrow {
    inset-block-end: calc(var(--cd-popconfirm-arrow-size) / -2);
    inset-inline-start: 50%;
    margin-inline-start: calc(var(--cd-popconfirm-arrow-size) / -2);
  }
  .cd-popconfirm__popup--bottom .cd-popconfirm__arrow {
    inset-block-start: calc(var(--cd-popconfirm-arrow-size) / -2);
    inset-inline-start: 50%;
    margin-inline-start: calc(var(--cd-popconfirm-arrow-size) / -2);
  }
  .cd-popconfirm__popup--left .cd-popconfirm__arrow {
    inset-inline-end: calc(var(--cd-popconfirm-arrow-size) / -2);
    inset-block-start: 50%;
    margin-block-start: calc(var(--cd-popconfirm-arrow-size) / -2);
  }
  .cd-popconfirm__popup--right .cd-popconfirm__arrow {
    inset-inline-start: calc(var(--cd-popconfirm-arrow-size) / -2);
    inset-block-start: 50%;
    margin-block-start: calc(var(--cd-popconfirm-arrow-size) / -2);
  }

  .cd-popconfirm__body {
    display: flex;
    gap: var(--cd-spacing-2);
  }
  .cd-popconfirm__icon {
    display: inline-flex;
    flex-shrink: 0;
    line-height: 1;
  }
  .cd-popconfirm__icon--danger {
    color: var(--cd-popconfirm-icon-color-danger);
  }
  .cd-popconfirm__icon--warning {
    color: var(--cd-popconfirm-icon-color-warning);
  }
  .cd-popconfirm__icon--default {
    color: var(--cd-popconfirm-icon-color-info);
  }

  .cd-popconfirm__content-wrap {
    min-inline-size: 0;
  }
  .cd-popconfirm__title {
    color: var(--cd-popconfirm-title-color);
    font-size: var(--cd-popconfirm-title-size);
    font-weight: 600;
    line-height: 1.4;
  }
  .cd-popconfirm__content {
    margin-block-start: var(--cd-spacing-1);
    color: var(--cd-popconfirm-color-text-secondary);
    font-size: var(--cd-popconfirm-content-size);
    line-height: 1.5;
  }

  .cd-popconfirm__footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--cd-popconfirm-gap-footer);
    margin-block-start: var(--cd-spacing-3);
  }

  /* 本子集无入场动画；reduced-motion 下同样无过渡 */
  @media (prefers-reduced-motion: reduce) {
    .cd-popconfirm__popup {
      transition: none;
    }
  }
</style>
