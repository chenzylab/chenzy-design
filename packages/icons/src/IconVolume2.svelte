<!-- IconVolume2 — 具名图标，对齐 Semi IconVolume2（convertIcon(volume_2, 'volume_2')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { volume2Svg } from './svgs.js';

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

<Icon svg={volume2Svg} type="volume_2" {...rest} />
