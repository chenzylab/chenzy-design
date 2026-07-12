<!--
  SkeletonImage — 大矩形图片骨架块，showIcon 时中心放弱色图片图标。
  active 优先从 context 读（无 context 默认 false）。
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import { SKELETON_KEY, type SkeletonContext } from './context.js';

  interface Props {
    width?: string | number | undefined;
    height?: string | number | undefined;
    showIcon?: boolean;
    class?: string;
    style?: string;
  }

  let {
    width = '100%',
    height = '120px',
    showIcon = true,
    class: className,
    style,
  }: Props = $props();

  const ctx = getContext<SkeletonContext | undefined>(SKELETON_KEY);
  const active = $derived(ctx?.active ?? false);

  const inlineSize = $derived(typeof width === 'number' ? `${width}px` : width);
  const blockSize = $derived(typeof height === 'number' ? `${height}px` : height);
  const cls = $derived(
    ['cd-skeleton__block', 'cd-skeleton__image', className].filter(Boolean).join(' '),
  );
</script>

<div
  class={cls}
  class:cd-skeleton__block--active={active}
  aria-hidden="true"
  style="inline-size:{inlineSize}; block-size:{blockSize}; {style ?? ''}"
>
  {#if showIcon}
    <svg
      class="cd-skeleton__image-icon"
      viewBox="0 0 48 48"
      width="32"
      height="32"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M40 8H8a4 4 0 0 0-4 4v24a4 4 0 0 0 4 4h32a4 4 0 0 0 4-4V12a4 4 0 0 0-4-4Zm0 28H8v-6l8-8 6 6 10-10 8 8v10ZM16 22a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z"
      />
    </svg>
  {/if}
</div>

<style>
  .cd-skeleton__image {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .cd-skeleton__image-icon {
    color: var(--cd-skeleton-image-icon-color);
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
