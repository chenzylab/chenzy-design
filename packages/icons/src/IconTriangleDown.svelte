<!-- IconTriangleDown — 具名图标，对齐 Semi IconTriangleDown（convertIcon(triangle_down, 'triangle_down')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { triangleDownSvg } from './svgs.js';

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

<Icon svg={triangleDownSvg} type="triangle_down" {...rest} />
