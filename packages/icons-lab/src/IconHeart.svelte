<!-- IconHeart — 具名图标，对齐 Semi IconHeart（convertIcon(heart, 'heart')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { heartSvg } from './svgs.js';

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

<Icon svg={heartSvg} type="heart" {...rest} />
