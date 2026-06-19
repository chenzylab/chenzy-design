<!--
  ColorPicker — see specs/components/input/ColorPicker.spec.md
  基础子集：trigger + 浮层（saturation 方块 + hue 条 + alpha 条 + hex 输入 + presets）。
  受控 value / open 不回写 (红线 #1)，仅 onChange / onOpenChange。
  拖拽用命令式指针（红线 #3）：pointerdown 一次性读 rect 存普通变量，
  document pointermove/pointerup 手动加/移除。useDismiss 放 $effect。
  对外 value/onChange 一律为 hex 字符串。
  TODO(延后): format=rgb/hsv 切换 UI、eyeDropper、recentColors、inline 模式、
  rgb/hsv 对象入参。
-->
<script lang="ts">
  import { useId, useDismiss } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';

  type Size = 'small' | 'default' | 'large';

  interface Props {
    value?: string;
    defaultValue?: string;
    alpha?: boolean;
    open?: boolean;
    defaultOpen?: boolean;
    presets?: string[];
    size?: Size;
    disabled?: boolean;
    outputUppercase?: boolean;
    onChange?: (hex: string) => void;
    onOpenChange?: (open: boolean) => void;
    ariaLabel?: string;
  }

  let {
    value,
    defaultValue = '#000000',
    alpha = true,
    open,
    defaultOpen = false,
    presets = [],
    size = 'default',
    disabled = false,
    outputUppercase = true,
    onChange,
    onOpenChange,
    ariaLabel,
  }: Props = $props();

  const loc = useLocale();

  const hexInputId = useId('cd-color-picker-hex');

  // ---------- 色彩工具（纯函数）----------
  interface Hsv {
    h: number; // 0-360
    s: number; // 0-1
    v: number; // 0-1
    a: number; // 0-1
  }

  function clamp01(n: number): number {
    return Math.min(1, Math.max(0, n));
  }

  function parseHex(input: string): { r: number; g: number; b: number; a: number } | null {
    let h = input.trim().replace(/^#/, '');
    if (/^[0-9a-fA-F]{3}$/.test(h)) {
      h = h.split('').map((c) => c + c).join('');
    }
    if (/^[0-9a-fA-F]{4}$/.test(h)) {
      h = h.split('').map((c) => c + c).join('');
    }
    if (/^[0-9a-fA-F]{6}$/.test(h)) {
      return {
        r: parseInt(h.slice(0, 2), 16),
        g: parseInt(h.slice(2, 4), 16),
        b: parseInt(h.slice(4, 6), 16),
        a: 1,
      };
    }
    if (/^[0-9a-fA-F]{8}$/.test(h)) {
      return {
        r: parseInt(h.slice(0, 2), 16),
        g: parseInt(h.slice(2, 4), 16),
        b: parseInt(h.slice(4, 6), 16),
        a: parseInt(h.slice(6, 8), 16) / 255,
      };
    }
    return null;
  }

  function hexToHsv(hex: string): Hsv {
    const rgb = parseHex(hex);
    if (!rgb) return { h: 0, s: 0, v: 0, a: 1 };
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    const maxC = Math.max(r, g, b);
    const minC = Math.min(r, g, b);
    const delta = maxC - minC;
    let h = 0;
    if (delta !== 0) {
      if (maxC === r) h = ((g - b) / delta) % 6;
      else if (maxC === g) h = (b - r) / delta + 2;
      else h = (r - g) / delta + 4;
      h *= 60;
      if (h < 0) h += 360;
    }
    const s = maxC === 0 ? 0 : delta / maxC;
    const v = maxC;
    return { h, s, v, a: rgb.a };
  }

  function toHex2(n: number): string {
    return Math.round(clamp01(n) * 255)
      .toString(16)
      .padStart(2, '0');
  }

  function hsvToHex({ h, s, v, a }: Hsv): string {
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;
    let r = 0;
    let g = 0;
    let b = 0;
    if (h < 60) [r, g, b] = [c, x, 0];
    else if (h < 120) [r, g, b] = [x, c, 0];
    else if (h < 180) [r, g, b] = [0, c, x];
    else if (h < 240) [r, g, b] = [0, x, c];
    else if (h < 300) [r, g, b] = [x, 0, c];
    else [r, g, b] = [c, 0, x];
    let out = `#${toHex2(r + m)}${toHex2(g + m)}${toHex2(b + m)}`;
    if (a < 1) out += toHex2(a);
    return outputUppercase ? out.toUpperCase() : out.toLowerCase();
  }

  // ---------- 受控值 (红线 #1) ----------
  const isControlled = $derived(value !== undefined);
  let innerValue = $state<string>(getInitialValue());
  const currentHex = $derived(isControlled ? (value ?? defaultValue) : innerValue);

  function getInitialValue(): string {
    return defaultValue;
  }

  function setValue(hex: string) {
    if (!isControlled) innerValue = hex;
    onChange?.(hex);
  }

  // ---------- 受控 open (红线 #1) ----------
  const isOpenControlled = $derived(open !== undefined);
  let innerOpen = $state(getInitialOpen());
  const isOpen = $derived(isOpenControlled ? !!open : innerOpen);

  function getInitialOpen(): boolean {
    return defaultOpen;
  }

  function setOpen(next: boolean) {
    if (next === isOpen) return;
    if (!isOpenControlled) innerOpen = next;
    onOpenChange?.(next);
  }

  function toggleOpen() {
    if (disabled) return;
    setOpen(!isOpen);
  }

  // ---------- 内部 HSV 状态 ----------
  // 初值从 current hex 派生。dragging 期间不从 value 反算（避免与本地更新打架）。
  function initialHsv(): Hsv {
    return hexToHsv(defaultValue);
  }
  const init = initialHsv();
  let h = $state(init.h);
  let s = $state(init.s);
  let v = $state(init.v);
  let a = $state(init.a);

  let dragging = $state(false);
  // 用户正在手动编辑 hex 输入时，不从 value 反算覆盖输入框。
  let editingHex = $state(false);

  // 当外部 value 变化时同步内部 HSV（非拖拽 / 非手动编辑期间）。
  $effect(() => {
    const hex = currentHex;
    if (dragging || editingHex) return;
    const next = hexToHsv(hex);
    h = next.h;
    s = next.s;
    v = next.v;
    a = next.a;
  });

  // 当前 hex（由 hsv 计算），用于显示与渐变。
  const displayHex = $derived(hsvToHex({ h, s, v, a }));
  const opaqueHex = $derived(hsvToHex({ h, s, v, a: 1 }));

  function commitHsv() {
    setValue(hsvToHex({ h, s, v, a }));
  }

  // ---------- hex 输入框 ----------
  let hexInput = $state('');
  // 浮层显示时把输入同步成当前 hex（非拖拽 / 非用户编辑）。
  $effect(() => {
    if (!isOpen) return;
    if (dragging || editingHex) return;
    hexInput = displayHex;
  });

  function handleHexInput(e: Event & { currentTarget: HTMLInputElement }) {
    editingHex = true;
    hexInput = e.currentTarget.value;
    const parsed = parseHex(hexInput);
    if (!parsed) return;
    const next = hexToHsv(hexInput);
    h = next.h;
    s = next.s;
    v = next.v;
    a = alpha ? next.a : 1;
    commitHsv();
  }

  function handleHexBlur() {
    editingHex = false;
    hexInput = displayHex;
  }

  // ---------- presets ----------
  function applyPreset(preset: string) {
    if (disabled) return;
    const next = hexToHsv(preset);
    h = next.h;
    s = next.s;
    v = next.v;
    a = alpha ? next.a : 1;
    commitHsv();
  }

  // ---------- 命令式拖拽 (红线 #3) ----------
  // pointerdown 一次性读 rect 存普通变量；document 监听手动加/移除。
  let satRect: DOMRect | null = null;
  let satEl = $state<HTMLElement | null>(null);
  let hueRect: DOMRect | null = null;
  let hueEl = $state<HTMLElement | null>(null);
  let alphaRect: DOMRect | null = null;
  let alphaEl = $state<HTMLElement | null>(null);

  function ratioX(rect: DOMRect, clientX: number): number {
    return clamp01((clientX - rect.left) / rect.width);
  }
  function ratioY(rect: DOMRect, clientY: number): number {
    return clamp01((clientY - rect.top) / rect.height);
  }

  // --- saturation ---
  function onSatMove(e: PointerEvent) {
    if (!satRect) return;
    s = ratioX(satRect, e.clientX);
    v = 1 - ratioY(satRect, e.clientY);
    commitHsv();
  }
  function onSatUp() {
    document.removeEventListener('pointermove', onSatMove);
    document.removeEventListener('pointerup', onSatUp);
    satRect = null;
    dragging = false;
  }
  function onSatDown(e: PointerEvent) {
    if (disabled || !satEl) return;
    e.preventDefault();
    dragging = true;
    satRect = satEl.getBoundingClientRect();
    s = ratioX(satRect, e.clientX);
    v = 1 - ratioY(satRect, e.clientY);
    commitHsv();
    document.addEventListener('pointermove', onSatMove);
    document.addEventListener('pointerup', onSatUp);
  }

  // --- hue ---
  function onHueMove(e: PointerEvent) {
    if (!hueRect) return;
    h = ratioX(hueRect, e.clientX) * 360;
    commitHsv();
  }
  function onHueUp() {
    document.removeEventListener('pointermove', onHueMove);
    document.removeEventListener('pointerup', onHueUp);
    hueRect = null;
    dragging = false;
  }
  function onHueDown(e: PointerEvent) {
    if (disabled || !hueEl) return;
    e.preventDefault();
    dragging = true;
    hueRect = hueEl.getBoundingClientRect();
    h = ratioX(hueRect, e.clientX) * 360;
    commitHsv();
    document.addEventListener('pointermove', onHueMove);
    document.addEventListener('pointerup', onHueUp);
  }

  // --- alpha ---
  function onAlphaMove(e: PointerEvent) {
    if (!alphaRect) return;
    a = ratioX(alphaRect, e.clientX);
    commitHsv();
  }
  function onAlphaUp() {
    document.removeEventListener('pointermove', onAlphaMove);
    document.removeEventListener('pointerup', onAlphaUp);
    alphaRect = null;
    dragging = false;
  }
  function onAlphaDown(e: PointerEvent) {
    if (disabled || !alphaEl) return;
    e.preventDefault();
    dragging = true;
    alphaRect = alphaEl.getBoundingClientRect();
    a = ratioX(alphaRect, e.clientX);
    commitHsv();
    document.addEventListener('pointermove', onAlphaMove);
    document.addEventListener('pointerup', onAlphaUp);
  }

  // ---------- 键盘微调 ----------
  function onHueKeydown(e: KeyboardEvent) {
    if (disabled) return;
    let delta = 0;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') delta = 1;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') delta = -1;
    else return;
    e.preventDefault();
    h = (h + delta + 360) % 360;
    commitHsv();
  }

  function onAlphaKeydown(e: KeyboardEvent) {
    if (disabled) return;
    let delta = 0;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') delta = 0.01;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') delta = -0.01;
    else return;
    e.preventDefault();
    a = clamp01(a + delta);
    commitHsv();
  }

  function onSatKeydown(e: KeyboardEvent) {
    if (disabled) return;
    let ds = 0;
    let dv = 0;
    switch (e.key) {
      case 'ArrowRight': ds = 0.01; break;
      case 'ArrowLeft': ds = -0.01; break;
      case 'ArrowUp': dv = 0.01; break;
      case 'ArrowDown': dv = -0.01; break;
      default: return;
    }
    e.preventDefault();
    s = clamp01(s + ds);
    v = clamp01(v + dv);
    commitHsv();
  }

  // ---------- useDismiss (红线 #3): 放 $effect ----------
  let rootEl = $state<HTMLDivElement | null>(null);

  $effect(() => {
    if (!isOpen || !rootEl) return;
    const cleanup = useDismiss(rootEl, {
      onDismiss: () => setOpen(false),
      escape: true,
      outsideClick: true,
    });
    return cleanup;
  });

  // ---------- 派生展示数据 ----------
  const huePercent = $derived((h / 360) * 100);
  const satPercent = $derived(s * 100);
  const valPercent = $derived((1 - v) * 100);
  const alphaPercent = $derived(a * 100);
  const hueRounded = $derived(Math.round(h));
  const alphaRounded = $derived(Math.round(a * 100) / 100);

  const cls = $derived(
    [
      'cd-color-picker',
      `cd-color-picker--${size}`,
      disabled && 'cd-color-picker--disabled',
      isOpen && 'cd-color-picker--open',
    ]
      .filter(Boolean)
      .join(' '),
  );
</script>

<div class={cls} bind:this={rootEl}>
  <button
    type="button"
    class="cd-color-picker__trigger"
    aria-haspopup="dialog"
    aria-expanded={isOpen}
    aria-label={ariaLabel}
    {disabled}
    style="background:{displayHex}"
    onclick={toggleOpen}
  ></button>

  {#if isOpen}
    <div class="cd-color-picker__panel" role="dialog" aria-label={ariaLabel ?? '颜色选择'}>
      <div
        class="cd-color-picker__saturation"
        bind:this={satEl}
        role="slider"
        tabindex={disabled ? -1 : 0}
        aria-label={loc().t('ColorPicker.saturation')}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(satPercent)}
        aria-valuetext={`饱和度 ${Math.round(satPercent)}%，明度 ${Math.round(v * 100)}%`}
        style="background:hsl({hueRounded}, 100%, 50%)"
        onpointerdown={onSatDown}
        onkeydown={onSatKeydown}
      >
        <div class="cd-color-picker__saturation-white"></div>
        <div class="cd-color-picker__saturation-black"></div>
        <span
          class="cd-color-picker__saturation-handle"
          style="inset-inline-start:{satPercent}%; inset-block-start:{valPercent}%"
        ></span>
      </div>

      <div class="cd-color-picker__sliders">
        <div class="cd-color-picker__swatch-current" style="background:{displayHex}"></div>

        <div class="cd-color-picker__bars">
          <div
            class="cd-color-picker__hue"
            bind:this={hueEl}
            role="slider"
            tabindex={disabled ? -1 : 0}
            aria-label={loc().t('ColorPicker.hue')}
            aria-valuemin={0}
            aria-valuemax={360}
            aria-valuenow={hueRounded}
            onpointerdown={onHueDown}
            onkeydown={onHueKeydown}
          >
            <span
              class="cd-color-picker__bar-handle"
              style="inset-inline-start:{huePercent}%"
            ></span>
          </div>

          {#if alpha}
            <div
              class="cd-color-picker__alpha"
              bind:this={alphaEl}
              role="slider"
              tabindex={disabled ? -1 : 0}
              aria-label={loc().t('ColorPicker.alpha')}
              aria-valuemin={0}
              aria-valuemax={1}
              aria-valuenow={alphaRounded}
              onpointerdown={onAlphaDown}
              onkeydown={onAlphaKeydown}
            >
              <div
                class="cd-color-picker__alpha-bg"
                style="background:linear-gradient(to right, transparent, {opaqueHex})"
              ></div>
              <span
                class="cd-color-picker__bar-handle"
                style="inset-inline-start:{alphaPercent}%"
              ></span>
            </div>
          {/if}
        </div>
      </div>

      <div class="cd-color-picker__field">
        <label class="cd-color-picker__label" for={hexInputId}>HEX</label>
        <input
          class="cd-color-picker__hex"
          id={hexInputId}
          type="text"
          value={hexInput}
          aria-label={loc().t('ColorPicker.hex')}
          oninput={handleHexInput}
          onblur={handleHexBlur}
        />
      </div>

      {#if presets.length > 0}
        <div class="cd-color-picker__presets">
          {#each presets as preset (preset)}
            <button
              type="button"
              class="cd-color-picker__preset"
              aria-label={preset}
              style="background:{preset}"
              onclick={() => applyPreset(preset)}
            ></button>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .cd-color-picker {
    position: relative;
    display: inline-flex;
  }
  .cd-color-picker__trigger {
    inline-size: var(--cd-color-picker-trigger-size);
    block-size: var(--cd-color-picker-trigger-size);
    padding: 0;
    border: 1px solid var(--cd-color-picker-trigger-border);
    border-radius: var(--cd-color-picker-trigger-radius);
    cursor: pointer;
  }
  .cd-color-picker--small .cd-color-picker__trigger {
    inline-size: calc(var(--cd-color-picker-trigger-size) - 4px);
    block-size: calc(var(--cd-color-picker-trigger-size) - 4px);
  }
  .cd-color-picker--large .cd-color-picker__trigger {
    inline-size: calc(var(--cd-color-picker-trigger-size) + 6px);
    block-size: calc(var(--cd-color-picker-trigger-size) + 6px);
  }
  .cd-color-picker__trigger:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-color-picker__trigger:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  .cd-color-picker__panel {
    position: absolute;
    inset-block-start: calc(100% + var(--cd-spacing-2));
    inset-inline-start: 0;
    z-index: var(--cd-color-picker-panel-z);
    inline-size: var(--cd-color-picker-panel-width);
    padding: var(--cd-spacing-3);
    background: var(--cd-color-picker-panel-bg);
    border-radius: var(--cd-color-picker-panel-radius);
    box-shadow: var(--cd-color-picker-panel-shadow);
  }
  .cd-color-picker__saturation {
    position: relative;
    inline-size: 100%;
    block-size: var(--cd-color-picker-saturation-height);
    border-radius: var(--cd-radius-2);
    overflow: hidden;
    cursor: crosshair;
    touch-action: none;
    outline: none;
  }
  .cd-color-picker__saturation:focus-visible {
    box-shadow: var(--cd-focus-ring);
  }
  .cd-color-picker__saturation-white,
  .cd-color-picker__saturation-black {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
  .cd-color-picker__saturation-white {
    background: linear-gradient(to right, #fff, rgba(255, 255, 255, 0));
  }
  .cd-color-picker__saturation-black {
    background: linear-gradient(to top, #000, rgba(0, 0, 0, 0));
  }
  .cd-color-picker__saturation-handle {
    position: absolute;
    inline-size: var(--cd-color-picker-handle-size);
    block-size: var(--cd-color-picker-handle-size);
    border: 2px solid var(--cd-color-picker-handle-border);
    border-radius: var(--cd-radius-full);
    box-shadow: var(--cd-shadow-1);
    transform: translate(-50%, -50%);
    pointer-events: none;
  }
  .cd-color-picker__sliders {
    display: flex;
    align-items: center;
    gap: var(--cd-spacing-2);
    margin-block-start: var(--cd-spacing-3);
  }
  .cd-color-picker__swatch-current {
    flex: 0 0 auto;
    inline-size: var(--cd-color-picker-swatch-size);
    block-size: var(--cd-color-picker-swatch-size);
    border: 1px solid var(--cd-color-border);
    border-radius: var(--cd-radius-full);
  }
  .cd-color-picker__bars {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    gap: var(--cd-spacing-2);
    min-inline-size: 0;
  }
  .cd-color-picker__hue,
  .cd-color-picker__alpha {
    position: relative;
    inline-size: 100%;
    block-size: var(--cd-color-picker-slider-height);
    border-radius: var(--cd-radius-full);
    cursor: pointer;
    touch-action: none;
    outline: none;
  }
  .cd-color-picker__hue {
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
  }
  .cd-color-picker__alpha {
    background-image:
      linear-gradient(45deg, var(--cd-color-fill-1) 25%, transparent 25%),
      linear-gradient(-45deg, var(--cd-color-fill-1) 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, var(--cd-color-fill-1) 75%),
      linear-gradient(-45deg, transparent 75%, var(--cd-color-fill-1) 75%);
    background-size: 8px 8px;
    background-position: 0 0, 0 4px, 4px -4px, -4px 0;
  }
  .cd-color-picker__alpha-bg {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
  }
  .cd-color-picker__hue:focus-visible,
  .cd-color-picker__alpha:focus-visible {
    box-shadow: var(--cd-focus-ring);
  }
  .cd-color-picker__bar-handle {
    position: absolute;
    inset-block-start: 50%;
    inline-size: var(--cd-color-picker-handle-size);
    block-size: var(--cd-color-picker-handle-size);
    background: var(--cd-color-picker-handle-border);
    border: 1px solid var(--cd-color-border);
    border-radius: var(--cd-radius-full);
    box-shadow: var(--cd-shadow-1);
    transform: translate(-50%, -50%);
    pointer-events: none;
  }
  .cd-color-picker__field {
    display: flex;
    align-items: center;
    gap: var(--cd-spacing-2);
    margin-block-start: var(--cd-spacing-3);
  }
  .cd-color-picker__label {
    flex: 0 0 auto;
    color: var(--cd-color-text-2);
    font-size: var(--cd-font-size-1);
  }
  .cd-color-picker__hex {
    flex: 1 1 auto;
    min-inline-size: 0;
    block-size: var(--cd-input-height-small);
    padding-inline: var(--cd-input-padding-x);
    background: var(--cd-input-bg);
    color: var(--cd-input-color-text);
    border: 1px solid var(--cd-input-border);
    border-radius: var(--cd-input-radius);
    font: inherit;
    font-size: var(--cd-font-size-1);
  }
  .cd-color-picker__hex:focus-visible {
    outline: none;
    border-color: var(--cd-input-border-active);
    box-shadow: var(--cd-focus-ring);
  }
  .cd-color-picker__presets {
    display: flex;
    flex-wrap: wrap;
    gap: var(--cd-spacing-2);
    margin-block-start: var(--cd-spacing-3);
  }
  .cd-color-picker__preset {
    inline-size: var(--cd-color-picker-swatch-size);
    block-size: var(--cd-color-picker-swatch-size);
    padding: 0;
    border: 1px solid var(--cd-color-border);
    border-radius: var(--cd-radius-1);
    cursor: pointer;
  }
  .cd-color-picker__preset:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
</style>
