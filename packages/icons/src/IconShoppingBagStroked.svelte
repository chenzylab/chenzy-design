<!-- IconShoppingBagStroked — 具名图标，对齐 Semi IconShoppingBagStroked（convertIcon(shopping_bag_stroked, 'shopping_bag_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { shoppingBagStrokedSvg } from './svgs.js';

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

<Icon svg={shoppingBagStrokedSvg} type="shopping_bag_stroked" {...rest} />
