<!-- IconDarkMode — 具名图标，对齐 Semi IconDarkMode（convertIcon(dark-mode, 'dark-mode')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { darkModeSvg } from './svgs.js';

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

<Icon svg={darkModeSvg} type="dark-mode" {...rest} />
