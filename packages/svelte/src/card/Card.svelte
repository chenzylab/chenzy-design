<!--
  Card — see specs/components/show/Card.spec.md
  Container: cover → header → body (with loading skeleton) → actions.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { useId } from '@chenzy-design/core';

  type CardSize = 'small' | 'default' | 'large';
  type CardShadow = 'never' | 'hover' | 'always';

  export interface Props {
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
    /** header 区内联样式透传 */
    headerStyle?: string;
    /** body 区内联样式透传 */
    bodyStyle?: string;
    /** header 与 body 间是否显示分隔线 */
    headerLine?: boolean;
    /** actions 区上方是否显示分隔线 */
    footerLine?: boolean;
    /** actions/footer 区内联样式透传 */
    footerStyle?: string;
    /** 整卡可点击：合并 hoverable 视觉并启用键盘/点击激活与 role=button */
    clickable?: boolean;
    /** 仅在 clickable 时生效，禁用点击与 hover 反馈 */
    disabled?: boolean;
    class?: string;
    onClick?: (originalEvent: MouseEvent | KeyboardEvent) => void;
    onMouseenter?: (originalEvent: MouseEvent) => void;
    onMouseleave?: (originalEvent: MouseEvent) => void;
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
    headerStyle,
    bodyStyle,
    headerLine = true,
    footerLine = true,
    footerStyle,
    clickable = false,
    disabled = false,
    class: className,
    onClick,
    onMouseenter,
    onMouseleave,
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
      (hoverable || shadow === 'hover' || (clickable && !disabled)) &&
        'cd-card--hoverable',
      clickable && 'cd-card--clickable',
      clickable && disabled && 'cd-card--disabled',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );

  // clickable interaction: pure handlers, no global listeners → no cleanup needed
  function handleClick(e: MouseEvent) {
    if (!clickable || disabled) return;
    onClick?.(e);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (!clickable || disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      // Space: prevent page scroll on activation
      e.preventDefault();
      onClick?.(e);
    }
  }

  function handleMouseenter(e: MouseEvent) {
    onMouseenter?.(e);
  }
  function handleMouseleave(e: MouseEvent) {
    onMouseleave?.(e);
  }
</script>

<!--
  tabindex is only set together with role="button" (clickable, not disabled),
  so the element is interactive when focusable; the static check can't see the
  cross-attribute correlation.
-->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
  class={cls}
  role={clickable ? 'button' : hasTitle ? 'region' : undefined}
  aria-labelledby={titleIsString ? titleId : undefined}
  aria-busy={loading || undefined}
  aria-disabled={clickable && disabled ? 'true' : undefined}
  tabindex={clickable ? (disabled ? -1 : 0) : undefined}
  onclick={clickable ? handleClick : undefined}
  onkeydown={clickable ? handleKeydown : undefined}
  onmouseenter={onMouseenter ? handleMouseenter : undefined}
  onmouseleave={onMouseleave ? handleMouseleave : undefined}
>
  {#if cover}
    <div class="cd-card__cover">{@render cover()}</div>
  {/if}

  {#if hasHeader}
    <div
      class={['cd-card__header', !headerLine && 'cd-card__header--no-line']
        .filter(Boolean)
        .join(' ')}
      style={headerStyle}
    >
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

  <div class="cd-card__body" style={bodyStyle}>
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
    <div
      class={['cd-card__actions', !footerLine && 'cd-card__actions--no-line']
        .filter(Boolean)
        .join(' ')}
      style={footerStyle}
    >
      {@render actions()}
    </div>
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

  .cd-card--clickable {
    cursor: pointer;
    transition:
      box-shadow var(--cd-motion-duration-fast) var(--cd-motion-ease-standard),
      transform var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-card--clickable:not(.cd-card--disabled):hover {
    transform: translateY(-2px);
  }
  .cd-card--clickable:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-card--disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  .cd-card--disabled.cd-card--clickable:hover {
    transform: none;
    box-shadow: none;
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
    gap: var(--cd-spacing-base-tight);
    padding: var(--cd-card-padding);
    border-block-end: 1px solid var(--cd-card-header-border);
  }
  .cd-card__header--no-line {
    border-block-end: none;
  }
  .cd-card--small .cd-card__header {
    padding: var(--cd-card-padding-small);
  }
  .cd-card__title {
    color: var(--cd-card-title-color);
    font-weight: var(--cd-font-weight-bold);
    font-size: var(--cd-font-size-header-6);
    min-inline-size: 0;
  }
  .cd-card--small .cd-card__title {
    font-size: var(--cd-font-size-regular);
  }
  .cd-card--large .cd-card__title {
    font-size: var(--cd-font-size-header-4);
  }
  .cd-card__extra {
    flex: 0 0 auto;
    color: var(--cd-color-text-2);
    font-size: var(--cd-font-size-regular);
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
  .cd-card__actions--no-line {
    border-block-start: none;
  }
  .cd-card__actions :global(> *) {
    flex: 1 1 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-block: var(--cd-spacing-base-tight);
  }
  .cd-card__actions :global(> * + *) {
    border-inline-start: 1px solid var(--cd-card-header-border);
  }

  .cd-card__skeleton {
    display: flex;
    flex-direction: column;
    gap: var(--cd-spacing-base-tight);
  }
  .cd-card__skeleton-row {
    display: block;
    block-size: 0.9em;
    border-radius: var(--cd-border-radius-small);
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
    .cd-card--clickable,
    .cd-card__skeleton-row {
      transition: none;
      animation: none;
    }
    .cd-card--clickable:not(.cd-card--disabled):hover {
      transform: none;
    }
  }
</style>
