<!-- IconConfigStroked — 具名图标，对齐 Semi IconConfigStroked（convertIcon(config_stroked, 'config_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { configStrokedSvg } from './svgs.js';

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

<Icon svg={configStrokedSvg} type="config_stroked" {...rest} />
