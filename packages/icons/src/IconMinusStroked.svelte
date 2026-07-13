<!-- IconMinusStroked — 具名图标，对齐 Semi IconMinusStroked（convertIcon(minus_stroked, 'minus_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { minusStrokedSvg } from './svgs.js';

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

<Icon svg={minusStrokedSvg} type="minus_stroked" {...rest} />
