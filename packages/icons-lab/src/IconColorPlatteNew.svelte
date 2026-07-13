<!-- IconColorPlatteNew — 具名图标，对齐 Semi IconColorPlatteNew（convertIcon(color-platte-new, 'color-platte-new')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { colorPlatteNewSvg } from './svgs.js';

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

<Icon svg={colorPlatteNewSvg} type="color-platte-new" {...rest} />
