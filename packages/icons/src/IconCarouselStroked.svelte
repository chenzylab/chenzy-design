<!-- IconCarouselStroked — 具名图标，对齐 Semi IconCarouselStroked（convertIcon(carousel_stroked, 'carousel_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { carouselStrokedSvg } from './svgs.js';

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

<Icon svg={carouselStrokedSvg} type="carousel_stroked" {...rest} />
