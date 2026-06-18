<!--
  SkeletonAvatar — 头像骨架块（圆形 / 方形）。
  size 映射 small 24 / default 32 / large 40 / 数字直接 px。
  active 优先从 context 读（无 context 默认 false）。
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import { SKELETON_KEY, type SkeletonContext } from './context.js';

  interface Props {
    shape?: 'circle' | 'square';
    size?: 'small' | 'default' | 'large' | number;
    class?: string;
    style?: string;
  }

  let { shape = 'circle', size = 'default', class: className, style }: Props = $props();

  const ctx = getContext<SkeletonContext | undefined>(SKELETON_KEY);
  const active = $derived(ctx?.active ?? false);

  const px = $derived.by(() => {
    if (typeof size === 'number') return size;
    if (size === 'small') return 24;
    if (size === 'large') return 40;
    return 32;
  });
  const radius = $derived(
    shape === 'circle'
      ? 'var(--cd-skeleton-radius-pill)'
      : 'var(--cd-skeleton-radius)',
  );
  const cls = $derived(
    ['cd-skeleton__block', 'cd-skeleton__avatar', className].filter(Boolean).join(' '),
  );
</script>

<div
  class={cls}
  class:cd-skeleton__block--active={active}
  aria-hidden="true"
  style="inline-size:{px}px; block-size:{px}px; border-radius:{radius}; {style ?? ''}"
></div>

<style>
  .cd-skeleton__avatar {
    flex: 0 0 auto;
  }

  .cd-skeleton__block {
    background: var(--cd-skeleton-color-bg);
    border-radius: var(--cd-skeleton-radius);
  }
  .cd-skeleton__block--active {
    background-image: linear-gradient(
      90deg,
      var(--cd-skeleton-color-bg) 25%,
      var(--cd-skeleton-color-highlight) 37%,
      var(--cd-skeleton-color-bg) 63%
    );
    background-size: 400% 100%;
    animation: -global-cd-skeleton-shimmer var(--cd-skeleton-anim-duration)
      var(--cd-skeleton-anim-timing) infinite;
  }

  @keyframes -global-cd-skeleton-shimmer {
    0% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0 50%;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .cd-skeleton__block--active {
      animation: none;
      background-image: none;
      background: var(--cd-skeleton-color-bg);
    }
  }
</style>
