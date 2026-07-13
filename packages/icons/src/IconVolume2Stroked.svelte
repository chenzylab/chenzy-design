<!-- IconVolume2Stroked — 具名图标，对齐 Semi IconVolume2Stroked（convertIcon(volume_2_stroked, 'volume_2_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { volume2StrokedSvg } from './svgs.js';

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

<Icon svg={volume2StrokedSvg} type="volume_2_stroked" {...rest} />
