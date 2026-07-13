<!-- IconTooltip — 具名图标，对齐 Semi IconTooltip（convertIcon(tooltip, 'tooltip')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { tooltipSvg } from './svgs.js';

  interface Props {
    size?: IconSize;
    spin?: boolean;
    rotate?: number;
    class?: string;
    style?: string;
    [key: string]: unknown;
  }
  let { ...rest }: Props = $props();
</script>

<Icon svg={tooltipSvg} type="tooltip" {...rest} />
