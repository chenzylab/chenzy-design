<!-- IconToutiaoLogo — 具名图标，对齐 Semi IconToutiaoLogo（convertIcon(toutiao_logo, 'toutiao_logo')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { toutiaoLogoSvg } from './svgs.js';

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

<Icon svg={toutiaoLogoSvg} type="toutiao_logo" {...rest} />
