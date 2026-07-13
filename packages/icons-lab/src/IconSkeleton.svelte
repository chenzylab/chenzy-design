<!-- IconSkeleton — 具名图标，对齐 Semi IconSkeleton（convertIcon(skeleton, 'skeleton')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { skeletonSvg } from './svgs.js';

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

<Icon svg={skeletonSvg} type="skeleton" {...rest} />
