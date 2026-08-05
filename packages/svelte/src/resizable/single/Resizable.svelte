<!--
  Resizable — single resizable container with up to 8 drag handles (4 edges + 4
  corners), each an independent ResizableHandler. Consumes createResizeDrag from
  core for imperative pointer geometry (redline no.3: no reactive attachment
  reads geometry).
  DOM mirrors Semi: root cd-resizable-resizable, an isResizing fixed background
  overlay, and per-direction ResizableHandler.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import {
    createResizeDrag,
    DIRECTIONS,
    type Direction,
    type Enable,
    type ResizableSize as Size,
    type ResizeCallback,
    type ResizeStartCallback,
  } from '@chenzy-design/core';
  import ResizableHandler from './ResizableHandler.svelte';
  import type { HandleClassName, HandleStyle, HandleNode } from './types.js';

  interface Props {
    /** 受控尺寸。 */
    size?: Size;
    /** 非受控初始尺寸。 */
    defaultSize?: Size;
    /** 启用哪些把手；false 全禁用；缺省全 true。 */
    enable?: Enable | false;
    minWidth?: string | number;
    minHeight?: string | number;
    maxWidth?: string | number;
    maxHeight?: string | number;
    /** 锁定宽高比（true 从起始尺寸推导，number 为指定比值）。 */
    lockAspectRatio?: boolean | number;
    /** 吸附网格步长 [x, y]，默认 [1,1]。也接受单数字（归一为 [n,n]）。 */
    grid?: [number, number] | number;
    /** 吸附到指定像素尺寸（对齐 Semi snap）。 */
    snap?: { x?: number[]; y?: number[] };
    /** 吸附生效的最小间隙，0 表示总是吸附到最近目标（对齐 Semi snapGap）。 */
    snapGap?: number;
    /** 限制伸缩范围的边界元素（对齐 Semi boundElement）：'parent' | 'window' | HTMLElement。 */
    boundElement?: 'parent' | 'window' | HTMLElement;
    /** 画布缩放系数（拖拽 delta 除以 scale）。 */
    scale?: number;
    /** 像素比修正（高分屏 delta，对齐 Semi ratio）。 */
    ratio?: number | [number, number];
    class?: string;
    style?: string;
    /** 各向把手的自定义类名。 */
    handleClass?: HandleClassName;
    /** 各向把手的自定义内联样式。 */
    handleStyle?: HandleStyle;
    /** 各向把手自定义内容。 */
    handleNode?: HandleNode;
    /** 拖拽开始；返回 false 取消本次拖拽（对齐 Semi）。 */
    onResizeStart?: ResizeStartCallback;
    /** 拖拽中；载荷顺序 (size, event, direction)。 */
    onChange?: ResizeCallback;
    /** 拖拽结束，签名同 onChange。 */
    onResizeEnd?: ResizeCallback;
    children?: Snippet;
  }

  let {
    size,
    defaultSize,
    enable,
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
    lockAspectRatio = false,
    grid,
    snap,
    snapGap,
    boundElement,
    scale = 1,
    ratio = 1,
    class: className = '',
    style,
    handleClass,
    handleStyle,
    handleNode,
    onResizeStart,
    onChange,
    onResizeEnd,
    children,
  }: Props = $props();

  let rootEl = $state<HTMLDivElement | null>(null);
  let isResizing = $state(false);

  const normGrid = $derived<[number, number] | undefined>(
    grid == null ? undefined : typeof grid === 'number' ? [grid, grid] : grid,
  );

  const toCss = (v: string | number | undefined): string | undefined =>
    v == null ? undefined : typeof v === 'number' ? `${v}px` : v;

  const toPx = (v: string | number | undefined): number | undefined => {
    if (v == null) return undefined;
    if (typeof v === 'number') return v;
    if (v.endsWith('px')) return Number(v.slice(0, -2));
    const n = Number(v);
    return Number.isNaN(n) ? undefined : n;
  };

  // 非受控本地尺寸（拖拽时命令式写入）。default 仅作一次性初值、后续不回写。
  // svelte-ignore state_referenced_locally
  let localWidth = $state<string | number | undefined>(defaultSize?.width);
  // svelte-ignore state_referenced_locally
  let localHeight = $state<string | number | undefined>(defaultSize?.height);

  const isControlled = $derived(size !== undefined);
  const curWidth = $derived(isControlled ? size?.width : localWidth);
  const curHeight = $derived(isControlled ? size?.height : localHeight);

  const isEnabled = (dir: Direction): boolean => {
    if (enable === false) return false;
    if (enable == null) return true;
    return enable[dir] ?? false;
  };

  const enabledHandles = $derived(DIRECTIONS.filter(isEnabled));

  // 当前尺寸的 px 读数（命令式，红线 no.3：不在 effect 里读几何）。
  function readSize(): { width: number; height: number } {
    if (rootEl) {
      return { width: rootEl.offsetWidth, height: rootEl.offsetHeight };
    }
    return { width: toPx(curWidth) ?? 0, height: toPx(curHeight) ?? 0 };
  }

  function commit(w: number, h: number): void {
    if (!isControlled) {
      localWidth = w;
      localHeight = h;
    }
  }

  // 当前拖拽控制器（每次 pointerdown 新建，始终读最新 props；卸载兜底解绑）。
  let activeDrag: ReturnType<typeof createResizeDrag> | null = null;

  function clampSize(w0: number, h0: number): { width: number; height: number } {
    let w = w0;
    let h = h0;
    const minW = toPx(minWidth);
    const maxW = toPx(maxWidth);
    const minH = toPx(minHeight);
    const maxH = toPx(maxHeight);
    if (minW != null) w = Math.max(w, minW);
    if (maxW != null) w = Math.min(w, maxW);
    if (minH != null) h = Math.max(h, minH);
    if (maxH != null) h = Math.min(h, maxH);
    return { width: w, height: h };
  }

  // 依据 boundElement 计算当前可用的最大宽高（drag start 时读一次 DOM）。
  // 盒子向右/下扩展时，上限 = 边界右/下沿 − 盒子左/上沿。
  function computeBoundMax(): { maxWidth?: number; maxHeight?: number } {
    if (!boundElement || !rootEl) return {};
    const box = rootEl.getBoundingClientRect();
    let right: number, bottom: number;
    if (boundElement === 'window') {
      right = window.innerWidth;
      bottom = window.innerHeight;
    } else {
      const el = boundElement === 'parent' ? rootEl.parentElement : boundElement;
      if (!el) return {};
      const r = el.getBoundingClientRect();
      right = r.right;
      bottom = r.bottom;
    }
    return { maxWidth: right - box.left, maxHeight: bottom - box.top };
  }

  function handlePointerDown(event: PointerEvent, dir: Direction): void {
    if (event.button !== 0) return;
    // onResizeStart 返回 false 取消。
    const cont = onResizeStart?.(event, dir);
    if (cont === false) return;
    event.preventDefault();
    isResizing = true;
    activeDrag?.destroy();
    activeDrag = createResizeDrag({
      axis: 'xy',
      getStart: () => readSize(),
      min: { min: toPx(minWidth) },
      max: { max: toPx(maxWidth) },
      ...(normGrid ? { grid: normGrid } : {}),
      ...(snap ? { snap } : {}),
      ...(snapGap != null ? { snapGap } : {}),
      ...(boundElement ? { getBoundMax: computeBoundMax } : {}),
      lockAspectRatio,
      scale,
      ratio,
      onMove: (s, _delta, d, e) => {
        // per-axis clamp for both width/height
        const { width: w, height: h } = clampSize(s.width, s.height);
        commit(w, h);
        onChange?.({ width: w, height: h }, e, d);
      },
      onEnd: (s, d, e) => {
        const { width: w, height: h } = clampSize(s.width, s.height);
        isResizing = false;
        onResizeEnd?.({ width: w, height: h }, e, d);
        activeDrag = null;
      },
    });
    activeDrag.start(event, dir);
  }

  // 卸载兜底：拖拽中卸载时解绑遗留全局监听（红线 no.3）。
  $effect(() => () => activeDrag?.destroy());

  const resizeStyle = $derived(
    [
      isResizing ? 'user-select:none' : 'user-select:auto',
      toCss(maxWidth) ? `max-width:${toCss(maxWidth)}` : '',
      toCss(maxHeight) ? `max-height:${toCss(maxHeight)}` : '',
      toCss(minWidth) ? `min-width:${toCss(minWidth)}` : '',
      toCss(minHeight) ? `min-height:${toCss(minHeight)}` : '',
      style ?? '',
      toCss(curWidth) ? `width:${toCss(curWidth)}` : '',
      toCss(curHeight) ? `height:${toCss(curHeight)}` : '',
    ]
      .filter(Boolean)
      .join(';'),
  );

  const cls = $derived([className, 'cd-resizable-resizable'].filter(Boolean).join(' '));
</script>

<div bind:this={rootEl} class={cls} style={resizeStyle}>
  {#if isResizing}
    <div class="cd-resizable-background"></div>
  {/if}
  {@render children?.()}
  {#if enable !== false}
    {#each enabledHandles as dir (dir)}
      <ResizableHandler
        direction={dir}
        class={handleClass?.[dir]}
        style={handleStyle?.[dir]}
        onResizeStart={handlePointerDown}
      >
        {#if handleNode?.[dir]}
          {@render handleNode[dir]?.()}
        {/if}
      </ResizableHandler>
    {/each}
  {/if}
</div>

<style>
  .cd-resizable-resizable {
    position: relative;
    box-sizing: border-box;
    flex-shrink: 0;
  }

  .cd-resizable-background {
    height: 100%;
    width: 100%;
    inset: 0;
    z-index: var(--cd-z-index-resizable-background);
    opacity: 0;
    position: fixed;
  }
</style>
