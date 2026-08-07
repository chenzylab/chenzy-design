<!--
  ColorSlider — 色相（hue）滑块（对齐 semi-ui/colorPicker/ColorSlider）。
  彩虹渐变条 + 把手，把手填充当前色相的纯色（Semi 用 hsvaToHslString({h, s:100, v:100, a:1})）。
-->
<script lang="ts">
  import { hsvaToHslString } from '@chenzy-design/core';
  import { SLIDER_HANDLE_SIZE, SLIDER_HEIGHT } from './constants.js';

  interface Props {
    hue: number;
    width: number;
    height?: number;
    handleSize?: number;
    'aria-label': string;
    onChange: (hue: number) => void;
  }

  let {
    hue,
    width,
    height = SLIDER_HEIGHT,
    handleSize = SLIDER_HANDLE_SIZE,
    'aria-label': ariaLabel,
    onChange,
  }: Props = $props();

  const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

  const handleBg = $derived(hsvaToHslString({ h: hue, s: 100, v: 100, a: 1 }));
  /** 把手左偏移（对齐 Semi `hue / 360 * width - handleSize / 2`）。 */
  const handleLeft = $derived((hue / 360) * width - handleSize / 2);

  let el = $state<HTMLElement | null>(null);
  let rect: DOMRect | null = null;
  let grabbing = $state(false);

  function emitFromPointer(e: PointerEvent) {
    if (!rect) return;
    onChange(clamp((e.clientX - rect.left) / rect.width, 0, 1) * 360);
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
    let next = hue;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp': next = (hue + 1) % 360; break;
      case 'ArrowLeft':
      case 'ArrowDown': next = (hue - 1 + 360) % 360; break;
      case 'Home': next = 0; break;
      case 'End': next = 360; break;
      default: return;
    }
    e.preventDefault();
    onChange(next);
  }
</script>

<div
  class="cd-color-picker-colorslider"
  bind:this={el}
  role="slider"
  tabindex="0"
  aria-label={ariaLabel}
  aria-valuemin={0}
  aria-valuemax={360}
  aria-valuenow={Math.round(hue)}
  style:width="{width}px"
  style:height="{height}px"
  style:cursor={grabbing ? 'grabbing' : 'pointer'}
  onpointerdown={onPointerDown}
  onkeydown={onKeydown}
>
  <span
    class="cd-color-picker-handle"
    style:width="{handleSize}px"
    style:height="{handleSize}px"
    style:left="{handleLeft}px"
    style:background-color={handleBg}
  ></span>
</div>

<style>
  .cd-color-picker-colorslider {
    position: relative;
    box-sizing: border-box;
    margin-top: var(--cd-spacing-color-picker-slider-margintop);
    border-radius: var(--cd-radius-color-picker-handle);
    background: linear-gradient(
      to right,
      #f00 0%,
      #ff0 17%,
      #0f0 33%,
      #0ff 50%,
      #00f 67%,
      #f0f 83%,
      #f00 100%
    );
    touch-action: none;
    outline: none;
  }
  .cd-color-picker-colorslider:focus-visible {
    box-shadow: var(--cd-focus-ring);
  }
  .cd-color-picker-handle {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    box-sizing: border-box;
    border: var(--cd-width-color-picker-handle-border) solid
      var(--cd-color-color-picker-handle-border);
    border-radius: var(--cd-radius-color-picker-handle);
    cursor: grab;
    pointer-events: none;
  }
</style>
