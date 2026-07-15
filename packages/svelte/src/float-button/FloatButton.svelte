<!--
  FloatButton — 悬浮固定在视口的可操作按钮。严格对齐 Semi Design：
  纯 div + onClick（非 button/a），href 靠 JS 跳转（_blank → window.open，否则 location.href）。
  外层 div 带 size + shape class；body 带 shape + size (+ colorful? + disabled?) class。
  有 badge 时 body 外层包裹 Badge（复用本库 Badge）。
-->
<script lang="ts">
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
    onClick,
    class: className = '',
    style,
  }: FloatButtonProps = $props();

  const rootClass = $derived(
    ['cd-floatButton', `cd-floatButton-${size}`, `cd-floatButton-${shape}`, className]
      .filter(Boolean)
      .join(' '),
  );

  const bodyClass = $derived(
    [
      'cd-floatButton-body',
      `cd-floatButton-${shape}`,
      `cd-floatButton-${size}`,
      colorful ? 'cd-floatButton-colorful' : '',
      disabled ? 'cd-floatButton-disabled' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );

  function handleClick(e: MouseEvent) {
    if (disabled) return;
    if (href) {
      if (target === '_blank') window.open(href, '_blank');
      else window.location.href = href;
    }
    onClick?.(e);
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class={rootClass} {style} onclick={handleClick}>
  {#if badge}
    <Badge {...badge}>
      <div class={bodyClass}>{@render icon?.()}</div>
    </Badge>
  {:else}
    <div class={bodyClass}>{@render icon?.()}</div>
  {/if}
</div>

<style>
  .cd-floatButton {
    position: fixed;
    bottom: var(--cd-floatbutton-bottom);
    right: var(--cd-floatbutton-right);
    z-index: var(--cd-floatbutton-z);
    cursor: pointer;
  }

  .cd-floatButton-body {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--cd-floatbutton-bg);
    box-shadow: var(--cd-floatbutton-shadow);
    color: var(--cd-floatbutton-color);
  }
  .cd-floatButton-body:hover {
    background-color: var(--cd-floatbutton-bg-hover);
  }
  .cd-floatButton-body:active {
    background-color: var(--cd-floatbutton-bg-active);
  }

  /* 形状（作用于 body：Semi round/square 圆角在 body 上生效） */
  .cd-floatButton-body.cd-floatButton-round {
    border-radius: var(--cd-floatbutton-radius-round);
  }
  .cd-floatButton-body.cd-floatButton-square {
    border-radius: var(--cd-floatbutton-radius-square);
  }

  /* 尺寸（作用于 body） */
  .cd-floatButton-body.cd-floatButton-small {
    width: var(--cd-floatbutton-size-small);
    height: var(--cd-floatbutton-size-small);
  }
  .cd-floatButton-body.cd-floatButton-default {
    width: var(--cd-floatbutton-size-default);
    height: var(--cd-floatbutton-size-default);
  }
  .cd-floatButton-body.cd-floatButton-large {
    width: var(--cd-floatbutton-size-large);
    height: var(--cd-floatbutton-size-large);
  }

  /* colorful（AI 多彩渐变） */
  .cd-floatButton-body.cd-floatButton-colorful {
    background: var(--cd-floatbutton-colorful-bg);
    color: var(--cd-floatbutton-colorful-text);
  }
  .cd-floatButton-body.cd-floatButton-colorful:hover {
    background: var(--cd-floatbutton-colorful-bg-hover);
  }
  .cd-floatButton-body.cd-floatButton-colorful:active {
    background: var(--cd-floatbutton-colorful-bg-active);
  }

  /* 禁用（Semi：disabled-bg + disabled-text，非 opacity） */
  .cd-floatButton-body.cd-floatButton-disabled {
    background: var(--cd-floatbutton-disabled-bg);
    color: var(--cd-floatbutton-disabled-text);
    cursor: not-allowed;
  }
  .cd-floatButton-body.cd-floatButton-disabled:hover {
    background-color: var(--cd-floatbutton-disabled-bg);
  }

  .cd-floatButton-body :global(svg) {
    width: 1.25em;
    height: 1.25em;
  }

  /* 徽章定位（对齐 Semi 几何公式：偏移 = 0.29 × R）。
     Semi 直接选 .semi-badge-dot / .semi-badge-count；本库 Badge 用 cd-badge-* 类。
     round：R = 0.5 × 边长；square：R = 圆角半径。 */
  .cd-floatButton-round.cd-floatButton-small :global(.cd-badge-dot),
  .cd-floatButton-round.cd-floatButton-small :global(.cd-badge-count) {
    top: calc(0.29 * 0.5 * var(--cd-floatbutton-size-small));
    inset-inline-end: calc(0.29 * 0.5 * var(--cd-floatbutton-size-small));
  }
  .cd-floatButton-round.cd-floatButton-default :global(.cd-badge-dot),
  .cd-floatButton-round.cd-floatButton-default :global(.cd-badge-count) {
    top: calc(0.29 * 0.5 * var(--cd-floatbutton-size-default));
    inset-inline-end: calc(0.29 * 0.5 * var(--cd-floatbutton-size-default));
  }
  .cd-floatButton-round.cd-floatButton-large :global(.cd-badge-dot),
  .cd-floatButton-round.cd-floatButton-large :global(.cd-badge-count) {
    top: calc(0.29 * 0.5 * var(--cd-floatbutton-size-large));
    inset-inline-end: calc(0.29 * 0.5 * var(--cd-floatbutton-size-large));
  }
  .cd-floatButton-square :global(.cd-badge-dot),
  .cd-floatButton-square :global(.cd-badge-count) {
    top: calc(0.29 * var(--cd-floatbutton-radius-square));
    inset-inline-end: calc(0.29 * var(--cd-floatbutton-radius-square));
  }
</style>
