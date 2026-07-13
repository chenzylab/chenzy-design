<!-- IconCoinMoneyStroked — 具名图标，对齐 Semi IconCoinMoneyStroked（convertIcon(coin_money_stroked, 'coin_money_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { coinMoneyStrokedSvg } from './svgs.js';

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

<Icon svg={coinMoneyStrokedSvg} type="coin_money_stroked" {...rest} />
