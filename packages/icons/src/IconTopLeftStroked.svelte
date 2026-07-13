<!-- IconTopLeftStroked — 具名图标，对齐 Semi IconTopLeftStroked（convertIcon(top_left_stroked, 'top_left_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { topLeftStrokedSvg } from './svgs.js';

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

<Icon svg={topLeftStrokedSvg} type="top_left_stroked" {...rest} />
