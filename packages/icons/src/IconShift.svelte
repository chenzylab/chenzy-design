<!-- IconShift — 具名图标，对齐 Semi IconShift（convertIcon(shift, 'shift')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { shiftSvg } from './svgs.js';

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

<Icon svg={shiftSvg} type="shift" {...rest} />
