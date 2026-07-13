<!-- IconPriceTag — 具名图标，对齐 Semi IconPriceTag（convertIcon(price_tag, 'price_tag')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { priceTagSvg } from './svgs.js';

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

<Icon svg={priceTagSvg} type="price_tag" {...rest} />
