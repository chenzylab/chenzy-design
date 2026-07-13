<!-- IconBanner — 具名图标，对齐 Semi IconBanner（convertIcon(banner, 'banner')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { bannerSvg } from './svgs.js';

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

<Icon svg={bannerSvg} type="banner" {...rest} />
