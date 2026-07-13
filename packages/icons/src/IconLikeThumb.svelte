<!-- IconLikeThumb — 具名图标，对齐 Semi IconLikeThumb（convertIcon(like_thumb, 'like_thumb')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { likeThumbSvg } from './svgs.js';

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

<Icon svg={likeThumbSvg} type="like_thumb" {...rest} />
