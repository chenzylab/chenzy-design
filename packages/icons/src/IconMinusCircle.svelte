<!-- IconMinusCircle — 具名图标，对齐 Semi IconMinusCircle（convertIcon(minus_circle, 'minus_circle')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { minusCircleSvg } from './svgs.js';

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

<Icon svg={minusCircleSvg} type="minus_circle" {...rest} />
