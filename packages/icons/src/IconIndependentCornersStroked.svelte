<!-- IconIndependentCornersStroked — 具名图标，对齐 Semi IconIndependentCornersStroked（convertIcon(independent_corners_stroked, 'independent_corners_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { independentCornersStrokedSvg } from './svgs.js';

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

<Icon svg={independentCornersStrokedSvg} type="independent_corners_stroked" {...rest} />
