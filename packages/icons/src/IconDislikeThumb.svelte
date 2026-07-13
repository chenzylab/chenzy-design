<!-- IconDislikeThumb — 具名图标，对齐 Semi IconDislikeThumb（convertIcon(dislike_thumb, 'dislike_thumb')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { dislikeThumbSvg } from './svgs.js';

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

<Icon svg={dislikeThumbSvg} type="dislike_thumb" {...rest} />
