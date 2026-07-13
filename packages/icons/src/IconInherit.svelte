<!-- IconInherit — 具名图标，对齐 Semi IconInherit（convertIcon(inherit, 'inherit')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { inheritSvg } from './svgs.js';

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

<Icon svg={inheritSvg} type="inherit" {...rest} />
