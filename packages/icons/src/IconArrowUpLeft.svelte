<!-- IconArrowUpLeft — 具名图标，对齐 Semi IconArrowUpLeft（convertIcon(arrow_up_left, 'arrow_up_left')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { arrowUpLeftSvg } from './svgs.js';

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

<Icon svg={arrowUpLeftSvg} type="arrow_up_left" {...rest} />
