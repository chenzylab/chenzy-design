<!-- IconVideoDouyinStroked — 具名图标，对齐 Semi IconVideoDouyinStroked（convertIcon(video_douyin_stroked, 'video_douyin_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { videoDouyinStrokedSvg } from './svgs.js';

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

<Icon svg={videoDouyinStrokedSvg} type="video_douyin_stroked" {...rest} />
