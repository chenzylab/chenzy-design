<!-- IconLeftCircleStroked — 具名图标，对齐 Semi IconLeftCircleStroked（convertIcon(left_circle_stroked, 'left_circle_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { leftCircleStrokedSvg } from './svgs.js';

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

<Icon svg={leftCircleStrokedSvg} type="left_circle_stroked" {...rest} />
