<!-- IconUserCardVideo — 具名图标，对齐 Semi IconUserCardVideo（convertIcon(user_card_video, 'user_card_video')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { userCardVideoSvg } from './svgs.js';

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

<Icon svg={userCardVideoSvg} type="user_card_video" {...rest} />
