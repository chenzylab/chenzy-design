<!-- IconCreditCard — 具名图标，对齐 Semi IconCreditCard（convertIcon(credit_card, 'credit_card')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { creditCardSvg } from './svgs.js';

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

<Icon svg={creditCardSvg} type="credit_card" {...rest} />
