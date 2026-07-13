<!-- IconAlignVBotStroked — 具名图标，对齐 Semi IconAlignVBotStroked（convertIcon(align_v_bot_stroked, 'align_v_bot_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { alignVBotStrokedSvg } from './svgs.js';

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

<Icon svg={alignVBotStrokedSvg} type="align_v_bot_stroked" {...rest} />
