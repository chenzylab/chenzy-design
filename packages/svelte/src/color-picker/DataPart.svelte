<!--
  DataPart — 颜色手动输入区（对齐 semi-ui/colorPicker/DataPart + DataPartFoundation）。

  结构：当前色块 + InputGroup[Input(色值) + InputNumber(alpha%)? + Select(格式)] + Button(吸管)?
  format 是本组件内部 state（不受控，对齐 Semi state.format），仅由 defaultFormat 初始化。

  输入框走「本地 inputValue state」而非直接绑派生串（对齐 Semi state.inputValue）：
  用户敲 `#39c` 这类半截值时不能被外部值回写打断，只有解析成功才提交，
  外部色变 / 格式切换时再同步回展示串。
-->
<script lang="ts">
  import { untrack } from 'svelte';
  import {
    colorValueToInputString,
    parseColorInput,
    colorValueRgbaToHex,
    rgbaStringToRgba,
    type ColorValue,
    type ColorValueFormat,
  } from '@chenzy-design/core';
  import { IconEyedropper } from '@chenzy-design/icons';
  import Input from '../input/Input.svelte';
  import InputGroup from '../input/InputGroup.svelte';
  import InputNumber from '../input-number/InputNumber.svelte';
  import Select from '../select/Select.svelte';
  import Button from '../button/Button.svelte';
  import { FORMAT_LIST } from './constants.js';
  import type { ColorPickerFoundation } from './color-picker-foundation.svelte.js';

  interface Props {
    currentColor: ColorValue;
    defaultFormat: ColorValueFormat;
    width: number;
    alpha: boolean;
    eyeDropper: boolean;
    foundation: ColorPickerFoundation;
    labels: {
      value: string;
      alpha: string;
      format: string;
      eyeDropper: string;
    };
  }

  let {
    currentColor,
    defaultFormat,
    width,
    alpha,
    eyeDropper,
    foundation,
    labels,
  }: Props = $props();

  const formatOptions = FORMAT_LIST.map((type) => ({
    label: type,
    value: type,
  }));

  // format / inputValue 只在挂载时取一次初值（对齐 Semi constructor 里的 this.state 初始化），
  // 后续由用户操作驱动，故用 untrack 显式表明「只取初值」。
  let format = $state<ColorValueFormat>(untrack(() => defaultFormat));

  /** 展示串（对齐 Semi getInputValue）。 */
  const displayValue = $derived(colorValueToInputString(currentColor, format));

  // 本地输入串：外部色值/格式变化时同步为展示串，用户输入期间自持（对齐 Semi state.inputValue）。
  let inputValue = $state(
    untrack(() => colorValueToInputString(currentColor, defaultFormat)),
  );
  $effect(() => {
    inputValue = displayValue;
  });

  function handleInputChange(v: string) {
    inputValue = v;
    const parsed = parseColorInput(v, format);
    if (parsed) foundation.handleChange(parsed.color, parsed.format);
  }

  /** alpha 百分比数字输入（对齐 Semi onNumberChange 的三格式分支）。 */
  function handleAlphaNumberChange(v: number | null) {
    if (v == null) return;
    const a = Number((v / 100).toFixed(2));
    if (format === 'rgba') {
      foundation.handleChange({ ...currentColor.rgba, a }, 'rgba');
    } else if (format === 'hsva') {
      foundation.handleChange({ ...currentColor.hsva, a }, 'hsva');
    } else {
      foundation.handleChange(
        colorValueRgbaToHex({ ...currentColor.rgba, a }),
        'hex',
      );
    }
  }

  const alphaPercentValue = $derived(Math.round(currentColor.rgba.a * 100));

  const demoBlockBg = $derived(
    `rgba(${currentColor.rgba.r},${currentColor.rgba.g},${currentColor.rgba.b},${currentColor.rgba.a})`,
  );

  // ---------- EyeDropper（实验性 API，不支持时不渲染按钮）----------
  interface EyeDropperCtor {
    new (): { open: () => Promise<{ sRGBHex: string }> };
  }
  const eyeDropperSupported = $derived(
    eyeDropper && typeof window !== 'undefined' && 'EyeDropper' in window,
  );

  /** 吸管取色（对齐 Semi handlePickValueWithStraw：hex 直提，rgba 结果强制 a=1）。 */
  async function handlePickValueWithStraw() {
    if (!eyeDropperSupported) return;
    const Ctor = (window as unknown as { EyeDropper: EyeDropperCtor })
      .EyeDropper;
    try {
      const result = await new Ctor().open();
      const color = result?.sRGBHex;
      if (!color) return;
      if (color.startsWith('#')) {
        foundation.handleChange(color, 'hex');
      } else if (color.startsWith('rgba')) {
        foundation.handleChange({ ...rgbaStringToRgba(color), a: 1 }, 'rgba');
      }
    } catch {
      // 用户取消（Esc）：静默忽略，对齐 Semi 空 catch
    }
  }
</script>

<div class="cd-color-picker-datapart" style:width="{width}px">
  <div
    class="cd-color-picker-colordemoblock"
    style:background-color={demoBlockBg}
  ></div>
  <!-- 定位 class 一律直接挂组件根节点（对齐 Semi，不额外包 div）。 -->
  <InputGroup class="cd-color-picker-inputgroup" size="small">
    <Input
      class="cd-color-picker-colorpickerinput"
      size="small"
      value={inputValue}
      ariaLabel={labels.value}
      onChange={handleInputChange}
    />
    {#if alpha}
      <InputNumber
        class="cd-color-picker-colorpickerinputnumber"
        size="small"
        min={0}
        max={100}
        hideButtons
        affixIsIcon={false}
        ariaLabel={labels.alpha}
        value={alphaPercentValue}
        onNumberChange={handleAlphaNumberChange}
      >
        {#snippet suffix()}<span class="cd-color-picker-inputnumbersuffix"
            >%</span
          >{/snippet}
      </InputNumber>
    {/if}
    <Select
      class="cd-color-picker-formatselect"
      size="small"
      value={format}
      optionList={formatOptions}
      ariaLabel={labels.format}
      onSelect={(v) => (format = v as ColorValueFormat)}
    />
  </InputGroup>

  {#if eyeDropperSupported}
    <Button
      type="tertiary"
      theme="light"
      size="small"
      ariaLabel={labels.eyeDropper}
      onclick={handlePickValueWithStraw}
    >
      {#snippet icon()}<IconEyedropper aria-hidden="true" />{/snippet}
    </Button>
  {/if}
</div>

<style>
  .cd-color-picker-datapart {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    margin-top: var(--cd-spacing-color-picker-datapart-margintop);
  }
  .cd-color-picker-colordemoblock {
    flex: 0 0 auto;
    min-width: 20px;
    min-height: 20px;
    width: 20px;
    height: 20px;
    border-radius: var(--cd-radius-color-picker-demoblock);
  }
  /*
   * 四个定位类（inputGroup + 三个控件）全部直接挂在子组件根节点上（对齐 Semi，不额外包 div）；
   * Svelte scope 够不到子组件根，故统一用 :global 打洞。
   */
  .cd-color-picker-datapart :global(.cd-color-picker-inputgroup) {
    flex: 1;
    min-width: 0;
    width: auto;
    flex-wrap: nowrap;
    margin-left: var(--cd-spacing-color-picker-inputgroup-marginleft);
  }
  .cd-color-picker-datapart :global(.cd-color-picker-colorpickerinput) {
    flex: 1;
    min-width: 0;
  }
  .cd-color-picker-datapart :global(.cd-color-picker-colorpickerinputnumber) {
    flex: 0 0 auto;
    width: var(--cd-width-color-picker-colorpickerinputnumber);
  }
  .cd-color-picker-datapart :global(.cd-color-picker-formatselect) {
    flex: 0 0 auto;
    width: var(--cd-width-color-picker-formatselect);
  }
  .cd-color-picker-inputnumbersuffix {
    font-size: var(--cd-font-color-picker-inputnumbersuffix-fontsize);
    padding: var(--cd-spacing-color-picker-inputnumbersuffix-vertical)
      var(--cd-spacing-color-picker-inputnumbersuffix-horizontal);
  }
</style>
