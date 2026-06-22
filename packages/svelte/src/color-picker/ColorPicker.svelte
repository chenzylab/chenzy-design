<!--
  ColorPicker — see specs/components/input/ColorPicker.spec.md
  基础子集：trigger + 浮层（saturation 方块 + hue 条 + alpha 条 + hex 输入 + presets）。
  受控 value / open 不回写 (红线 #1)，仅 onChange / onOpenChange。
  拖拽用命令式指针（红线 #3）：pointerdown 一次性读 rect 存普通变量，
  document pointermove/pointerup 手动加/移除。useDismiss 放 $effect。
  对外 value/onChange 一律为 hex 字符串（向后兼容；format 仅影响面板内显示/编辑）。
  eyeDropper：浏览器支持 window.EyeDropper 时渲染吸管按钮，取屏幕色（降级隐藏）。
  recentColors：记录最近应用的颜色（preset/eyeDropper/hex 确认/关闭面板时），去重 + 上限。
  format：面板内可切换 hex/rgb/hsv/hsl 显示与编辑（红线 #2：转换纯函数在 core）。
  inline：不渲染 trigger 浮层，直接内联渲染选色面板（设置页嵌入）。
-->
<script lang="ts">
  import {
    useId,
    useDismiss,
    hexToHsv as coreHexToHsv,
    hsvToHex as coreHsvToHex,
    formatColor,
    parseColor,
    colorClamp01,
    type Hsv,
    type ColorFormat,
  } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';

  type Size = 'small' | 'default' | 'large';
  type Status = 'default' | 'warning' | 'error';

  interface Props {
    value?: string;
    defaultValue?: string;
    alpha?: boolean;
    open?: boolean;
    defaultOpen?: boolean;
    presets?: string[];
    size?: Size;
    status?: Status;
    disabled?: boolean;
    outputUppercase?: boolean;
    /** 受控：面板内显示/编辑的颜色格式。对外 onChange 仍为 hex 字符串。 */
    format?: ColorFormat;
    /** 非受控初始格式（默认 'hex'）。format 受控时忽略。 */
    defaultFormat?: ColorFormat;
    /** 面板内是否显示格式切换器（默认 true；format 锁定可设 false） */
    showFormatToggle?: boolean;
    /** 内联渲染选色面板，不使用 trigger 浮层（默认 false） */
    inline?: boolean;
    /** 支持浏览器 EyeDropper 时显示吸管按钮（默认 true，不支持自动隐藏） */
    eyeDropper?: boolean;
    /** 显示最近使用颜色行（默认 false） */
    recentColors?: boolean;
    /** 最近颜色上限（默认 8） */
    recentMax?: number;
    onChange?: (hex: string) => void;
    onOpenChange?: (open: boolean) => void;
    /** 面板内格式切换时触发 */
    onFormatChange?: (format: ColorFormat) => void;
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
    status = 'default',
    disabled = false,
    outputUppercase = true,
    format,
    defaultFormat = 'hex',
    showFormatToggle = true,
    inline = false,
    eyeDropper = true,
    recentColors = false,
    recentMax = 8,
    onChange,
    onOpenChange,
    onFormatChange,
    ariaLabel,
  }: Props = $props();

  const loc = useLocale();

  const hexInputId = useId('cd-color-picker-hex');

  // ---------- 色彩工具（纯函数来自 core，红线 #2）----------
  const clamp01 = colorClamp01;

  function hexToHsv(hex: string): Hsv {
    return coreHexToHsv(hex);
  }

  function hsvToHex(hsv: Hsv): string {
    return coreHsvToHex(hsv, { uppercase: outputUppercase });
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
  // inline 模式：面板常驻渲染，不受 open 控制。
  const isOpenControlled = $derived(open !== undefined);
  let innerOpen = $state(getInitialOpen());
  const isOpen = $derived(inline ? true : isOpenControlled ? !!open : innerOpen);

  // ---------- 受控 format (红线 #1) ----------
  const isFormatControlled = $derived(format !== undefined);
  let innerFormat = $state<ColorFormat>(getInitialFormat());
  const currentFormat = $derived<ColorFormat>(isFormatControlled ? format! : innerFormat);

  function getInitialFormat(): ColorFormat {
    return format ?? defaultFormat;
  }
  const formatOptions: ColorFormat[] = ['hex', 'rgb', 'hsv', 'hsl'];

  function setFormat(next: ColorFormat) {
    if (next === currentFormat) return;
    if (!isFormatControlled) innerFormat = next;
    onFormatChange?.(next);
    // 切换格式时立即用当前色按新格式刷新输入框（非编辑态）。
    editingHex = false;
  }

  function getInitialOpen(): boolean {
    return defaultOpen;
  }

  function setOpen(next: boolean) {
    if (next === isOpen) return;
    // 关闭面板时把当前颜色记入最近用色
    if (!next) recordColor(hsvToHex({ h, s, v, a }));
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

  // 按当前格式格式化的字符串，用于输入框显示。
  const displayFormatted = $derived(
    formatColor(
      { h, s, v, a: alpha ? a : 1 },
      currentFormat,
      { uppercase: outputUppercase, alpha },
    ),
  );

  function commitHsv() {
    setValue(hsvToHex({ h, s, v, a }));
  }

  // ---------- 颜色输入框（按 currentFormat 显示/编辑） ----------
  // 编辑态显示用户输入缓冲，否则始终派生 displayFormatted（切换格式/拖拽即时刷新）。
  let hexBuffer = $state('');
  const hexInput = $derived(editingHex ? hexBuffer : displayFormatted);

  function handleHexInput(e: Event & { currentTarget: HTMLInputElement }) {
    editingHex = true;
    hexBuffer = e.currentTarget.value;
    const next = parseColor(hexBuffer, currentFormat);
    if (!next) return;
    h = next.h;
    s = next.s;
    v = next.v;
    a = alpha ? next.a : 1;
    commitHsv();
  }

  function handleHexBlur() {
    editingHex = false;
  }

  // 应用一个完整 hex（preset / eyeDropper / 最近色）：写 HSV + 提交 + 记录最近。
  function applyHex(hex: string) {
    if (disabled) return;
    const next = hexToHsv(hex);
    h = next.h;
    s = next.s;
    v = next.v;
    a = alpha ? next.a : 1;
    commitHsv();
    recordColor(hsvToHex({ h, s, v, a }));
  }

  // ---------- presets ----------
  function applyPreset(preset: string) {
    applyHex(preset);
  }

  // ---------- recentColors ----------
  let recent = $state<string[]>([]);
  function recordColor(hex: string) {
    if (!recentColors) return;
    const norm = outputUppercase ? hex.toUpperCase() : hex.toLowerCase();
    const next = [norm, ...recent.filter((c) => c !== norm)];
    recent = next.slice(0, recentMax);
  }

  // ---------- eyeDropper（实验性 API，降级隐藏） ----------
  interface EyeDropperCtor {
    new (): { open: () => Promise<{ sRGBHex: string }> };
  }
  const eyeDropperSupported = $derived(
    eyeDropper && typeof window !== 'undefined' && 'EyeDropper' in window,
  );
  async function pickWithEyeDropper() {
    if (disabled || !eyeDropperSupported) return;
    const Ctor = (window as unknown as { EyeDropper: EyeDropperCtor }).EyeDropper;
    try {
      const result = await new Ctor().open();
      if (result?.sRGBHex) applyHex(result.sRGBHex);
    } catch {
      // 用户取消（Esc）或失败：静默忽略
    }
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
    // inline 模式无浮层，不挂 dismiss。
    if (inline || !isOpen || !rootEl) return;
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
      status !== 'default' && `cd-color-picker--${status}`,
      inline && 'cd-color-picker--inline',
      disabled && 'cd-color-picker--disabled',
      isOpen && 'cd-color-picker--open',
    ]
      .filter(Boolean)
      .join(' '),
  );
</script>

{#snippet panelBody()}
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
        {#if showFormatToggle}
          <label class="cd-color-picker__format" aria-label={loc().t('ColorPicker.format')}>
            <select
              class="cd-color-picker__format-select"
              value={currentFormat}
              {disabled}
              onchange={(e) => setFormat(e.currentTarget.value as ColorFormat)}
            >
              {#each formatOptions as opt (opt)}
                <option value={opt}>{opt.toUpperCase()}</option>
              {/each}
            </select>
          </label>
        {:else}
          <label class="cd-color-picker__label" for={hexInputId}>{currentFormat.toUpperCase()}</label>
        {/if}
        <input
          class="cd-color-picker__hex"
          id={hexInputId}
          type="text"
          value={hexInput}
          aria-label={loc().t('ColorPicker.hex')}
          oninput={handleHexInput}
          onblur={handleHexBlur}
        />
        {#if eyeDropperSupported}
          <button
            type="button"
            class="cd-color-picker__eyedropper"
            aria-label={loc().t('ColorPicker.eyeDropper')}
            {disabled}
            onclick={pickWithEyeDropper}
          >
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
              <path fill="currentColor" d="M11.6 1.5a2 2 0 0 1 2.9 2.8l-1.3 1.3 1 1-1.1 1-1-1-5.4 5.4-3 .8.8-3 5.4-5.4-1-1 1-1.1 1 1 1.3-1.3Z" />
            </svg>
          </button>
        {/if}
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

      {#if recentColors && recent.length > 0}
        <div class="cd-color-picker__recent">
          <span class="cd-color-picker__recent-label">{loc().t('ColorPicker.recent')}</span>
          <div class="cd-color-picker__recent-swatches">
            {#each recent as color (color)}
              <button
                type="button"
                class="cd-color-picker__preset"
                aria-label={color}
                style="background:{color}"
                onclick={() => applyHex(color)}
              ></button>
            {/each}
          </div>
        </div>
      {/if}
{/snippet}

{#if inline}
  <div class={cls} bind:this={rootEl}>
    <div class="cd-color-picker__panel cd-color-picker__panel--inline" role="group" aria-label={ariaLabel ?? loc().t('ColorPicker.panelLabel')}>
      {@render panelBody()}
    </div>
  </div>
{:else}
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
      <div class="cd-color-picker__panel" role="dialog" aria-label={ariaLabel ?? loc().t('ColorPicker.panelLabel')}>
        {@render panelBody()}
      </div>
    {/if}
  </div>
{/if}

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
  /* 校验态：仅影响 trigger 与 inline 面板边框色，不改内部取色控件。 */
  .cd-color-picker--warning .cd-color-picker__trigger,
  .cd-color-picker--warning .cd-color-picker__panel--inline {
    border-color: var(--cd-color-picker-status-warning);
  }
  .cd-color-picker--error .cd-color-picker__trigger,
  .cd-color-picker--error .cd-color-picker__panel--inline {
    border-color: var(--cd-color-picker-status-error);
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
  .cd-color-picker--inline {
    display: inline-flex;
  }
  .cd-color-picker__panel--inline {
    position: static;
    inset: auto;
    box-shadow: none;
    border: 1px solid var(--cd-color-border);
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
  .cd-color-picker__format {
    flex: 0 0 auto;
    display: inline-flex;
  }
  .cd-color-picker__format-select {
    block-size: var(--cd-input-height-small);
    padding-inline: var(--cd-spacing-1);
    color: var(--cd-color-text-2);
    background: var(--cd-input-bg);
    border: 1px solid var(--cd-input-border);
    border-radius: var(--cd-input-radius);
    font: inherit;
    font-size: var(--cd-font-size-1);
    cursor: pointer;
  }
  .cd-color-picker__format-select:focus-visible {
    outline: none;
    border-color: var(--cd-input-border-active);
    box-shadow: var(--cd-focus-ring);
  }
  .cd-color-picker__format-select:disabled {
    cursor: not-allowed;
    opacity: 0.5;
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
  .cd-color-picker__eyedropper {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    inline-size: var(--cd-input-height-small);
    block-size: var(--cd-input-height-small);
    padding: 0;
    color: var(--cd-color-text-2);
    background: var(--cd-input-bg);
    border: 1px solid var(--cd-input-border);
    border-radius: var(--cd-input-radius);
    cursor: pointer;
  }
  .cd-color-picker__eyedropper:hover:not(:disabled) {
    color: var(--cd-color-primary);
    border-color: var(--cd-input-border-active);
  }
  .cd-color-picker__eyedropper:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-color-picker__eyedropper:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  .cd-color-picker__recent {
    margin-block-start: var(--cd-spacing-3);
  }
  .cd-color-picker__recent-label {
    display: block;
    margin-block-end: var(--cd-spacing-1);
    color: var(--cd-color-text-2);
    font-size: var(--cd-font-size-1);
  }
  .cd-color-picker__recent-swatches {
    display: flex;
    flex-wrap: wrap;
    gap: var(--cd-spacing-2);
  }
</style>
