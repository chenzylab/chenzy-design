<!--
  ResizeItem — one panel inside a ResizeGroup. Registers with the group (context)
  declaratively; the group drives its flex-basis. Registration bookkeeping is a
  plain object handed to the group (no reactive dispatch on mount → no §9.3 loop).
  See specs/components/other/Resizable.spec.md §4.3.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { getContext, onMount } from 'svelte';
  import type { ResizeCallback, ResizeStartCallback } from '@chenzy-design/core';
  import {
    RESIZE_GROUP_KEY,
    type ResizeGroupContext,
    type ResizeItemRegistration,
  } from './context.js';

  interface Props {
    /** 初始尺寸（百分比字符串 / px / 数字比例）。 */
    defaultSize?: string | number;
    /** 最小尺寸（同单位）。 */
    min?: string;
    /** 最大尺寸（同单位）。 */
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

  const cls = $derived(['cd-resize-item', className].filter(Boolean).join(' '));
</script>

<div bind:this={el} class={cls} {style}>
  {@render children?.()}
</div>

<style>
  .cd-resize-item {
    box-sizing: border-box;
    min-width: 0;
    min-height: 0;
    overflow: auto;
  }
</style>
