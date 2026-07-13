<!-- IconBadgeStar — 具名图标，对齐 Semi IconBadgeStar（convertIcon(badge-star, 'badge-star')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { badgeStarSvg } from './svgs.js';

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

<Icon svg={badgeStarSvg} type="badge-star" {...rest} />
