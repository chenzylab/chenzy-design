<!-- IconRowsStroked — 具名图标，对齐 Semi IconRowsStroked（convertIcon(rows_stroked, 'rows_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { rowsStrokedSvg } from './svgs.js';

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

<Icon svg={rowsStrokedSvg} type="rows_stroked" {...rest} />
