<!--
  ToastItem — 单条轻提示卡片（纯视觉）。
  类型图标 + 内容 + 可选关闭按钮；pauseOnHover 经 mouseenter/leave + focusin/out 暂停/恢复定时器。
  a11y：卡片 role=presentation + aria-live=off（不充当 live region）；所有文案播报统一走单例
  live region（见 live-region.ts），由 store.ts 在新增/更新 toast 时命令式写入，避免每条卡片
  各自 region 造成的重复/竞争播报。error -> assertive，其余 -> polite。
  关闭按钮 button + aria-label「关闭」，不抢焦点、不锁滚动。
  loading 用 CSS infinite rotate spinner（旋转 animation 非显隐 from 帧问题，安全）。
-->
<script lang="ts">
  import type { ToastItem, ToastType } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';

  interface Props {
    toast: ToastItem;
    onClose: (id: string) => void;
    onPause: (id: string) => void;
    onResume: (id: string) => void;
  }

  let { toast, onClose, onPause, onResume }: Props = $props();
  const loc = useLocale();

  function handlePause() {
    if (toast.pauseOnHover) onPause(toast.id);
  }
  function handleResume() {
    if (toast.pauseOnHover) onResume(toast.id);
  }
</script>

{#snippet typeIcon(type: ToastType)}
  {#if type === 'success'}
    <svg class="cd-toast-item__icon-svg" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="1.4" />
      <path
        fill="none"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M5 8.2l2 2 4-4.4"
      />
    </svg>
  {:else if type === 'warning'}
    <svg class="cd-toast-item__icon-svg" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path
        fill="none"
        stroke="currentColor"
        stroke-width="1.4"
        stroke-linejoin="round"
        d="M8 1.5l6.5 12h-13z"
      />
      <path stroke="currentColor" stroke-width="1.4" stroke-linecap="round" d="M8 6.5v3.2" />
      <circle cx="8" cy="11.6" r="0.85" fill="currentColor" />
    </svg>
  {:else if type === 'error'}
    <svg class="cd-toast-item__icon-svg" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="1.4" />
      <path
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
        d="M5.5 5.5l5 5M10.5 5.5l-5 5"
      />
    </svg>
  {:else if type === 'loading'}
    <svg
      class="cd-toast-item__icon-svg cd-toast-item__spinner"
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="8" cy="8" r="6.4" fill="none" stroke="currentColor" stroke-width="1.6" opacity="0.25" />
      <path
        fill="none"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
        d="M8 1.6a6.4 6.4 0 0 1 6.4 6.4"
      />
    </svg>
  {:else}
    <svg class="cd-toast-item__icon-svg" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="1.4" />
      <path stroke="currentColor" stroke-width="1.4" stroke-linecap="round" d="M8 7.2v4" />
      <circle cx="8" cy="4.7" r="0.85" fill="currentColor" />
    </svg>
  {/if}
{/snippet}

<div
  class={['cd-toast-item', `cd-toast-item--${toast.type}`, `cd-toast-item--${toast.theme}`, toast.theme === 'light' && 'cd-toast-item--light']}
  style={toast.textMaxWidth !== 450 ? `max-inline-size: ${typeof toast.textMaxWidth === 'number' ? `${toast.textMaxWidth}px` : toast.textMaxWidth}` : undefined}
  role="presentation"
  aria-live="off"
  onmouseenter={handlePause}
  onmouseleave={handleResume}
  onfocusin={handlePause}
  onfocusout={handleResume}
>
  {#if toast.icon !== false}
    <span class="cd-toast-item__icon">
      {#if toast.icon && toast.icon !== true}
        {@render toast.icon()}
      {:else}
        {@render typeIcon(toast.type)}
      {/if}
    </span>
  {/if}
  <span class="cd-toast-item__content">{toast.content}</span>
  {#if toast.showClose}
    <button
      type="button"
      class="cd-toast-item__close"
      aria-label={loc().t('Toast.close')}
      onclick={() => onClose(toast.id)}
    >
      <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
        <path
          stroke="currentColor"
          stroke-width="1.4"
          stroke-linecap="round"
          d="M4 4l8 8M12 4l-8 8"
        />
      </svg>
    </button>
  {/if}
</div>

<style>
  .cd-toast-item {
    display: flex;
    gap: var(--cd-toast-gap);
    align-items: center;
    box-sizing: border-box;
    padding: var(--cd-toast-padding);
    max-inline-size: var(--cd-toast-max-width);
    min-inline-size: var(--cd-toast-min-width);
    background: var(--cd-toast-bg);
    color: var(--cd-toast-color-text);
    font-size: var(--cd-toast-font-size);
    font-weight: var(--cd-toast-font-weight);
    line-height: 1.5;
    border-radius: var(--cd-toast-radius);
    box-shadow: var(--cd-toast-shadow);
    pointer-events: auto;
  }

  .cd-toast-item__icon {
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    inline-size: 1.125em;
    block-size: 1.125em;
  }

  .cd-toast-item__icon-svg {
    inline-size: 100%;
    block-size: 100%;
  }

  .cd-toast-item--info .cd-toast-item__icon {
    color: var(--cd-toast-color-icon-info);
  }
  .cd-toast-item--success .cd-toast-item__icon {
    color: var(--cd-toast-color-icon-success);
  }
  .cd-toast-item--warning .cd-toast-item__icon {
    color: var(--cd-toast-color-icon-warning);
  }
  .cd-toast-item--error .cd-toast-item__icon {
    color: var(--cd-toast-color-icon-error);
  }
  .cd-toast-item--loading .cd-toast-item__icon {
    color: var(--cd-toast-color-icon-info);
  }

  /* dark 主题：深色卡片，文案/关闭色覆盖为 token（对齐 Notification dark theme） */
  .cd-toast-item--dark {
    background: var(--cd-toast-bg-dark);
    color: var(--cd-toast-color-text-dark);
  }
  .cd-toast-item--dark .cd-toast-item__close {
    color: var(--cd-toast-color-close-dark);
  }
  .cd-toast-item--dark .cd-toast-item__close:hover {
    color: var(--cd-toast-color-close-hover-dark);
  }

  .cd-toast-item__content {
    flex: 1 1 auto;
    min-inline-size: 0;
    overflow-wrap: anywhere;
  }

  .cd-toast-item__close {
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    inline-size: 1.25em;
    block-size: 1.25em;
    padding: 0;
    margin: 0;
    border: none;
    background: transparent;
    color: var(--cd-toast-color-close);
    cursor: pointer;
    border-radius: var(--cd-border-radius-small);
    transition: color var(--cd-toast-motion-duration) ease;
  }

  .cd-toast-item__close:hover {
    color: var(--cd-toast-color-close-hover);
  }

  .cd-toast-item__close:focus-visible {
    outline: 2px solid var(--cd-color-primary);
    outline-offset: 1px;
  }

  .cd-toast-item__close svg {
    inline-size: 100%;
    block-size: 100%;
  }

  .cd-toast-item__spinner {
    transform-origin: center;
    animation: cd-toast-spin 0.8s linear infinite;
  }

  @keyframes cd-toast-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .cd-toast-item__spinner {
      animation-duration: 1.6s;
    }
    .cd-toast-item__close {
      transition: none;
    }
  }
</style>
