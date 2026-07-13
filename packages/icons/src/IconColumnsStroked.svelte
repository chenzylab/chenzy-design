<!-- IconColumnsStroked — 具名图标，对齐 Semi IconColumnsStroked（convertIcon(columns_stroked, 'columns_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { columnsStrokedSvg } from './svgs.js';

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

<Icon svg={columnsStrokedSvg} type="columns_stroked" {...rest} />
