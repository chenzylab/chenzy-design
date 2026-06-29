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
    /**
     * AI 多彩按钮：所有 theme 下用品牌蓝→紫渐变（对齐 Semi AI 风格）。
     * type 仅 primary / tertiary 有意义（其余 type 回退为 primary）。
     */
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
  const typeRaw = $derived<ButtonType>(typeProp ?? group?.type ?? 'secondary');
  const theme = $derived<ButtonTheme>(themeProp ?? group?.theme ?? 'light');
  const size = $derived<ButtonSize>(sizeProp ?? group?.size ?? 'default');
  const disabled = $derived<boolean>(disabledProp ?? group?.disabled ?? false);

  // colorful 仅支持 primary / tertiary；其余 type 回退为 primary。
  const type = $derived<ButtonType>(
    colorful && typeRaw !== 'primary' && typeRaw !== 'tertiary' ? 'primary' : typeRaw,
  );

  // 无 children（仅 icon 或 loading 旋转图标）时为纯图标按钮，收成方形。
  const iconOnly = $derived(!children && (!!icon || loading));

  const cls = $derived(
    [
      'cd-button',
      `cd-button--${type}`,
      `cd-button--${theme}`,
      `cd-button--${size}`,
      block && 'cd-button--block',
      loading && 'cd-button--loading',
      colorful && 'cd-button--colorful',
      iconOnly && 'cd-button--icon-only',
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
  /* 纯图标（无文字）：收成正方形，宽=高，去除水平内距 */
  .cd-button--icon-only {
    width: var(--cd-button-height-default);
    padding-inline: 0;
    gap: 0;
  }
  .cd-button--icon-only.cd-button--small {
    width: var(--cd-button-height-small);
  }
  .cd-button--icon-only.cd-button--large {
    width: var(--cd-button-height-large);
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
    colorful (AI 多彩)：蓝 → 紫 双色渐变（对齐 Semi AI 风格，冷色调）。
    - 支持所有 theme；type 仅 primary/tertiary（脚本里已收窄回退）。
    - 局部变量 --cf / --cf-hover / --cf-text 复用同一渐变，各 theme 按填充方式取用。
    - solid: 多彩实心 + 白字；light: 浅多彩底 + 紫字；
      outline: 透明 + 渐变边框（border-image）+ 紫字；borderless: 透明 + 紫字。
  */
  .cd-button--colorful {
    /* 实心渐变 + hover 加深版（向蓝/紫各深一档），各 theme 复用 */
    --cf: linear-gradient(
      120deg,
      var(--cd-button-colorful-from) 0%,
      var(--cd-button-colorful-via) 52%,
      var(--cd-button-colorful-to) 100%
    );
    --cf-hover: linear-gradient(
      120deg,
      color-mix(in srgb, var(--cd-button-colorful-from) 85%, #000) 0%,
      color-mix(in srgb, var(--cd-button-colorful-via) 85%, #000) 52%,
      color-mix(in srgb, var(--cd-button-colorful-to) 85%, #000) 100%
    );
    --cf-text: var(--cd-button-colorful-via);
  }
  .cd-button--colorful.cd-button--solid {
    background: var(--cf);
    color: var(--cd-color-text-inverse);
    border-color: transparent;
  }
  .cd-button--colorful.cd-button--solid:hover:not(:disabled):not([aria-disabled='true']) {
    background: var(--cf-hover);
    box-shadow: 0 4px 12px color-mix(in srgb, var(--cd-button-colorful-via) 35%, transparent);
  }
  .cd-button--colorful.cd-button--light {
    background: linear-gradient(
      120deg,
      color-mix(in srgb, var(--cd-button-colorful-from) 16%, transparent) 0%,
      color-mix(in srgb, var(--cd-button-colorful-via) 16%, transparent) 52%,
      color-mix(in srgb, var(--cd-button-colorful-to) 16%, transparent) 100%
    );
    color: var(--cf-text);
    border-color: transparent;
  }
  .cd-button--colorful.cd-button--light:hover:not(:disabled):not([aria-disabled='true']) {
    background: linear-gradient(
      120deg,
      color-mix(in srgb, var(--cd-button-colorful-from) 28%, transparent) 0%,
      color-mix(in srgb, var(--cd-button-colorful-via) 28%, transparent) 52%,
      color-mix(in srgb, var(--cd-button-colorful-to) 28%, transparent) 100%
    );
  }
  .cd-button--colorful.cd-button--borderless {
    background: transparent;
    color: var(--cf-text);
  }
  .cd-button--colorful.cd-button--borderless:hover:not(:disabled):not([aria-disabled='true']) {
    background: linear-gradient(
      120deg,
      color-mix(in srgb, var(--cd-button-colorful-from) 16%, transparent) 0%,
      color-mix(in srgb, var(--cd-button-colorful-to) 16%, transparent) 100%
    );
  }
  /* outline: 渐变边框 + 渐变文字色 */
  .cd-button--colorful.cd-button--outline {
    background: transparent;
    border: 1px solid transparent;
    border-image: var(--cf) 1;
    color: var(--cf-text);
  }
  .cd-button--colorful.cd-button--outline:hover:not(:disabled):not([aria-disabled='true']) {
    background: linear-gradient(
      120deg,
      color-mix(in srgb, var(--cd-button-colorful-from) 12%, transparent) 0%,
      color-mix(in srgb, var(--cd-button-colorful-to) 12%, transparent) 100%
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
