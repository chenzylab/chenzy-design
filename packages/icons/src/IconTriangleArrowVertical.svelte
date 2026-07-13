<!-- IconTriangleArrowVertical — 具名图标，对齐 Semi IconTriangleArrowVertical（convertIcon(triangle_arrow_vertical, 'triangle_arrow_vertical')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { triangleArrowVerticalSvg } from './svgs.js';

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

<Icon svg={triangleArrowVerticalSvg} type="triangle_arrow_vertical" {...rest} />
