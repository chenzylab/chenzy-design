<!-- IconPrint — 具名图标，对齐 Semi IconPrint（convertIcon(print, 'print')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { printSvg } from './svgs.js';

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

<Icon svg={printSvg} type="print" {...rest} />
