<!-- IconTransfer — 具名图标，对齐 Semi IconTransfer（convertIcon(transfer, 'transfer')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { transferSvg } from './svgs.js';

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

<Icon svg={transferSvg} type="transfer" {...rest} />
