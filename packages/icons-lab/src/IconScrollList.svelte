<!-- IconScrollList — 具名图标，对齐 Semi IconScrollList（convertIcon(scroll-list, 'scroll-list')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { scrollListSvg } from './svgs.js';

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

<Icon svg={scrollListSvg} type="scroll-list" {...rest} />
