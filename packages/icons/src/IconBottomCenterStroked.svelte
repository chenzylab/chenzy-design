<!-- IconBottomCenterStroked — 具名图标，对齐 Semi IconBottomCenterStroked（convertIcon(bottom_center_stroked, 'bottom_center_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { bottomCenterStrokedSvg } from './svgs.js';

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

<Icon svg={bottomCenterStrokedSvg} type="bottom_center_stroked" {...rest} />
