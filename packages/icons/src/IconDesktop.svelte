<!-- IconDesktop — 具名图标，对齐 Semi IconDesktop（convertIcon(desktop, 'desktop')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { desktopSvg } from './svgs.js';

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

<Icon svg={desktopSvg} type="desktop" {...rest} />
