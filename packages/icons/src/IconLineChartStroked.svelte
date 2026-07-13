<!-- IconLineChartStroked — 具名图标，对齐 Semi IconLineChartStroked（convertIcon(line_chart_stroked, 'line_chart_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { lineChartStrokedSvg } from './svgs.js';

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

<Icon svg={lineChartStrokedSvg} type="line_chart_stroked" {...rest} />
