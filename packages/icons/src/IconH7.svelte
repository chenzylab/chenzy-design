<!-- IconH7 — 具名图标，对齐 Semi IconH7（convertIcon(h7, 'h7')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { h7Svg } from './svgs.js';

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

<Icon svg={h7Svg} type="h7" {...rest} />
