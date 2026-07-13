<!-- IconBarChartVStroked — 具名图标，对齐 Semi IconBarChartVStroked（convertIcon(bar_chart_v_stroked, 'bar_chart_v_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { barChartVStrokedSvg } from './svgs.js';

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

<Icon svg={barChartVStrokedSvg} type="bar_chart_v_stroked" {...rest} />
