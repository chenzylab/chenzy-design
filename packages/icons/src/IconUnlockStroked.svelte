<!-- IconUnlockStroked — 具名图标，对齐 Semi IconUnlockStroked（convertIcon(unlock_stroked, 'unlock_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { unlockStrokedSvg } from './svgs.js';

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

<Icon svg={unlockStrokedSvg} type="unlock_stroked" {...rest} />
