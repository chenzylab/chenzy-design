<!-- IconThumbUpStroked — 具名图标，对齐 Semi IconThumbUpStroked（convertIcon(thumb_up_stroked, 'thumb_up_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { thumbUpStrokedSvg } from './svgs.js';

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

<Icon svg={thumbUpStrokedSvg} type="thumb_up_stroked" {...rest} />
