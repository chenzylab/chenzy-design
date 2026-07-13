<!-- IconUnlock — 具名图标，对齐 Semi IconUnlock（convertIcon(unlock, 'unlock')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { unlockSvg } from './svgs.js';

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

<Icon svg={unlockSvg} type="unlock" {...rest} />
