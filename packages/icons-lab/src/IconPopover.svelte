<!-- IconPopover — 具名图标，对齐 Semi IconPopover（convertIcon(popover, 'popover')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { popoverSvg } from './svgs.js';

  interface Props {
    size?: IconSize;
    spin?: boolean;
    rotate?: number;
    class?: string;
    style?: string;
    [key: string]: unknown;
  }
  let { ...rest }: Props = $props();
</script>

<Icon svg={popoverSvg} type="popover" {...rest} />
