<!-- IconTreeSelect — 具名图标，对齐 Semi IconTreeSelect（convertIcon(tree-select, 'tree-select')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { treeSelectSvg } from './svgs.js';

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

<Icon svg={treeSelectSvg} type="tree-select" {...rest} />
