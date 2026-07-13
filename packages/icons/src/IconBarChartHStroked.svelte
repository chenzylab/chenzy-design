<!-- IconBarChartHStroked — 具名图标，对齐 Semi IconBarChartHStroked（convertIcon(bar_chart_h_stroked, 'bar_chart_h_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { barChartHStrokedSvg } from './svgs.js';

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

<Icon svg={barChartHStrokedSvg} type="bar_chart_h_stroked" {...rest} />
