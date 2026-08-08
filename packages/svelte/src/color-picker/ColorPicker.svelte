<!--
  ColorPicker — 严格对齐 Semi Design（semi-ui/colorPicker/index.tsx 的 renderPicker + render）。

  值形态为 Semi ColorValue 对象 { hsva, rgba, hex }（hsva 的 s/v 为 0-100）。
  受控 value 不回写（红线 #1），仅经 onChange 通知；value 未传时 foundation 内部持有当前色。

  结构镜像 Semi renderPicker：
    topSlot? + ColorChooseArea + ColorSlider(hue) + AlphaSlider? + DataPart + bottomSlot?
  usePopover=true 时用 <Popover> 包裹，children 缺省渲染默认色块 trigger（对齐 Semi）。

  逻辑层在 color-picker-foundation.svelte.ts（对齐 semi-foundation/colorPicker/foundation.ts），
  本文件只做视图装配。
-->
<script lang="ts">
  import type { ComponentProps, Snippet } from 'svelte';
  import { DEFAULT_COLOR_VALUE, type ColorValue, type ColorValueFormat } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';
  import Popover from '../popover/Popover.svelte';
  import ColorChooseArea from './ColorChooseArea.svelte';
  import ColorSlider from './ColorSlider.svelte';
  import AlphaSlider from './AlphaSlider.svelte';
  import DataPart from './DataPart.svelte';
  import { createColorPickerFoundation } from './color-picker-foundation.svelte.js';
  import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from './constants.js';

  type PopoverProps = ComponentProps<typeof Popover>;

  interface Props {
    /** 受控值（Semi ColorValue 对象）。 */
    value?: ColorValue;
    /** 非受控初始值（默认 Semi 品牌绿 #39c5bb）。 */
    defaultValue?: ColorValue;
    /** 是否开启透明度选择（对齐 Semi alpha）。 */
    alpha?: boolean;
    /** 面板宽度 px（对齐 Semi width，默认 280）。 */
    width?: number;
    /** 饱和度方块高度 px（对齐 Semi height，默认 280）。 */
    height?: number;
    /** DataPart 输入区默认格式（不受控，对齐 Semi defaultFormat）。 */
    defaultFormat?: ColorValueFormat;
    /** 是否开启滴管拾色器（默认 true；浏览器不支持 EyeDropper 时自动隐藏按钮）。 */
    eyeDropper?: boolean;
    /** 浮层模式：包裹 Popover，children 作触发器（对齐 Semi usePopover）。 */
    usePopover?: boolean;
    /** 透传内部 Popover 的属性（仅 usePopover）。 */
    popoverProps?: PopoverProps;
    /** 自定义触发器（仅 usePopover；缺省渲染默认色块，对齐 Semi children）。 */
    children?: Snippet;
    /** 面板顶部渲染额外元素（对齐 Semi topSlot）。 */
    topSlot?: Snippet;
    /** 面板底部渲染额外元素（对齐 Semi bottomSlot）。 */
    bottomSlot?: Snippet;
    /** 根元素自定义类名（对齐 Semi className）。 */
    class?: string;
    /** 根元素内联样式（对齐 Semi style）。 */
    style?: string;
    /** 用户选中颜色的回调（对齐 Semi onChange，回 ColorValue 对象）。 */
    onChange?: (value: ColorValue) => void;
  }

  let {
    value,
    defaultValue = DEFAULT_COLOR_VALUE,
    alpha = false,
    width = DEFAULT_WIDTH,
    height = DEFAULT_HEIGHT,
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

  const foundation = createColorPickerFoundation(() => ({
    value,
    defaultValue,
    alpha,
    onChange,
  }));

  const currentColor = $derived(foundation.currentColor);

  const dataPartLabels = $derived({
    value: loc().t('ColorPicker.hex'),
    alpha: loc().t('ColorPicker.alpha'),
    format: loc().t('ColorPicker.format'),
    eyeDropper: loc().t('ColorPicker.eyeDropper'),
  });

  const rootCls = $derived(['cd-color-picker', className].filter(Boolean).join(' '));
</script>

{#snippet picker()}
  <div class={rootCls} {style}>
    {@render topSlot?.()}

    <ColorChooseArea
      hsva={currentColor.hsva}
      {width}
      {height}
      aria-label={loc().t('ColorPicker.saturation')}
      onChange={({ s, v }) =>
        foundation.handleChange(
          { h: currentColor.hsva.h, s, v, a: currentColor.hsva.a },
          'hsva',
        )}
    />

    <ColorSlider
      hue={currentColor.hsva.h}
      {width}
      aria-label={loc().t('ColorPicker.hue')}
      onChange={(h) => foundation.handleChangeH(h)}
    />

    {#if alpha}
      <AlphaSlider
        hsva={currentColor.hsva}
        {width}
        aria-label={loc().t('ColorPicker.alpha')}
        onChange={(a) => foundation.handleChangeA(a)}
      />
    {/if}

    <DataPart
      {currentColor}
      {defaultFormat}
      {width}
      {alpha}
      {eyeDropper}
      {foundation}
      labels={dataPartLabels}
    />

    {@render bottomSlot?.()}
  </div>
{/snippet}

{#if usePopover}
  <Popover
    {...popoverProps}
    class={['cd-color-picker-popover', popoverProps?.class].filter(Boolean).join(' ')}
    content={picker}
  >
    {#if children}
      {@render children()}
    {:else}
      <div
        class="cd-color-picker-popover-defaultchildren"
        role="button"
        tabindex="0"
        aria-label={loc().t('ColorPicker.hex')}
        style:background-color={currentColor.hex}
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
  /* popover 模式：整体内边距 + 默认色块 trigger。 */
  :global(.cd-color-picker-popover .cd-popover-content) {
    padding: var(--cd-spacing-color-picker-popover-padding);
  }
  .cd-color-picker-popover-defaultchildren {
    width: var(--cd-width-color-picker-defaulttrigger);
    height: var(--cd-width-color-picker-defaulttrigger);
    border-radius: var(--cd-radius-color-picker-defaulttrigger);
    cursor: pointer;
  }
</style>
