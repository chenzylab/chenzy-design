<!-- IconRealSizeStroked — 具名图标，对齐 Semi IconRealSizeStroked（convertIcon(real_size_stroked, 'real_size_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { realSizeStrokedSvg } from './svgs.js';

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

<Icon svg={realSizeStrokedSvg} type="real_size_stroked" {...rest} />
