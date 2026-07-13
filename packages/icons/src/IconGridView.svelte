<!-- IconGridView — 具名图标，对齐 Semi IconGridView（convertIcon(grid_view, 'grid_view')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { gridViewSvg } from './svgs.js';

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

<Icon svg={gridViewSvg} type="grid_view" {...rest} />
