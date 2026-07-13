<!-- IconPrize — 具名图标，对齐 Semi IconPrize（convertIcon(prize, 'prize')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { prizeSvg } from './svgs.js';

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

<Icon svg={prizeSvg} type="prize" {...rest} />
