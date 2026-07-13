<!-- IconH4 — 具名图标，对齐 Semi IconH4（convertIcon(h4, 'h4')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { h4Svg } from './svgs.js';

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

<Icon svg={h4Svg} type="h4" {...rest} />
