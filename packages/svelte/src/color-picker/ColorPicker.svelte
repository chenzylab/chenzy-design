<!--
  ColorPicker — 严格对齐 Semi Design（semi-ui/colorPicker）。
  值形态为 Semi ColorValue 对象 { hsva, rgba, hex }（hsva 的 s/v 为 0-100）。
  受控 value 不回写（红线 #1），仅经 onChange 通知；value 未传时内部持有 currentColor。

  结构镜像 Semi renderPicker：
    topSlot? + ColorChooseArea(饱和度方块) + ColorSlider(hue) + AlphaSlider(alpha)?
    + DataPart(colorDemoBlock + InputGroup[Input + InputNumber(alpha%)? + Select(格式)] + Button(吸管)?)
    + bottomSlot?
  usePopover=true 时用 <Popover> 包裹，children 缺省渲染默认色块 trigger（对齐 Semi）。

  拖拽用命令式指针（红线 #3）：pointerdown 一次性读 rect，document 上手动加/移除监听。
  格式（hex/rgba/hsva）为 DataPart 内部 state，不受控（对齐 Semi）。
-->
<script lang="ts">
  import { untrack, type Snippet } from 'svelte';
  import {
    colorValueFromHsva,
    colorValueFromRgba,
    colorValueFromHex,
    colorValueToInputString,
    parseColorInput,
    DEFAULT_COLOR_VALUE,
    type ColorValue,
    type ColorValueFormat,
    type HsvaColor,
    type RgbaColor,
  } from '@chenzy-design/core';
  import { IconEyedropper } from '@chenzy-design/icons';
  import { useLocale } from '../locale-provider/index.js';
  import Popover from '../popover/Popover.svelte';
  import type { ComponentProps } from 'svelte';
  import Input from '../input/Input.svelte';
  import InputGroup from '../input/InputGroup.svelte';
  import InputNumber from '../input-number/InputNumber.svelte';
  import Select from '../select/Select.svelte';
  import Button from '../button/Button.svelte';

  type PopoverProps = ComponentProps<typeof Popover>;

  interface Props {
    /** 受控值（Semi ColorValue 对象）。 */
    value?: ColorValue;
    /** 非受控初始值（默认 Semi 品牌绿 #39c5bb）。 */
    defaultValue?: ColorValue;
    /** 是否显示 alpha 透明度滑条（对齐 Semi alpha）。 */
    alpha?: boolean;
    /** 面板宽度 px（对齐 Semi width，默认 280）。 */
    width?: number;
    /** 饱和度方块高度 px（对齐 Semi height，默认 280）。 */
    height?: number;
    /** DataPart 输入区初始格式（不受控，对齐 Semi defaultFormat）。 */
    defaultFormat?: ColorValueFormat;
    /** 支持浏览器 EyeDropper 时显示吸管按钮（默认 true，不支持自动隐藏）。 */
    eyeDropper?: boolean;
    /** 浮层模式：包裹 Popover，children 作触发器（对齐 Semi usePopover）。 */
    usePopover?: boolean;
    /** 透传内部 Popover 的属性（仅 usePopover）。 */
    popoverProps?: PopoverProps;
    /** 自定义触发器（仅 usePopover；缺省渲染默认色块，对齐 Semi children）。 */
    children?: Snippet;
    /** 面板顶部 slot（对齐 Semi topSlot）。 */
    topSlot?: Snippet;
    /** 面板底部 slot（对齐 Semi bottomSlot）。 */
    bottomSlot?: Snippet;
    /** 根元素自定义类名（对齐 Semi className）。 */
    class?: string;
    /** 根元素内联样式（对齐 Semi style）。 */
    style?: string;
    /** 值变化回调（对齐 Semi onChange，回 ColorValue 对象）。 */
    onChange?: (value: ColorValue) => void;
  }

  let {
    value,
    defaultValue = DEFAULT_COLOR_VALUE,
    alpha = false,
    width = 280,
    height = 280,
    defaultFormat = 'hex',
    eyeDropper = true,
    usePopover = false,
    popoverProps,
    children,
    topSlot,
    bottomSlot,
    class: className,
    style,
    onChange,
  }: Props = $props();

  const loc = useLocale();

  // ---------- 受控值（红线 #1）----------
  const isControlled = $derived(value !== undefined);
  let innerValue = $state<ColorValue>(untrack(() => defaultValue));
  const currentColor = $derived<ColorValue>(isControlled ? value! : innerValue);

  function notify(next: ColorValue) {
    if (!isControlled) innerValue = next;
    onChange?.(next);
  }

  /** 按格式提交颜色变更（对齐 Semi foundation.handleChange）。 */
  function handleChange(color: HsvaColor | RgbaColor | string, format: ColorValueFormat) {
    if (format === 'hsva') notify(colorValueFromHsva(color as HsvaColor));
    else if (format === 'rgba') notify(colorValueFromRgba(color as RgbaColor));
    else notify(colorValueFromHex(color as string));
  }

  /** 仅改 alpha（对齐 Semi handleChangeA：alpha 关闭时强制不透明，hex 截断）。 */
  function handleChangeA(newAlpha: number) {
    const a = alpha ? newAlpha : 1;
    const rgba: RgbaColor = { ...currentColor.rgba, a };
    const from = colorValueFromRgba(rgba);
    notify({
      rgba,
      hex: alpha ? from.hex : from.hex.slice(0, 7),
      hsva: { ...currentColor.hsva, a },
    });
  }

  // ---------- 命令式拖拽（红线 #3）----------
  function clamp(n: number, lo: number, hi: number) {
    return Math.min(hi, Math.max(lo, n));
  }

  let satEl = $state<HTMLElement | null>(null);
  let satRect: DOMRect | null = null;
  function onSatMove(e: PointerEvent) {
    if (!satRect) return;
    const s = clamp((e.clientX - satRect.left) / satRect.width, 0, 1) * 100;
    const v = (1 - clamp((e.clientY - satRect.top) / satRect.height, 0, 1)) * 100;
    handleChange({ h: currentColor.hsva.h, s, v, a: currentColor.hsva.a }, 'hsva');
  }
  function onSatUp() {
    document.removeEventListener('pointermove', onSatMove);
    document.removeEventListener('pointerup', onSatUp);
    satRect = null;
  }
  function onSatDown(e: PointerEvent) {
    if (!satEl) return;
    e.preventDefault();
    satRect = satEl.getBoundingClientRect();
    onSatMove(e);
    document.addEventListener('pointermove', onSatMove);
    document.addEventListener('pointerup', onSatUp);
  }

  let hueEl = $state<HTMLElement | null>(null);
  let hueRect: DOMRect | null = null;
  function onHueMove(e: PointerEvent) {
    if (!hueRect) return;
    const h = clamp((e.clientX - hueRect.left) / hueRect.width, 0, 1) * 360;
    handleChange({ ...currentColor.hsva, h }, 'hsva');
  }
  function onHueUp() {
    document.removeEventListener('pointermove', onHueMove);
    document.removeEventListener('pointerup', onHueUp);
    hueRect = null;
  }
  function onHueDown(e: PointerEvent) {
    if (!hueEl) return;
    e.preventDefault();
    hueRect = hueEl.getBoundingClientRect();
    onHueMove(e);
    document.addEventListener('pointermove', onHueMove);
    document.addEventListener('pointerup', onHueUp);
  }

  let alphaEl = $state<HTMLElement | null>(null);
  let alphaRect: DOMRect | null = null;
  function onAlphaMove(e: PointerEvent) {
    if (!alphaRect) return;
    const a = Math.round(clamp((e.clientX - alphaRect.left) / alphaRect.width, 0, 1) * 100) / 100;
    handleChangeA(a);
  }
  function onAlphaUp() {
    document.removeEventListener('pointermove', onAlphaMove);
    document.removeEventListener('pointerup', onAlphaUp);
    alphaRect = null;
  }
  function onAlphaDown(e: PointerEvent) {
    if (!alphaEl) return;
    e.preventDefault();
    alphaRect = alphaEl.getBoundingClientRect();
    onAlphaMove(e);
    document.addEventListener('pointermove', onAlphaMove);
    document.addEventListener('pointerup', onAlphaUp);
  }

  // ---------- 键盘微调（slider 无障碍）----------
  function onSatKeydown(e: KeyboardEvent) {
    const { h, s, v, a } = currentColor.hsva;
    let ns = s;
    let nv = v;
    switch (e.key) {
      case 'ArrowRight': ns = clamp(s + 1, 0, 100); break;
      case 'ArrowLeft': ns = clamp(s - 1, 0, 100); break;
      case 'ArrowUp': nv = clamp(v + 1, 0, 100); break;
      case 'ArrowDown': nv = clamp(v - 1, 0, 100); break;
      case 'Home': ns = 0; break;
      case 'End': ns = 100; break;
      default: return;
    }
    e.preventDefault();
    handleChange({ h, s: ns, v: nv, a }, 'hsva');
  }
  function onHueKeydown(e: KeyboardEvent) {
    const { h } = currentColor.hsva;
    let nh = h;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp': nh = (h + 1) % 360; break;
      case 'ArrowLeft':
      case 'ArrowDown': nh = (h - 1 + 360) % 360; break;
      case 'Home': nh = 0; break;
      case 'End': nh = 360; break;
      default: return;
    }
    e.preventDefault();
    handleChange({ ...currentColor.hsva, h: nh }, 'hsva');
  }
  function onAlphaKeydown(e: KeyboardEvent) {
    const a = currentColor.hsva.a;
    let na = a;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp': na = clamp(Math.round((a + 0.01) * 100) / 100, 0, 1); break;
      case 'ArrowLeft':
      case 'ArrowDown': na = clamp(Math.round((a - 0.01) * 100) / 100, 0, 1); break;
      case 'Home': na = 0; break;
      case 'End': na = 1; break;
      default: return;
    }
    e.preventDefault();
    handleChangeA(na);
  }

  // ---------- eyeDropper（实验性 API，降级隐藏）----------
  interface EyeDropperCtor {
    new (): { open: () => Promise<{ sRGBHex: string }> };
  }
  const eyeDropperSupported = $derived(
    eyeDropper && typeof window !== 'undefined' && 'EyeDropper' in window,
  );
  async function pickWithEyeDropper() {
    if (!eyeDropperSupported) return;
    const Ctor = (window as unknown as { EyeDropper: EyeDropperCtor }).EyeDropper;
    try {
      const result = await new Ctor().open();
      const c = result?.sRGBHex;
      if (!c) return;
      if (c.startsWith('#')) handleChange(c, 'hex');
    } catch {
      // 用户取消（Esc）：静默忽略
    }
  }

  // ---------- DataPart 内部格式 state（不受控，对齐 Semi）----------
  let format = $state<ColorValueFormat>(untrack(() => defaultFormat));
  const formatOptions: { label: string; value: ColorValueFormat }[] = [
    { label: 'hex', value: 'hex' },
    { label: 'rgba', value: 'rgba' },
    { label: 'hsva', value: 'hsva' },
  ];
  const inputString = $derived(colorValueToInputString(currentColor, format));

  function handleInputChange(v: string) {
    const parsed = parseColorInput(v, format);
    if (parsed) handleChange(parsed.color, parsed.format);
  }

  function handleAlphaNumberChange(v: number | null) {
    if (v == null) return;
    const na = Number((v / 100).toFixed(2));
    if (format === 'rgba') handleChange({ ...currentColor.rgba, a: na }, 'rgba');
    else if (format === 'hsva') handleChange({ ...currentColor.hsva, a: na }, 'hsva');
    else handleChangeA(na);
  }

  const alphaPercentValue = $derived(Math.round(currentColor.rgba.a * 100));

  // ---------- 派生展示 ----------
  const hueColor = $derived(`hsl(${currentColor.hsva.h}, 100%, 50%)`);
  const satX = $derived(currentColor.hsva.s);
  const satY = $derived(100 - currentColor.hsva.v);
  const huePercent = $derived((currentColor.hsva.h / 360) * 100);
  const alphaPercent = $derived(currentColor.hsva.a * 100);
  const rgbaCss = $derived(
    `rgba(${currentColor.rgba.r},${currentColor.rgba.g},${currentColor.rgba.b},${currentColor.rgba.a})`,
  );
  const opaqueRgbaCss = $derived(
    `rgb(${currentColor.rgba.r},${currentColor.rgba.g},${currentColor.rgba.b})`,
  );

  const rootCls = $derived(['cd-color-picker', className].filter(Boolean).join(' '));
  const rootStyle = $derived([`width:${width}px`, style].filter(Boolean).join(';'));
</script>

{#snippet picker()}
  <div class={rootCls} style={rootStyle}>
    {@render topSlot?.()}

    <div
      class="cd-color-picker__colorChooseArea"
      bind:this={satEl}
      role="slider"
      tabindex="0"
      aria-label={loc().t('ColorPicker.saturation')}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(currentColor.hsva.s)}
      style="height:{height}px; background:{hueColor}"
      onpointerdown={onSatDown}
      onkeydown={onSatKeydown}
    >
      <div class="cd-color-picker__saturation-white"></div>
      <div class="cd-color-picker__saturation-black"></div>
      <span
        class="cd-color-picker__handle"
        style="left:{satX}%; top:{satY}%"
      ></span>
    </div>

    <div
      class="cd-color-picker__colorSlider"
      bind:this={hueEl}
      role="slider"
      tabindex="0"
      aria-label={loc().t('ColorPicker.hue')}
      aria-valuemin={0}
      aria-valuemax={360}
      aria-valuenow={Math.round(currentColor.hsva.h)}
      onpointerdown={onHueDown}
      onkeydown={onHueKeydown}
    >
      <span class="cd-color-picker__handle cd-color-picker__slider-handle" style="left:{huePercent}%"></span>
    </div>

    {#if alpha}
      <div
        class="cd-color-picker__alphaSlider"
        bind:this={alphaEl}
        role="slider"
        tabindex="0"
        aria-label={loc().t('ColorPicker.alpha')}
        aria-valuemin={0}
        aria-valuemax={1}
        aria-valuenow={Math.round(currentColor.hsva.a * 100) / 100}
        onpointerdown={onAlphaDown}
        onkeydown={onAlphaKeydown}
      >
        <div
          class="cd-color-picker__alphaSliderInner"
          style="background:linear-gradient(to right, transparent, {opaqueRgbaCss})"
        ></div>
        <span class="cd-color-picker__handle cd-color-picker__slider-handle" style="left:{alphaPercent}%"></span>
      </div>
    {/if}

    <div class="cd-color-picker__dataPart">
      <div class="cd-color-picker__colorDemoBlock" style="background:{rgbaCss}"></div>
      <div class="cd-color-picker__inputGroup">
        <InputGroup size="small">
          <div class="cd-color-picker__colorPickerInput">
            <Input
              size="small"
              value={inputString}
              ariaLabel={loc().t('ColorPicker.hex')}
              onChange={handleInputChange}
            />
          </div>
          {#if alpha}
            <div class="cd-color-picker__colorPickerInputNumber">
              <InputNumber
                size="small"
                min={0}
                max={100}
                hideButtons
                ariaLabel={loc().t('ColorPicker.alpha')}
                value={alphaPercentValue}
                onNumberChange={handleAlphaNumberChange}
              >
                {#snippet suffix()}<span class="cd-color-picker__inputNumberSuffix">%</span>{/snippet}
              </InputNumber>
            </div>
          {/if}
          <div class="cd-color-picker__formatSelect">
            <Select
              size="small"
              value={format}
              optionList={formatOptions}
              ariaLabel={loc().t('ColorPicker.format')}
              onSelect={(v) => (format = v as ColorValueFormat)}
            />
          </div>
        </InputGroup>
      </div>
      {#if eyeDropperSupported}
        <Button
          type="tertiary"
          theme="light"
          size="small"
          ariaLabel={loc().t('ColorPicker.eyeDropper')}
          onclick={pickWithEyeDropper}
        >
          {#snippet icon()}<IconEyedropper aria-hidden="true" />{/snippet}
        </Button>
      {/if}
    </div>

    {@render bottomSlot?.()}
  </div>
{/snippet}

{#if usePopover}
  <Popover
    trigger="click"
    {...popoverProps}
    class={['cd-color-picker-popover', popoverProps?.class].filter(Boolean).join(' ')}
    content={picker}
  >
    {#if children}
      {@render children()}
    {:else}
      <div
        class="cd-color-picker-popover-defaultChildren"
        aria-label={loc().t('ColorPicker.hex')}
        style="background:{currentColor.hex}"
      ></div>
    {/if}
  </Popover>
{:else}
  {@render picker()}
{/if}

<style>
  .cd-color-picker {
    display: inline-block;
  }
  /* saturation 方块：四角非对称圆角（上圆下直）。 */
  .cd-color-picker__colorChooseArea {
    position: relative;
    inline-size: 100%;
    border-radius:
      var(--cd-radius-color-picker-topleft) var(--cd-radius-color-picker-topright)
      var(--cd-radius-color-picker-bottomright) var(--cd-radius-color-picker-bottomleft);
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.05);
    overflow: hidden;
    cursor: crosshair;
    touch-action: none;
    outline: none;
  }
  .cd-color-picker__colorChooseArea:focus-visible {
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
  .cd-color-picker__handle {
    position: absolute;
    inline-size: var(--cd-color-picker-handle-size);
    block-size: var(--cd-color-picker-handle-size);
    border: var(--cd-width-color-picker-handle-border) solid var(--cd-color-color-picker-handle-border);
    border-radius: var(--cd-radius-color-picker-handle);
    box-shadow: var(--cd-color-picker-handle-shadow);
    transform: translate(-50%, -50%);
    box-sizing: border-box;
    pointer-events: none;
  }
  .cd-color-picker__colorSlider {
    position: relative;
    inline-size: 100%;
    block-size: var(--cd-color-picker-slider-height);
    margin-block-start: var(--cd-spacing-color-picker-slider-margintop);
    border-radius: var(--cd-radius-color-picker-handle);
    background: linear-gradient(
      to right,
      #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%
    );
    cursor: pointer;
    touch-action: none;
    outline: none;
  }
  .cd-color-picker__alphaSlider {
    position: relative;
    inline-size: 100%;
    block-size: var(--cd-color-picker-slider-height);
    margin-block-start: var(--cd-spacing-color-picker-slider-margintop);
    border-radius: var(--cd-radius-color-picker-handle);
    background:
      url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill-opacity=".05"><rect x="8" width="8" height="8"/><rect y="8" width="8" height="8"/></svg>');
    cursor: pointer;
    touch-action: none;
    outline: none;
  }
  .cd-color-picker__alphaSliderInner {
    position: absolute;
    inset: 0;
    inline-size: 100%;
    block-size: 100%;
    border-radius: var(--cd-radius-color-picker-alphasliderinner);
    pointer-events: none;
  }
  .cd-color-picker__colorSlider:focus-visible,
  .cd-color-picker__alphaSlider:focus-visible {
    box-shadow: var(--cd-focus-ring);
  }
  .cd-color-picker__slider-handle {
    inset-block-start: 50%;
  }
  .cd-color-picker__dataPart {
    display: flex;
    align-items: center;
    margin-block-start: var(--cd-spacing-color-picker-datapart-margintop);
  }
  .cd-color-picker__colorDemoBlock {
    flex: 0 0 auto;
    min-inline-size: 20px;
    min-block-size: 20px;
    inline-size: 20px;
    block-size: 20px;
    border-radius: var(--cd-radius-color-picker-demoblock);
  }
  .cd-color-picker__inputGroup {
    flex: 1;
    min-inline-size: 0;
    margin-inline-start: var(--cd-spacing-color-picker-inputgroup-marginleft);
  }
  .cd-color-picker__inputGroup :global(.cd-input-group) {
    inline-size: 100%;
    flex-wrap: nowrap;
  }
  .cd-color-picker__colorPickerInput {
    flex: 1;
    min-inline-size: 0;
  }
  .cd-color-picker__colorPickerInputNumber {
    flex: 0 0 auto;
    inline-size: var(--cd-width-color-picker-colorpickerinputnumber);
  }
  .cd-color-picker__inputNumberSuffix {
    font-size: var(--cd-font-color-picker-inputnumbersuffix-fontsize);
    padding:
      var(--cd-spacing-color-picker-inputnumbersuffix-vertical)
      var(--cd-spacing-color-picker-inputnumbersuffix-horizontal);
  }
  .cd-color-picker__formatSelect {
    flex: 0 0 auto;
    inline-size: var(--cd-width-color-picker-formatselect);
  }
  /* popover 模式：整体内边距 + 默认色块 trigger。 */
  :global(.cd-color-picker-popover .cd-popover-content) {
    padding: var(--cd-spacing-color-picker-popover-padding);
  }
  .cd-color-picker-popover-defaultChildren {
    inline-size: var(--cd-width-color-picker-defaulttrigger);
    block-size: var(--cd-width-color-picker-defaulttrigger);
    border-radius: var(--cd-radius-color-picker-defaulttrigger);
    cursor: pointer;
  }
</style>
