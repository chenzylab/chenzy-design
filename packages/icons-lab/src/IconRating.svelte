<!-- IconRating — 具名图标，对齐 Semi IconRating（convertIcon(rating, 'rating')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { ratingSvg } from './svgs.js';

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

<Icon svg={ratingSvg} type="rating" {...rest} />
