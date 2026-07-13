<!-- IconVennChartStroked — 具名图标，对齐 Semi IconVennChartStroked（convertIcon(venn_chart_stroked, 'venn_chart_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { vennChartStrokedSvg } from './svgs.js';

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

<Icon svg={vennChartStrokedSvg} type="venn_chart_stroked" {...rest} />
