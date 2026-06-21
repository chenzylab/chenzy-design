<!--
  Icon — see specs/components/basic/Icon.spec.md
  Pure presentational primitive. Token-driven size/color, a11y-correct.
-->
<script lang="ts">
  import type { Component, Snippet } from 'svelte';

  type IconSize = 'extra-small' | 'small' | 'default' | 'large' | 'extra-large' | number;
  type IconStatus = 'default' | 'warning' | 'error' | 'success' | 'info';

  interface Props {
    size?: IconSize;
    spin?: boolean;
    rotate?: number;
    status?: IconStatus;
    color?: string;
    /** 直接传入 SVG 字符串，内部用 {@html} 渲染。来源须可信（构建期 SVGO 净化）。 */
    svg?: string;
    /** 传入一个 Svelte 图标组件作为渲染源。 */
    component?: Component;
    label?: string;
    class?: string;
    /** 透传到根元素的内联样式。 */
    style?: string;
    children?: Snippet;
  }

  let {
    size = 'default',
    spin = false,
    rotate = 0,
    status = 'default',
    color,
    svg,
    component,
    label,
    class: className = '',
    style = '',
    children,
  }: Props = $props();

  // 渲染源派生：优先级 svg > component > children。
  const SvgComponent = $derived(component);

  const isNumericSize = $derived(typeof size === 'number');

  const cls = $derived(
    [
      'cd-icon',
      !isNumericSize && `cd-icon--${size}`,
      status !== 'default' && `cd-icon--status-${status}`,
      spin && 'cd-icon--spin',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );

  const inlineStyle = $derived(
    [
      isNumericSize && `width:${size}px`,
      isNumericSize && `height:${size}px`,
      color && `color:${color}`,
      rotate && `transform:rotate(${rotate}deg)`,
      style,
    ]
      .filter(Boolean)
      .join(';'),
  );
</script>

<span
  class={cls}
  style={inlineStyle || undefined}
  role={label ? 'img' : undefined}
  aria-label={label}
  aria-hidden={label ? undefined : 'true'}
>
  {#if svg}
    <!-- 渲染源 svg：信任来源（构建期 SVGO 净化），运行时不做净化；用户传入的运行时 svg 须自行确保可信。 -->
    {@html svg}
  {:else if SvgComponent}
    <SvgComponent />
  {:else}
    {@render children?.()}
  {/if}
</span>

<style>
  .cd-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    vertical-align: -0.125em;
    width: var(--cd-icon-size-default);
    height: var(--cd-icon-size-default);
    color: currentColor;
    fill: currentColor;
    line-height: 1;
  }
  .cd-icon :global(svg) {
    width: 100%;
    height: 100%;
    /* Do NOT force fill here: stroke-based SVGs set their own fill="none".
       Color propagates via currentColor; fill-based icons should use
       fill="currentColor" in their own markup. */
  }
  .cd-icon--extra-small {
    width: var(--cd-icon-size-extra-small);
    height: var(--cd-icon-size-extra-small);
  }
  .cd-icon--small {
    width: var(--cd-icon-size-small);
    height: var(--cd-icon-size-small);
  }
  .cd-icon--default {
    width: var(--cd-icon-size-default);
    height: var(--cd-icon-size-default);
  }
  .cd-icon--large {
    width: var(--cd-icon-size-large);
    height: var(--cd-icon-size-large);
  }
  .cd-icon--extra-large {
    width: var(--cd-icon-size-extra-large);
    height: var(--cd-icon-size-extra-large);
  }
  .cd-icon--status-warning {
    color: var(--cd-icon-color-warning);
  }
  .cd-icon--status-error {
    color: var(--cd-icon-color-error);
  }
  .cd-icon--status-success {
    color: var(--cd-icon-color-success);
  }
  .cd-icon--status-info {
    color: var(--cd-icon-color-info);
  }
  .cd-icon--spin {
    animation: cd-icon-spin var(--cd-icon-spin-duration) var(--cd-icon-spin-timing) infinite;
  }
  @keyframes cd-icon-spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-icon--spin {
      animation: none;
    }
  }
</style>
