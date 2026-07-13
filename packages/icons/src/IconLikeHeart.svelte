<!-- IconLikeHeart — 具名图标，对齐 Semi IconLikeHeart（convertIcon(like_heart, 'like_heart')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { likeHeartSvg } from './svgs.js';

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

<Icon svg={likeHeartSvg} type="like_heart" {...rest} />
