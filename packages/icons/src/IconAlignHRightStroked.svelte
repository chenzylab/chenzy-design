<!-- IconAlignHRightStroked — 具名图标，对齐 Semi IconAlignHRightStroked（convertIcon(align_h_right_stroked, 'align_h_right_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { alignHRightStrokedSvg } from './svgs.js';

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

<Icon svg={alignHRightStrokedSvg} type="align_h_right_stroked" {...rest} />
