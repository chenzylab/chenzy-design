<!-- IconListView — 具名图标，对齐 Semi IconListView（convertIcon(list_view, 'list_view')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { listViewSvg } from './svgs.js';

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

<Icon svg={listViewSvg} type="list_view" {...rest} />
