<!--
  AlphaSlider — 透明度滑块（对齐 semi-ui/colorPicker/AlphaSlider）。

  三层：棋盘格底纹（外层 background）→ 透明→不透明线性渐变（inner）→ 把手。
  渐变两端照搬 Semi：hsvaToHslaString({...hsva, a: 0}) → hsvaToHslaString({...hsva, a: 1})；
  把手底色也带棋盘格（Semi alphaHandle 单列一套样式），故半透明时把手能透出格子。
-->
<script lang="ts">
  import { hsvaToHslaString, hsvaToRgbaString, type HsvaColor } from '@chenzy-design/core';
  import { ALPHA_CHECKERBOARD, SLIDER_HANDLE_SIZE, SLIDER_HEIGHT } from './constants.js';

  interface Props {
    hsva: HsvaColor;
    width: number;
    height?: number;
    handleSize?: number;
    'aria-label': string;
    onChange: (alpha: number) => void;
  }

  let {
    hsva,
    width,
    height = SLIDER_HEIGHT,
    handleSize = SLIDER_HANDLE_SIZE,
    'aria-label': ariaLabel,
    onChange,
  }: Props = $props();

  const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

  const sliderBg = $derived(
    `linear-gradient(90deg, ${hsvaToHslaString({ ...hsva, a: 0 })}, ${hsvaToHslaString({ ...hsva, a: 1 })})`,
  );
  const handleBg = $derived(hsvaToRgbaString(hsva));
  /** 把手左偏移（对齐 Semi `hsva.a * width - handleSize / 2`）。 */
  const handleLeft = $derived(hsva.a * width - handleSize / 2);

  let el = $state<HTMLElement | null>(null);
  let rect: DOMRect | null = null;
  let grabbing = $state(false);

  function emitFromPointer(e: PointerEvent) {
    if (!rect) return;
    const a = Math.round(clamp((e.clientX - rect.left) / rect.width, 0, 1) * 100) / 100;
    onChange(a);
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
    let next = hsva.a;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp': next = clamp(Math.round((hsva.a + 0.01) * 100) / 100, 0, 1); break;
      case 'ArrowLeft':
      case 'ArrowDown': next = clamp(Math.round((hsva.a - 0.01) * 100) / 100, 0, 1); break;
      case 'Home': next = 0; break;
      case 'End': next = 1; break;
      default: return;
    }
    e.preventDefault();
    onChange(next);
  }
</script>

<div
  class="cd-color-picker-alphaslider"
  bind:this={el}
  role="slider"
  tabindex="0"
  aria-label={ariaLabel}
  aria-valuemin={0}
  aria-valuemax={1}
  aria-valuenow={Math.round(hsva.a * 100) / 100}
  aria-valuetext="{Math.round(hsva.a * 100)}%"
  style:width="{width}px"
  style:height="{height}px"
  style:background={ALPHA_CHECKERBOARD}
  style:cursor={grabbing ? 'grabbing' : 'pointer'}
  onpointerdown={onPointerDown}
  onkeydown={onKeydown}
>
  <div class="cd-color-picker-alphasliderinner" style:background={sliderBg}>
    <span
      class="cd-color-picker-alphahandle"
      style:width="{handleSize}px"
      style:height="{handleSize}px"
      style:left="{handleLeft}px"
      style:background-image={ALPHA_CHECKERBOARD}
      style:background-color={handleBg}
    ></span>
  </div>
</div>

<style>
  .cd-color-picker-alphaslider {
    position: relative;
    box-sizing: border-box;
    margin-top: var(--cd-spacing-color-picker-slider-margintop);
    border-radius: var(--cd-radius-color-picker-handle);
    touch-action: none;
    outline: none;
  }
  .cd-color-picker-alphaslider:focus-visible {
    box-shadow: var(--cd-focus-ring);
  }
  .cd-color-picker-alphasliderinner {
    width: 100%;
    height: 100%;
    border-radius: var(--cd-radius-color-picker-alphasliderinner);
  }
  /* Semi 的 alphaHandle 自带棋盘格底纹，半透明时把手也透出格子。 */
  .cd-color-picker-alphahandle {
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
