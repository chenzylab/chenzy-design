<!-- IconDeleteStroked — 具名图标，对齐 Semi IconDeleteStroked（convertIcon(delete_stroked, 'delete_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { deleteStrokedSvg } from './svgs.js';

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

<Icon svg={deleteStrokedSvg} type="delete_stroked" {...rest} />
