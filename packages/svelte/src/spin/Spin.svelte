<!--
  Spin — see specs/components/feedback/Spin.spec.md
  加载指示器：inline / wrapper / fullscreen 三形态。
  delay 去抖 + minShowTime 最短显示 由 @chenzy-design/core createSpinController 提供（必须复用，不重复实现）。
  红线 #1：spinning 是受控输入，effective 是内部派生显示态，绝不回写 spinning，仅触发 onShow/onHide。
  红线 #3：定时器/订阅全部在 $effect 命令式管理 + cleanup，无 DOM 几何测量。
  role=status (aria-live=polite) 公布加载；wrapper 内容 aria-busy；reduced-motion 退化为呼吸。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { createSpinController, type SpinController } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';

  type Size = 'small' | 'default' | 'large';

  interface Props {
    spinning?: boolean;
    size?: Size;
    tip?: string;
    delay?: number;
    minShowTime?: number;
    fullscreen?: boolean;
    wrapperClassName?: string;
    ariaLabel?: string;
    indicator?: Snippet<[{ size: Size }]>;
    children?: Snippet;
    onShow?: () => void;
    onHide?: () => void;
  }

  let {
    spinning = true,
    size = 'default',
    tip = '',
    delay = 0,
    minShowTime = 0,
    fullscreen = false,
    wrapperClassName = '',
    ariaLabel,
    indicator,
    children,
    onShow,
    onHide,
  }: Props = $props();

  const loc = useLocale();

  // effective：内部派生显示态，render 读它决定显隐（红线 #1）。
  let effective = $state(false);
  // controller 在 client $effect 命令式创建（SSR 安全），不在 render 路径触碰定时器。
  let ctrl: SpinController | null = $state(null);

  // effect A：mount 时创建 controller 并订阅；依赖 delay/minShowTime（变化才重建）。
  // 不依赖 spinning：避免 spinning 变化重建 controller 丢失去抖/最短显示状态。
  $effect(() => {
    const controller = createSpinController({ delay, minShowTime, spinning });
    ctrl = controller;
    effective = controller.getEffective();
    const unsub = controller.subscribe((v) => {
      effective = v;
      if (v) onShow?.();
      else onHide?.();
    });
    return () => {
      unsub();
      controller.destroy();
      ctrl = null;
    };
  });

  // effect B：仅依赖 spinning + ctrl，把受控请求推给 controller（红线 #1：只推入，不回写）。
  $effect(() => {
    ctrl?.setSpinning(spinning);
  });

  const isWrapper = $derived(children !== undefined && !fullscreen);
  const isFullscreen = $derived(fullscreen);
  const isInline = $derived(!isWrapper && !isFullscreen);

  const hasTip = $derived(tip.length > 0);
  // 有 tip 时 tip 文本作为可访问名；无 tip 时用 ariaLabel。
  const statusLabel = $derived(hasTip ? undefined : (ariaLabel ?? loc().t('Spin.loading')));

  const indicatorClass = $derived(`cd-spin__indicator cd-spin__indicator--${size}`);
</script>

{#snippet defaultIndicator()}
  <svg
    class={indicatorClass}
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
  >
    <circle
      class="cd-spin__track"
      cx="12"
      cy="12"
      r="10"
      fill="none"
      stroke="var(--cd-spin-track-color)"
      stroke-width="2.5"
    />
    <circle
      class="cd-spin__arc"
      cx="12"
      cy="12"
      r="10"
      fill="none"
      stroke="var(--cd-spin-color)"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-dasharray="47 63"
    />
  </svg>
{/snippet}

{#snippet spinner()}
  {#if indicator}
    {@render indicator({ size })}
  {:else}
    {@render defaultIndicator()}
  {/if}
{/snippet}

{#if isInline}
  <div
    class="cd-spin cd-spin--{size}"
    role="status"
    aria-live="polite"
    aria-label={statusLabel}
  >
    {@render spinner()}
    {#if hasTip}
      <div class="cd-spin__tip">{tip}</div>
    {/if}
  </div>
{:else if isFullscreen}
  {#if effective}
    <div
      class="cd-spin cd-spin--{size} cd-spin--fullscreen"
      role="status"
      aria-live="polite"
      aria-label={statusLabel}
    >
      <div class="cd-spin__box">
        {@render spinner()}
        {#if hasTip}
          <div class="cd-spin__tip">{tip}</div>
        {/if}
      </div>
    </div>
  {/if}
{:else}
  <div class="cd-spin-wrapper {wrapperClassName}">
    <div
      class="cd-spin__content"
      class:cd-spin__content--blur={effective}
      aria-busy={effective ? true : undefined}
      inert={effective ? true : undefined}
    >
      {@render children?.()}
    </div>
    {#if effective}
      <div
        class="cd-spin__overlay cd-spin--{size}"
        role="status"
        aria-live="polite"
        aria-label={statusLabel}
      >
        <div class="cd-spin__box">
          {@render spinner()}
          {#if hasTip}
            <div class="cd-spin__tip">{tip}</div>
          {/if}
        </div>
      </div>
    {/if}
  </div>
{/if}

<style>
  .cd-spin {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--cd-spin-tip-gap);
    color: var(--cd-spin-color);
  }

  .cd-spin__indicator {
    display: block;
    inline-size: var(--cd-spin-size-default);
    block-size: var(--cd-spin-size-default);
    animation: cd-spin-rotate var(--cd-spin-duration) linear infinite;
  }
  .cd-spin__indicator--small {
    inline-size: var(--cd-spin-size-small);
    block-size: var(--cd-spin-size-small);
  }
  .cd-spin__indicator--default {
    inline-size: var(--cd-spin-size-default);
    block-size: var(--cd-spin-size-default);
  }
  .cd-spin__indicator--large {
    inline-size: var(--cd-spin-size-large);
    block-size: var(--cd-spin-size-large);
  }

  .cd-spin__tip {
    color: var(--cd-spin-tip-color);
    font-size: var(--cd-spin-tip-font-size);
    text-align: center;
  }

  /* wrapper 形态 */
  .cd-spin-wrapper {
    position: relative;
  }
  .cd-spin__content {
    transition: opacity var(--cd-spin-fade-duration) var(--cd-motion-ease-standard);
  }
  .cd-spin__content--blur {
    opacity: 0.5;
    pointer-events: none;
    user-select: none;
  }
  .cd-spin__overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: var(--cd-spin-z);
    background: var(--cd-spin-mask-bg);
    animation: cd-spin-fade var(--cd-spin-fade-duration) var(--cd-motion-ease-standard);
  }

  /* fullscreen 形态 */
  .cd-spin--fullscreen {
    position: fixed;
    inset: 0;
    z-index: var(--cd-spin-z-fullscreen);
    background: var(--cd-spin-mask-bg);
    animation: cd-spin-fade var(--cd-spin-fade-duration) var(--cd-motion-ease-standard);
  }

  .cd-spin__box {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--cd-spin-tip-gap);
    color: var(--cd-spin-color);
  }

  @keyframes cd-spin-rotate {
    to {
      transform: rotate(360deg);
    }
  }
  @keyframes cd-spin-fade {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .cd-spin__indicator {
      animation: cd-spin-pulse var(--cd-spin-duration-reduced) ease-in-out infinite;
    }
    .cd-spin__overlay,
    .cd-spin--fullscreen {
      animation: none;
    }
    .cd-spin__content {
      transition: none;
    }
  }

  @keyframes cd-spin-pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.4;
    }
  }
</style>
