<!--
  ResizeHandler — draggable separator between two ResizeItems. Registers with the
  group (context); pointerdown delegates to the group's coupling geometry.
  Strictly aligned with Semi Design: a bare div (no role / aria / tabindex /
  keyboard), rendering IconHandle by default (rotated 90deg on vertical groups).
  DOM: root cd-resizable-handler cd-resizable-handler-{direction}.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { getContext, onMount } from 'svelte';
  import { IconHandle } from '@chenzy-design/icons';
  import { RESIZE_GROUP_KEY, type ResizeGroupContext, type ResizeHandlerRegistration } from './context.js';

  interface Props {
    /** 禁用该把手。 */
    disabled?: boolean;
    class?: string;
    style?: string;
    onResizeStart?: (event: PointerEvent) => void;
    children?: Snippet;
  }

  let { disabled = false, class: className = '', style, onResizeStart, children }: Props = $props();

  const group = getContext<ResizeGroupContext | undefined>(RESIZE_GROUP_KEY);

  let el = $state<HTMLDivElement | null>(null);
  let myId = $state(-1);

  onMount(() => {
    if (!group) return;
    const reg: ResizeHandlerRegistration = {
      id: -1,
      getEl: () => el,
      isDisabled: () => disabled,
    };
    const unregister = group.registerHandler(reg);
    myId = reg.id;
    return unregister;
  });

  const direction = $derived(group?.direction() ?? 'horizontal');

  function onPointerDown(event: PointerEvent): void {
    if (disabled || event.button !== 0 || !group) return;
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
  {#if children}
    {@render children()}
  {:else}
    <IconHandle size="inherit" style={direction === 'horizontal' ? 'rotate: 0deg' : 'rotate: 90deg'} />
  {/if}
</div>

<style>
  .cd-resizable-handler {
    user-select: none;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--cd-color-fill-0);
    opacity: 1;
  }
  .cd-resizable-handler-vertical {
    width: 100%;
    height: 10px;
    flex-shrink: 0;
    cursor: row-resize;
  }
  .cd-resizable-handler-horizontal {
    height: 100%;
    width: 10px;
    flex-shrink: 0;
    cursor: col-resize;
  }
</style>
