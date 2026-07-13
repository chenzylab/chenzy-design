<!-- IconShield — 具名图标，对齐 Semi IconShield（convertIcon(shield, 'shield')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { shieldSvg } from './svgs.js';

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

<Icon svg={shieldSvg} type="shield" {...rest} />
