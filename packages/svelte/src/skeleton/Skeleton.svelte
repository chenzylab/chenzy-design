<!--
  Skeleton — 骨架屏容器。
  loading 切换占位/真实内容；active 控制 shimmer 动画（经 context 传给原子子组件）。
  loading 受控不回写（红线 #1）：仅由父级 prop 驱动，组件内部不修改。
  占位容器 aria-busy + aria-live=polite + aria-label；骨架块本身 aria-hidden。
  unmountPlaceholder=true（默认）：{#if} 条件渲染，未激活的一侧从 DOM 卸载。
  unmountPlaceholder=false（keepDOM）：占位与真实内容同时挂载，靠 display:none 切换，避免重挂开销。
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
    // unmountPlaceholder=true（默认）走 {#if} 卸载；false 走 keepDOM（display:none 切换）。
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

  // 状态渲染派生纯函数（红线 #2）：仅由入参算出隐藏标记，不产生副作用。
  function hidden(isLoading: boolean, showWhenLoading: boolean): boolean {
    return showWhenLoading ? !isLoading : isLoading;
  }
</script>

{#snippet placeholderBody()}
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
{/snippet}

{#if unmountPlaceholder}
  {#if loading}
    <div class={cls} role="status" aria-busy="true" aria-live="polite" aria-label={ariaLabel ?? loc().t('Skeleton.loading')}>
      {@render placeholderBody()}
    </div>
  {:else}
    {@render children?.()}
  {/if}
{:else}
  <!-- keepDOM：两侧均挂载，靠 display:none 切换；隐藏侧加 inert/aria-hidden 防焦点与朗读。 -->
  <div
    class={cls}
    role="status"
    aria-busy="true"
    aria-live="polite"
    aria-label={ariaLabel ?? loc().t('Skeleton.loading')}
    aria-hidden={hidden(loading, true) ? 'true' : undefined}
    inert={hidden(loading, true)}
    hidden={hidden(loading, true)}
  >
    {@render placeholderBody()}
  </div>
  <div
    class="cd-skeleton__content"
    aria-hidden={hidden(loading, false) ? 'true' : undefined}
    inert={hidden(loading, false)}
    hidden={hidden(loading, false)}
  >
    {@render children?.()}
  </div>
{/if}

<style>
  .cd-skeleton {
    display: block;
  }
  .cd-skeleton__content {
    display: contents;
  }
  /* keepDOM 隐藏侧：[hidden] 须压过 .cd-skeleton 的 display:block 与 __content 的 display:contents。 */
  .cd-skeleton[hidden],
  .cd-skeleton__content[hidden] {
    display: none;
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
