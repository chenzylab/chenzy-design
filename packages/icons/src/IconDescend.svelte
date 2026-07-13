<!-- IconDescend — 具名图标，对齐 Semi IconDescend（convertIcon(descend, 'descend')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { descendSvg } from './svgs.js';

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

<Icon svg={descendSvg} type="descend" {...rest} />
