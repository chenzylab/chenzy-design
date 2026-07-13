<!-- IconSwitch — 具名图标，对齐 Semi IconSwitch（convertIcon(switch, 'switch')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { switchSvg } from './svgs.js';

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

<Icon svg={switchSvg} type="switch" {...rest} />
