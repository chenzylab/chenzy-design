<!-- IconTree — 具名图标，对齐 Semi IconTree（convertIcon(tree, 'tree')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { treeSvg } from './svgs.js';

  interface Props {
    size?: IconSize;
    spin?: boolean;
    rotate?: number;
    class?: string;
    style?: string;
    [key: string]: unknown;
  }
  let { ...rest }: Props = $props();
</script>

<Icon svg={treeSvg} type="tree" {...rest} />
