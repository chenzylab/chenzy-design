<!-- IconGridRectangle — 具名图标，对齐 Semi IconGridRectangle（convertIcon(grid-rectangle, 'grid-rectangle')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { gridRectangleSvg } from './svgs.js';

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

<Icon svg={gridRectangleSvg} type="grid-rectangle" {...rest} />
