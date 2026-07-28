<!--
  QuickControl —— 对齐 Semi datePicker/quickControl.tsx。
  快捷选择预设区：按 presetPosition(top/bottom/left/right) + type 派生一整套 class（wrapper/header/
  content-wrapper/content/item/ellipsis），复用 Button + Typography.Text(ellipsis showTooltip)。
  top/bottom 无 header（标题只在 left/right 出现）。presets 为空则不渲染。
-->
<script lang="ts">
  import Button from '../button/Button.svelte';
  import Text from '../typography/Text.svelte';
  import { useLocale } from '../locale-provider/index.js';
  import { cssClasses } from './constants.js';
  import type { PresetType, PresetsType } from './date-picker-foundation.svelte.js';

  interface Props {
    presets?: PresetsType;
    presetPosition?: 'left' | 'right' | 'top' | 'bottom';
    type?: string;
    insetInput?: boolean;
    onPresetClick?: (preset: PresetType, e: MouseEvent) => void;
  }

  let {
    presets = [],
    presetPosition = 'bottom',
    type = 'date',
    insetInput = false,
    onPresetClick,
  }: Props = $props();

  const loc = useLocale();
  const prefixCls = cssClasses.PREFIX;

  const isTypeRange = $derived(type === 'dateRange' || type === 'dateTimeRange');
  const isPanelTopAndBottom = $derived(presetPosition === 'top' || presetPosition === 'bottom');
  const isMonth = $derived(type === 'month');
  const isTopAndBottomRange = $derived(isPanelTopAndBottom && isTypeRange);
  const isTopAndBottomMonth = $derived(isPanelTopAndBottom && isMonth);

  // class 派生（逐条对齐 Semi）。
  const wrapperCls = $derived(
    [
      `${prefixCls}-quick-control`,
      type && `${prefixCls}-quick-control-${type}`,
      `${prefixCls}-quick-control-${presetPosition}`,
    ]
      .filter(Boolean)
      .join(' '),
  );
  const contentWrapperCls = $derived(`${prefixCls}-quick-control-${presetPosition}-content-wrapper`);
  const contentCls = $derived(
    isTopAndBottomRange
      ? `${prefixCls}-quick-control-${presetPosition}-range-content`
      : isTopAndBottomMonth
        ? `${prefixCls}-quick-control-${presetPosition}-month-content`
        : `${prefixCls}-quick-control-${presetPosition}-content`,
  );
  const itemCls = $derived(
    isTopAndBottomRange
      ? `${prefixCls}-quick-control-${presetPosition}-range-content-item`
      : isTopAndBottomMonth
        ? `${prefixCls}-quick-control-${presetPosition}-month-content-item`
        : `${prefixCls}-quick-control-${presetPosition}-content-item`,
  );
  const ellipsisCls = $derived(
    isTopAndBottomRange
      ? `${prefixCls}-quick-control-${presetPosition}-range-content-item-ellipsis`
      : isTopAndBottomMonth
        ? `${prefixCls}-quick-control-${presetPosition}-month-content-item-ellipsis`
        : `${prefixCls}-quick-control-${presetPosition}-content-item-ellipsis`,
  );

  const resolved = $derived(
    presets.map((item) => (typeof item === 'function' ? item() : item)),
  );
</script>

{#if presets.length}
  <div class={wrapperCls} {...{ 'x-insetinput': insetInput ? 'true' : 'false' }}>
    {#if !isPanelTopAndBottom}
      <div class={`${prefixCls}-quick-control-header`}>{loc().t('DatePicker.presets')}</div>
    {/if}
    <div class={contentWrapperCls}>
      <div class={contentCls}>
        {#each resolved as item, index (index)}
          <Button size="small" type="primary" onclick={(e) => onPresetClick?.(item, e)}>
            <div class={itemCls}>
              <Text ellipsis={{ showTooltip: true }} class={ellipsisCls}>{item.text}</Text>
            </div>
          </Button>
        {/each}
      </div>
    </div>
  </div>
{/if}

<style>
  /* QuickControl 预设区 —— 对齐 Semi datePicker.scss `&-quick-control`（626-740）。
     class 为动态字符串（presetPosition/type 派生），用 :global 打洞。
     token：header paddingTop=18px、content paddingX=12px、marginTop=14px、item-gap=spacing-tight(8px)、
     top/bottom paddingX=base-loose(20px)、按钮文字=primary、bg=transparent、header fontWeight=600。 */

  :global(.cd-datepicker-quick-control) {
    box-sizing: border-box;
    background-color: var(--cd-color-date-picker-quick-bg-default, transparent);
  }
  :global(.cd-datepicker-quick-control-header) {
    padding: 18px 12px 0;
    font-weight: var(--cd-font-weight-bold, 600);
  }
  /* 各方位分割线（对齐 Semi border-{right,left,bottom,top}）。 */
  :global(.cd-datepicker-quick-control-left) {
    border-right: var(--cd-width-date-picker-border, 1px) solid
      var(--cd-color-date-picker-border-bg-default);
  }
  :global(.cd-datepicker-quick-control-right) {
    border-left: var(--cd-width-date-picker-border, 1px) solid
      var(--cd-color-date-picker-border-bg-default);
  }
  :global(.cd-datepicker-quick-control-top) {
    border-bottom: var(--cd-width-date-picker-border, 1px) solid
      var(--cd-color-date-picker-border-bg-default);
  }
  :global(.cd-datepicker-quick-control-bottom) {
    border-top: var(--cd-width-date-picker-border, 1px) solid
      var(--cd-color-date-picker-border-bg-default);
  }

  /* 左右方位 content-wrapper：max-width 200px + marginTop 14px + 纵向滚动。 */
  :global(.cd-datepicker-quick-control-left-content-wrapper),
  :global(.cd-datepicker-quick-control-right-content-wrapper) {
    max-width: 200px;
    margin-top: 14px;
    overflow-y: auto;
  }
  /* 上下方位 content-wrapper：max-height 100px + 纵向滚动。 */
  :global(.cd-datepicker-quick-control-top-content-wrapper),
  :global(.cd-datepicker-quick-control-bottom-content-wrapper) {
    overflow-y: auto;
    max-height: 100px;
  }

  /* 左右方位 content：2 列 grid（按钮宽 84 = (200-24-8)/2），gap 8，paddingX 12 + 下 12。 */
  :global(.cd-datepicker-quick-control-left-content),
  :global(.cd-datepicker-quick-control-right-content) {
    box-sizing: border-box;
    display: grid;
    align-content: flex-start;
    grid-gap: var(--cd-spacing-tight, 8px);
    grid-template-columns: repeat(2, minmax(calc(84px - 7.5px), 84px));
    padding: 0 12px 12px;
  }
  :global(.cd-datepicker-quick-control-left-content-item),
  :global(.cd-datepicker-quick-control-right-content-item) {
    max-width: 84px;
  }
  :global(.cd-datepicker-quick-control-left-content-item-ellipsis),
  :global(.cd-datepicker-quick-control-right-content-item-ellipsis) {
    width: calc(84px - var(--cd-spacing-tight, 8px) * 2);
    color: var(--cd-color-date-picker-quick-button-text-default, var(--cd-color-primary));
  }

  /* 上下方位 content（date/dateTime）：3 列 grid（按钮宽约 76），gap 8，padding 8 20。 */
  :global(.cd-datepicker-quick-control-top-content),
  :global(.cd-datepicker-quick-control-bottom-content) {
    display: grid;
    grid-gap: var(--cd-spacing-tight, 8px);
    grid-template-columns: repeat(3, minmax(calc(76px - 5px), 76px));
    align-content: flex-start;
    padding: var(--cd-spacing-tight, 8px) var(--cd-spacing-base-loose, 20px);
  }
  :global(.cd-datepicker-quick-control-top-content-item),
  :global(.cd-datepicker-quick-control-bottom-content-item) {
    max-width: 76px;
  }
  :global(.cd-datepicker-quick-control-top-content-item-ellipsis),
  :global(.cd-datepicker-quick-control-bottom-content-item-ellipsis) {
    width: calc(76px - var(--cd-spacing-tight, 8px) * 2);
    color: var(--cd-color-date-picker-quick-button-text-default, var(--cd-color-primary));
  }

  /* 上下方位 range content：5 列 grid（按钮宽约 91），gap 8，padding 8 20。 */
  :global(.cd-datepicker-quick-control-top-range-content),
  :global(.cd-datepicker-quick-control-bottom-range-content) {
    box-sizing: border-box;
    display: grid;
    align-content: flex-start;
    grid-template-columns: repeat(5, minmax(calc(91px - 3px), 91px));
    grid-gap: var(--cd-spacing-tight, 8px);
    padding: var(--cd-spacing-tight, 8px) var(--cd-spacing-base-loose, 20px);
  }
  :global(.cd-datepicker-quick-control-top-range-content-item),
  :global(.cd-datepicker-quick-control-bottom-range-content-item) {
    max-width: 91px;
  }
  :global(.cd-datepicker-quick-control-top-range-content-item-ellipsis),
  :global(.cd-datepicker-quick-control-bottom-range-content-item-ellipsis) {
    width: calc(91px - var(--cd-spacing-tight, 8px) * 2);
    color: var(--cd-color-date-picker-quick-button-text-default, var(--cd-color-primary));
  }

  /* 上下方位 month content：2 列 grid（按钮宽 73 = (154-8)/2），gap 8，padding 8 20。 */
  :global(.cd-datepicker-quick-control-top-month-content),
  :global(.cd-datepicker-quick-control-bottom-month-content) {
    box-sizing: border-box;
    display: grid;
    grid-template-columns: repeat(2, minmax(calc(73px - 7.5px), 73px));
    grid-gap: var(--cd-spacing-tight, 8px);
    align-content: flex-start;
    padding: var(--cd-spacing-tight, 8px) var(--cd-spacing-base-loose, 20px);
  }
  :global(.cd-datepicker-quick-control-top-month-content-item),
  :global(.cd-datepicker-quick-control-bottom-month-content-item) {
    max-width: 73px;
  }
  :global(.cd-datepicker-quick-control-top-month-content-item-ellipsis),
  :global(.cd-datepicker-quick-control-bottom-month-content-item-ellipsis) {
    max-width: calc(73px - var(--cd-spacing-tight, 8px) * 2);
    color: var(--cd-color-date-picker-quick-button-text-default, var(--cd-color-primary));
  }
</style>
