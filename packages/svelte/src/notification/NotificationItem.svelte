<!--
  NotificationItem — 单条通知卡片。
  类型图标（可选）+ 主体（title + content）+ 可选关闭按钮（右上角绝对定位）。
  pauseOnHover 经 mouseenter/leave + focusin/out 暂停/恢复定时器。
  a11y：error/warning -> role=alert + aria-live=assertive；其余 -> role=status + aria-live=polite。
  title/content 经 useId 关联 aria-labelledby / aria-describedby；关闭按钮 aria-label「关闭」，不抢焦点。
-->
<script lang="ts">
  import { useId } from '@chenzy-design/core';
  import type { NotificationItem, NotificationType } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';

  interface Props {
    item: NotificationItem;
    onClose: (id: string) => void;
    onPause: (id: string) => void;
    onResume: (id: string) => void;
  }

  let { item, onClose, onPause, onResume }: Props = $props();
  const loc = useLocale();

  const titleId = useId('cd-notification-title');
  const contentId = useId('cd-notification-content');

  const isAlert = $derived(item.type === 'error' || item.type === 'warning');
  const role = $derived(isAlert ? 'alert' : 'status');
  const ariaLive = $derived(isAlert ? 'assertive' : 'polite');
  const hasIcon = $derived(item.type !== 'default');

  function handlePause() {
    if (item.pauseOnHover) onPause(item.id);
  }
  function handleResume() {
    if (item.pauseOnHover) onResume(item.id);
  }
</script>

{#snippet typeIcon(type: NotificationType)}
  {#if type === 'success'}
    <svg class="cd-notification-item__icon-svg" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
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
  {:else if type === 'info'}
    <svg class="cd-notification-item__icon-svg" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="1.4" />
      <path stroke="currentColor" stroke-width="1.4" stroke-linecap="round" d="M8 7.2v4" />
      <circle cx="8" cy="4.7" r="0.85" fill="currentColor" />
    </svg>
  {:else if type === 'warning'}
    <svg class="cd-notification-item__icon-svg" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
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
    <svg class="cd-notification-item__icon-svg" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="1.4" />
      <path
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
        d="M5.5 5.5l5 5M10.5 5.5l-5 5"
      />
    </svg>
  {/if}
{/snippet}

<div
  class="cd-notification-item cd-notification-item--{item.type}"
  {role}
  aria-live={ariaLive}
  aria-labelledby={item.title ? titleId : undefined}
  aria-describedby={item.content ? contentId : undefined}
  onmouseenter={handlePause}
  onmouseleave={handleResume}
  onfocusin={handlePause}
  onfocusout={handleResume}
>
  {#if hasIcon}
    <span class="cd-notification-item__icon">
      {@render typeIcon(item.type)}
    </span>
  {/if}
  <div class="cd-notification-item__body">
    {#if item.title}
      <div class="cd-notification-item__title" id={titleId}>{item.title}</div>
    {/if}
    {#if item.content}
      <div class="cd-notification-item__content" id={contentId}>{item.content}</div>
    {/if}
  </div>
  {#if item.closable}
    <button
      type="button"
      class="cd-notification-item__close"
      aria-label={loc().t('Notification.closeText')}
      onclick={() => onClose(item.id)}
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
  .cd-notification-item {
    position: relative;
    display: flex;
    gap: var(--cd-notification-gap);
    align-items: flex-start;
    box-sizing: border-box;
    inline-size: var(--cd-notification-width);
    max-inline-size: 100%;
    padding: var(--cd-notification-padding);
    background: var(--cd-notification-bg);
    border: 1px solid var(--cd-notification-border);
    border-radius: var(--cd-notification-radius);
    box-shadow: var(--cd-notification-shadow);
    pointer-events: auto;
  }

  .cd-notification-item__icon {
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    inline-size: 1.25em;
    block-size: 1.25em;
    margin-block-start: 0.0625em;
  }

  .cd-notification-item__icon-svg {
    inline-size: 100%;
    block-size: 100%;
  }

  .cd-notification-item--success .cd-notification-item__icon {
    color: var(--cd-notification-icon-success);
  }
  .cd-notification-item--info .cd-notification-item__icon {
    color: var(--cd-notification-icon-info);
  }
  .cd-notification-item--warning .cd-notification-item__icon {
    color: var(--cd-notification-icon-warning);
  }
  .cd-notification-item--error .cd-notification-item__icon {
    color: var(--cd-notification-icon-error);
  }

  .cd-notification-item__body {
    flex: 1 1 auto;
    min-inline-size: 0;
    /* 为右上角关闭按钮预留空间 */
    padding-inline-end: 1.5em;
  }

  .cd-notification-item__title {
    font-size: var(--cd-notification-title-size);
    font-weight: 600;
    line-height: 1.4;
    color: var(--cd-notification-color-title);
    overflow-wrap: anywhere;
  }

  .cd-notification-item__content {
    margin-block-start: var(--cd-spacing-1);
    font-size: var(--cd-notification-content-size);
    line-height: 1.5;
    color: var(--cd-notification-color-content);
    overflow-wrap: anywhere;
  }

  .cd-notification-item__close {
    position: absolute;
    inset-block-start: var(--cd-notification-padding);
    inset-inline-end: var(--cd-notification-padding);
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
    color: var(--cd-notification-close-color);
    cursor: pointer;
    border-radius: var(--cd-radius-1);
    transition: color var(--cd-notification-motion-duration) ease;
  }

  .cd-notification-item__close:hover {
    color: var(--cd-notification-close-color-hover);
  }

  .cd-notification-item__close:focus-visible {
    outline: 2px solid var(--cd-color-primary);
    outline-offset: 1px;
  }

  .cd-notification-item__close svg {
    inline-size: 100%;
    block-size: 100%;
  }

  @media (prefers-reduced-motion: reduce) {
    .cd-notification-item__close {
      transition: none;
    }
  }
</style>
