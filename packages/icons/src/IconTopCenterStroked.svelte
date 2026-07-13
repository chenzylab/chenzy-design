<!-- IconTopCenterStroked — 具名图标，对齐 Semi IconTopCenterStroked（convertIcon(top_center_stroked, 'top_center_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { topCenterStrokedSvg } from './svgs.js';

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

<Icon svg={topCenterStrokedSvg} type="top_center_stroked" {...rest} />
