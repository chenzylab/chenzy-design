<!-- IconVideo — 具名图标，对齐 Semi IconVideo（convertIcon(video, 'video')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { videoSvg } from './svgs.js';

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

<Icon svg={videoSvg} type="video" {...rest} />
