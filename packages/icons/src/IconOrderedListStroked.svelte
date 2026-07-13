<!-- IconOrderedListStroked — 具名图标，对齐 Semi IconOrderedListStroked（convertIcon(ordered_list_stroked, 'ordered_list_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { orderedListStrokedSvg } from './svgs.js';

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

<Icon svg={orderedListStrokedSvg} type="ordered_list_stroked" {...rest} />
