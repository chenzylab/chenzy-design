<!-- IconH1 — 具名图标，对齐 Semi IconH1（convertIcon(h1, 'h1')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { h1Svg } from './svgs.js';

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

<Icon svg={h1Svg} type="h1" {...rest} />
