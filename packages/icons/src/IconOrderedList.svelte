<!-- IconOrderedList — 具名图标，对齐 Semi IconOrderedList（convertIcon(ordered_list, 'ordered_list')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { orderedListSvg } from './svgs.js';

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

<Icon svg={orderedListSvg} type="ordered_list" {...rest} />
