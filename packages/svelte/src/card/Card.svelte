<!--
  Card — see specs/components/show/Card.spec.md
  Container: cover → header → body (with loading skeleton) → actions.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { useId } from '@chenzy-design/core';

  type CardSize = 'small' | 'default' | 'large';
  type CardShadow = 'never' | 'hover' | 'always';

  interface Props {
    title?: string | Snippet;
    extra?: Snippet;
    cover?: Snippet;
    actions?: Snippet;
    size?: CardSize;
    bordered?: boolean;
    shadow?: CardShadow;
    hoverable?: boolean;
    loading?: boolean;
    loadingRows?: number;
    children?: Snippet;
  }

  let {
    title,
    extra,
    cover,
    actions,
    size = 'default',
    bordered = true,
    shadow = 'never',
    hoverable = false,
    loading = false,
    loadingRows = 3,
    children,
  }: Props = $props();

  const titleId = useId('cd-card-title');
  const titleIsString = $derived(typeof title === 'string');
  const titleText = $derived(typeof title === 'string' ? title : undefined);
  const titleSnippet = $derived(typeof title === 'function' ? title : undefined);
  const hasTitle = $derived(title !== undefined);
  const hasHeader = $derived(hasTitle || extra !== undefined);

  // skeleton rows is render-only (derived from a number prop, not a mounted array)
  const rows = $derived(
    Array.from({ length: Math.max(0, loadingRows) }, (_, i) => i),
  );

  const cls = $derived(
    [
      'cd-card',
      `cd-card--${size}`,
      bordered && 'cd-card--bordered',
      `cd-card--shadow-${shadow}`,
      (hoverable || shadow === 'hover') && 'cd-card--hoverable',
    ]
      .filter(Boolean)
      .join(' '),
  );
</script>

<div
  class={cls}
  role={hasTitle ? 'region' : undefined}
  aria-labelledby={titleIsString ? titleId : undefined}
>
  {#if cover}
    <div class="cd-card__cover">{@render cover()}</div>
  {/if}

  {#if hasHeader}
    <div class="cd-card__header">
      {#if hasTitle}
        <div class="cd-card__title" id={titleIsString ? titleId : undefined}>
          {#if titleText !== undefined}
            {titleText}
          {:else if titleSnippet}
            {@render titleSnippet()}
          {/if}
        </div>
      {/if}
      {#if extra}
        <div class="cd-card__extra">{@render extra()}</div>
      {/if}
    </div>
  {/if}

  <div class="cd-card__body">
    {#if loading}
      <div class="cd-card__skeleton" aria-hidden="true">
        {#each rows as row (row)}
          <span class="cd-card__skeleton-row"></span>
        {/each}
      </div>
    {:else}
      {@render children?.()}
    {/if}
  </div>

  {#if actions}
    <div class="cd-card__actions">{@render actions()}</div>
  {/if}
</div>

<style>
  .cd-card {
    display: flex;
    flex-direction: column;
    background: var(--cd-card-bg);
    border: 1px solid transparent;
    border-radius: var(--cd-card-radius);
    overflow: hidden;
    transition: box-shadow var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-card--bordered {
    border-color: var(--cd-card-border);
  }
  .cd-card--shadow-always {
    box-shadow: var(--cd-card-shadow);
  }
  .cd-card--hoverable:hover,
  .cd-card--shadow-hover:hover {
    box-shadow: var(--cd-card-shadow-hover);
  }

  .cd-card__cover {
    display: block;
    overflow: hidden;
  }
  .cd-card__cover :global(img) {
    display: block;
    inline-size: 100%;
  }

  .cd-card__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--cd-spacing-3);
    padding: var(--cd-card-padding);
    border-block-end: 1px solid var(--cd-card-header-border);
  }
  .cd-card--small .cd-card__header {
    padding: var(--cd-card-padding-small);
  }
  .cd-card__title {
    color: var(--cd-card-title-color);
    font-weight: var(--cd-font-weight-semibold);
    font-size: var(--cd-font-size-3);
    min-inline-size: 0;
  }
  .cd-card--small .cd-card__title {
    font-size: var(--cd-font-size-2);
  }
  .cd-card--large .cd-card__title {
    font-size: var(--cd-font-size-4);
  }
  .cd-card__extra {
    flex: 0 0 auto;
    color: var(--cd-color-text-2);
    font-size: var(--cd-font-size-2);
  }

  .cd-card__body {
    flex: 1 1 auto;
    padding: var(--cd-card-padding);
    color: var(--cd-color-text-0);
  }
  .cd-card--small .cd-card__body {
    padding: var(--cd-card-padding-small);
  }

  .cd-card__actions {
    display: flex;
    align-items: center;
    border-block-start: 1px solid var(--cd-card-header-border);
  }
  .cd-card__actions :global(> *) {
    flex: 1 1 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-block: var(--cd-spacing-3);
  }
  .cd-card__actions :global(> * + *) {
    border-inline-start: 1px solid var(--cd-card-header-border);
  }

  .cd-card__skeleton {
    display: flex;
    flex-direction: column;
    gap: var(--cd-spacing-3);
  }
  .cd-card__skeleton-row {
    display: block;
    block-size: 0.9em;
    border-radius: var(--cd-radius-1);
    background: linear-gradient(
      90deg,
      var(--cd-color-fill-0) 25%,
      var(--cd-color-fill-1) 37%,
      var(--cd-color-fill-0) 63%
    );
    background-size: 400% 100%;
    animation: cd-card-shimmer 1.4s ease infinite;
  }
  .cd-card__skeleton-row:last-child {
    inline-size: 60%;
  }

  @keyframes cd-card-shimmer {
    0% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0 50%;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-card,
    .cd-card__skeleton-row {
      transition: none;
      animation: none;
    }
  }
</style>
