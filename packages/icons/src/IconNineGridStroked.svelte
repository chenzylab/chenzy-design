<!-- IconNineGridStroked — 具名图标，对齐 Semi IconNineGridStroked（convertIcon(nine_grid_stroked, 'nine_grid_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { nineGridStrokedSvg } from './svgs.js';

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

<Icon svg={nineGridStrokedSvg} type="nine_grid_stroked" {...rest} />
