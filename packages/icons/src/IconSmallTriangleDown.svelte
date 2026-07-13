<!-- IconSmallTriangleDown — 具名图标，对齐 Semi IconSmallTriangleDown（convertIcon(small_triangle_down, 'small_triangle_down')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { smallTriangleDownSvg } from './svgs.js';

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

<Icon svg={smallTriangleDownSvg} type="small_triangle_down" {...rest} />
