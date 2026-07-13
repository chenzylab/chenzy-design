<!-- IconRingChartStroked — 具名图标，对齐 Semi IconRingChartStroked（convertIcon(ring_chart_stroked, 'ring_chart_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { ringChartStrokedSvg } from './svgs.js';

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

<Icon svg={ringChartStrokedSvg} type="ring_chart_stroked" {...rest} />
