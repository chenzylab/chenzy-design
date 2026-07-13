<!-- IconCoinMoney — 具名图标，对齐 Semi IconCoinMoney（convertIcon(coin_money, 'coin_money')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { coinMoneySvg } from './svgs.js';

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

<Icon svg={coinMoneySvg} type="coin_money" {...rest} />
