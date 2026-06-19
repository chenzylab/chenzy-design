<!--
  BackTop — 回到顶部悬浮按钮。
  基础子集：window target + 阈值显隐 + 平滑缓动回顶 + 三尺寸。
  TODO(延后):
    - 自定义 target 元素（监听指定容器滚动）
    - 受控 visible
    - announceOnArrive（到顶后 live region 播报）

  ⚠️ 死循环红线：
    - 滚动监听用 $effect 内命令式 addEventListener('scroll', ..., {passive:true})
      + rAF 节流，cleanup 时 removeEventListener + cancelAnimationFrame。
    - visible 仅在 scroll 回调（非 render 期）写入本地 $state。
    - render 期只读 visible $state，绝不读 scrollTop 几何。
    - 回顶动画亦为命令式 rAF 循环；卸载时在 $effect cleanup 中 cancel。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { isAboveThreshold, scrollPositionAt } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';

  type Size = 'small' | 'default' | 'large';

  interface Props {
    /** 滚动超过此高度(px)显示按钮 */
    visibilityHeight?: number;
    /** 回顶动画时长(ms)，0 表示瞬时 */
    duration?: number;
    /** 距底偏移，number → px */
    bottom?: number | string;
    /** 距 inline-end 偏移，number → px */
    right?: number | string;
    size?: Size;
    ariaLabel?: string;
    /** 替换图标（保留圆形按钮外壳） */
    icon?: Snippet<[{ size: Size }]>;
    /** 完全自定义按钮内容 */
    children?: Snippet<[{ visible: boolean }]>;
    onClick?: (e: MouseEvent) => void;
    onVisibleChange?: (info: { visible: boolean }) => void;
    onScrollEnd?: () => void;
    class?: string;
  }

  let {
    visibilityHeight = 400,
    duration = 450,
    bottom = 40,
    right = 40,
    size = 'default',
    ariaLabel,
    icon,
    children,
    onClick,
    onVisibleChange,
    onScrollEnd,
    class: className = '',
  }: Props = $props();

  const loc = useLocale();

  // 本地响应式状态：仅由命令式 scroll 回调写入，render 期只读。
  let visible = $state(false);

  // 偏移样式：number → px。
  const bottomPx = $derived(typeof bottom === 'number' ? `${bottom}px` : bottom);
  const rightPx = $derived(typeof right === 'number' ? `${right}px` : right);

  // 减弱动效偏好（命令式读取，仅 client）。
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

  // 滚动监听（命令式 + rAF 节流 + cleanup）。$effect 仅 client 运行，SSR 安全。
  $effect(() => {
    let rafId = 0;

    function onScroll() {
      if (rafId) return; // rAF 节流
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        // scrollTop 读取发生在回调中（非 render 期）。
        const top = window.scrollY;
        const next = isAboveThreshold(top, visibilityHeight);
        if (next !== visible) {
          visible = next;
          onVisibleChange?.({ visible: next });
        }
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // 初始判定一次
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  });

  // 回顶动画的 rAF 句柄（组件级，供卸载 cleanup 取消）。
  let scrollRaf = 0;

  $effect(() => {
    // 仅注册卸载时取消未完成的回顶动画。
    return () => {
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
    };
  });

  function scrollToTop(e: MouseEvent) {
    onClick?.(e);
    const from = window.scrollY;
    if (duration <= 0 || reduced) {
      window.scrollTo(0, 0);
      onScrollEnd?.();
      return;
    }
    if (scrollRaf) cancelAnimationFrame(scrollRaf);
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      window.scrollTo(0, scrollPositionAt(from, elapsed, duration));
      if (elapsed < duration) {
        scrollRaf = requestAnimationFrame(step);
      } else {
        scrollRaf = 0;
        onScrollEnd?.();
      }
    };
    scrollRaf = requestAnimationFrame(step);
  }
</script>

<button
  type="button"
  class="cd-backtop cd-backtop--{size} {className}"
  class:cd-backtop--visible={visible}
  aria-label={ariaLabel ?? loc().t('BackTop.ariaLabel')}
  aria-hidden={!visible}
  tabindex={visible ? 0 : -1}
  style="--cd-backtop-offset-bottom:{bottomPx}; --cd-backtop-offset-inline-end:{rightPx}"
  onclick={scrollToTop}
>
  {#if children}
    {@render children({ visible })}
  {:else if icon}
    {@render icon({ size })}
  {:else}
    <svg class="cd-backtop__icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M12 19V5M5 12l7-7 7 7"
      />
    </svg>
  {/if}
</button>

<style>
  .cd-backtop {
    position: fixed;
    inset-block-end: var(--cd-backtop-offset-bottom, 40px);
    inset-inline-end: var(--cd-backtop-offset-inline-end, 40px);
    inline-size: var(--cd-backtop-size);
    block-size: var(--cd-backtop-size);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: 1px solid transparent;
    border-radius: var(--cd-backtop-radius);
    background: var(--cd-backtop-bg);
    color: var(--cd-backtop-color);
    box-shadow: var(--cd-backtop-shadow);
    cursor: pointer;
    z-index: var(--cd-backtop-z);
    /* 隐藏态（默认） */
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transform: translateY(8px);
    transition:
      opacity var(--cd-backtop-motion-duration) ease,
      transform var(--cd-backtop-motion-duration) ease,
      visibility var(--cd-backtop-motion-duration) ease;
  }

  .cd-backtop--visible {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
    transform: translateY(0);
  }

  .cd-backtop--small {
    inline-size: var(--cd-backtop-size-small);
    block-size: var(--cd-backtop-size-small);
  }

  .cd-backtop--large {
    inline-size: var(--cd-backtop-size-large);
    block-size: var(--cd-backtop-size-large);
  }

  .cd-backtop:hover {
    background: var(--cd-backtop-bg-hover);
  }

  .cd-backtop:active {
    background: var(--cd-backtop-bg-active);
  }

  .cd-backtop:focus-visible {
    outline: 2px solid var(--cd-backtop-focus-ring);
    outline-offset: 2px;
  }

  .cd-backtop__icon {
    inline-size: 50%;
    block-size: 50%;
  }

  @media (prefers-reduced-motion: reduce) {
    .cd-backtop {
      transition: none;
    }
  }
</style>
