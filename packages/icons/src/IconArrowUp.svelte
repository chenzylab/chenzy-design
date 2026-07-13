<!-- IconArrowUp — 具名图标，对齐 Semi IconArrowUp（convertIcon(arrow_up, 'arrow_up')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { arrowUpSvg } from './svgs.js';

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

<Icon svg={arrowUpSvg} type="arrow_up" {...rest} />
