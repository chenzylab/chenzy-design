<!-- IconSortStroked — 具名图标，对齐 Semi IconSortStroked（convertIcon(sort_stroked, 'sort_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { sortStrokedSvg } from './svgs.js';

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

<Icon svg={sortStrokedSvg} type="sort_stroked" {...rest} />
