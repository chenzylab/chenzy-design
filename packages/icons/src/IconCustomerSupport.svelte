<!-- IconCustomerSupport — 具名图标，对齐 Semi IconCustomerSupport（convertIcon(customer_support, 'customer_support')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { customerSupportSvg } from './svgs.js';

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

<Icon svg={customerSupportSvg} type="customer_support" {...rest} />
