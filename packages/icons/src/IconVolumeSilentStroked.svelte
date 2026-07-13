<!-- IconVolumeSilentStroked — 具名图标，对齐 Semi IconVolumeSilentStroked（convertIcon(volume_silent_stroked, 'volume_silent_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { volumeSilentStrokedSvg } from './svgs.js';

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

<Icon svg={volumeSilentStrokedSvg} type="volume_silent_stroked" {...rest} />
