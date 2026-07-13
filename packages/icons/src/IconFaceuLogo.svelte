<!-- IconFaceuLogo — 具名图标，对齐 Semi IconFaceuLogo（convertIcon(faceu_logo, 'faceu_logo')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { faceuLogoSvg } from './svgs.js';

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

<Icon svg={faceuLogoSvg} type="faceu_logo" {...rest} />
