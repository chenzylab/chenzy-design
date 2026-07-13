<!-- IconVideoStroked — 具名图标，对齐 Semi IconVideoStroked（convertIcon(video_stroked, 'video_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { videoStrokedSvg } from './svgs.js';

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

<Icon svg={videoStrokedSvg} type="video_stroked" {...rest} />
