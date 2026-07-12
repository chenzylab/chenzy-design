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
    /** 圆形按钮（border-radius:50%），配合 icon-only 呈正圆。spec §4 circle。 */
    circle?: boolean;
    /** required for icon-only buttons */
    ariaLabel?: string;
    /** 指明按钮控制的元素 id（配合被控元素如 Collapsible 的 id 建立关联，透传 aria-controls）。 */
    ariaControls?: string;
    /** 展开态语义（配合折叠/展开触发器，透传 aria-expanded）。 */
    ariaExpanded?: boolean;
    icon?: Snippet;
    /** 图标相对文字位置。spec §4 L27 */
    iconPosition?: 'left' | 'right';
    /**
     * 设置水平方向是否去掉内边距，仅在设置了 icon 时有效（对齐 Semi）。
     * true 等效 ['left','right']；'left'/'right' 去单侧；数组组合去两侧。
     */
    noHorizontalPadding?: boolean | 'left' | 'right' | Array<'left' | 'right'>;
    /** 根元素自定义类名（透传，叠加在内置 class 之后）。 */
    class?: string;
    /** 根元素自定义内联样式（透传）。 */
    style?: string;
    /** 内容区（文本 + 图标包裹）自定义类名（对齐 Semi contentClassName）。 */
    contentClassName?: string;
    children?: Snippet;
    onclick?: (e: MouseEvent) => void;
    onmousedown?: (e: MouseEvent) => void;
    onmouseenter?: (e: MouseEvent) => void;
    onmouseleave?: (e: MouseEvent) => void;
  }

  let {
    type: typeProp,
    theme: themeProp,
    size: sizeProp,
    block = false,
    disabled: disabledProp,
    loading = false,
    colorful: colorfulProp,
    htmlType = 'button',
    circle = false,
    ariaLabel,
    ariaControls,
    ariaExpanded,
    icon,
    iconPosition = 'left',
    noHorizontalPadding = false,
    class: className,
    style,
    contentClassName,
    children,
    onclick,
    onmousedown,
    onmouseenter,
    onmouseleave,
  }: Props = $props();

  // ButtonGroup 上下文：仅在未显式设置对应 prop 时作为默认回退（显式 prop 始终优先）。
  const group = getButtonGroupContext();
  const typeRaw = $derived<ButtonType>(typeProp ?? group?.type ?? 'secondary');
  const theme = $derived<ButtonTheme>(themeProp ?? group?.theme ?? 'light');
  const size = $derived<ButtonSize>(sizeProp ?? group?.size ?? 'default');
  const disabled = $derived<boolean>(disabledProp ?? group?.disabled ?? false);
  const colorful = $derived<boolean>(colorfulProp ?? group?.colorful ?? false);

  // colorful 仅支持 primary / tertiary；其余 type 回退为 primary。
  const type = $derived<ButtonType>(
    colorful && typeRaw !== 'primary' && typeRaw !== 'tertiary' ? 'primary' : typeRaw,
  );

  // 无 children（仅 icon 或 loading 旋转图标）时为纯图标按钮，收成方形。
  const iconOnly = $derived(!children && (!!icon || loading));

  // noHorizontalPadding 规整为 {left,right}，仅在有 icon 时生效（对齐 Semi）。
  const noPad = $derived.by(() => {
    if (!icon || !noHorizontalPadding) return { left: false, right: false };
    if (noHorizontalPadding === true) return { left: true, right: true };
    const arr = Array.isArray(noHorizontalPadding)
      ? noHorizontalPadding
      : [noHorizontalPadding];
    return { left: arr.includes('left'), right: arr.includes('right') };
  });

  const cls = $derived(
    [
      'cd-button',
      `cd-button--${type}`,
      `cd-button--${theme}`,
      `cd-button--${size}`,
      block && 'cd-button--block',
      loading && 'cd-button--loading',
      colorful && 'cd-button--colorful',
      circle && 'cd-button--circle',
      iconOnly && 'cd-button--icon-only',
      icon && iconPosition === 'right' && 'cd-button--icon-right',
      noPad.left && 'cd-button--no-pad-left',
      noPad.right && 'cd-button--no-pad-right',
      className,
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

<button
  class={cls}
  {style}
  type={htmlType}
  {disabled}
  aria-busy={loading || undefined}
  aria-label={ariaLabel}
  aria-controls={ariaControls}
  aria-expanded={ariaExpanded}
  onclick={handleClick}
  {onmousedown}
  {onmouseenter}
  {onmouseleave}
>
  {#if contentClassName}
    <span class={contentClassName} style="display: contents;">
      {@render leadingIcon()}
      {@render children?.()}
    </span>
  {:else}
    {@render leadingIcon()}
    {@render children?.()}
  {/if}
</button>

<style>
  .cd-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--cd-spacing-tight);
    height: var(--cd-height-button-default);
    padding-inline: var(--cd-spacing-button-default-paddingleft);
    border: var(--cd-width-button-border) solid transparent;
    border-radius: var(--cd-radius-button);
    font-size: var(--cd-font-button-fontsize);
    font-weight: var(--cd-font-button-fontweight);
    line-height: var(--cd-font-button-lineheight);
    cursor: pointer;
    /* 过渡/变换由各 type/theme 的专属 transition/transform token 接管（见下），
       对齐 Semi animation.scss：默认 duration=0ms（无过渡），主题/DSM 可按类型开启。 */
  }

  /* —— animation：背景/边框过渡 + 按压变换（每 type/theme 独立 token，对齐 Semi）—— */
  .cd-button--primary {
    transition:
      background-color var(--cd-transition-duration-button-primary-bg)
        var(--cd-transition-function-button-primary-bg) var(--cd-transition-delay-button-primary-bg),
      border-color var(--cd-transition-duration-button-primary-border)
        var(--cd-transition-function-button-primary-border) var(--cd-transition-delay-button-primary-border);
    transform: var(--cd-transform-scale-button-primary);
  }
  .cd-button--secondary {
    transition:
      background-color var(--cd-transition-duration-button-secondary-bg)
        var(--cd-transition-function-button-secondary-bg) var(--cd-transition-delay-button-secondary-bg),
      border-color var(--cd-transition-duration-button-secondary-border)
        var(--cd-transition-function-button-secondary-border) var(--cd-transition-delay-button-secondary-border);
    transform: var(--cd-transform-scale-button-secondary);
  }
  .cd-button--tertiary {
    transition:
      background-color var(--cd-transition-duration-button-tertiary-bg)
        var(--cd-transition-function-button-tertiary-bg) var(--cd-transition-delay-button-tertiary-bg),
      border-color var(--cd-transition-duration-button-tertiary-border)
        var(--cd-transition-function-button-tertiary-border) var(--cd-transition-delay-button-tertiary-border);
    transform: var(--cd-transform-scale-button-tertiary);
  }
  .cd-button--warning {
    transition:
      background-color var(--cd-transition-duration-button-warning-bg)
        var(--cd-transition-function-button-warning-bg) var(--cd-transition-delay-button-warning-bg),
      border-color var(--cd-transition-duration-button-warning-border)
        var(--cd-transition-function-button-warning-border) var(--cd-transition-delay-button-warning-border);
    transform: var(--cd-transform-scale-button-warning);
  }
  .cd-button--danger {
    transition:
      background-color var(--cd-transition-duration-button-danger-bg)
        var(--cd-transition-function-button-danger-bg) var(--cd-transition-delay-button-danger-bg),
      border-color var(--cd-transition-duration-button-danger-border)
        var(--cd-transition-function-button-danger-border) var(--cd-transition-delay-button-danger-border);
    transform: var(--cd-transform-scale-button-danger);
  }
  /* theme 级：light/borderless 覆盖 type 级过渡（对齐 Semi 的 light/borderless 独立组；
     borderless 无边框，故仅背景过渡） */
  .cd-button--light {
    transition:
      background-color var(--cd-transition-duration-button-light-bg)
        var(--cd-transition-function-button-light-bg) var(--cd-transition-delay-button-light-bg),
      border-color var(--cd-transition-duration-button-light-border)
        var(--cd-transition-function-button-light-border) var(--cd-transition-delay-button-light-border);
    transform: var(--cd-transform-scale-button-light);
  }
  .cd-button--borderless {
    transition: background-color var(--cd-transition-duration-button-borderless-bg)
      var(--cd-transition-function-button-borderless-bg) var(--cd-transition-delay-button-borderless-bg);
    transform: var(--cd-transform-scale-button-borderless);
  }
  .cd-button:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  /* Semi：全尺寸字号统一 regular(14)，仅高度/内边距随尺寸变化 */
  .cd-button--small {
    height: var(--cd-height-button-small);
    padding-inline: var(--cd-spacing-button-small-paddingleft);
  }
  .cd-button--large {
    height: var(--cd-height-button-large);
    padding-inline: var(--cd-spacing-button-large-paddingleft);
  }
  .cd-button--block {
    width: 100%;
  }
  /* 纯图标（无文字）：收成正方形，宽=高，去除水平内距 */
  .cd-button--icon-only {
    width: var(--cd-height-button-default);
    padding-inline: 0;
    gap: 0;
  }
  .cd-button--icon-only.cd-button--small {
    width: var(--cd-height-button-small);
  }
  .cd-button--icon-only.cd-button--large {
    width: var(--cd-height-button-large);
  }
  /* 圆形按钮：正圆边框（配合 icon-only 的方形尺寸得到正圆）。仅形状 CSS，无新 token。 */
  .cd-button--circle {
    border-radius: 50%;
  }
  /* noHorizontalPadding：仅 icon 按钮去单/双侧水平内距（对齐 Semi） */
  .cd-button--no-pad-left {
    padding-inline-start: 0;
  }
  .cd-button--no-pad-right {
    padding-inline-end: 0;
  }
  .cd-button--loading {
    cursor: default;
    opacity: 0.75;
  }
  .cd-button:disabled {
    cursor: not-allowed;
  }
  /*
    收敛：每个 type × theme × state 组合直接读独立消费组件级 token（对齐 Semi
    semi-foundation/button/button.scss）。不再用 --btn-hue + color-mix 派生。
    - solid（实心主题）：读 --cd-color-button-<type>-{bg,text}-{default,hover,active}
    - light/borderless/outline：读共享的 light/borderless/outline 背景 token +
      type 各自的 borderless-text token 作为文字色（对齐 Semi 三主题共用文字规则）。
  */

  /* —— theme: solid —— type 实心背景 + 文字（各 type 独立 token） */
  .cd-button--primary.cd-button--solid {
    background: var(--cd-color-button-primary-bg-default);
    color: var(--cd-color-button-primary-text-default);
  }
  .cd-button--primary.cd-button--solid:hover:not(:disabled):not([aria-disabled='true']) {
    background: var(--cd-color-button-primary-bg-hover);
    color: var(--cd-color-button-primary-text-hover);
  }
  .cd-button--primary.cd-button--solid:active:not(:disabled):not([aria-disabled='true']) {
    background: var(--cd-color-button-primary-bg-active);
    color: var(--cd-color-button-primary-text-active);
  }
  .cd-button--secondary.cd-button--solid {
    background: var(--cd-color-button-secondary-bg-default);
    color: var(--cd-color-button-secondary-text-default);
  }
  .cd-button--secondary.cd-button--solid:hover:not(:disabled):not([aria-disabled='true']) {
    background: var(--cd-color-button-secondary-bg-hover);
    color: var(--cd-color-button-secondary-text-hover);
  }
  .cd-button--secondary.cd-button--solid:active:not(:disabled):not([aria-disabled='true']) {
    background: var(--cd-color-button-secondary-bg-active);
    color: var(--cd-color-button-secondary-text-active);
  }
  .cd-button--tertiary.cd-button--solid {
    background: var(--cd-color-button-tertiary-bg-default);
    color: var(--cd-color-button-tertiary-text-default);
  }
  .cd-button--tertiary.cd-button--solid:hover:not(:disabled):not([aria-disabled='true']) {
    background: var(--cd-color-button-tertiary-bg-hover);
    color: var(--cd-color-button-tertiary-text-hover);
  }
  .cd-button--tertiary.cd-button--solid:active:not(:disabled):not([aria-disabled='true']) {
    background: var(--cd-color-button-tertiary-bg-active);
    color: var(--cd-color-button-tertiary-text-active);
  }
  .cd-button--warning.cd-button--solid {
    background: var(--cd-color-button-warning-bg-default);
    color: var(--cd-color-button-warning-text-default);
  }
  .cd-button--warning.cd-button--solid:hover:not(:disabled):not([aria-disabled='true']) {
    background: var(--cd-color-button-warning-bg-hover);
    color: var(--cd-color-button-warning-text-hover);
  }
  .cd-button--warning.cd-button--solid:active:not(:disabled):not([aria-disabled='true']) {
    background: var(--cd-color-button-warning-bg-active);
    color: var(--cd-color-button-warning-text-active);
  }
  .cd-button--danger.cd-button--solid {
    background: var(--cd-color-button-danger-bg-default);
    color: var(--cd-color-button-danger-text-default);
  }
  .cd-button--danger.cd-button--solid:hover:not(:disabled):not([aria-disabled='true']) {
    background: var(--cd-color-button-danger-bg-hover);
    color: var(--cd-color-button-danger-text-hover);
  }
  .cd-button--danger.cd-button--solid:active:not(:disabled):not([aria-disabled='true']) {
    background: var(--cd-color-button-danger-bg-active);
    color: var(--cd-color-button-danger-text-active);
  }

  /*
    light / borderless / outline 文字色：对齐 Semi，三主题共用各 type 的
    borderless-text token（tertiary 用 solid-text token）。
  */
  .cd-button--primary.cd-button--light,
  .cd-button--primary.cd-button--borderless,
  .cd-button--primary.cd-button--outline {
    color: var(--cd-color-button-primary-borderless-text-default);
  }
  .cd-button--secondary.cd-button--light,
  .cd-button--secondary.cd-button--borderless,
  .cd-button--secondary.cd-button--outline {
    color: var(--cd-color-button-secondary-borderless-text-default);
  }
  .cd-button--tertiary.cd-button--light,
  .cd-button--tertiary.cd-button--borderless,
  .cd-button--tertiary.cd-button--outline {
    color: var(--cd-color-button-tertiary-solid-text-default);
  }
  .cd-button--warning.cd-button--light,
  .cd-button--warning.cd-button--borderless,
  .cd-button--warning.cd-button--outline {
    color: var(--cd-color-button-warning-borderless-text-default);
  }
  .cd-button--danger.cd-button--light,
  .cd-button--danger.cd-button--borderless,
  .cd-button--danger.cd-button--outline {
    color: var(--cd-color-button-danger-borderless-text-default);
  }

  /* theme: light — 共享浅色背景（fill 阶梯），文字色由上方 type 规则决定 */
  .cd-button--light {
    background: var(--cd-color-button-light-bg-default);
    border: var(--cd-width-button-light-border) solid
      var(--cd-color-button-light-border-default);
  }
  .cd-button--light:hover:not(:disabled):not([aria-disabled='true']) {
    background: var(--cd-color-button-light-bg-hover);
    border-color: var(--cd-color-button-light-border-hover);
  }
  .cd-button--light:active:not(:disabled):not([aria-disabled='true']) {
    background: var(--cd-color-button-light-bg-active);
    border-color: var(--cd-color-button-light-border-active);
  }

  /* theme: borderless — 透明背景 + 共享浅色 hover/active 背景，无边框 */
  .cd-button--borderless {
    background: transparent;
    border: var(--cd-width-button-borderless-border) solid
      var(--cd-color-button-borderless-border-default);
  }
  .cd-button--borderless:hover:not(:disabled):not([aria-disabled='true']) {
    background: var(--cd-color-button-borderless-bg-hover);
    border-color: var(--cd-color-button-borderless-border-hover);
  }
  .cd-button--borderless:active:not(:disabled):not([aria-disabled='true']) {
    background: var(--cd-color-button-borderless-bg-active);
    border-color: var(--cd-color-button-borderless-border-active);
  }

  /* theme: outline — 透明背景 + type 各自边框色 + 共享 hover/active 背景 */
  .cd-button--outline {
    background: transparent;
    border-width: var(--cd-width-button-outline-border);
  }
  .cd-button--primary.cd-button--outline {
    border-color: var(--cd-color-button-primary-outline-border-default);
  }
  .cd-button--secondary.cd-button--outline {
    border-color: var(--cd-color-button-secondary-outline-border-default);
  }
  .cd-button--tertiary.cd-button--outline {
    border-color: var(--cd-color-button-tertiary-outline-border-default);
  }
  .cd-button--warning.cd-button--outline {
    border-color: var(--cd-color-button-warning-outline-border-default);
  }
  .cd-button--danger.cd-button--outline {
    border-color: var(--cd-color-button-danger-outline-border-default);
  }
  .cd-button--outline:hover:not(:disabled):not([aria-disabled='true']) {
    background: var(--cd-color-button-outline-bg-hover);
  }
  .cd-button--outline:active:not(:disabled):not([aria-disabled='true']) {
    background: var(--cd-color-button-outline-bg-active);
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
    color: var(--cd-color-white);
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
  /*
    disabled（对齐 Semi $color-button_disabled*）：不用整体 opacity 压暗，按主题给禁用色。
    置于所有 type×theme 着色规则之后，特异性 ≥ 那些规则（0-2-0）以确保覆盖：
    - solid/light：禁用底灰 + 灰字；borderless：透明底 + 灰字；outline：透明底 + 灰边 + 灰字。
    - colorful 禁用：取消渐变（背景/border-image）回落到同一套禁用色。
  */
  .cd-button--solid:disabled,
  .cd-button--light:disabled {
    background: var(--cd-color-button-disabled-bg-default);
    border-color: transparent;
  }
  .cd-button--borderless:disabled {
    background: transparent;
    border-color: transparent;
  }
  .cd-button--outline:disabled {
    background: transparent;
    border-color: var(--cd-color-button-disabled-border-default);
  }
  /* 文字色：0-2-0 覆盖各 type×theme 文字规则 */
  .cd-button--solid:disabled,
  .cd-button--light:disabled,
  .cd-button--borderless:disabled,
  .cd-button--outline:disabled {
    color: var(--cd-color-button-disabled-text-default);
    box-shadow: none;
  }
  /* colorful 禁用：清渐变，回落禁用色（0-3-0 覆盖 colorful 着色） */
  .cd-button--colorful.cd-button--solid:disabled,
  .cd-button--colorful.cd-button--light:disabled {
    background: var(--cd-color-button-disabled-bg-default);
    border-image: none;
  }
  .cd-button--colorful.cd-button--borderless:disabled {
    background: transparent;
    border-image: none;
  }
  .cd-button--colorful.cd-button--outline:disabled {
    background: transparent;
    border-image: none;
    border-color: var(--cd-color-button-disabled-border-default);
  }
  .cd-button--colorful:disabled {
    color: var(--cd-color-button-disabled-text-default);
  }
  .cd-button__icon {
    display: inline-flex;
  }
  /* loading 旋转图标 */
  .cd-button__icon--spin {
    animation: cd-button-spin var(--cd-animation-duration-button-icon-loading) linear infinite;
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
