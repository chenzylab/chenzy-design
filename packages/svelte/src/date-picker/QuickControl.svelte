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
