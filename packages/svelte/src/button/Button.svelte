<!--
  Button — see specs/components/basic/Button.spec.md
  Token-driven, a11y-correct (native <button>/<a>), no hardcoded values.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import {
    getButtonGroupContext,
    type ButtonType,
    type ButtonTheme,
    type ButtonSize,
  } from './context.js';

  interface Props {
    type?: ButtonType;
    theme?: ButtonTheme;
    size?: ButtonSize;
    block?: boolean;
    disabled?: boolean;
    loading?: boolean;
    /** AI 多彩按钮：solid/light 主题下用品牌渐变背景（对齐 Semi AI 风格）。 */
    colorful?: boolean;
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
    type: typeProp,
    theme: themeProp,
    size: sizeProp,
    block = false,
    disabled: disabledProp,
    loading = false,
    colorful = false,
    htmlType = 'button',
    href,
    ariaLabel,
    icon,
    iconPosition = 'left',
    children,
    onclick,
  }: Props = $props();

  // ButtonGroup 上下文：仅在未显式设置对应 prop 时作为默认回退（显式 prop 始终优先）。
  const group = getButtonGroupContext();
  const type = $derived<ButtonType>(typeProp ?? group?.type ?? 'secondary');
  const theme = $derived<ButtonTheme>(themeProp ?? group?.theme ?? 'light');
  const size = $derived<ButtonSize>(sizeProp ?? group?.size ?? 'default');
  const disabled = $derived<boolean>(disabledProp ?? group?.disabled ?? false);

  const cls = $derived(
    [
      'cd-button',
      `cd-button--${type}`,
      `cd-button--${theme}`,
      `cd-button--${size}`,
      block && 'cd-button--block',
      loading && 'cd-button--loading',
      colorful && 'cd-button--colorful',
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

<!-- loading 时显示旋转加载图标（优先于用户 icon）；否则渲染用户 icon -->
{#snippet leadingIcon()}
  {#if loading}
    <span class="cd-button__icon cd-button__icon--spin" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
        <path d="M12 3a9 9 0 1 0 9 9" />
      </svg>
    </span>
  {:else if icon}
    <span class="cd-button__icon">{@render icon()}</span>
  {/if}
{/snippet}

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
    {@render leadingIcon()}
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
    {@render leadingIcon()}
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
      border-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard),
      color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
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
  /*
    type 决定「色相」(--btn-hue 系列变量)，theme 决定「填充方式」，两者正交组合。
    - --btn-hue:       该 type 的语义主色 (solid 背景 / light·borderless·outline 文字与边框)
    - --btn-hue-hover: solid 背景 hover 加深一档
    - --btn-hue-text:  solid 文字色 (语义色用白字，中性色用反相文字)
    light/borderless/outline 的浅色背景统一用 color-mix 由 --btn-hue 派生，
    避免依赖尚未定义的 *-light-* token。
  */
  .cd-button--primary {
    --btn-hue: var(--cd-color-primary);
    --btn-hue-hover: var(--cd-color-primary-hover);
    --btn-hue-text: var(--cd-color-text-inverse);
  }
  .cd-button--secondary {
    /* 中性 type：solid=深灰底白字 */
    --btn-hue: var(--cd-color-text-0);
    --btn-hue-hover: var(--cd-color-text-1);
    --btn-hue-text: var(--cd-color-text-inverse);
  }
  .cd-button--tertiary {
    /* 中性更弱：solid=中灰底白字、light/borderless 用次级文字色 */
    --btn-hue: var(--cd-color-text-2);
    --btn-hue-hover: var(--cd-color-text-1);
    --btn-hue-text: var(--cd-color-text-inverse);
  }
  .cd-button--warning {
    --btn-hue: var(--cd-color-warning);
    --btn-hue-hover: color-mix(in srgb, var(--cd-color-warning) 88%, #000);
    --btn-hue-text: var(--cd-color-text-inverse);
  }
  .cd-button--danger {
    --btn-hue: var(--cd-color-danger);
    --btn-hue-hover: color-mix(in srgb, var(--cd-color-danger) 88%, #000);
    --btn-hue-text: var(--cd-color-text-inverse);
  }

  /* theme: solid — type 色相实心背景 + 反相/白字 */
  .cd-button--solid {
    background: var(--btn-hue);
    color: var(--btn-hue-text);
  }
  .cd-button--solid:hover:not(:disabled):not([aria-disabled='true']) {
    background: var(--btn-hue-hover);
  }
  .cd-button--solid:active:not(:disabled):not([aria-disabled='true']) {
    background: color-mix(in srgb, var(--btn-hue) 82%, #000);
  }

  /* theme: light — type 色相浅色背景 + 色相文字 */
  .cd-button--light {
    background: color-mix(in srgb, var(--btn-hue) 12%, transparent);
    color: var(--btn-hue);
  }
  .cd-button--light:hover:not(:disabled):not([aria-disabled='true']) {
    background: color-mix(in srgb, var(--btn-hue) 20%, transparent);
  }
  .cd-button--light:active:not(:disabled):not([aria-disabled='true']) {
    background: color-mix(in srgb, var(--btn-hue) 28%, transparent);
  }

  /* theme: borderless — 透明背景 + 色相文字，无边框 */
  .cd-button--borderless {
    background: transparent;
    color: var(--btn-hue);
  }
  .cd-button--borderless:hover:not(:disabled):not([aria-disabled='true']) {
    background: color-mix(in srgb, var(--btn-hue) 12%, transparent);
  }
  .cd-button--borderless:active:not(:disabled):not([aria-disabled='true']) {
    background: color-mix(in srgb, var(--btn-hue) 20%, transparent);
  }

  /* theme: outline — 透明背景 + 色相边框 + 色相文字 */
  .cd-button--outline {
    background: transparent;
    border-color: var(--btn-hue);
    color: var(--btn-hue);
  }
  .cd-button--outline:hover:not(:disabled):not([aria-disabled='true']) {
    background: color-mix(in srgb, var(--btn-hue) 8%, transparent);
    border-color: var(--btn-hue-hover);
    color: var(--btn-hue-hover);
  }
  .cd-button--outline:active:not(:disabled):not([aria-disabled='true']) {
    background: color-mix(in srgb, var(--btn-hue) 14%, transparent);
  }
  /*
    colorful (AI 多彩)：品牌色到蓝/紫的渐变。
    - colorful + solid: 渐变实心背景 + 白字
    - colorful + light: 浅色渐变底 + 主色文字
    仅这两种 theme 下生效；其余 theme 不变。
  */
  .cd-button--colorful.cd-button--solid {
    background: linear-gradient(
      135deg,
      var(--cd-button-colorful-from) 0%,
      var(--cd-button-colorful-to) 100%
    );
    color: var(--cd-color-text-inverse);
    border-color: transparent;
  }
  .cd-button--colorful.cd-button--solid:hover:not(:disabled):not([aria-disabled='true']) {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--cd-button-colorful-from) 88%, #000) 0%,
      color-mix(in srgb, var(--cd-button-colorful-to) 88%, #000) 100%
    );
  }
  .cd-button--colorful.cd-button--light {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--cd-button-colorful-from) 14%, transparent) 0%,
      color-mix(in srgb, var(--cd-button-colorful-to) 14%, transparent) 100%
    );
    color: var(--cd-button-colorful-from);
    border-color: transparent;
  }
  .cd-button--colorful.cd-button--light:hover:not(:disabled):not([aria-disabled='true']) {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--cd-button-colorful-from) 22%, transparent) 0%,
      color-mix(in srgb, var(--cd-button-colorful-to) 22%, transparent) 100%
    );
  }
  .cd-button__icon {
    display: inline-flex;
  }
  /* loading 旋转图标 */
  .cd-button__icon--spin {
    animation: cd-button-spin 0.7s linear infinite;
  }
  @keyframes cd-button-spin {
    to {
      transform: rotate(360deg);
    }
  }
  /* iconPosition=right: 纯 CSS flex order, DOM 顺序不变 (spec §4 L27) */
  .cd-button--icon-right .cd-button__icon {
    order: 1;
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-button {
      transition: none;
    }
    /* 降级：不旋转，避免眩晕 */
    .cd-button__icon--spin {
      animation: none;
    }
  }
</style>
