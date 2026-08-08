<!--
  ResizableHandler — single drag handle for one direction of a Resizable
  container. Bare hit-area div (no role / aria / tabindex / keyboard) —
  strictly aligned with Semi Design (semi-ui/resizable/single/resizableHandler.tsx).
  DOM: cd-resizable-resizableHandler cd-resizable-resizableHandler-{direction}.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { Direction } from '@chenzy-design/core';

  interface Props {
    direction: Direction;
    class?: string | undefined;
    style?: string | undefined;
    onResizeStart?: (event: PointerEvent, direction: Direction) => void;
    children?: Snippet;
  }

  let { direction, class: className, style, onResizeStart, children }: Props = $props();

  function onPointerDown(event: PointerEvent): void {
    onResizeStart?.(event, direction);
  }

  const cls = $derived(
    [className, 'cd-resizable-resizableHandler', `cd-resizable-resizableHandler-${direction}`]
      .filter(Boolean)
      .join(' '),
  );
</script>

<!-- 把手是裸命中区，严格对齐 Semi（无 role/aria/键盘），仅承载指针拖拽。 -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class={cls} {style} onpointerdown={onPointerDown}>
  {@render children?.()}
</div>

<style>
  :global(.cd-resizable-resizableHandler) {
    position: absolute;
    user-select: none;
    z-index: var(--cd-z-index-resizable-handler);
  }
  /* 上下把手：宽满高 var(--cd-height-resizable-row-handler) */
  :global(.cd-resizable-resizableHandler-top),
  :global(.cd-resizable-resizableHandler-bottom) {
    width: 100%;
    height: var(--cd-height-resizable-row-handler);
    left: 0;
    cursor: row-resize;
  }
  :global(.cd-resizable-resizableHandler-top) {
    top: calc(-1 * var(--cd-height-resizable-row-handler) / 2);
  }
  :global(.cd-resizable-resizableHandler-bottom) {
    bottom: calc(-1 * var(--cd-height-resizable-row-handler) / 2);
  }
  /* 左右把手：高满宽 var(--cd-width-resizable-col-handler) */
  :global(.cd-resizable-resizableHandler-left),
  :global(.cd-resizable-resizableHandler-right) {
    width: var(--cd-width-resizable-col-handler);
    height: 100%;
    top: 0;
    cursor: col-resize;
  }
  :global(.cd-resizable-resizableHandler-left) {
    left: calc(-1 * var(--cd-width-resizable-col-handler) / 2);
  }
  :global(.cd-resizable-resizableHandler-right) {
    right: calc(-1 * var(--cd-width-resizable-col-handler) / 2);
  }
  /* 四角：var(--cd-width-resizable-edge-handler) x var(--cd-height-resizable-edge-handler) */
  :global(.cd-resizable-resizableHandler-topRight),
  :global(.cd-resizable-resizableHandler-bottomRight),
  :global(.cd-resizable-resizableHandler-bottomLeft),
  :global(.cd-resizable-resizableHandler-topLeft) {
    width: var(--cd-width-resizable-edge-handler);
    height: var(--cd-height-resizable-edge-handler);
    position: absolute;
  }
  :global(.cd-resizable-resizableHandler-topRight) {
    top: calc(-1 * var(--cd-height-resizable-edge-handler) / 2);
    right: calc(-1 * var(--cd-width-resizable-edge-handler) / 2);
    cursor: ne-resize;
  }
  :global(.cd-resizable-resizableHandler-bottomRight) {
    bottom: calc(-1 * var(--cd-height-resizable-edge-handler) / 2);
    right: calc(-1 * var(--cd-width-resizable-edge-handler) / 2);
    cursor: se-resize;
  }
  :global(.cd-resizable-resizableHandler-bottomLeft) {
    bottom: calc(-1 * var(--cd-height-resizable-edge-handler) / 2);
    left: calc(-1 * var(--cd-width-resizable-edge-handler) / 2);
    cursor: sw-resize;
  }
  :global(.cd-resizable-resizableHandler-topLeft) {
    top: calc(-1 * var(--cd-height-resizable-edge-handler) / 2);
    left: calc(-1 * var(--cd-width-resizable-edge-handler) / 2);
    cursor: nw-resize;
  }
</style>
