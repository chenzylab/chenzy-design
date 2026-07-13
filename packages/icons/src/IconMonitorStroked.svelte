<!-- IconMonitorStroked — 具名图标，对齐 Semi IconMonitorStroked（convertIcon(monitor_stroked, 'monitor_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { monitorStrokedSvg } from './svgs.js';

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

<Icon svg={monitorStrokedSvg} type="monitor_stroked" {...rest} />
