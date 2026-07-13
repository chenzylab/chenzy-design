<!-- IconUserCardVideoStroked — 具名图标，对齐 Semi IconUserCardVideoStroked（convertIcon(user_card_video_stroked, 'user_card_video_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { userCardVideoStrokedSvg } from './svgs.js';

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

<Icon svg={userCardVideoStrokedSvg} type="user_card_video_stroked" {...rest} />
