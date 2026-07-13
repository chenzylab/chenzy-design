<!-- IconSendStroked — 具名图标，对齐 Semi IconSendStroked（convertIcon(send_stroked, 'send_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { sendStrokedSvg } from './svgs.js';

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

<Icon svg={sendStrokedSvg} type="send_stroked" {...rest} />
