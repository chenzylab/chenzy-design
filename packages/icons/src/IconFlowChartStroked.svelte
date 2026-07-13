<!-- IconFlowChartStroked — 具名图标，对齐 Semi IconFlowChartStroked（convertIcon(flow_chart_stroked, 'flow_chart_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { flowChartStrokedSvg } from './svgs.js';

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

<Icon svg={flowChartStrokedSvg} type="flow_chart_stroked" {...rest} />
