<!--
  ResizeHandler — draggable separator between two ResizeItems. Registers with the
  group (context); pointerdown delegates to the group's coupling geometry.
  Strictly aligned with Semi Design: a bare div (no role / aria / tabindex /
  keyboard), rendering IconHandle by default (rotated 90deg on vertical groups).
  DOM: root cd-resizable-handler cd-resizable-handler-{direction}.
-->
<script lang="ts">
  import { getContext, onMount } from 'svelte';
  import { IconHandle } from '@chenzy-design/icons';
  import { RESIZE_GROUP_KEY, type ResizeGroupContext, type ResizeHandlerRegistration } from './ResizeContext.js';

  interface Props {
    class?: string;
    style?: string;
    onResizeStart?: (event: PointerEvent) => void;
  }

  let { class: className = '', style, onResizeStart }: Props = $props();

  const group = getContext<ResizeGroupContext | undefined>(RESIZE_GROUP_KEY);

  let el = $state<HTMLDivElement | null>(null);
  let myId = $state(-1);

  onMount(() => {
    if (!group) return;
    const reg: ResizeHandlerRegistration = {
      id: -1,
      getEl: () => el,
    };
    const unregister = group.registerHandler(reg);
    myId = reg.id;
    return unregister;
  });

  const direction = $derived(group?.direction() ?? 'horizontal');

  function onPointerDown(event: PointerEvent): void {
    if (event.button !== 0 || !group) return;
    onResizeStart?.(event);
    group.startHandlerDrag(myId, event);
  }

  const cls = $derived(
    [className, 'cd-resizable-handler', `cd-resizable-handler-${direction}`].filter(Boolean).join(' '),
  );
</script>

<!-- 把手是裸命中区，严格对齐 Semi（无 role/aria/键盘），仅承载指针拖拽。 -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div bind:this={el} class={cls} {style} onpointerdown={onPointerDown}>
  <IconHandle size="inherit" style={direction === 'horizontal' ? 'rotate: 0deg' : 'rotate: 90deg'} />
</div>

<style>
  .cd-resizable-handler {
    user-select: none;
    z-index: var(--cd-z-index-resizable-handler);
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--cd-color-resizable-handler-bg);
    opacity: 1;
  }
  .cd-resizable-handler-vertical {
    width: 100%;
    height: var(--cd-height-resizable-vertical-handler);
    flex-shrink: 0;
    cursor: row-resize;
  }
  .cd-resizable-handler-horizontal {
    height: 100%;
    width: var(--cd-width-resizable-horizontal-handler);
    flex-shrink: 0;
    cursor: col-resize;
  }
</style>
