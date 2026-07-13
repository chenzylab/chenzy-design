<!-- IconCenterLeftStroked — 具名图标，对齐 Semi IconCenterLeftStroked（convertIcon(center_left_stroked, 'center_left_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { centerLeftStrokedSvg } from './svgs.js';

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

<Icon svg={centerLeftStrokedSvg} type="center_left_stroked" {...rest} />
