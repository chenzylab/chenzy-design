<!-- IconTickCircle — 具名图标，对齐 Semi IconTickCircle（convertIcon(tick_circle, 'tick_circle')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { tickCircleSvg } from './svgs.js';

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

<Icon svg={tickCircleSvg} type="tick_circle" {...rest} />
