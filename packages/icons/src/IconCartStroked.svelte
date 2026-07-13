<!-- IconCartStroked — 具名图标，对齐 Semi IconCartStroked（convertIcon(cart_stroked, 'cart_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { cartStrokedSvg } from './svgs.js';

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

<Icon svg={cartStrokedSvg} type="cart_stroked" {...rest} />
