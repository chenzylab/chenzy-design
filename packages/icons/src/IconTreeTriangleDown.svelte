<!-- IconTreeTriangleDown — 具名图标，对齐 Semi IconTreeTriangleDown（convertIcon(tree_triangle_down, 'tree_triangle_down')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { treeTriangleDownSvg } from './svgs.js';

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

<Icon svg={treeTriangleDownSvg} type="tree_triangle_down" {...rest} />
