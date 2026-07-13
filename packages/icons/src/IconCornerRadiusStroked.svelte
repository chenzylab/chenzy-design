<!-- IconCornerRadiusStroked — 具名图标，对齐 Semi IconCornerRadiusStroked（convertIcon(corner_radius_stroked, 'corner_radius_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { cornerRadiusStrokedSvg } from './svgs.js';

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

<Icon svg={cornerRadiusStrokedSvg} type="corner_radius_stroked" {...rest} />
