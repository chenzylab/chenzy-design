<!-- IconCenterRightStroked — 具名图标，对齐 Semi IconCenterRightStroked（convertIcon(center_right_stroked, 'center_right_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { centerRightStrokedSvg } from './svgs.js';

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

<Icon svg={centerRightStrokedSvg} type="center_right_stroked" {...rest} />
