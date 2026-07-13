<!-- IconSemiLogo — 具名图标，对齐 Semi IconSemiLogo（convertIcon(semi_logo, 'semi_logo')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { semiLogoSvg } from './svgs.js';

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

<Icon svg={semiLogoSvg} type="semi_logo" {...rest} />
