<!-- IconAlignHLeftStroked — 具名图标，对齐 Semi IconAlignHLeftStroked（convertIcon(align_h_left_stroked, 'align_h_left_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { alignHLeftStrokedSvg } from './svgs.js';

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

<Icon svg={alignHLeftStrokedSvg} type="align_h_left_stroked" {...rest} />
