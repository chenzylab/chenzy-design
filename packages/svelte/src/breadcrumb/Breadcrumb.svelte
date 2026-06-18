<!--
  Breadcrumb — see specs/components/navigation/Breadcrumb.spec.md
  Data-driven `routes` mode (browser-verifiable) + declarative `children` mode.
  TODO: maxItemCount collapse, showTooltip, moreType popover, renderItem/renderMore.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { BreadcrumbRoute } from './types.js';

  type BreadcrumbSize = 'small' | 'default' | 'large';

  interface Props {
    routes?: BreadcrumbRoute[];
    separator?: string;
    size?: BreadcrumbSize;
    class?: string;
    children?: Snippet;
    onClick?: (route: BreadcrumbRoute, index: number) => void;
  }

  let {
    routes = [],
    separator = '/',
    size = 'default',
    class: className = '',
    children,
    onClick,
  }: Props = $props();

  const cls = $derived(
    ['cd-breadcrumb', `cd-breadcrumb--${size}`, className].filter(Boolean).join(' '),
  );

  const hasRoutes = $derived(routes.length > 0);

  function handleClick(route: BreadcrumbRoute, index: number) {
    onClick?.(route, index);
  }
</script>

<nav class={cls} aria-label="面包屑">
  {#if hasRoutes}
    <ol class="cd-breadcrumb__list">
      {#each routes as route, index (index)}
        {@const isLast = index === routes.length - 1}
        <li class="cd-breadcrumb__item">
          {#if isLast}
            <span class="cd-breadcrumb__current" aria-current="page">{route.label}</span>
          {:else if route.href}
            <a
              class="cd-breadcrumb__link"
              href={route.href}
              onclick={() => handleClick(route, index)}>{route.label}</a
            >
          {:else}
            <span
              class="cd-breadcrumb__text"
              role="link"
              tabindex="0"
              onclick={() => handleClick(route, index)}
              onkeydown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleClick(route, index);
                }
              }}>{route.label}</span
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
</style>
