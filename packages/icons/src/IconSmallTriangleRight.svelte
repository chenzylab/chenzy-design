<!-- IconSmallTriangleRight — 具名图标，对齐 Semi IconSmallTriangleRight（convertIcon(small_triangle_right, 'small_triangle_right')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { smallTriangleRightSvg } from './svgs.js';

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

<Icon svg={smallTriangleRightSvg} type="small_triangle_right" {...rest} />
