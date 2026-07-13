<!-- IconArrowDownLeft — 具名图标，对齐 Semi IconArrowDownLeft（convertIcon(arrow_down_left, 'arrow_down_left')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { arrowDownLeftSvg } from './svgs.js';

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

<Icon svg={arrowDownLeftSvg} type="arrow_down_left" {...rest} />
