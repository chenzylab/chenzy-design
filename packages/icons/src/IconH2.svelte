<!-- IconH2 — 具名图标，对齐 Semi IconH2（convertIcon(h2, 'h2')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { h2Svg } from './svgs.js';

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

<Icon svg={h2Svg} type="h2" {...rest} />
