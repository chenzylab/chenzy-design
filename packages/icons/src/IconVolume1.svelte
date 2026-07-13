<!-- IconVolume1 — 具名图标，对齐 Semi IconVolume1（convertIcon(volume_1, 'volume_1')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { volume1Svg } from './svgs.js';

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

<Icon svg={volume1Svg} type="volume_1" {...rest} />
