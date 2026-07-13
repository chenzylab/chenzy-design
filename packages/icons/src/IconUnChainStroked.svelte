<!-- IconUnChainStroked — 具名图标，对齐 Semi IconUnChainStroked（convertIcon(un_chain_stroked, 'un_chain_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { unChainStrokedSvg } from './svgs.js';

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

<Icon svg={unChainStrokedSvg} type="un_chain_stroked" {...rest} />
