<!-- IconShareMoneyStroked — 具名图标，对齐 Semi IconShareMoneyStroked（convertIcon(share_money_stroked, 'share_money_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { shareMoneyStrokedSvg } from './svgs.js';

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

<Icon svg={shareMoneyStrokedSvg} type="share_money_stroked" {...rest} />
