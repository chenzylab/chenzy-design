<!-- IconH8 — 具名图标，对齐 Semi IconH8（convertIcon(h8, 'h8')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { h8Svg } from './svgs.js';

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

<Icon svg={h8Svg} type="h8" {...rest} />
