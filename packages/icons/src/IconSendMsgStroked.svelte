<!-- IconSendMsgStroked — 具名图标，对齐 Semi IconSendMsgStroked（convertIcon(send_msg_stroked, 'send_msg_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { sendMsgStrokedSvg } from './svgs.js';

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

<Icon svg={sendMsgStrokedSvg} type="send_msg_stroked" {...rest} />
