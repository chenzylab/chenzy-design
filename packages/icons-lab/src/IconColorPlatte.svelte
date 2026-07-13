<!-- IconColorPlatte — 具名图标，对齐 Semi IconColorPlatte（convertIcon(color-platte, 'color-platte')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { colorPlatteSvg } from './svgs.js';

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

<Icon svg={colorPlatteSvg} type="color-platte" {...rest} />
