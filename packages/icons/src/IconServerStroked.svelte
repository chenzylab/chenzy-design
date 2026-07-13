<!-- IconServerStroked — 具名图标，对齐 Semi IconServerStroked（convertIcon(server_stroked, 'server_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { serverStrokedSvg } from './svgs.js';

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

<Icon svg={serverStrokedSvg} type="server_stroked" {...rest} />
