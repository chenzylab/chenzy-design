<!--
  ColorChooseArea — 饱和度/明度方块（对齐 semi-ui/colorPicker/ColorChooseArea）。

  底色为当前色相的纯色（hsvaToHslString），叠加两层渐变（左→右白、下→上黑）取饱和度与明度；
  把手填充当前色，位置由 hsva.s / hsva.v 换算。

  与 Semi 的差异：
  - Semi 用 mousedown + window mousemove/mouseup，本库用 pointer 事件（同时覆盖触控）；
  - Semi 把手位置存 state（px），本库直接由 hsva 派生百分比定位，省一次 state 同步；
  - 本库额外挂 role="slider" + 方向键（Semi 只有 aria-label/aria-valuetext，无键盘操作）。
-->
<script lang="ts">
  import { hsvaToHslString, hsvaToRgbaString, type HsvaColor } from '@chenzy-design/core';
  import { AREA_HANDLE_SIZE } from './constants.js';

  interface Props {
    hsva: HsvaColor;
    width: number;
    height: number;
    handleSize?: number;
    'aria-label': string;
    /** 饱和度/明度变化（对齐 Semi onChange({ s, v })）。 */
    onChange: (next: { s: number; v: number }) => void;
  }

  let {
    hsva,
    width,
    height,
    handleSize = AREA_HANDLE_SIZE,
    'aria-label': ariaLabel,
    onChange,
  }: Props = $props();

  const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

  /** 底色取当前色相的最饱和最亮色（对齐 Semi `hsvaToHslString({h, s:100, v:100, a:1})`）。 */
  const areaBg = $derived(hsvaToHslString({ h: hsva.h, s: 100, v: 100, a: 1 }));
  /** 把手填充当前色（对齐 Semi `backgroundColor: rgba(...)`）。 */
  const handleBg = $derived(hsvaToRgbaString({ ...hsva, a: 1 }));

  let el = $state<HTMLElement | null>(null);
  let rect: DOMRect | null = null;
  let grabbing = $state(false);

  function emitFromPointer(e: PointerEvent) {
    if (!rect) return;
    const s = clamp((e.clientX - rect.left) / rect.width, 0, 1) * 100;
    const v = (1 - clamp((e.clientY - rect.top) / rect.height, 0, 1)) * 100;
    onChange({ s, v });
  }

  function onPointerMove(e: PointerEvent) {
    emitFromPointer(e);
  }

  function onPointerUp() {
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);
    rect = null;
    grabbing = false;
  }

  function onPointerDown(e: PointerEvent) {
    if (!el) return;
    e.preventDefault();
    rect = el.getBoundingClientRect();
    grabbing = true;
    emitFromPointer(e);
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  }

  function onKeydown(e: KeyboardEvent) {
    let { s, v } = hsva;
    switch (e.key) {
      case 'ArrowRight': s = clamp(s + 1, 0, 100); break;
      case 'ArrowLeft': s = clamp(s - 1, 0, 100); break;
      case 'ArrowUp': v = clamp(v + 1, 0, 100); break;
      case 'ArrowDown': v = clamp(v - 1, 0, 100); break;
      case 'Home': s = 0; break;
      case 'End': s = 100; break;
      default: return;
    }
    e.preventDefault();
    onChange({ s, v });
  }
</script>

<div
  class="cd-color-picker-colorchoosearea"
  bind:this={el}
  role="slider"
  tabindex="0"
  aria-label={ariaLabel}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-valuenow={Math.round(hsva.s)}
  aria-valuetext="Saturation {Math.round(hsva.s)}%, Brightness {Math.round(hsva.v)}%"
  style:width="{width}px"
  style:height="{height}px"
  style:background-color={areaBg}
  style:cursor={grabbing ? 'grabbing' : 'pointer'}
  onpointerdown={onPointerDown}
  onkeydown={onKeydown}
>
  <span
    class="cd-color-picker-handle"
    style:width="{handleSize}px"
    style:height="{handleSize}px"
    style:left="calc({hsva.s}% - {handleSize / 2}px)"
    style:top="calc({100 - hsva.v}% - {handleSize / 2}px)"
    style:background-color={handleBg}
  ></span>
</div>

<style>
  /*
   * 渐变叠加照搬 Semi colorPicker.scss（引自 vanilla-colorful）：
   * 上→下黑、左→右白两层，叠在色相底色上。
   */
  .cd-color-picker-colorchoosearea {
    position: relative;
    box-sizing: border-box;
    border-color: transparent;
    border-radius:
      var(--cd-radius-color-picker-topleft) var(--cd-radius-color-picker-topright)
      var(--cd-radius-color-picker-bottomleft) var(--cd-radius-color-picker-bottomright);
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.05);
    background-image:
      linear-gradient(to top, #000, rgba(0, 0, 0, 0)),
      linear-gradient(to right, #fff, rgba(255, 255, 255, 0));
    touch-action: none;
    outline: none;
  }
  .cd-color-picker-colorchoosearea:focus-visible {
    box-shadow: var(--cd-focus-ring);
  }
  .cd-color-picker-handle {
    position: absolute;
    box-sizing: border-box;
    border: var(--cd-width-color-picker-handle-border) solid
      var(--cd-color-color-picker-handle-border);
    border-radius: var(--cd-radius-color-picker-handle);
    cursor: grab;
    pointer-events: none;
  }
</style>
