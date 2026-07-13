<!-- IconH9 — 具名图标，对齐 Semi IconH9（convertIcon(h9, 'h9')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { h9Svg } from './svgs.js';

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

<Icon svg={h9Svg} type="h9" {...rest} />
