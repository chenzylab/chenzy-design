<!--
  SkeletonParagraph — 多行段落骨架块。
  宽度规则：width 是数组按行取（越界用 100%）；是单值时全部行用该值；
  未给 width 时末行收窄到 61%、其余 100%。
  active 优先从 context 读（无 context 默认 false）。
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import { SKELETON_KEY, type SkeletonContext } from './context.js';

  interface Props {
    rows?: number;
    width?: string | number | Array<string | number>;
    class?: string;
    style?: string;
  }

  let { rows = 3, width, class: className, style }: Props = $props();

  const ctx = getContext<SkeletonContext | undefined>(SKELETON_KEY);
  const active = $derived(ctx?.active ?? false);

  function toLength(value: string | number): string {
    return typeof value === 'number' ? `${value}px` : value;
  }

  const widths = $derived.by(() => {
    const list: string[] = [];
    for (let i = 0; i < rows; i++) {
      const last = i === rows - 1;
      if (Array.isArray(width)) {
        const v = width[i];
        list.push(v === undefined ? '100%' : toLength(v));
      } else if (width === undefined) {
        list.push(last ? '61%' : '100%');
      } else {
        list.push(toLength(width));
      }
    }
    return list;
  });

  const cls = $derived(
    ['cd-skeleton__paragraph', className].filter(Boolean).join(' '),
  );
</script>

<ul class={cls} aria-hidden="true" style={style}>
  {#each widths as w, i (i)}
    <li
      class="cd-skeleton__block cd-skeleton__paragraph-row"
      class:cd-skeleton__block--active={active}
      style="inline-size:{w}"
    ></li>
  {/each}
</ul>

<style>
  .cd-skeleton__paragraph {
    display: flex;
    flex-direction: column;
    gap: var(--cd-skeleton-gap);
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .cd-skeleton__paragraph-row {
    block-size: var(--cd-skeleton-paragraph-height);
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
