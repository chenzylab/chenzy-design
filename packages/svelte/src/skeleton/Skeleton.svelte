<!--
  Skeleton — 骨架屏容器。
  loading 切换占位/真实内容；active 控制 shimmer 动画（经 context 传给原子子组件）。
  loading 受控不回写（红线 #1）：仅由父级 prop 驱动，组件内部不修改。
  占位容器 aria-busy + aria-live=polite + aria-label；骨架块本身 aria-hidden。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { setContext } from 'svelte';
  import { SKELETON_KEY, type SkeletonContext } from './context.js';
  import SkeletonAvatar from './SkeletonAvatar.svelte';
  import SkeletonTitle from './SkeletonTitle.svelte';
  import SkeletonParagraph from './SkeletonParagraph.svelte';
  import { useLocale } from '../locale-provider/index.js';

  interface Props {
    loading?: boolean;
    active?: boolean;
    unmountPlaceholder?: boolean;
    placeholder?: Snippet;
    children?: Snippet;
    ariaLabel?: string;
    class?: string;
  }

  let {
    loading = true,
    active = false,
    // unmountPlaceholder 当前实现等同卸载（{#if loading}）；保留 prop 语义，false 行为暂同卸载。TODO: display:none 保留 DOM。
    unmountPlaceholder = true,
    placeholder,
    children,
    ariaLabel,
    class: className,
  }: Props = $props();

  const loc = useLocale();

  // setContext 一个带 getter 的对象：原子子组件读取 ctx.active 即建立响应式依赖。
  const ctx: SkeletonContext = {
    get active() {
      return active;
    },
  };
  setContext(SKELETON_KEY, ctx);

  const cls = $derived(
    ['cd-skeleton', active && 'cd-skeleton--active', className]
      .filter(Boolean)
      .join(' '),
  );
</script>

{#if loading}
  <div class={cls} aria-busy="true" aria-live="polite" aria-label={ariaLabel ?? loc().t('Skeleton.loading')}>
    {#if placeholder}
      {@render placeholder()}
    {:else}
      <div class="cd-skeleton__default">
        <SkeletonAvatar />
        <div class="cd-skeleton__default-body">
          <SkeletonTitle />
          <SkeletonParagraph />
        </div>
      </div>
    {/if}
  </div>
{:else}
  {@render children?.()}
{/if}

<style>
  .cd-skeleton {
    display: block;
  }
  .cd-skeleton__default {
    display: flex;
    gap: var(--cd-skeleton-gap);
    align-items: flex-start;
  }
  .cd-skeleton__default-body {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    gap: var(--cd-skeleton-gap);
    min-inline-size: 0;
  }
</style>
