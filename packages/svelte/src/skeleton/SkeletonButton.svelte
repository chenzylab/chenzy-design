<!--
  SkeletonButton — 按钮骨架块（矩形 / 胶囊）。
  size 映射高度 small 24 / default 32 / large 40；block 时宽 100%，否则默认约 64px。
  active 优先从 context 读（无 context 默认 false）。
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import { SKELETON_KEY, type SkeletonContext } from './context.js';

  interface Props {
    size?: 'small' | 'default' | 'large';
    block?: boolean;
    pill?: boolean;
    width?: string | number;
    class?: string;
    style?: string;
  }

  let {
    size = 'default',
    block = false,
    pill = false,
    width,
    class: className,
    style,
  }: Props = $props();

  const ctx = getContext<SkeletonContext | undefined>(SKELETON_KEY);
  const active = $derived(ctx?.active ?? false);

  const heightPx = $derived(size === 'small' ? 24 : size === 'large' ? 40 : 32);
  const inlineSize = $derived.by(() => {
    if (block) return '100%';
    if (width !== undefined) return typeof width === 'number' ? `${width}px` : width;
    return '64px';
  });
  const radius = $derived(
    pill ? 'var(--cd-skeleton-radius-pill)' : 'var(--cd-skeleton-radius)',
  );
  const cls = $derived(
    ['cd-skeleton__block', 'cd-skeleton__button', className].filter(Boolean).join(' '),
  );
</script>

<div
  class={cls}
  class:cd-skeleton__block--active={active}
  aria-hidden="true"
  style="inline-size:{inlineSize}; block-size:{heightPx}px; border-radius:{radius}; {style ??
    ''}"
></div>

<style>
  .cd-skeleton__button {
    display: inline-block;
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
