<!-- IconCustomerSupportStroked — 具名图标，对齐 Semi IconCustomerSupportStroked（convertIcon(customer_support_stroked, 'customer_support_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { customerSupportStrokedSvg } from './svgs.js';

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

<Icon svg={customerSupportStrokedSvg} type="customer_support_stroked" {...rest} />
