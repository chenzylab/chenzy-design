<!-- IconH5 — 具名图标，对齐 Semi IconH5（convertIcon(h5, 'h5')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { h5Svg } from './svgs.js';

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

<Icon svg={h5Svg} type="h5" {...rest} />
