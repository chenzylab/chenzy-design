<!-- IconCard — 具名图标，对齐 Semi IconCard（convertIcon(card, 'card')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { cardSvg } from './svgs.js';

  interface Props {
    size?: IconSize;
    spin?: boolean;
    rotate?: number;
    class?: string;
    style?: string;
    [key: string]: unknown;
  }
  let { ...rest }: Props = $props();
</script>

<Icon svg={cardSvg} type="card" {...rest} />
