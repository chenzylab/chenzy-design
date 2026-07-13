<!-- IconGridStroked — 具名图标，对齐 Semi IconGridStroked（convertIcon(grid_stroked, 'grid_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { gridStrokedSvg } from './svgs.js';

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

<Icon svg={gridStrokedSvg} type="grid_stroked" {...rest} />
