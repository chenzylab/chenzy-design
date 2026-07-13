<!-- IconVolume1Stroked — 具名图标，对齐 Semi IconVolume1Stroked（convertIcon(volume_1_stroked, 'volume_1_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { volume1StrokedSvg } from './svgs.js';

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

<Icon svg={volume1StrokedSvg} type="volume_1_stroked" {...rest} />
