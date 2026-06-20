<!--
  Breadcrumb — see specs/components/navigation/Breadcrumb.spec.md
  Data-driven `routes` mode (browser-verifiable) + declarative `children` mode.
  maxItemCount: 超出时中间折叠为 ... 触发器（保留首项 + 末 maxItemCount-1 项），点击展开全部。
  TODO: showTooltip, moreType popover, renderItem/renderMore.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { useLocale } from '../locale-provider/index.js';
  import type { BreadcrumbRoute } from './types.js';

  type BreadcrumbSize = 'small' | 'default' | 'large';
  type DisplayCell =
    | { type: 'route'; route: BreadcrumbRoute; index: number }
    | { type: 'ellipsis'; count: number };

  interface Props {
    routes?: BreadcrumbRoute[];
    separator?: string;
    size?: BreadcrumbSize;
    /** 超出此数量时中间折叠（0 = 不折叠） */
    maxItemCount?: number;
    class?: string;
    children?: Snippet;
    onClick?: (route: BreadcrumbRoute, index: number) => void;
  }

  let {
    routes = [],
    separator = '/',
    size = 'default',
    maxItemCount = 0,
    class: className = '',
    children,
    onClick,
  }: Props = $props();

  const loc = useLocale();

  const cls = $derived(
    ['cd-breadcrumb', `cd-breadcrumb--${size}`, className].filter(Boolean).join(' '),
  );

  const hasRoutes = $derived(routes.length > 0);

  // 折叠：展开后显示全部；本地 $state。
  let expanded = $state(false);

  // 折叠生效：maxItemCount>0、未展开、路由数超上限。
  // 折叠后展示：首项 + ellipsis + 末 (maxItemCount-1) 项。
  const cells = $derived.by<DisplayCell[]>(() => {
    const all: DisplayCell[] = routes.map((route, index) => ({
      type: 'route',
      route,
      index,
    }));
    if (expanded || maxItemCount <= 0 || routes.length <= maxItemCount) return all;
    const tail = Math.max(1, maxItemCount - 1);
    const head = all.slice(0, 1);
    const rest = all.slice(1, routes.length - tail);
    const tailCells = all.slice(routes.length - tail);
    if (rest.length === 0) return all;
    return [...head, { type: 'ellipsis', count: rest.length }, ...tailCells];
  });

  function handleClick(route: BreadcrumbRoute, index: number) {
    onClick?.(route, index);
  }
</script>

<nav class={cls} aria-label={loc().t('Breadcrumb.ariaLabel')}>
  {#if hasRoutes}
    <ol class="cd-breadcrumb__list">
      {#each cells as cell, cellIndex (cell.type === 'route' ? `r-${cell.index}` : 'ellipsis')}
        {@const isLast = cellIndex === cells.length - 1}
        <li class="cd-breadcrumb__item">
          {#if cell.type === 'ellipsis'}
            <button
              type="button"
              class="cd-breadcrumb__more"
              aria-label={loc().t('Breadcrumb.moreLabel', { count: cell.count })}
              onclick={() => (expanded = true)}
            >…</button>
          {:else if isLast}
            <span class="cd-breadcrumb__current" aria-current="page">{cell.route.label}</span>
          {:else if cell.route.href}
            <a
              class="cd-breadcrumb__link"
              href={cell.route.href}
              onclick={() => handleClick(cell.route, cell.index)}>{cell.route.label}</a
            >
          {:else}
            <span
              class="cd-breadcrumb__text"
              role="link"
              tabindex="0"
              onclick={() => handleClick(cell.route, cell.index)}
              onkeydown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleClick(cell.route, cell.index);
                }
              }}>{cell.route.label}</span
            >
          {/if}
          {#if !isLast}
            <span class="cd-breadcrumb__separator" aria-hidden="true">{separator}</span>
          {/if}
        </li>
      {/each}
    </ol>
  {:else}
    <ol class="cd-breadcrumb__list">
      {@render children?.()}
    </ol>
  {/if}
</nav>

<style>
  .cd-breadcrumb {
    font-size: var(--cd-breadcrumb-font-size);
    color: var(--cd-breadcrumb-color);
  }
  .cd-breadcrumb--small {
    font-size: var(--cd-font-size-1);
  }
  .cd-breadcrumb--large {
    font-size: var(--cd-font-size-3);
  }
  .cd-breadcrumb__list {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--cd-breadcrumb-gap);
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .cd-breadcrumb__item {
    display: inline-flex;
    align-items: center;
    gap: var(--cd-breadcrumb-gap);
  }
  .cd-breadcrumb__separator {
    color: var(--cd-breadcrumb-separator-color);
    user-select: none;
  }
  .cd-breadcrumb__link,
  .cd-breadcrumb__text {
    color: var(--cd-breadcrumb-color-link);
    text-decoration: none;
    cursor: pointer;
    border-radius: var(--cd-radius-1);
  }
  .cd-breadcrumb__link:hover,
  .cd-breadcrumb__text:hover {
    text-decoration: underline;
  }
  .cd-breadcrumb__link:focus-visible,
  .cd-breadcrumb__text:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-breadcrumb__current {
    color: var(--cd-breadcrumb-color-active);
  }
  .cd-breadcrumb__more {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-inline-size: 1.5em;
    padding: 0 var(--cd-spacing-1);
    border: none;
    background: transparent;
    color: var(--cd-breadcrumb-color-link);
    font: inherit;
    line-height: 1;
    cursor: pointer;
    border-radius: var(--cd-radius-1);
  }
  .cd-breadcrumb__more:hover {
    background: var(--cd-color-fill-1);
  }
  .cd-breadcrumb__more:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
</style>
