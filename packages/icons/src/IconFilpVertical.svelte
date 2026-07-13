<!-- IconFilpVertical — 具名图标，对齐 Semi IconFilpVertical（convertIcon(filp_vertical, 'filp_vertical')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { filpVerticalSvg } from './svgs.js';

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

<Icon svg={filpVerticalSvg} type="filp_vertical" {...rest} />
