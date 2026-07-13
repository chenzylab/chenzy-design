<!-- IconAlignVTopStroked — 具名图标，对齐 Semi IconAlignVTopStroked（convertIcon(align_v_top_stroked, 'align_v_top_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { alignVTopStrokedSvg } from './svgs.js';

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

<Icon svg={alignVTopStrokedSvg} type="align_v_top_stroked" {...rest} />
