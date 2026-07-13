<!-- IconArrowDownRight — 具名图标，对齐 Semi IconArrowDownRight（convertIcon(arrow_down_right, 'arrow_down_right')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { arrowDownRightSvg } from './svgs.js';

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

<Icon svg={arrowDownRightSvg} type="arrow_down_right" {...rest} />
