<!-- IconForward — 具名图标，对齐 Semi IconForward（convertIcon(forward, 'forward')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { forwardSvg } from './svgs.js';

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

<Icon svg={forwardSvg} type="forward" {...rest} />
