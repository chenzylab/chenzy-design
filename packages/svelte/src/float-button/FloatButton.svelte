<!--
  FloatButton — 悬浮固定在视口的可操作按钮。
  a11y 升级（对标 Semi div+onClick）：
    - 无 href → <button type="button">；有 href → <a href target rel>。天然键盘可达。
    - _blank 自动补 rel="noopener noreferrer"。
    - icon-only（无 children/content）必须 aria-label（dev 缺失 warn）。
  定位靠 style 逻辑属性（inset-inline-end / inset-block-end），不提供独立 top/right prop。
  可选包裹 Badge（复用本库 Badge）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import Badge from '../badge/Badge.svelte';
  import type { FloatButtonProps } from './types.js';

  let {
    icon,
    badge,
    shape = 'round',
    size = 'default',
    colorful = false,
    disabled = false,
    href,
    target,
    ariaLabel,
    onClick,
    class: className = '',
    style,
    children,
  }: FloatButtonProps = $props();

  // dev 检测：兼容 Vite（import.meta.env.DEV）与非 Vite 消费方（缺失时静默 no-op），
  // 避免依赖 vite/client 环境类型即可通过 svelte-check（对齐 IconButton）。
  const isDev = (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV ?? false;

  // dev 校验：icon-only（无 children）时必须提供 ariaLabel。
  $effect(() => {
    if (isDev && !children && !ariaLabel) {
      console.warn(
        '[FloatButton] `ariaLabel` is required for icon-only float buttons to provide an accessible name.',
      );
    }
  });

  // 有 href 且 target=_blank 时补 rel（安全：阻断 window.opener）。
  const computedRel = $derived(target === '_blank' ? 'noopener noreferrer' : undefined);

  // round/square 是语义预设（走 class + token）；其它字符串视为自定义 border-radius。
  const isPreset = $derived(shape === 'round' || shape === 'square');

  const rootClass = $derived(
    [
      'cd-floatbutton',
      isPreset ? `cd-floatbutton--${shape}` : '',
      `cd-floatbutton--${size}`,
      colorful ? 'cd-floatbutton--colorful' : '',
      disabled ? 'cd-floatbutton--disabled' : '',
      children ? 'cd-floatbutton--with-content' : 'cd-floatbutton--icon-only',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );

  // 自定义 shape：把 border-radius 拼到用户 style 前（用户 style 仍可覆盖）。
  const rootStyle = $derived(
    isPreset ? style : [`border-radius:${shape}`, style ?? ''].filter(Boolean).join(';'),
  );

  function handleClick(e: MouseEvent) {
    if (disabled) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onClick?.(e);
  }
</script>

{#snippet body()}
  {#if icon}
    <span class="cd-floatbutton__icon">{@render (icon as Snippet)()}</span>
  {/if}
  {#if children}
    <span class="cd-floatbutton__content">{@render children()}</span>
  {/if}
{/snippet}

{#snippet inner()}
  {#if badge}
    <Badge {...badge}>
      {@render body()}
    </Badge>
  {:else}
    {@render body()}
  {/if}
{/snippet}

{#if href}
  <a
    class={rootClass}
    href={disabled ? undefined : href}
    {target}
    rel={computedRel}
    aria-label={ariaLabel}
    aria-disabled={disabled ? 'true' : undefined}
    tabindex={disabled ? -1 : undefined}
    style={rootStyle}
    onclick={handleClick}
  >
    {@render inner()}
  </a>
{:else}
  <button
    type="button"
    class={rootClass}
    {disabled}
    aria-label={ariaLabel}
    style={rootStyle}
    onclick={handleClick}
  >
    {@render inner()}
  </button>
{/if}

<style>
  .cd-floatbutton {
    position: fixed;
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--cd-spacing-tight, 8px);
    inline-size: var(--cd-floatbutton-size-default);
    block-size: var(--cd-floatbutton-size-default);
    padding: 0;
    border: 1px solid var(--cd-floatbutton-border);
    border-radius: var(--cd-floatbutton-radius-round);
    background: var(--cd-floatbutton-bg);
    color: var(--cd-floatbutton-color);
    box-shadow: var(--cd-floatbutton-shadow);
    font: inherit;
    text-decoration: none;
    cursor: pointer;
    z-index: var(--cd-floatbutton-z);
    transition:
      background var(--cd-floatbutton-motion-duration) ease,
      box-shadow var(--cd-floatbutton-motion-duration) ease;
  }

  /* 有可视文字时：宽度自适应，加水平内距 */
  .cd-floatbutton--with-content {
    inline-size: auto;
    min-inline-size: var(--cd-floatbutton-size-default);
    padding-inline: 16px;
  }
  .cd-floatbutton--with-content.cd-floatbutton--small {
    min-inline-size: var(--cd-floatbutton-size-small);
    padding-inline: 12px;
  }
  .cd-floatbutton--with-content.cd-floatbutton--large {
    min-inline-size: var(--cd-floatbutton-size-large);
    padding-inline: 20px;
  }

  /* 形状 */
  .cd-floatbutton--square {
    border-radius: var(--cd-floatbutton-radius-square);
  }
  /* round + 有文字（宽>高）：用胶囊圆角而非 50%（后者在矩形上会变椭圆）。 */
  .cd-floatbutton--round.cd-floatbutton--with-content {
    border-radius: var(--cd-border-radius-full, 9999px);
  }

  /* 徽章：让 Badge 包裹层撑满按钮，徽章才相对整个按钮而非 icon 小框定位。 */
  .cd-floatbutton :global(.cd-badge) {
    inline-size: 100%;
    block-size: 100%;
    align-items: center;
    justify-content: center;
  }
  /*
    徽章定位到圆形按钮边缘右上角切点（对齐 Semi 几何公式）：
    偏移 = (√2−1)/√2 × R = 0.29 × R，R = 半个按钮宽。default 48 → 0.29×24 ≈ 7px。
    覆盖 Badge 默认的 translate(50%,-50%) 贴角定位。
  */
  .cd-floatbutton--round :global(.cd-badge-rightTop) {
    inset-block-start: calc(0.29 * 0.5 * var(--cd-floatbutton-size-default));
    inset-inline-end: calc(0.29 * 0.5 * var(--cd-floatbutton-size-default));
    transform: translate(50%, -50%);
  }
  .cd-floatbutton--round.cd-floatbutton--small :global(.cd-badge-rightTop) {
    inset-block-start: calc(0.29 * 0.5 * var(--cd-floatbutton-size-small));
    inset-inline-end: calc(0.29 * 0.5 * var(--cd-floatbutton-size-small));
  }
  .cd-floatbutton--round.cd-floatbutton--large :global(.cd-badge-rightTop) {
    inset-block-start: calc(0.29 * 0.5 * var(--cd-floatbutton-size-large));
    inset-inline-end: calc(0.29 * 0.5 * var(--cd-floatbutton-size-large));
  }
  /* square：偏移 = 0.29 × 圆角半径，贴方形圆角切点。 */
  .cd-floatbutton--square :global(.cd-badge-rightTop) {
    inset-block-start: calc(0.29 * var(--cd-floatbutton-radius-square));
    inset-inline-end: calc(0.29 * var(--cd-floatbutton-radius-square));
  }

  /* 尺寸 */
  .cd-floatbutton--small {
    inline-size: var(--cd-floatbutton-size-small);
    block-size: var(--cd-floatbutton-size-small);
  }
  .cd-floatbutton--large {
    inline-size: var(--cd-floatbutton-size-large);
    block-size: var(--cd-floatbutton-size-large);
  }

  .cd-floatbutton:hover {
    background: var(--cd-floatbutton-bg-hover);
  }
  .cd-floatbutton:active {
    background: var(--cd-floatbutton-bg-active);
  }
  .cd-floatbutton:focus-visible {
    outline: 2px solid var(--cd-floatbutton-focus-ring);
    outline-offset: 2px;
  }

  /* colorful：AI 多彩渐变 */
  .cd-floatbutton--colorful {
    background: var(--cd-floatbutton-colorful-gradient);
    color: var(--cd-floatbutton-colorful-color);
    border-color: transparent;
  }
  .cd-floatbutton--colorful:hover,
  .cd-floatbutton--colorful:active {
    background: var(--cd-floatbutton-colorful-gradient);
    filter: brightness(1.05);
  }

  /* 禁用 */
  .cd-floatbutton--disabled {
    opacity: var(--cd-floatbutton-disabled-opacity);
    cursor: not-allowed;
    pointer-events: none;
    box-shadow: none;
  }

  .cd-floatbutton__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .cd-floatbutton__icon :global(svg) {
    inline-size: 1.25em;
    block-size: 1.25em;
  }

  @media (prefers-reduced-motion: reduce) {
    .cd-floatbutton {
      transition: none;
    }
    /* colorful 渐变在 reduced-motion 下静止（本实现为静态渐变，无动画） */
  }
</style>
