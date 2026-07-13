<!-- IconGrid — 具名图标，对齐 Semi IconGrid（convertIcon(grid, 'grid')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { gridSvg } from './svgs.js';

  interface Props {
    size?: IconSize;
    spin?: boolean;
    rotate?: number;
    class?: string;
    style?: string;
    [key: string]: unknown;
  }
  let { ...rest }: Props = $props();
</script>

<Icon svg={gridSvg} type="grid" {...rest} />
