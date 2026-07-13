<!-- IconSearchStroked — 具名图标，对齐 Semi IconSearchStroked（convertIcon(search_stroked, 'search_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { searchStrokedSvg } from './svgs.js';

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

<Icon svg={searchStrokedSvg} type="search_stroked" {...rest} />
