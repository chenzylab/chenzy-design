<!--
  Badge — see specs/components/show/Badge.spec.md
  Wrapper-mode count/dot superscript OR standalone status dot.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  type BadgeType =
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'success'
    | 'warning'
    | 'danger';
  type BadgeTheme = 'solid' | 'light';
  type BadgePosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  type BadgeSize = 'small' | 'default';
  type BadgeStatus = 'default' | 'success' | 'processing' | 'error' | 'warning';

  interface Props {
    count?: number | string;
    dot?: boolean;
    overflowCount?: number;
    showZero?: boolean;
    type?: BadgeType;
    theme?: BadgeTheme;
    position?: BadgePosition;
    offset?: [number, number];
    size?: BadgeSize;
    status?: BadgeStatus;
    children?: Snippet;
    countContent?: Snippet;
  }

  let {
    count,
    dot = false,
    overflowCount = 99,
    showZero = false,
    type = 'danger',
    theme = 'solid',
    position = 'top-right',
    offset = [0, 0],
    size = 'default',
    status,
    children,
    countContent,
  }: Props = $props();

  const isNumber = $derived(typeof count === 'number');

  // displayed count text (overflow handling)
  const displayCount = $derived.by(() => {
    if (typeof count === 'number') {
      return count > overflowCount ? `${overflowCount}+` : String(count);
    }
    return count ?? '';
  });

  // whether a numeric/text count badge should be shown
  const showCount = $derived.by(() => {
    if (dot) return true;
    if (countContent) return true;
    if (isNumber) {
      if (count === 0 && !showZero) return false;
      return true;
    }
    return count !== undefined && count !== '';
  });

  // standalone status-dot mode: status set and no wrapped children
  const standalone = $derived(status !== undefined && !children);

  const statusColor = $derived(
    status === 'success'
      ? 'var(--cd-color-success)'
      : status === 'error'
        ? 'var(--cd-color-danger)'
        : status === 'warning'
          ? 'var(--cd-color-warning)'
          : status === 'processing'
            ? 'var(--cd-color-primary)'
            : 'var(--cd-color-text-3)',
  );

  const supStyle = $derived(
    `inset-block-${position.startsWith('top') ? 'start' : 'end'}:${offset[1]}px;` +
      `inset-inline-${position.endsWith('right') ? 'end' : 'start'}:${offset[0]}px`,
  );

  const supCls = $derived(
    [
      'cd-badge__sup',
      `cd-badge__sup--${type}`,
      `cd-badge__sup--${theme}`,
      `cd-badge__sup--${size}`,
      `cd-badge__sup--${position}`,
      dot && 'cd-badge__sup--dot',
    ]
      .filter(Boolean)
      .join(' '),
  );

  const supAriaLabel = $derived(dot ? undefined : String(displayCount));
</script>

{#if standalone}
  <span class="cd-badge cd-badge--status">
    <span
      class="cd-badge__status-dot"
      class:cd-badge__status-dot--processing={status === 'processing'}
      style="background:{statusColor}"
      aria-hidden="true"
    ></span>
    {#if count !== undefined && count !== ''}
      <span class="cd-badge__status-text">{count}</span>
    {/if}
  </span>
{:else}
  <span class="cd-badge">
    {@render children?.()}
    {#if showCount}
      <sup class={supCls} style={supStyle} aria-label={supAriaLabel}>
        {#if dot}
          <!-- dot only -->
        {:else if countContent}
          {@render countContent()}
        {:else}
          {displayCount}
        {/if}
      </sup>
    {/if}
  </span>
{/if}

<style>
  .cd-badge {
    position: relative;
    display: inline-flex;
    line-height: 1;
  }
  .cd-badge--status {
    align-items: center;
    gap: var(--cd-spacing-2);
  }

  .cd-badge__sup {
    position: absolute;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    min-inline-size: var(--cd-badge-size);
    block-size: var(--cd-badge-size);
    padding-inline: var(--cd-spacing-1);
    border-radius: var(--cd-radius-full);
    background: var(--cd-badge-bg);
    color: var(--cd-badge-color);
    font-size: var(--cd-badge-font-size);
    font-weight: var(--cd-font-weight-medium);
    line-height: 1;
    white-space: nowrap;
    box-shadow: 0 0 0 1px var(--cd-color-bg-0);
  }
  .cd-badge__sup--small {
    min-inline-size: var(--cd-badge-size-small);
    block-size: var(--cd-badge-size-small);
  }
  .cd-badge__sup--dot {
    min-inline-size: var(--cd-badge-dot-size);
    inline-size: var(--cd-badge-dot-size);
    block-size: var(--cd-badge-dot-size);
    padding: 0;
  }

  /* corner placement (default offsets translate over the edge) */
  .cd-badge__sup--top-right {
    inset-block-start: 0;
    inset-inline-end: 0;
    transform: translate(50%, -50%);
  }
  .cd-badge__sup--top-left {
    inset-block-start: 0;
    inset-inline-start: 0;
    transform: translate(-50%, -50%);
  }
  .cd-badge__sup--bottom-right {
    inset-block-end: 0;
    inset-inline-end: 0;
    transform: translate(50%, 50%);
  }
  .cd-badge__sup--bottom-left {
    inset-block-end: 0;
    inset-inline-start: 0;
    transform: translate(-50%, 50%);
  }

  /* type → semantic color (solid) */
  .cd-badge__sup--solid.cd-badge__sup--primary {
    background: var(--cd-color-primary);
    color: var(--cd-color-text-inverse);
  }
  .cd-badge__sup--solid.cd-badge__sup--secondary {
    background: var(--cd-color-text-2);
    color: var(--cd-color-text-inverse);
  }
  .cd-badge__sup--solid.cd-badge__sup--tertiary {
    background: var(--cd-color-text-3);
    color: var(--cd-color-text-inverse);
  }
  .cd-badge__sup--solid.cd-badge__sup--success {
    background: var(--cd-color-success);
    color: var(--cd-color-text-inverse);
  }
  .cd-badge__sup--solid.cd-badge__sup--warning {
    background: var(--cd-color-warning);
    color: var(--cd-color-text-inverse);
  }
  .cd-badge__sup--solid.cd-badge__sup--danger {
    background: var(--cd-color-danger);
    color: var(--cd-color-text-inverse);
  }

  /* light theme: tinted background + colored text */
  .cd-badge__sup--light.cd-badge__sup--primary {
    background: color-mix(in srgb, var(--cd-color-primary) 16%, var(--cd-color-bg-0));
    color: var(--cd-color-primary);
  }
  .cd-badge__sup--light.cd-badge__sup--secondary {
    background: var(--cd-color-fill-0);
    color: var(--cd-color-text-1);
  }
  .cd-badge__sup--light.cd-badge__sup--tertiary {
    background: var(--cd-color-fill-1);
    color: var(--cd-color-text-2);
  }
  .cd-badge__sup--light.cd-badge__sup--success {
    background: color-mix(in srgb, var(--cd-color-success) 16%, var(--cd-color-bg-0));
    color: var(--cd-color-success);
  }
  .cd-badge__sup--light.cd-badge__sup--warning {
    background: color-mix(in srgb, var(--cd-color-warning) 16%, var(--cd-color-bg-0));
    color: var(--cd-color-warning);
  }
  .cd-badge__sup--light.cd-badge__sup--danger {
    background: color-mix(in srgb, var(--cd-color-danger) 16%, var(--cd-color-bg-0));
    color: var(--cd-color-danger);
  }

  /* standalone status dot */
  .cd-badge__status-dot {
    display: inline-block;
    inline-size: var(--cd-badge-dot-size);
    block-size: var(--cd-badge-dot-size);
    border-radius: var(--cd-radius-full);
    flex: 0 0 auto;
  }
  .cd-badge__status-dot--processing {
    position: relative;
  }
  .cd-badge__status-dot--processing::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: inherit;
    animation: cd-badge-pulse 1.2s ease-in-out infinite;
  }
  .cd-badge__status-text {
    color: var(--cd-color-text-1);
    font-size: var(--cd-font-size-2);
  }

  @keyframes cd-badge-pulse {
    0% {
      transform: scale(1);
      opacity: 0.6;
    }
    100% {
      transform: scale(2.4);
      opacity: 0;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-badge__status-dot--processing::after {
      animation: none;
    }
  }
</style>
