<!-- IconTriangleArrow — 具名图标，对齐 Semi IconTriangleArrow（convertIcon(triangle_arrow, 'triangle_arrow')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { triangleArrowSvg } from './svgs.js';

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

<Icon svg={triangleArrowSvg} type="triangle_arrow" {...rest} />
