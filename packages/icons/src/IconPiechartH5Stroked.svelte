<!-- IconPiechartH5Stroked — 具名图标，对齐 Semi IconPiechartH5Stroked（convertIcon(piechart_h5_stroked, 'piechart_h5_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { piechartH5StrokedSvg } from './svgs.js';

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

<Icon svg={piechartH5StrokedSvg} type="piechart_h5_stroked" {...rest} />
