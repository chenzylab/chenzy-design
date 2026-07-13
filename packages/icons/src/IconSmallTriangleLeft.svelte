<!-- IconSmallTriangleLeft — 具名图标，对齐 Semi IconSmallTriangleLeft（convertIcon(small_triangle_left, 'small_triangle_left')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { smallTriangleLeftSvg } from './svgs.js';

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

<Icon svg={smallTriangleLeftSvg} type="small_triangle_left" {...rest} />
