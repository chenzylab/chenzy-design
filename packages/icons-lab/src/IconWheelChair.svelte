<!-- IconWheelChair — 具名图标，对齐 Semi IconWheelChair（convertIcon(wheel-chair, 'wheel-chair')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { wheelChairSvg } from './svgs.js';

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

<Icon svg={wheelChairSvg} type="wheel-chair" {...rest} />
