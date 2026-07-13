<!-- IconShieldStroked — 具名图标，对齐 Semi IconShieldStroked（convertIcon(shield_stroked, 'shield_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { shieldStrokedSvg } from './svgs.js';

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

<Icon svg={shieldStrokedSvg} type="shield_stroked" {...rest} />
