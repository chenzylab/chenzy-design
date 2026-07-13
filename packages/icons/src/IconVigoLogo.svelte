<!-- IconVigoLogo — 具名图标，对齐 Semi IconVigoLogo（convertIcon(vigo_logo, 'vigo_logo')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { vigoLogoSvg } from './svgs.js';

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

<Icon svg={vigoLogoSvg} type="vigo_logo" {...rest} />
