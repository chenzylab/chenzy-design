<!-- IconColorPalette — 具名图标，对齐 Semi IconColorPalette（convertIcon(color_palette, 'color_palette')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { colorPaletteSvg } from './svgs.js';

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

<Icon svg={colorPaletteSvg} type="color_palette" {...rest} />
