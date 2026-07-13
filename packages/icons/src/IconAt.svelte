<!-- IconAt — 具名图标，对齐 Semi IconAt（convertIcon(at, 'at')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { atSvg } from './svgs.js';

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

<Icon svg={atSvg} type="at" {...rest} />
