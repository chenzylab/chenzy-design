<!--
  NotificationItem — 单条通知卡片。
  类型图标（可选）+ 主体（title + content）+ 可选关闭按钮（右上角绝对定位）+ 可选 footer 操作区。
  pauseOnHover 经 mouseenter/leave + focusin/out 暂停/恢复定时器。
  showProgress：底部倒计时进度条，随 duration 递减；hover/聚焦时暂停（与定时器同步）。
    命令式 rAF 驱动（红线 #3）——effect 启动循环、cleanup 取消帧并清空 ref；duration<=0 时不渲染。
  theme：light（默认，与卡片背景一致）/ dark（深色卡片）。
  a11y：error/warning -> role=alert + aria-live=assertive；其余 -> role=status + aria-live=polite。
  title/content 经 useId 关联 aria-labelledby / aria-describedby；关闭按钮 aria-label「关闭」，不抢焦点。
  类型前缀（如「错误：」）以视觉隐藏文本注入卡片首部（spec §6），令屏幕阅读器先播报极性语义。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { useId } from '@chenzy-design/core';
  import type { NotificationItem, NotificationType } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';

  interface Props {
    item: NotificationItem;
    onClose: (id: string) => void;
    /**
     * 仅在用户点击关闭按钮时触发（与 onClose 区分：onClose 在任何关闭方式时触发）。
     * 由 NotificationContainer 传入，从 onCloseClickMap 中查找并调用对应回调。
     */
    onCloseClick?: (id: string) => void;
    onPause: (id: string) => void;
    onResume: (id: string) => void;
  }

  let { item, onClose, onCloseClick, onPause, onResume }: Props = $props();
  const loc = useLocale();

  const titleId = useId('cd-notification-title');
  const contentId = useId('cd-notification-content');

  const isAlert = $derived(item.type === 'error' || item.type === 'warning');
  const role = $derived(isAlert ? 'alert' : 'status');
  const ariaLive = $derived(isAlert ? 'assertive' : 'polite');
  const hasIcon = $derived(item.type !== 'default');

  // 视觉隐藏类型前缀（如「错误：」）：default 无前缀；其余走 i18n（colon 跟随 locale）。
  // 注入卡片首部，令屏幕阅读器先读极性语义再读 title/content。
  const typePrefix = $derived(
    item.type === 'default'
      ? ''
      : `${loc().t(`Notification.${item.type}`)}${loc().t('Form.colon')}`,
  );

  // footer 是渲染层 Snippet（core 用 unknown 透传，无框架依赖）。
  const footer = $derived(item.footer as Snippet | undefined);

  // showProgress 仅在有限 duration 下有意义；duration<=0（常驻）无倒计时可显示。
  const hasProgress = $derived(item.showProgress && item.duration > 0);

  // 本地暂停态：与 store 定时器的暂停/恢复严格同源（同一组 hover/focus 处理器）。
  // 用普通变量（非 $state）让 rAF 循环直接读取，避免 effect 重订阅/重启而丢失进度。
  let paused = false;
  // 进度条 DOM 引用；命令式驱动 scaleX，避免每帧触发 Svelte 响应式。
  let progressEl = $state<HTMLDivElement | null>(null);

  function handlePause() {
    if (item.pauseOnHover) {
      paused = true;
      onPause(item.id);
    }
  }
  function handleResume() {
    if (item.pauseOnHover) {
      paused = false;
      onResume(item.id);
    }
  }

  // 命令式 rAF 倒计时进度（红线 #3）：effect 仅依赖 duration/progressEl 启动单条循环，
  // 循环内直接读 paused（普通变量）冻结/推进剩余时间，直接写 DOM scaleX；cleanup 取消帧。
  $effect(() => {
    if (!hasProgress || !progressEl) return;
    const totalMs = item.duration * 1000;
    const el = progressEl;
    let raf = 0;
    let remaining = totalMs;
    let last = performance.now();

    function tick(t: number): void {
      if (!paused) remaining = Math.max(0, remaining - (t - last));
      last = t;
      el.style.transform = `scaleX(${remaining / totalMs})`;
      if (remaining > 0) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  });
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
  class="cd-notification-item cd-notification-item--{item.type} cd-notification-item--{item.theme}"
  {role}
  aria-live={ariaLive}
  aria-labelledby={item.title ? titleId : undefined}
  aria-describedby={item.content ? contentId : undefined}
  onmouseenter={handlePause}
  onmouseleave={handleResume}
  onfocusin={handlePause}
  onfocusout={handleResume}
>
  {#if typePrefix}
    <span class="cd-sr-only">{typePrefix}</span>
  {/if}
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
    {#if footer}
      <div class="cd-notification-item__footer">
        {@render footer()}
      </div>
    {/if}
  </div>
  {#if item.closable}
    <button
      type="button"
      class="cd-notification-item__close"
      aria-label={loc().t('Notification.closeText')}
      onclick={() => { onCloseClick?.(item.id); onClose(item.id); }}
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
  {#if hasProgress}
    <div class="cd-notification-item__progress" aria-hidden="true">
      <div class="cd-notification-item__progress-bar" bind:this={progressEl}></div>
    </div>
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

  /* 视觉隐藏类型前缀复用 tokens.css 全局 .cd-sr-only：仅供屏幕阅读器读取极性语义。 */

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
    margin-block-start: var(--cd-spacing-extra-tight);
    font-size: var(--cd-notification-content-size);
    line-height: 1.5;
    color: var(--cd-notification-color-content);
    overflow-wrap: anywhere;
  }

  .cd-notification-item__footer {
    display: flex;
    flex-wrap: wrap;
    gap: var(--cd-spacing-tight);
    align-items: center;
    margin-block-start: var(--cd-spacing-base-tight);
  }

  .cd-notification-item__progress {
    position: absolute;
    inset-inline: 0;
    inset-block-end: 0;
    block-size: var(--cd-notification-progress-height);
    overflow: hidden;
    border-end-start-radius: var(--cd-notification-radius);
    border-end-end-radius: var(--cd-notification-radius);
    pointer-events: none;
  }

  .cd-notification-item__progress-bar {
    block-size: 100%;
    inline-size: 100%;
    background: var(--cd-notification-progress-color);
    /* 倒计时从起始边收缩：LTR 自左、RTL 自右（随 dir 翻转 transform-origin）。 */
    transform-origin: left center;
    /* 初始满格；命令式 rAF 写 scaleX 递减 */
    transform: scaleX(1);
  }

  :global([dir='rtl']) .cd-notification-item__progress-bar {
    transform-origin: right center;
  }

  .cd-notification-item--success .cd-notification-item__progress-bar {
    background: var(--cd-notification-icon-success);
  }
  .cd-notification-item--info .cd-notification-item__progress-bar {
    background: var(--cd-notification-icon-info);
  }
  .cd-notification-item--warning .cd-notification-item__progress-bar {
    background: var(--cd-notification-icon-warning);
  }
  .cd-notification-item--error .cd-notification-item__progress-bar {
    background: var(--cd-notification-icon-error);
  }

  /* dark 主题：深色卡片，文案/边框/关闭色覆盖为 token */
  .cd-notification-item--dark {
    background: var(--cd-notification-bg-dark);
    border-color: var(--cd-notification-border-dark);
  }
  .cd-notification-item--dark .cd-notification-item__title {
    color: var(--cd-notification-color-title-dark);
  }
  .cd-notification-item--dark .cd-notification-item__content {
    color: var(--cd-notification-color-content-dark);
  }
  .cd-notification-item--dark .cd-notification-item__close {
    color: var(--cd-notification-close-color-dark);
  }
  .cd-notification-item--dark .cd-notification-item__close:hover {
    color: var(--cd-notification-close-color-hover-dark);
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
    border-radius: var(--cd-border-radius-small);
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
