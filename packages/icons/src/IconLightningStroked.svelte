<!-- IconLightningStroked — 具名图标，对齐 Semi IconLightningStroked（convertIcon(lightning_stroked, 'lightning_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { lightningStrokedSvg } from './svgs.js';

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

<Icon svg={lightningStrokedSvg} type="lightning_stroked" {...rest} />
