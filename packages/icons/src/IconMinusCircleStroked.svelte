<!-- IconMinusCircleStroked — 具名图标，对齐 Semi IconMinusCircleStroked（convertIcon(minus_circle_stroked, 'minus_circle_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { minusCircleStrokedSvg } from './svgs.js';

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

<Icon svg={minusCircleStrokedSvg} type="minus_circle_stroked" {...rest} />
