<!-- IconSmartphoneCheckStroked — 具名图标，对齐 Semi IconSmartphoneCheckStroked（convertIcon(smartphone_check_stroked, 'smartphone_check_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { smartphoneCheckStrokedSvg } from './svgs.js';

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

<Icon svg={smartphoneCheckStrokedSvg} type="smartphone_check_stroked" {...rest} />
