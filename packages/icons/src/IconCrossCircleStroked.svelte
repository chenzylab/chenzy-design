<!-- IconCrossCircleStroked — 具名图标，对齐 Semi IconCrossCircleStroked（convertIcon(cross_circle_stroked, 'cross_circle_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { crossCircleStrokedSvg } from './svgs.js';

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

<Icon svg={crossCircleStrokedSvg} type="cross_circle_stroked" {...rest} />
