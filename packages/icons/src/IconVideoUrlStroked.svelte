<!-- IconVideoUrlStroked — 具名图标，对齐 Semi IconVideoUrlStroked（convertIcon(video_url_stroked, 'video_url_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { videoUrlStrokedSvg } from './svgs.js';

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

<Icon svg={videoUrlStrokedSvg} type="video_url_stroked" {...rest} />
