<!-- IconTick — 具名图标，对齐 Semi IconTick（convertIcon(tick, 'tick')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { tickSvg } from './svgs.js';

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

<Icon svg={tickSvg} type="tick" {...rest} />
