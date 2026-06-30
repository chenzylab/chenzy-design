<!--
  Banner — see specs/components/feedback/Banner.spec.md
  内嵌文档流的反馈横幅：info/success/warning/danger 四语义，full/card 两形态。
  非模态、不夺焦、不锁滚。role/aria-live 由 @chenzy-design/core resolveBannerRole 按 type + dynamic 推断。
  红线 #1：受控 open 绝不回写——isOpen 派生自受控 open 或内部 innerOpen，关闭仅回调 + 仅非受控写 innerOpen。
  红线 #2：render 不读 effect 写的状态。
  红线 #3：无 DOM 几何测量；关闭过渡用 svelte/transition (slide)，reduced-motion 经 duration 降级。
  closeOnEsc：开启且可关闭并显示时，$effect 内 window keydown 监听 Esc → close('esc')，cleanup 解绑。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { slide } from 'svelte/transition';
  import { resolveBannerRole, useId, type BannerType } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';

  interface Props {
    type?: BannerType;
    fullMode?: boolean;
    bordered?: boolean;
    title?: string;
    description?: string;
    open?: boolean;
    defaultOpen?: boolean;
    closable?: boolean;
    closeOnEsc?: boolean;
    animation?: boolean;
    dynamic?: boolean;
    ariaLabel?: string;
    children?: Snippet;
    titleSnippet?: Snippet;
    icon?: Snippet<[{ type: BannerType }]> | boolean;
    action?: Snippet<[{ close: () => void }]>;
    closeIcon?: Snippet;
    onOpenChange?: (info: { open: boolean }) => void;
    onClose?: (info: { trigger: 'closeButton' | 'esc' }) => void;
    onAfterClose?: () => void;
    class?: string;
  }

  let {
    type = 'info',
    fullMode = true,
    bordered = false,
    title = '',
    description = '',
    open,
    defaultOpen = true,
    closable = true,
    closeOnEsc = false,
    animation = true,
    dynamic = false,
    ariaLabel,
    children,
    titleSnippet,
    icon = true,
    action,
    closeIcon,
    onOpenChange,
    onClose,
    onAfterClose,
    class: className = '',
  }: Props = $props();

  // 红线 #1：受控 open 绝不回写。
  // initOpen() 仅在初始化时读 defaultOpen，避免 state_referenced_locally。
  function initOpen(): boolean {
    return defaultOpen;
  }
  const isOpenControlled = $derived(open !== undefined);
  let innerOpen = $state(initOpen());
  const isOpen = $derived(isOpenControlled ? open : innerOpen);

  const roleProps = $derived(resolveBannerRole(type, dynamic));
  const isRegion = $derived(roleProps.role === 'region');

  const loc = useLocale();

  const titleId = useId('cd-banner-title');
  const descId = useId('cd-banner-desc');

  const hasTitle = $derived(titleSnippet !== undefined || title.length > 0);
  const hasDescription = $derived(children !== undefined || description.length > 0);

  // icon 三态：false 隐藏；function 用自定义 snippet；其余真值用默认语义图标。
  const showIcon = $derived(icon !== false);
  const useCustomIcon = $derived(typeof icon === 'function');

  const animDur = $derived(animation ? 150 : 0);

  function close(trigger: 'closeButton' | 'esc') {
    if (!isOpenControlled) innerOpen = false;
    onOpenChange?.({ open: false });
    onClose?.({ trigger });
  }

  // 红线 #3：Esc 监听命令式绑定 + cleanup。
  // 仅在显示、开启 closeOnEsc 且可关闭时绑定全局 keydown（横幅内嵌文档流非夺焦，故监听 window）；
  // 关闭后 isOpen 变 false，effect 重跑触发 cleanup 解绑，避免遗留监听。
  $effect(() => {
    if (!isOpen || !closeOnEsc || !closable) return;
    function onKeydown(e: KeyboardEvent) {
      if (e.key === 'Escape') close('esc');
    }
    window.addEventListener('keydown', onKeydown);
    return () => window.removeEventListener('keydown', onKeydown);
  });

  const cls = $derived(
    [
      'cd-banner',
      `cd-banner--${type}`,
      fullMode ? 'cd-banner--full' : 'cd-banner--card',
      !fullMode && bordered && 'cd-banner--bordered',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );
</script>

{#snippet defaultIcon(t: BannerType)}
  {#if t === 'success'}
    <svg class="cd-banner__icon-svg" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
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
  {:else if t === 'warning'}
    <svg class="cd-banner__icon-svg" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path
        fill="none"
        stroke="currentColor"
        stroke-width="1.4"
        stroke-linejoin="round"
        d="M8 1.8l6.4 11.4H1.6z"
      />
      <path stroke="currentColor" stroke-width="1.4" stroke-linecap="round" d="M8 6v3.4" />
      <circle cx="8" cy="11.4" r="0.85" fill="currentColor" />
    </svg>
  {:else if t === 'danger'}
    <svg class="cd-banner__icon-svg" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="1.4" />
      <path
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
        d="M5.5 5.5l5 5M10.5 5.5l-5 5"
      />
    </svg>
  {:else}
    <svg class="cd-banner__icon-svg" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="1.4" />
      <circle cx="8" cy="4.6" r="0.85" fill="currentColor" />
      <path stroke="currentColor" stroke-width="1.4" stroke-linecap="round" d="M8 7v4.4" />
    </svg>
  {/if}
{/snippet}

{#if isOpen}
  <div
    class={cls}
    {...roleProps}
    aria-label={isRegion ? ariaLabel : undefined}
    aria-labelledby={hasTitle ? titleId : undefined}
    aria-describedby={hasDescription ? descId : undefined}
    transition:slide={{ duration: animDur }}
    onoutroend={() => onAfterClose?.()}
  >
    {#if showIcon}
      <span class="cd-banner__icon" aria-hidden={useCustomIcon ? undefined : true}>
        {#if typeof icon === 'function'}
          {@render icon({ type })}
        {:else}
          {@render defaultIcon(type)}
        {/if}
      </span>
    {/if}

    <div class="cd-banner__content">
      {#if hasTitle}
        <div class="cd-banner__title" id={titleId}>
          {#if titleSnippet}
            {@render titleSnippet()}
          {:else}
            {title}
          {/if}
        </div>
      {/if}
      {#if hasDescription}
        <div class="cd-banner__description" id={descId}>
          {#if children}
            {@render children()}
          {:else}
            {description}
          {/if}
        </div>
      {/if}
    </div>

    {#if action}
      <div class="cd-banner__action">
        {@render action({ close: () => close('closeButton') })}
      </div>
    {/if}

    {#if closable}
      <button
        type="button"
        class="cd-banner__close"
        aria-label={loc().t('Banner.closeButtonAriaLabel')}
        onclick={() => close('closeButton')}
      >
        {#if closeIcon}
          {@render closeIcon()}
        {:else}
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
            <path
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              d="M4 4l8 8M12 4l-8 8"
            />
          </svg>
        {/if}
      </button>
    {/if}
  </div>
{/if}

<style>
  .cd-banner {
    display: flex;
    align-items: flex-start;
    gap: var(--cd-banner-gap);
    padding: var(--cd-banner-padding-y) var(--cd-banner-padding-x);
    color: var(--cd-banner-desc-color);
    font-size: var(--cd-banner-desc-size);
  }

  /* full：铺满，无圆角无外边框，左侧 accent 竖条 */
  .cd-banner--full {
    border-radius: 0;
    border-inline-start: var(--cd-banner-accent-width) solid transparent;
  }

  /* card：圆角，可选边框 */
  .cd-banner--card {
    border-radius: var(--cd-banner-radius);
  }
  .cd-banner--bordered {
    border: 1px solid var(--cd-color-border);
  }

  /* 语义背景 + accent（图标 / full 竖条） */
  .cd-banner--info {
    background: var(--cd-banner-info-bg);
  }
  .cd-banner--info.cd-banner--full {
    border-inline-start-color: var(--cd-banner-info-accent);
  }
  .cd-banner--info .cd-banner__icon {
    color: var(--cd-banner-info-accent);
  }

  .cd-banner--success {
    background: var(--cd-banner-success-bg);
  }
  .cd-banner--success.cd-banner--full {
    border-inline-start-color: var(--cd-banner-success-accent);
  }
  .cd-banner--success .cd-banner__icon {
    color: var(--cd-banner-success-accent);
  }

  .cd-banner--warning {
    background: var(--cd-banner-warning-bg);
  }
  .cd-banner--warning.cd-banner--full {
    border-inline-start-color: var(--cd-banner-warning-accent);
  }
  .cd-banner--warning .cd-banner__icon {
    color: var(--cd-banner-warning-accent);
  }

  .cd-banner--danger {
    background: var(--cd-banner-danger-bg);
  }
  .cd-banner--danger.cd-banner--full {
    border-inline-start-color: var(--cd-banner-danger-accent);
  }
  .cd-banner--danger .cd-banner__icon {
    color: var(--cd-banner-danger-accent);
  }

  .cd-banner__icon {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    inline-size: var(--cd-banner-icon-size);
    block-size: var(--cd-banner-icon-size);
  }
  .cd-banner__icon-svg {
    inline-size: 100%;
    block-size: 100%;
  }

  .cd-banner__content {
    flex: 1 1 auto;
    min-inline-size: 0;
    display: flex;
    flex-direction: column;
    gap: var(--cd-spacing-extra-tight);
  }

  .cd-banner__title {
    color: var(--cd-banner-title-color);
    font-size: var(--cd-banner-title-size);
    font-weight: var(--cd-font-weight-medium, 500);
    line-height: 1.4;
  }
  .cd-banner__description {
    color: var(--cd-banner-desc-color);
    font-size: var(--cd-banner-desc-size);
    line-height: 1.5;
  }

  .cd-banner__action {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
  }

  .cd-banner__close {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    inline-size: 1.5rem;
    block-size: 1.5rem;
    padding: 0;
    color: var(--cd-banner-close-color);
    background: transparent;
    border: none;
    border-radius: var(--cd-radius-small, 4px);
    cursor: pointer;
    transition: background-color var(--cd-banner-motion-duration) var(--cd-motion-ease-standard);
  }
  .cd-banner__close:hover {
    background: var(--cd-banner-close-hover-bg);
  }
  .cd-banner__close:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px var(--cd-color-primary);
  }

  @media (prefers-reduced-motion: reduce) {
    .cd-banner__close {
      transition: none;
    }
  }
</style>
