<!--
  List — see specs/components/show/List.spec.md
  基础子集：dataSource + renderItem、header/footer（string|Snippet）、bordered/split、
    loading（骨架/spinner）、empty。
  TODO(延后): 虚拟化、分页、grid 布局、selectable、loadMore、List.Item/Meta 子项。
-->
<script lang="ts" generics="T">
  import type { Snippet } from 'svelte';
  import Empty from '../empty/Empty.svelte';

  type ListSize = 'small' | 'default' | 'large';

  // 泛型组件 props 用内联类型而非具名 interface Props：在 declaration:true 下，
  // 引用泛型参数 T 的具名 interface 会被当作私有名泄漏进生成的 .d.ts 公共签名而报错。
  let {
    dataSource = [],
    renderItem,
    rowKey = 'key',
    size = 'default',
    bordered = false,
    split = true,
    header,
    footer,
    loading = false,
    loadingSkeleton = false,
    skeletonCount = 3,
    emptyContent,
    class: className = '',
  }: {
    dataSource?: T[];
    renderItem?: Snippet<[item: T, index: number]>;
    rowKey?: string | ((item: T) => string | number);
    size?: ListSize;
    bordered?: boolean;
    split?: boolean;
    header?: string | Snippet;
    footer?: string | Snippet;
    loading?: boolean;
    loadingSkeleton?: boolean;
    skeletonCount?: number;
    emptyContent?: string | Snippet;
    class?: string;
  } = $props();

  function isSnippet(v: unknown): v is Snippet {
    return typeof v === 'function';
  }

  function keyOf(item: T, index: number): string | number {
    if (typeof rowKey === 'function') return rowKey(item);
    const rec = item as unknown as Record<string, unknown>;
    const k = rec?.[rowKey];
    if (typeof k === 'string' || typeof k === 'number') return k;
    return index;
  }

  const isEmpty = $derived(!loading && dataSource.length === 0);
  const skeletonRows = $derived(Array.from({ length: Math.max(0, skeletonCount) }, (_, i) => i));

  const cls = $derived(
    [
      'cd-list',
      `cd-list--${size}`,
      bordered && 'cd-list--bordered',
      split && 'cd-list--split',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );
</script>

<div class={cls} aria-busy={loading || undefined}>
  {#if header !== undefined}
    <div class="cd-list__header">
      {#if isSnippet(header)}{@render header()}{:else}{header}{/if}
    </div>
  {/if}

  <div class="cd-list__body">
    {#if loading && loadingSkeleton}
      <ul class="cd-list__items" aria-hidden="true">
        {#each skeletonRows as i (i)}
          <li class="cd-list__item cd-list__item--skeleton">
            <span class="cd-list__skeleton-bar"></span>
          </li>
        {/each}
      </ul>
    {:else if loading}
      <div class="cd-list__spinner-wrap">
        <span class="cd-list__spinner" aria-hidden="true"></span>
      </div>
    {:else if isEmpty}
      <div class="cd-list__empty">
        {#if isSnippet(emptyContent)}
          {@render emptyContent()}
        {:else if emptyContent !== undefined}
          {emptyContent}
        {:else}
          <Empty image="noData" />
        {/if}
      </div>
    {:else}
      <ul class="cd-list__items">
        {#each dataSource as item, index (keyOf(item, index))}
          <li class="cd-list__item">
            {#if renderItem}{@render renderItem(item, index)}{/if}
          </li>
        {/each}
      </ul>
    {/if}
  </div>

  {#if footer !== undefined}
    <div class="cd-list__footer">
      {#if isSnippet(footer)}{@render footer()}{:else}{footer}{/if}
    </div>
  {/if}
</div>

<style>
  .cd-list {
    background: var(--cd-list-bg);
    color: var(--cd-list-item-color);
    --cd-list-pad-y: var(--cd-list-item-padding);
  }
  .cd-list--small {
    --cd-list-pad-y: var(--cd-list-item-padding-small);
  }
  .cd-list--bordered {
    border: 1px solid var(--cd-list-border);
    border-radius: var(--cd-list-radius);
    overflow: hidden;
  }

  .cd-list__header {
    padding-block: var(--cd-list-pad-y);
    padding-inline: var(--cd-list-item-padding);
    color: var(--cd-list-header-color);
    border-block-end: 1px solid var(--cd-list-split-color);
  }
  .cd-list__footer {
    padding-block: var(--cd-list-pad-y);
    padding-inline: var(--cd-list-item-padding);
    border-block-start: 1px solid var(--cd-list-split-color);
  }

  .cd-list__items {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .cd-list__item {
    padding-block: var(--cd-list-pad-y);
    padding-inline: var(--cd-list-item-padding);
  }
  .cd-list--split .cd-list__item + .cd-list__item {
    border-block-start: 1px solid var(--cd-list-split-color);
  }

  .cd-list__empty {
    padding-block: var(--cd-list-item-padding);
    display: flex;
    justify-content: center;
  }

  .cd-list__spinner-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-block: calc(var(--cd-list-item-padding) * 2);
  }
  .cd-list__spinner {
    inline-size: 1.5em;
    block-size: 1.5em;
    border: 2px solid var(--cd-list-split-color);
    border-block-start-color: var(--cd-color-primary, currentColor);
    border-radius: var(--cd-radius-full);
    animation: cd-list-spin 0.7s linear infinite;
  }

  .cd-list__skeleton-bar {
    display: block;
    block-size: 1em;
    inline-size: 100%;
    border-radius: var(--cd-radius-small);
    background: var(--cd-list-split-color);
    position: relative;
    overflow: hidden;
  }
  .cd-list__skeleton-bar::after {
    content: '';
    position: absolute;
    inset: 0;
    transform: translateX(-100%);
    background: linear-gradient(
      90deg,
      transparent,
      var(--cd-list-bg),
      transparent
    );
    animation: cd-list-shimmer 1.2s ease-in-out infinite;
  }

  @keyframes cd-list-spin {
    to {
      transform: rotate(360deg);
    }
  }
  @keyframes cd-list-shimmer {
    100% {
      transform: translateX(100%);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .cd-list__spinner {
      animation: none;
    }
    .cd-list__skeleton-bar::after {
      animation: none;
    }
  }
</style>
