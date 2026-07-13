<!-- IconVerify — 具名图标，对齐 Semi IconVerify（convertIcon(verify, 'verify')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { verifySvg } from './svgs.js';

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

<Icon svg={verifySvg} type="verify" {...rest} />
