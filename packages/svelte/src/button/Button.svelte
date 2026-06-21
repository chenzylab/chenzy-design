<!--
  Button — see specs/components/basic/Button.spec.md
  Token-driven, a11y-correct (native <button>/<a>), no hardcoded values.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  type ButtonType = 'primary' | 'secondary' | 'tertiary' | 'warning' | 'danger';
  type ButtonTheme = 'solid' | 'borderless' | 'light' | 'outline';
  type ButtonSize = 'small' | 'default' | 'large';

  interface Props {
    type?: ButtonType;
    theme?: ButtonTheme;
    size?: ButtonSize;
    block?: boolean;
    disabled?: boolean;
    loading?: boolean;
    htmlType?: 'button' | 'submit' | 'reset';
    href?: string;
    /** required for icon-only buttons */
    ariaLabel?: string;
    icon?: Snippet;
    /** 图标相对文字位置。spec §4 L27 */
    iconPosition?: 'left' | 'right';
    children?: Snippet;
    onclick?: (e: MouseEvent) => void;
  }

  let {
    type = 'secondary',
    theme = 'light',
    size = 'default',
    block = false,
    disabled = false,
    loading = false,
    htmlType = 'button',
    href,
    ariaLabel,
    icon,
    iconPosition = 'left',
    children,
    onclick,
  }: Props = $props();

  const cls = $derived(
    [
      'cd-button',
      `cd-button--${type}`,
      `cd-button--${theme}`,
      `cd-button--${size}`,
      block && 'cd-button--block',
      loading && 'cd-button--loading',
      icon && iconPosition === 'right' && 'cd-button--icon-right',
    ]
      .filter(Boolean)
      .join(' '),
  );

  function handleClick(e: MouseEvent) {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    onclick?.(e);
  }
</script>

{#if href}
  <a
    class={cls}
    href={disabled ? undefined : href}
    role="button"
    aria-disabled={disabled || undefined}
    aria-busy={loading || undefined}
    aria-label={ariaLabel}
    onclick={handleClick}
  >
    {#if icon}<span class="cd-button__icon">{@render icon()}</span>{/if}
    {@render children?.()}
  </a>
{:else}
  <button
    class={cls}
    type={htmlType}
    {disabled}
    aria-busy={loading || undefined}
    aria-label={ariaLabel}
    onclick={handleClick}
  >
    {#if icon}<span class="cd-button__icon">{@render icon()}</span>{/if}
    {@render children?.()}
  </button>
{/if}

<style>
  .cd-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--cd-spacing-2);
    height: var(--cd-button-height-default);
    padding-inline: var(--cd-button-padding-x);
    border: 1px solid transparent;
    border-radius: var(--cd-button-radius);
    font-size: var(--cd-button-font-size);
    font-weight: var(--cd-font-weight-medium);
    line-height: 1;
    cursor: pointer;
    transition:
      background-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard),
      border-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-button:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-button--small {
    height: var(--cd-button-height-small);
    font-size: var(--cd-font-size-1);
  }
  .cd-button--large {
    height: var(--cd-button-height-large);
    font-size: var(--cd-font-size-3);
  }
  .cd-button--block {
    width: 100%;
  }
  .cd-button--loading {
    cursor: default;
    opacity: 0.75;
  }
  .cd-button:disabled,
  .cd-button[aria-disabled='true'] {
    cursor: not-allowed;
    opacity: 0.5;
  }
  /* primary / solid */
  .cd-button--primary {
    background: var(--cd-button-color-bg-primary);
    color: var(--cd-button-color-text-primary);
  }
  .cd-button--secondary {
    background: var(--cd-color-fill-0);
    color: var(--cd-color-text-0);
  }
  .cd-button--tertiary {
    background: transparent;
    color: var(--cd-color-text-1);
  }
  .cd-button--warning {
    background: var(--cd-color-warning);
    color: var(--cd-color-text-inverse);
  }
  .cd-button--danger {
    background: var(--cd-color-danger);
    color: var(--cd-color-text-inverse);
  }
  .cd-button--outline {
    background: transparent;
    border-color: var(--cd-color-border);
    color: var(--cd-color-text-0);
  }
  .cd-button__icon {
    display: inline-flex;
  }
  /* iconPosition=right: 纯 CSS flex order, DOM 顺序不变 (spec §4 L27) */
  .cd-button--icon-right .cd-button__icon {
    order: 1;
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-button {
      transition: none;
    }
  }
</style>
