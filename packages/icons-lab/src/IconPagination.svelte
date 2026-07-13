<!-- IconPagination — 具名图标，对齐 Semi IconPagination（convertIcon(pagination, 'pagination')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { paginationSvg } from './svgs.js';

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

<Icon svg={paginationSvg} type="pagination" {...rest} />
