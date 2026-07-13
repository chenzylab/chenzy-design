<!-- IconInstagram — 具名图标，对齐 Semi IconInstagram（convertIcon(instagram, 'instagram')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { instagramSvg } from './svgs.js';

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

<Icon svg={instagramSvg} type="instagram" {...rest} />
