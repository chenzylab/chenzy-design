<!--
  Resizable — single resizable container with up to 8 drag handles (4 edges + 4
  corners). Consumes createResizeDrag from core for imperative pointer geometry
  (redline #3: no reactive attachment reads geometry). Handles are role=separator
  with keyboard support (←→/↑↓/Home/End) + i18n aria-label. See
  specs/components/other/Resizable.spec.md §4.1.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import {
    createResizeDrag,
    DIRECTIONS,
    hasDirection,
    type Direction,
    type Enable,
    type ResizableSize as Size,
    type ResizeCallback,
    type ResizeStartCallback,
  } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';

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
    /** 吸附网格步长 [x, y]。 */
    grid?: [number, number];
    /** 画布缩放系数（拖拽 delta 除以 scale）。 */
    scale?: number;
    /** 像素比修正（高分屏 delta）。 */
    ratio?: number | [number, number];
    /** 键盘步长（默认 10 或 grid[0]/grid[1]）。 */
    keyboardStep?: number;
    class?: string;
    style?: string;
    /** 拖拽开始；返回 false 取消本次拖拽（对齐 Semi）。 */
    onResizeStart?: ResizeStartCallback;
    /** 拖拽中；载荷顺序 (size, event, direction)。 */
    onChange?: ResizeCallback;
    /** 拖拽结束，签名同 onChange。 */
    onResizeEnd?: ResizeCallback;
    children?: Snippet;
    /** 各向把手自定义内容。 */
    handleNode?: Partial<Record<Direction, Snippet>>;
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
    scale = 1,
    ratio = 1,
    keyboardStep,
    class: className = '',
    style,
    onResizeStart,
    onChange,
    onResizeEnd,
    children,
    handleNode,
  }: Props = $props();

  const loc = useLocale();

  let rootEl = $state<HTMLDivElement | null>(null);

  const toCss = (v: string | number | undefined): string | undefined =>
    v == null ? undefined : typeof v === 'number' ? `${v}px` : v;

  const toPx = (v: string | number | undefined): number | undefined => {
    if (v == null) return undefined;
    if (typeof v === 'number') return v;
    if (v.endsWith('px')) return Number(v.slice(0, -2));
    const n = Number(v);
    return Number.isNaN(n) ? undefined : n;
  };

  // 非受控本地尺寸（拖拽/键盘时命令式写入）。default 仅作一次性初值、后续不回写。
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

  // 当前尺寸的 px 读数（命令式，红线 #3：不在 effect 里读几何）。
  function readSize(): { width: number; height: number } {
    if (rootEl) {
      return { width: rootEl.offsetWidth, height: rootEl.offsetHeight };
    }
    return { width: toPx(curWidth) ?? 0, height: toPx(curHeight) ?? 0 };
  }

  function commit(w: number, h: number): void {
    if (!isControlled) {
      // 保持原单位语义：若初值是 % 字符串，转回 %。
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

  function handlePointerDown(event: PointerEvent, dir: Direction): void {
    if (event.button !== 0) return;
    // onResizeStart 返回 false 取消。
    const cont = onResizeStart?.(event, dir);
    if (cont === false) return;
    event.preventDefault();
    activeDrag?.destroy();
    activeDrag = createResizeDrag({
      axis: 'xy',
      getStart: () => readSize(),
      min: { min: toPx(minWidth) },
      max: { max: toPx(maxWidth) },
      ...(grid ? { grid } : {}),
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
        onResizeEnd?.({ width: w, height: h }, e, d);
        activeDrag = null;
      },
    });
    activeDrag.start(event, dir);
  }

  // 卸载兜底：拖拽中卸载时解绑遗留全局监听（红线 #3）。
  $effect(() => () => activeDrag?.destroy());

  // 键盘：把手聚焦后按方向调尺寸。
  function stepFor(dir: 'x' | 'y'): number {
    if (keyboardStep != null) return keyboardStep;
    if (grid) return dir === 'x' ? grid[0] : grid[1];
    return 10;
  }

  function applyKeyboard(dir: Direction, dw: number, dh: number, e: KeyboardEvent): void {
    const cur = readSize();
    let w = cur.width + dw;
    let h = cur.height + dh;
    const minW = toPx(minWidth);
    const maxW = toPx(maxWidth);
    const minH = toPx(minHeight);
    const maxH = toPx(maxHeight);
    if (minW != null) w = Math.max(w, minW);
    if (maxW != null) w = Math.min(w, maxW);
    if (minH != null) h = Math.max(h, minH);
    if (maxH != null) h = Math.min(h, maxH);
    commit(w, h);
    onChange?.({ width: w, height: h }, e as unknown as PointerEvent, dir);
    onResizeEnd?.({ width: w, height: h }, e as unknown as PointerEvent, dir);
  }

  function handleKeydown(event: KeyboardEvent, dir: Direction): void {
    const horizontal = hasDirection(dir, 'left') || hasDirection(dir, 'right');
    const vertical = hasDirection(dir, 'top') || hasDirection(dir, 'bottom');
    // RTL 镜像：横向把手 ←→ 语义反转。
    const rtl =
      typeof window !== 'undefined' && rootEl
        ? getComputedStyle(rootEl).direction === 'rtl'
        : false;
    const sx = stepFor('x');
    const sy = stepFor('y');
    let dw = 0;
    let dh = 0;
    switch (event.key) {
      case 'ArrowRight':
        if (horizontal) dw = rtl ? -sx : sx;
        break;
      case 'ArrowLeft':
        if (horizontal) dw = rtl ? sx : -sx;
        break;
      case 'ArrowDown':
        if (vertical) dh = sy;
        break;
      case 'ArrowUp':
        if (vertical) dh = -sy;
        break;
      case 'Home': {
        // 收到最小
        const cur = readSize();
        if (horizontal) dw = (toPx(minWidth) ?? 0) - cur.width;
        if (vertical) dh = (toPx(minHeight) ?? 0) - cur.height;
        break;
      }
      case 'End': {
        const cur = readSize();
        const mw = toPx(maxWidth);
        const mh = toPx(maxHeight);
        if (horizontal && mw != null) dw = mw - cur.width;
        if (vertical && mh != null) dh = mh - cur.height;
        break;
      }
      default:
        return;
    }
    if (dw === 0 && dh === 0) return;
    event.preventDefault();
    applyKeyboard(dir, dw, dh, event);
  }

  const orientationOf = (dir: Direction): 'horizontal' | 'vertical' =>
    // 左右把手 = 竖直分隔线（vertical orientation）
    hasDirection(dir, 'left') || hasDirection(dir, 'right') ? 'vertical' : 'horizontal';

  const rootStyle = $derived(
    [toCss(curWidth) ? `width:${toCss(curWidth)}` : '', toCss(curHeight) ? `height:${toCss(curHeight)}` : '', style ?? '']
      .filter(Boolean)
      .join(';'),
  );

  const cls = $derived(['cd-resizable', className].filter(Boolean).join(' '));

  const label = $derived(loc().t('Resizable.handleAriaLabel'));

  function ariaNow(dir: Direction): number {
    const cur = readSize();
    return orientationOf(dir) === 'vertical' ? cur.width : cur.height;
  }
</script>

<div bind:this={rootEl} class={cls} style={rootStyle}>
  {@render children?.()}
  {#each enabledHandles as dir (dir)}
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div
      class="cd-resizable__handle cd-resizable__handle--{dir}"
      role="separator"
      tabindex="0"
      aria-orientation={orientationOf(dir)}
      aria-label={label}
      aria-valuenow={Math.round(ariaNow(dir))}
      aria-valuemin={orientationOf(dir) === 'vertical' ? toPx(minWidth) : toPx(minHeight)}
      aria-valuemax={orientationOf(dir) === 'vertical' ? toPx(maxWidth) : toPx(maxHeight)}
      onpointerdown={(e) => handlePointerDown(e, dir)}
      onkeydown={(e) => handleKeydown(e, dir)}
    >
      {#if handleNode?.[dir]}
        {@render handleNode[dir]?.()}
      {/if}
    </div>
  {/each}
</div>

<style>
  .cd-resizable {
    position: relative;
    box-sizing: border-box;
  }
  .cd-resizable__handle {
    position: absolute;
    z-index: 1;
    touch-action: none;
    /* 命中区 ≥24px（视觉线细，命中区扩展满足 2.5.8） */
  }
  .cd-resizable__handle:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px var(--cd-resizable-handle-color-focus);
  }
  /* 边把手：可视分隔线 */
  .cd-resizable__handle--right,
  .cd-resizable__handle--left {
    top: 0;
    bottom: 0;
    width: max(var(--cd-resizable-handle-size), 12px);
    cursor: ew-resize;
  }
  .cd-resizable__handle--right {
    right: calc(var(--cd-resizable-handle-size) * -0.5);
  }
  .cd-resizable__handle--left {
    left: calc(var(--cd-resizable-handle-size) * -0.5);
  }
  .cd-resizable__handle--top,
  .cd-resizable__handle--bottom {
    left: 0;
    right: 0;
    height: max(var(--cd-resizable-handle-size), 12px);
    cursor: ns-resize;
  }
  .cd-resizable__handle--top {
    top: calc(var(--cd-resizable-handle-size) * -0.5);
  }
  .cd-resizable__handle--bottom {
    bottom: calc(var(--cd-resizable-handle-size) * -0.5);
  }
  /* 角把手 */
  .cd-resizable__handle--topRight,
  .cd-resizable__handle--bottomRight,
  .cd-resizable__handle--bottomLeft,
  .cd-resizable__handle--topLeft {
    width: max(var(--cd-resizable-handle-size), 12px);
    height: max(var(--cd-resizable-handle-size), 12px);
  }
  .cd-resizable__handle--topRight {
    top: 0;
    right: 0;
    cursor: nesw-resize;
  }
  .cd-resizable__handle--bottomRight {
    bottom: 0;
    right: 0;
    cursor: nwse-resize;
  }
  .cd-resizable__handle--bottomLeft {
    bottom: 0;
    left: 0;
    cursor: nesw-resize;
  }
  .cd-resizable__handle--topLeft {
    top: 0;
    left: 0;
    cursor: nwse-resize;
  }
  /* 可视线：edge 把手中间画一条细线 */
  .cd-resizable__handle--right::after,
  .cd-resizable__handle--left::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    width: 1px;
    transform: translateX(-50%);
    background: var(--cd-resizable-handle-color);
    transition: background-color 0.15s;
  }
  .cd-resizable__handle--top::after,
  .cd-resizable__handle--bottom::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    height: 1px;
    transform: translateY(-50%);
    background: var(--cd-resizable-handle-color);
    transition: background-color 0.15s;
  }
  .cd-resizable__handle:hover::after {
    background: var(--cd-resizable-handle-color-hover);
  }
</style>
