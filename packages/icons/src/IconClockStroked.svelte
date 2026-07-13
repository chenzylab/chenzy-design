<!-- IconClockStroked — 具名图标，对齐 Semi IconClockStroked（convertIcon(clock_stroked, 'clock_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { clockStrokedSvg } from './svgs.js';

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

<Icon svg={clockStrokedSvg} type="clock_stroked" {...rest} />
