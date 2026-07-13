<!-- IconChainStroked — 具名图标，对齐 Semi IconChainStroked（convertIcon(chain_stroked, 'chain_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { chainStrokedSvg } from './svgs.js';

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

<Icon svg={chainStrokedSvg} type="chain_stroked" {...rest} />
