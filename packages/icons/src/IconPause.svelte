<!-- IconPause — 具名图标，对齐 Semi IconPause（convertIcon(pause, 'pause')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { pauseSvg } from './svgs.js';

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

<Icon svg={pauseSvg} type="pause" {...rest} />
