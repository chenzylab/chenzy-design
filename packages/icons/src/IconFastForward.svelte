<!-- IconFastForward — 具名图标，对齐 Semi IconFastForward（convertIcon(fast_forward, 'fast_forward')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { fastForwardSvg } from './svgs.js';

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

<Icon svg={fastForwardSvg} type="fast_forward" {...rest} />
