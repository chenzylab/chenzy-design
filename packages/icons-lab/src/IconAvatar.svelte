<!-- IconAvatar — 具名图标，对齐 Semi IconAvatar（convertIcon(avatar, 'avatar')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { avatarSvg } from './svgs.js';

  interface Props {
    size?: IconSize;
    spin?: boolean;
    rotate?: number;
    class?: string;
    style?: string;
    [key: string]: unknown;
  }
  let { ...rest }: Props = $props();
</script>

<Icon svg={avatarSvg} type="avatar" {...rest} />
