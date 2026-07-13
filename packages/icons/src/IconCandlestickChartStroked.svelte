<!-- IconCandlestickChartStroked — 具名图标，对齐 Semi IconCandlestickChartStroked（convertIcon(candlestick_chart_stroked, 'candlestick_chart_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { candlestickChartStrokedSvg } from './svgs.js';

  interface Props {
    size?: IconSize;
    spin?: boolean;
    rotate?: number;
    fill?: string;
    class?: string;
    style?: string;
    [key: string]: unknown;
  }
  let { ...rest }: Props = $props();
</script>

<Icon svg={candlestickChartStrokedSvg} type="candlestick_chart_stroked" {...rest} />
