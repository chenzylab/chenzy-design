<!-- IconConfig — 具名图标，对齐 Semi IconConfig（convertIcon(config, 'config')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { configSvg } from './svgs.js';

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

<Icon svg={configSvg} type="config" {...rest} />
