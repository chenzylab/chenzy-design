<!-- IconStackBarChartStroked — 具名图标，对齐 Semi IconStackBarChartStroked（convertIcon(stack_bar_chart_stroked, 'stack_bar_chart_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { stackBarChartStrokedSvg } from './svgs.js';

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

<Icon svg={stackBarChartStrokedSvg} type="stack_bar_chart_stroked" {...rest} />
