<!-- IconGiftStroked — 具名图标，对齐 Semi IconGiftStroked（convertIcon(gift_stroked, 'gift_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { giftStrokedSvg } from './svgs.js';

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

<Icon svg={giftStrokedSvg} type="gift_stroked" {...rest} />
