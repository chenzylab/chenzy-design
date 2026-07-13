<!-- IconFilter — 具名图标，对齐 Semi IconFilter（convertIcon(filter, 'filter')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { filterSvg } from './svgs.js';

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

<Icon svg={filterSvg} type="filter" {...rest} />
