<!-- IconTopRightStroked — 具名图标，对齐 Semi IconTopRightStroked（convertIcon(top_right_stroked, 'top_right_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { topRightStrokedSvg } from './svgs.js';

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

<Icon svg={topRightStrokedSvg} type="top_right_stroked" {...rest} />
