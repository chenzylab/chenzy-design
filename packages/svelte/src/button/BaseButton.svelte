<!--
  BaseButton — 纯容器（严格对齐 Semi semi-ui/button/Button.tsx）。
  只负责根 <button> 的 class 组装（type/theme/size/disabled/block/circle/colorful）与视觉着色 CSS，
  以及始终包一层 <span class="cd-button-content">。不含任何 icon/loading 逻辑（那属于 Button 派发器）。

  DOM 逐字节对齐 Semi：
    <button class="cd-button cd-button-{type} cd-button-{theme} ..." type={htmlType} aria-disabled={disabled}>
      <span class="cd-button-content ...">{children}</span>
    </button>
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { ButtonType, ButtonTheme, ButtonSize } from './context.js';

  interface Props {
    type?: ButtonType;
    theme?: ButtonTheme;
    size?: ButtonSize;
    block?: boolean;
    disabled?: boolean;
    colorful?: boolean;
    circle?: boolean;
    htmlType?: 'button' | 'submit' | 'reset';
    /** 追加到根 button 的额外 class（IconButton 组装的 -with-icon/-with-icon-only/-loading）。 */
    extraClass?: string | undefined;
    /** 用户自定义根 class（对齐 Semi className，拼在最后）。 */
    class?: string | undefined;
    style?: string | undefined;
    /** 内容区自定义类名（对齐 Semi contentClassName，追加到 .cd-button-content）。 */
    contentClassName?: string | undefined;
    children?: Snippet | undefined;
    onclick?: ((e: MouseEvent) => void) | undefined;
    onmousedown?: ((e: MouseEvent) => void) | undefined;
    onmouseenter?: ((e: MouseEvent) => void) | undefined;
    onmouseleave?: ((e: MouseEvent) => void) | undefined;
    [key: string]: unknown;
  }

  let {
    type = 'primary',
    theme = 'light',
    size = 'default',
    block = false,
    disabled = false,
    colorful = false,
    circle = false,
    htmlType = 'button',
    extraClass,
    class: className,
    style,
    contentClassName,
    children,
    onclick,
    onmousedown,
    onmouseenter,
    onmouseleave,
    ...rest
  }: Props = $props();

  // class 组装严格对齐 Semi Button.tsx classNames()：
  //   cd-button
  //   cd-button-{type}          仅 !disabled
  //   cd-button-disabled        仅 disabled
  //   cd-button-{type}-disabled 仅 disabled（disabled 下 type 差异）
  //   cd-button-size-small / -size-large（default 不加）
  //   cd-button-block / -circle / -{theme} / -colorful
  const cls = $derived(
    [
      'cd-button',
      !disabled && `cd-button-${type}`,
      disabled && 'cd-button-disabled',
      disabled && `cd-button-${type}-disabled`,
      size === 'small' && 'cd-button-size-small',
      size === 'large' && 'cd-button-size-large',
      block && 'cd-button-block',
      circle && 'cd-button-circle',
      `cd-button-${theme}`,
      colorful && 'cd-button-colorful',
      extraClass,
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );

  const contentCls = $derived(
    ['cd-button-content', contentClassName].filter(Boolean).join(' '),
  );

  // 对齐 Semi：disabled 时 content span 上的 click 阻断冒泡（onClick={e => disabled && e.stopPropagation()}）。
  function handleContentClick(e: MouseEvent) {
    if (disabled) e.stopPropagation();
  }
</script>

<button
  {...rest}
  class={cls}
  {style}
  type={htmlType}
  {disabled}
  aria-disabled={disabled}
  {onclick}
  {onmousedown}
  {onmouseenter}
  {onmouseleave}
>
  <span class={contentCls} onclick={handleContentClick} role="presentation">
    {@render children?.()}
  </span>
</button>

<style>
  /* ===== 基础容器（对齐 Semi button.scss .semi-button）===== */
  .cd-button {
    height: var(--cd-height-button-default);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    user-select: none;
    border: var(--cd-width-button-border) solid transparent;
    border-radius: var(--cd-radius-button);
    padding-left: var(--cd-spacing-button-default-paddingleft);
    padding-right: var(--cd-spacing-button-default-paddingright);
    padding-top: var(--cd-spacing-button-default-paddingtop);
    padding-bottom: var(--cd-spacing-button-default-paddingbottom);
    font-size: var(--cd-font-button-fontsize);
    line-height: var(--cd-font-button-lineheight);
    font-weight: var(--cd-font-button-fontweight);
    outline: none;
    vertical-align: middle;
    white-space: nowrap;
  }

  .cd-button-content {
    display: flex;
    align-items: center;
  }

  /* focus-visible outline（对齐 Semi：非 borderless/light 的实心/边框态用 type outline 色）。 */
  .cd-button-primary:focus-visible,
  .cd-button-secondary:focus-visible,
  .cd-button-tertiary:focus-visible,
  .cd-button-warning:focus-visible,
  .cd-button-danger:focus-visible {
    outline: var(--cd-width-button-outline) solid var(--cd-color-button-primary-outline-focus);
  }
  .cd-button-danger:not(.cd-button-borderless):not(.cd-button-light):focus-visible {
    outline: var(--cd-width-button-outline) solid var(--cd-color-button-danger-outline-focus);
  }
  .cd-button-warning:not(.cd-button-borderless):not(.cd-button-light):focus-visible {
    outline: var(--cd-width-button-outline) solid var(--cd-color-button-warning-outline-focus);
  }

  /* ===== type × theme × state（对齐 Semi button.scss，逐 type 复刻）===== */

  /* —— danger —— */
  .cd-button-danger {
    background-color: var(--cd-color-button-danger-bg-default);
    color: var(--cd-color-button-danger-text-default);
    transition:
      background-color var(--cd-transition-duration-button-danger-bg)
        var(--cd-transition-function-button-danger-bg) var(--cd-transition-delay-button-danger-bg),
      border var(--cd-transition-duration-button-danger-border)
        var(--cd-transition-function-button-danger-border) var(--cd-transition-delay-button-danger-border);
    transform: var(--cd-transform-scale-button-danger);
  }
  .cd-button-danger:hover {
    background-color: var(--cd-color-button-danger-bg-hover);
  }
  .cd-button-danger:active {
    background-color: var(--cd-color-button-danger-bg-active);
  }
  .cd-button-danger.cd-button-outline {
    background-color: transparent;
    border: var(--cd-width-button-outline-border) solid var(--cd-color-button-danger-outline-border-default);
  }
  .cd-button-danger.cd-button-light,
  .cd-button-danger.cd-button-outline,
  .cd-button-danger.cd-button-borderless {
    color: var(--cd-color-button-danger-borderless-text-default);
  }
  .cd-button-danger-disabled {
    background-color: var(--cd-color-button-disabled-danger-bg-default);
  }
  .cd-button-danger-disabled.cd-button-outline {
    background-color: transparent;
    border: var(--cd-width-button-outline-border) solid var(--cd-color-button-disabled-outline-border-default);
  }
  .cd-button-danger-disabled.cd-button-light {
    background-color: var(--cd-color-button-disabled-light-danger-bg-default);
  }

  /* —— warning —— */
  .cd-button-warning {
    background-color: var(--cd-color-button-warning-bg-default);
    color: var(--cd-color-button-warning-text-default);
    transition:
      background-color var(--cd-transition-duration-button-warning-bg)
        var(--cd-transition-function-button-warning-bg) var(--cd-transition-delay-button-warning-bg),
      border var(--cd-transition-duration-button-warning-border)
        var(--cd-transition-function-button-warning-border) var(--cd-transition-delay-button-warning-border);
    transform: var(--cd-transform-scale-button-warning);
  }
  .cd-button-warning:hover {
    background-color: var(--cd-color-button-warning-bg-hover);
  }
  .cd-button-warning:active {
    background-color: var(--cd-color-button-warning-bg-active);
  }
  .cd-button-warning.cd-button-outline {
    background-color: transparent;
    border: var(--cd-width-button-outline-border) solid var(--cd-color-button-warning-outline-border-default);
  }
  .cd-button-warning.cd-button-light,
  .cd-button-warning.cd-button-outline,
  .cd-button-warning.cd-button-borderless {
    color: var(--cd-color-button-warning-borderless-text-default);
  }
  .cd-button-warning-disabled {
    background-color: var(--cd-color-button-disabled-warning-bg-default);
  }
  .cd-button-warning-disabled.cd-button-outline {
    background-color: transparent;
    border: var(--cd-width-button-outline-border) solid var(--cd-color-button-disabled-outline-border-default);
  }
  .cd-button-warning-disabled.cd-button-light {
    background-color: var(--cd-color-button-disabled-light-warning-bg-default);
  }

  /* —— tertiary —— */
  .cd-button-tertiary {
    background-color: var(--cd-color-button-tertiary-bg-default);
    color: var(--cd-color-button-tertiary-text-default);
    transition:
      background-color var(--cd-transition-duration-button-tertiary-bg)
        var(--cd-transition-function-button-tertiary-bg) var(--cd-transition-delay-button-tertiary-bg),
      border var(--cd-transition-duration-button-tertiary-border)
        var(--cd-transition-function-button-tertiary-border) var(--cd-transition-delay-button-tertiary-border);
    transform: var(--cd-transform-scale-button-tertiary);
  }
  .cd-button-tertiary:hover {
    background-color: var(--cd-color-button-tertiary-bg-hover);
  }
  .cd-button-tertiary:active {
    background-color: var(--cd-color-button-tertiary-bg-active);
  }
  .cd-button-tertiary.cd-button-outline {
    background-color: transparent;
    border: var(--cd-width-button-outline-border) solid var(--cd-color-button-tertiary-outline-border-default);
  }
  .cd-button-tertiary.cd-button-light,
  .cd-button-tertiary.cd-button-outline,
  .cd-button-tertiary.cd-button-borderless {
    color: var(--cd-color-button-tertiary-solid-text-default);
  }
  .cd-button-tertiary-disabled {
    background-color: var(--cd-color-button-disabled-tertiary-bg-default);
  }
  .cd-button-tertiary-disabled.cd-button-outline {
    background-color: transparent;
    border: var(--cd-width-button-outline-border) solid var(--cd-color-button-disabled-outline-border-default);
  }
  .cd-button-tertiary-disabled.cd-button-light {
    background-color: var(--cd-color-button-disabled-light-tertiary-bg-default);
  }

  /* —— primary —— */
  .cd-button-primary {
    background-color: var(--cd-color-button-primary-bg-default);
    color: var(--cd-color-button-primary-text-default);
    transition:
      background-color var(--cd-transition-duration-button-primary-bg)
        var(--cd-transition-function-button-primary-bg) var(--cd-transition-delay-button-primary-bg),
      border var(--cd-transition-duration-button-primary-border)
        var(--cd-transition-function-button-primary-border) var(--cd-transition-delay-button-primary-border);
    transform: var(--cd-transform-scale-button-primary);
  }
  .cd-button-primary:not(.cd-button-borderless):not(.cd-button-light):not(.cd-button-outline):hover {
    background-color: var(--cd-color-button-primary-bg-hover);
  }
  .cd-button-primary:not(.cd-button-borderless):not(.cd-button-light):not(.cd-button-outline):active {
    background-color: var(--cd-color-button-primary-bg-active);
  }
  .cd-button-primary.cd-button-outline {
    background-color: transparent;
    border: var(--cd-width-button-outline-border) solid var(--cd-color-button-primary-outline-border-default);
  }
  .cd-button-primary.cd-button-light,
  .cd-button-primary.cd-button-outline,
  .cd-button-primary.cd-button-borderless {
    color: var(--cd-color-button-primary-borderless-text-default);
  }
  .cd-button-primary-disabled {
    background-color: var(--cd-color-button-disabled-primary-bg-default);
  }
  .cd-button-primary-disabled.cd-button-light {
    background: var(--cd-color-button-disabled-light-primary-bg-default);
  }
  .cd-button-primary-disabled.cd-button-outline {
    background-color: transparent;
    border: var(--cd-width-button-outline-border) solid var(--cd-color-button-disabled-outline-border-default);
  }

  /* —— secondary —— */
  .cd-button-secondary {
    background-color: var(--cd-color-button-secondary-bg-default);
    color: var(--cd-color-button-secondary-text-default);
    transition:
      background-color var(--cd-transition-duration-button-secondary-bg)
        var(--cd-transition-function-button-secondary-bg) var(--cd-transition-delay-button-secondary-bg),
      border var(--cd-transition-duration-button-secondary-border)
        var(--cd-transition-function-button-secondary-border) var(--cd-transition-delay-button-secondary-border);
    transform: var(--cd-transform-scale-button-secondary);
  }
  .cd-button-secondary:hover {
    background-color: var(--cd-color-button-secondary-bg-hover);
  }
  .cd-button-secondary:active {
    background-color: var(--cd-color-button-secondary-bg-active);
  }
  .cd-button-secondary.cd-button-outline {
    background-color: transparent;
    border: var(--cd-width-button-outline-border) solid var(--cd-color-button-secondary-outline-border-default);
  }
  .cd-button-secondary.cd-button-light,
  .cd-button-secondary.cd-button-outline,
  .cd-button-secondary.cd-button-borderless {
    color: var(--cd-color-button-secondary-borderless-text-default);
  }
  .cd-button-secondary-disabled {
    background-color: var(--cd-color-button-disabled-secondary-bg-default);
  }
  .cd-button-secondary-disabled.cd-button-outline {
    background-color: transparent;
    border: var(--cd-width-button-outline-border) solid var(--cd-color-button-disabled-outline-border-default);
  }
  .cd-button-secondary-disabled.cd-button-light {
    background-color: var(--cd-color-button-disabled-light-secondary-bg-default);
  }

  /* —— disabled 通用（文字色 + cursor，对齐 Semi .semi-button-disabled）—— */
  .cd-button-disabled {
    color: var(--cd-color-button-disabled-solid-text-default);
    cursor: not-allowed;
  }
  .cd-button-disabled:not(.cd-button-borderless):not(.cd-button-light):not(.cd-button-outline):hover {
    color: var(--cd-color-button-disabled-text-hover);
  }
  .cd-button-disabled.cd-button-light,
  .cd-button-disabled.cd-button-borderless {
    color: var(--cd-color-button-disabled-text-default);
  }
  .cd-button-disabled.cd-button-outline {
    color: var(--cd-color-button-disabled-outline-text-default);
  }

  /* ===== theme（对齐 Semi button.scss theme 组）===== */
  .cd-button-borderless {
    background-color: transparent;
    border: var(--cd-width-button-borderless-border) solid var(--cd-color-button-borderless-border-default);
    transition: background-color var(--cd-transition-duration-button-borderless-bg)
      var(--cd-transition-function-button-borderless-bg) var(--cd-transition-delay-button-borderless-bg);
    transform: var(--cd-transform-scale-button-borderless);
  }
  .cd-button-borderless:not(.cd-button-disabled):hover {
    background-color: var(--cd-color-button-borderless-bg-hover);
    border: var(--cd-width-button-borderless-border) solid var(--cd-color-button-borderless-border-hover);
  }
  .cd-button-borderless:not(.cd-button-disabled):active {
    background-color: var(--cd-color-button-borderless-bg-active);
    border: var(--cd-width-button-borderless-border) solid var(--cd-color-button-borderless-border-active);
  }

  .cd-button-outline {
    background-color: transparent;
  }
  .cd-button-outline:not(.cd-button-disabled):hover {
    background-color: var(--cd-color-button-outline-bg-hover);
  }
  .cd-button-outline:not(.cd-button-disabled):active {
    background-color: var(--cd-color-button-outline-bg-active);
  }

  .cd-button-light {
    background-color: var(--cd-color-button-light-bg-default);
    border: var(--cd-width-button-light-border) solid var(--cd-color-button-light-border-default);
    transition:
      background-color var(--cd-transition-duration-button-light-bg)
        var(--cd-transition-function-button-light-bg) var(--cd-transition-delay-button-light-bg),
      border var(--cd-transition-duration-button-light-border)
        var(--cd-transition-function-button-light-border) var(--cd-transition-delay-button-light-border);
    transform: var(--cd-transform-scale-button-light);
  }
  .cd-button-light:not(.cd-button-disabled):hover {
    background-color: var(--cd-color-button-light-bg-hover);
    border: var(--cd-width-button-light-border) solid var(--cd-color-button-light-border-hover);
  }
  .cd-button-light:not(.cd-button-disabled):active {
    background-color: var(--cd-color-button-light-bg-active);
    border: var(--cd-width-button-light-border) solid var(--cd-color-button-light-border-active);
  }

  /* ===== size（对齐 Semi -size-small / -size-large）===== */
  .cd-button-size-small {
    height: var(--cd-height-button-small);
    padding-top: var(--cd-spacing-button-small-paddingtop);
    padding-bottom: var(--cd-spacing-button-small-paddingbottom);
    padding-left: var(--cd-spacing-button-small-paddingleft);
    padding-right: var(--cd-spacing-button-small-paddingright);
  }
  .cd-button-size-large {
    height: var(--cd-height-button-large);
    padding-top: var(--cd-spacing-button-large-paddingtop);
    padding-bottom: var(--cd-spacing-button-large-paddingbottom);
    padding-left: var(--cd-spacing-button-large-paddingleft);
    padding-right: var(--cd-spacing-button-large-paddingright);
  }

  .cd-button-block {
    width: 100%;
  }

  /* circle（对齐 Semi -circle）：正圆边框。 */
  .cd-button-circle {
    border-radius: 50%;
  }

  /* ===== colorful（AI 多彩，对齐 Semi variables.scss colorful 规则；ai 色缺失用三色渐变）=====
     - primary/tertiary solid：渐变实心背景。
     - primary light/borderless：渐变文字（background-clip:text，作用在 content-right 或无图标的 content）。
     - primary outline：渐变文字 + 渐变边框。
     - tertiary solid colorful：渐变背景 + 渐变文字（对齐 Semi tertiary solid colorful text）。
     其余 type + colorful：Semi 无定义 → 无 colorful 效果（回落普通 type 着色，此处不写规则即可）。 */
  .cd-button-colorful.cd-button-primary.cd-button-solid {
    background: linear-gradient(
      120deg,
      var(--cd-button-colorful-from) 0%,
      var(--cd-button-colorful-via) 52%,
      var(--cd-button-colorful-to) 100%
    );
    border-color: transparent;
  }
  .cd-button-colorful.cd-button-tertiary.cd-button-solid {
    background: linear-gradient(
      120deg,
      var(--cd-button-colorful-from) 0%,
      var(--cd-button-colorful-via) 52%,
      var(--cd-button-colorful-to) 100%
    );
    border-color: transparent;
  }
  /* tertiary solid colorful：文字也走渐变填充（对齐 Semi tertiary_solid_colorful-text）。 */
  .cd-button-colorful.cd-button-tertiary.cd-button-solid :global(.cd-button-content-right),
  .cd-button-colorful.cd-button-tertiary.cd-button-solid .cd-button-content:not(:has(> :global(.cd-button-content-right))) {
    background: linear-gradient(
      120deg,
      var(--cd-button-colorful-from) 0%,
      var(--cd-button-colorful-via) 52%,
      var(--cd-button-colorful-to) 100%
    );
    background-clip: text;
    color: transparent;
  }
  /* primary light / borderless：渐变文字。 */
  .cd-button-colorful.cd-button-primary.cd-button-light :global(.cd-button-content-right),
  .cd-button-colorful.cd-button-primary.cd-button-light .cd-button-content:not(:has(> :global(.cd-button-content-right))),
  .cd-button-colorful.cd-button-primary.cd-button-borderless :global(.cd-button-content-right),
  .cd-button-colorful.cd-button-primary.cd-button-borderless .cd-button-content:not(:has(> :global(.cd-button-content-right))) {
    background: linear-gradient(
      120deg,
      var(--cd-button-colorful-from) 0%,
      var(--cd-button-colorful-via) 52%,
      var(--cd-button-colorful-to) 100%
    );
    background-clip: text;
    color: transparent;
  }
  /* primary outline：渐变文字色 + 渐变边框。 */
  .cd-button-colorful.cd-button-primary.cd-button-outline {
    color: var(--cd-button-colorful-via);
    border: var(--cd-width-button-outline-border) solid transparent;
    border-image: linear-gradient(
        120deg,
        var(--cd-button-colorful-from) 0%,
        var(--cd-button-colorful-via) 52%,
        var(--cd-button-colorful-to) 100%
      )
      1;
  }

  @media (prefers-reduced-motion: reduce) {
    .cd-button {
      transition: none;
    }
  }
</style>
