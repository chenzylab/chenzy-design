<!-- IconH6 — 具名图标，对齐 Semi IconH6（convertIcon(h6, 'h6')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { h6Svg } from './svgs.js';

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

<Icon svg={h6Svg} type="h6" {...rest} />
