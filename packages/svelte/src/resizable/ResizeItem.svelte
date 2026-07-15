<!--
  ResizeItem — one panel inside a ResizeGroup. Registers with the group (context)
  declaratively; the group drives its flex-basis. Registration bookkeeping is a
  plain object handed to the group (no reactive dispatch on mount → no §9.3 loop).
  On dynamic direction change the inline width↔height is swapped (aligns Semi).
  DOM: root cd-resizable-item.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { getContext, onMount, tick } from 'svelte';
  import type { ResizeCallback, ResizeStartCallback, GroupDirection } from '@chenzy-design/core';
  import {
    RESIZE_GROUP_KEY,
    type ResizeGroupContext,
    type ResizeItemRegistration,
  } from './context.js';

  interface Props {
    /** 初始尺寸（百分比字符串 / px / 纯数字比例）。 */
    defaultSize?: string | number;
    /** 最小尺寸（百分比或像素）。 */
    min?: string;
    /** 最大尺寸（百分比或像素）。 */
    max?: string;
    onResizeStart?: ResizeStartCallback;
    onChange?: ResizeCallback;
    onResizeEnd?: ResizeCallback;
    class?: string;
    style?: string;
    children?: Snippet;
  }

  let {
    defaultSize,
    min,
    max,
    onResizeStart,
    onChange,
    onResizeEnd,
    class: className = '',
    style,
    children,
  }: Props = $props();

  const group = getContext<ResizeGroupContext | undefined>(RESIZE_GROUP_KEY);

  let el = $state<HTMLDivElement | null>(null);

  onMount(() => {
    if (!group) return;
    const reg: ResizeItemRegistration = {
      id: -1,
      getEl: () => el,
      getMin: () => min,
      getMax: () => max,
      getDefaultSize: () => defaultSize,
      onResizeStart,
      onChange,
      onResizeEnd,
    };
    const unregister = group.registerItem(reg);
    return unregister;
  });

  // 支持动态方向：direction 变化时把 inline width↔height 互换（对齐 Semi）。
  let prevDirection: GroupDirection | undefined;
  $effect(() => {
    const dir = group?.direction();
    if (!dir) return;
    if (prevDirection === undefined) {
      prevDirection = dir;
      return;
    }
    if (dir === prevDirection) return;
    prevDirection = dir;
    tick().then(() => {
      if (!el) return;
      if (dir === 'horizontal') {
        const newWidth = el.style.height;
        el.style.width = newWidth;
        el.style.removeProperty('height');
      } else {
        const newHeight = el.style.width;
        el.style.height = newHeight;
        el.style.removeProperty('width');
      }
    });
  });

  const cls = $derived([className, 'cd-resizable-item'].filter(Boolean).join(' '));
</script>

<div bind:this={el} class={cls} {style}>
  {@render children?.()}
</div>

<style>
  .cd-resizable-item {
    position: relative;
    box-sizing: border-box;
    flex-shrink: 0;
  }
</style>
