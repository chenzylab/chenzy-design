<!-- IconXiguaLogo — 具名图标，对齐 Semi IconXiguaLogo（convertIcon(xigua_logo, 'xigua_logo')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { xiguaLogoSvg } from './svgs.js';

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

<Icon svg={xiguaLogoSvg} type="xigua_logo" {...rest} />
