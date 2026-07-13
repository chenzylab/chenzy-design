<!-- IconPrizeStroked — 具名图标，对齐 Semi IconPrizeStroked（convertIcon(prize_stroked, 'prize_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { prizeStrokedSvg } from './svgs.js';

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

<Icon svg={prizeStrokedSvg} type="prize_stroked" {...rest} />
