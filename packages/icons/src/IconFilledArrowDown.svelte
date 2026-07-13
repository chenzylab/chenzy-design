<!-- IconFilledArrowDown — 具名图标，对齐 Semi IconFilledArrowDown（convertIcon(filled_arrow_down, 'filled_arrow_down')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { filledArrowDownSvg } from './svgs.js';

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

<Icon svg={filledArrowDownSvg} type="filled_arrow_down" {...rest} />
