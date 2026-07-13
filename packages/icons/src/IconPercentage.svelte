<!-- IconPercentage — 具名图标，对齐 Semi IconPercentage（convertIcon(percentage, 'percentage')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { percentageSvg } from './svgs.js';

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

<Icon svg={percentageSvg} type="percentage" {...rest} />
