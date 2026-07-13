<!-- IconPieChart2Stroked — 具名图标，对齐 Semi IconPieChart2Stroked（convertIcon(pie_chart_2_stroked, 'pie_chart_2_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { pieChart2StrokedSvg } from './svgs.js';

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

<Icon svg={pieChart2StrokedSvg} type="pie_chart_2_stroked" {...rest} />
