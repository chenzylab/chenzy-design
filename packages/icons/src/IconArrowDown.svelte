<!-- IconArrowDown — 具名图标，对齐 Semi IconArrowDown（convertIcon(arrow_down, 'arrow_down')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { arrowDownSvg } from './svgs.js';

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

<Icon svg={arrowDownSvg} type="arrow_down" {...rest} />
