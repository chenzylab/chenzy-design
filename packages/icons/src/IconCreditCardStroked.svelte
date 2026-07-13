<!-- IconCreditCardStroked — 具名图标，对齐 Semi IconCreditCardStroked（convertIcon(credit_card_stroked, 'credit_card_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { creditCardStrokedSvg } from './svgs.js';

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

<Icon svg={creditCardStrokedSvg} type="credit_card_stroked" {...rest} />
