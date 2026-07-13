<!-- IconGridView1 — 具名图标，对齐 Semi IconGridView1（convertIcon(grid_view1, 'grid_view1')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { gridView1Svg } from './svgs.js';

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

<Icon svg={gridView1Svg} type="grid_view1" {...rest} />
