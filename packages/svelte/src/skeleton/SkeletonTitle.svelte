<!--
  SkeletonTitle — 单行标题骨架块。
  active 优先从 context 读（无 context 默认 false）；width 数字转 px。
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import { SKELETON_KEY, type SkeletonContext } from './context.js';

  interface Props {
    width?: string | number;
    height?: string | number;
    class?: string;
    style?: string;
  }

  let { width = '38%', height, class: className, style }: Props = $props();

  const ctx = getContext<SkeletonContext | undefined>(SKELETON_KEY);
  const active = $derived(ctx?.active ?? false);

  const inlineSize = $derived(typeof width === 'number' ? `${width}px` : width);
  const blockSize = $derived(
    height === undefined
      ? 'var(--cd-skeleton-title-height)'
      : typeof height === 'number'
        ? `${height}px`
        : height,
  );
  const cls = $derived(
    ['cd-skeleton__block', 'cd-skeleton__title', className].filter(Boolean).join(' '),
  );
</script>

<div
  class={cls}
  class:cd-skeleton__block--active={active}
  aria-hidden="true"
  style="inline-size:{inlineSize}; block-size:{blockSize}; {style ?? ''}"
></div>

<style>
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
