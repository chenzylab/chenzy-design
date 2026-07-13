<!-- IconSort — 具名图标，对齐 Semi IconSort（convertIcon(sort, 'sort')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { sortSvg } from './svgs.js';

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

<Icon svg={sortSvg} type="sort" {...rest} />
