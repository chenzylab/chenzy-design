<!-- IconCarousel — 具名图标，对齐 Semi IconCarousel（convertIcon(carousel, 'carousel')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { carouselSvg } from './svgs.js';

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

<Icon svg={carouselSvg} type="carousel" {...rest} />
