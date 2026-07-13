<!-- IconSmartphoneStroked — 具名图标，对齐 Semi IconSmartphoneStroked（convertIcon(smartphone_stroked, 'smartphone_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { smartphoneStrokedSvg } from './svgs.js';

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

<Icon svg={smartphoneStrokedSvg} type="smartphone_stroked" {...rest} />
