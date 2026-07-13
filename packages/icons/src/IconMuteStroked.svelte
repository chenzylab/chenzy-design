<!-- IconMuteStroked — 具名图标，对齐 Semi IconMuteStroked（convertIcon(mute_stroked, 'mute_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { muteStrokedSvg } from './svgs.js';

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

<Icon svg={muteStrokedSvg} type="mute_stroked" {...rest} />
