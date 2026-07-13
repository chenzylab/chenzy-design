<!-- IconFilledArrowUp — 具名图标，对齐 Semi IconFilledArrowUp（convertIcon(filled_arrow_up, 'filled_arrow_up')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { filledArrowUpSvg } from './svgs.js';

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

<Icon svg={filledArrowUpSvg} type="filled_arrow_up" {...rest} />
