<!-- IconInviteStroked — 具名图标，对齐 Semi IconInviteStroked（convertIcon(invite_stroked, 'invite_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { inviteStrokedSvg } from './svgs.js';

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

<Icon svg={inviteStrokedSvg} type="invite_stroked" {...rest} />
