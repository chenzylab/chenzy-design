<!-- IconH3 — 具名图标，对齐 Semi IconH3（convertIcon(h3, 'h3')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { h3Svg } from './svgs.js';

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

<Icon svg={h3Svg} type="h3" {...rest} />
