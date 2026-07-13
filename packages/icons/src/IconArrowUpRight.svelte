<!-- IconArrowUpRight — 具名图标，对齐 Semi IconArrowUpRight（convertIcon(arrow_up_right, 'arrow_up_right')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { arrowUpRightSvg } from './svgs.js';

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

<Icon svg={arrowUpRightSvg} type="arrow_up_right" {...rest} />
