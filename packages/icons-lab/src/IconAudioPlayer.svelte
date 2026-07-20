<!-- IconAudioPlayer — 具名图标，对齐 Semi 官网侧边栏 doc-audioPlayer（彩色专属插画）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { audioPlayerSvg } from './svgs.js';

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

<Icon svg={audioPlayerSvg} type="audioPlayer" {...rest} />
