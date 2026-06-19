<!--
  List — see specs/components/show/List.spec.md
  基础子集：dataSource + renderItem、header/footer（string|Snippet）、bordered/split、
    loading（骨架/spinner）、empty、loadMore（内置按钮/自定义）、grid 网格布局。
  TODO(延后): 虚拟化、分页、selectable、List.Item/Meta 子项。
-->
<script lang="ts" generics="T">
  import type { Snippet } from 'svelte';
  import Empty from '../empty/Empty.svelte';
  import { Button } from '../button/index.js';
  import { useLocale } from '../locale-provider/index.js';

  type ListSize = 'small' | 'default' | 'large';
  type GridConfig = number | { column?: number; gutter?: number };

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
    grid,
    loadMore,
    onLoadMore,
    loadingMore = false,
    hasMore = false,
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
    /** 网格布局：列数或 { column, gutter } */
    grid?: GridConfig;
    /** 自定义底部加载区（优先于内置按钮） */
    loadMore?: Snippet;
    /** 内置「加载更多」按钮回调 */
    onLoadMore?: () => void;
    /** 内置按钮 loading 态 */
    loadingMore?: boolean;
    /** 是否还有更多（控制内置按钮显隐） */
    hasMore?: boolean;
    class?: string;
  } = $props();

  const loc = useLocale();

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

  // grid 布局：解析列数/间距，生成 inline CSS（CSS grid）。
  const gridOn = $derived(grid !== undefined);
  const gridColumn = $derived(
    typeof grid === 'number' ? grid : (grid?.column ?? 4),
  );
  const gridGutter = $derived(
    typeof grid === 'object' ? (grid.gutter ?? 16) : 16,
  );
  const gridStyle = $derived(
    gridOn
      ? `display:grid;grid-template-columns:repeat(${gridColumn},minmax(0,1fr));gap:${gridGutter}px`
      : undefined,
  );

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
      <ul class="cd-list__items" class:cd-list__items--grid={gridOn} style={gridStyle}>
        {#each dataSource as item, index (keyOf(item, index))}
          <li class="cd-list__item" class:cd-list__item--grid={gridOn}>
            {#if renderItem}{@render renderItem(item, index)}{/if}
          </li>
        {/each}
      </ul>

      {#if loadMore}
        <div class="cd-list__load-more">{@render loadMore()}</div>
      {:else if onLoadMore !== undefined && (hasMore || loadingMore)}
        <div class="cd-list__load-more">
          <Button
            loading={loadingMore}
            disabled={!hasMore && !loadingMore}
            onclick={() => onLoadMore?.()}
          >
            {loc().t('List.loadMore')}
          </Button>
        </div>
      {/if}
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
  /* grid 模式：取消 split 分隔线与行内边距，由 grid gap 控制间距 */
  .cd-list__items--grid {
    padding-block: var(--cd-list-pad-y);
  }
  .cd-list--split .cd-list__item--grid + .cd-list__item--grid {
    border-block-start: none;
  }
  .cd-list__item--grid {
    padding: 0;
  }

  .cd-list__load-more {
    display: flex;
    justify-content: center;
    padding-block: var(--cd-list-item-padding);
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
