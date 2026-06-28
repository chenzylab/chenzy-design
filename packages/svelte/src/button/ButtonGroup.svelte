<!--
  ButtonGroup — 把多个 Button 横向拼接：相邻按钮共享边框、圆角只在两端。
  组级默认（size/type/theme/disabled）经 setContext 透传给组内 Button，
  仅作为「未显式设置」的回退（Button 显式 prop 始终优先），不破坏 Button API。
-->
<script lang="ts">
  import { setContext, type Snippet } from 'svelte';
  import {
    BUTTON_GROUP_CTX,
    type ButtonGroupContext,
    type ButtonType,
    type ButtonTheme,
    type ButtonSize,
  } from './context.js';

  interface Props {
    size?: ButtonSize;
    type?: ButtonType;
    theme?: ButtonTheme;
    disabled?: boolean;
    /** 按钮组语义标签（aria-label）。 */
    ariaLabel?: string;
    children?: Snippet;
  }

  let { size, type, theme, disabled, ariaLabel, children }: Props = $props();

  // 透传组级默认给组内 Button（getButtonGroupContext 读取）。
  // 用 getter 暴露 live 值，使组内 Button 始终读到最新的组级默认（context 本身不可重赋值）。
  const ctx: ButtonGroupContext = {
    get size() {
      return size;
    },
    get type() {
      return type;
    },
    get theme() {
      return theme;
    },
    get disabled() {
      return disabled;
    },
  };
  setContext(BUTTON_GROUP_CTX, ctx);
</script>

<div class="cd-button-group" role="group" aria-label={ariaLabel}>
  {@render children?.()}
</div>

<style>
  .cd-button-group {
    display: inline-flex;
    align-items: center;
  }
  /* 相邻按钮共享边框：除首个外左移 1px 叠边，圆角只保留两端。 */
  .cd-button-group :global(.cd-button) {
    border-radius: 0;
    position: relative;
  }
  .cd-button-group :global(.cd-button:not(:first-child)) {
    margin-inline-start: -1px;
  }
  .cd-button-group :global(.cd-button:first-child) {
    border-start-start-radius: var(--cd-button-radius);
    border-end-start-radius: var(--cd-button-radius);
  }
  .cd-button-group :global(.cd-button:last-child) {
    border-start-end-radius: var(--cd-button-radius);
    border-end-end-radius: var(--cd-button-radius);
  }
  /* hover/focus 的按钮浮到相邻按钮之上，保证边框/聚焦环完整可见。 */
  .cd-button-group :global(.cd-button:hover),
  .cd-button-group :global(.cd-button:focus-visible) {
    z-index: 1;
  }
  /* 无边框主题（solid/light）下，用细分隔线区隔相邻按钮。 */
  .cd-button-group :global(.cd-button:not(:first-child))::before {
    content: '';
    position: absolute;
    inset-block: 0;
    inset-inline-start: 0;
    width: 1px;
    background: var(--cd-button-group-divider);
    opacity: 0.5;
    pointer-events: none;
  }
</style>
