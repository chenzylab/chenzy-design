<!-- IconDongchediLogo — 具名图标，对齐 Semi IconDongchediLogo（convertIcon(dongchedi_logo, 'dongchedi_logo')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { dongchediLogoSvg } from './svgs.js';

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

<Icon svg={dongchediLogoSvg} type="dongchedi_logo" {...rest} />
