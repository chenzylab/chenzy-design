<!-- IconDownCircleStroked — 具名图标，对齐 Semi IconDownCircleStroked（convertIcon(down_circle_stroked, 'down_circle_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { downCircleStrokedSvg } from './svgs.js';

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

<Icon svg={downCircleStrokedSvg} type="down_circle_stroked" {...rest} />
