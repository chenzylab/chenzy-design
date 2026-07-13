<!-- IconPlayCircle — 具名图标，对齐 Semi IconPlayCircle（convertIcon(play_circle, 'play_circle')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { playCircleSvg } from './svgs.js';

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

<Icon svg={playCircleSvg} type="play_circle" {...rest} />
