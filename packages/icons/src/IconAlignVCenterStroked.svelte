<!-- IconAlignVCenterStroked — 具名图标，对齐 Semi IconAlignVCenterStroked（convertIcon(align_v_center_stroked, 'align_v_center_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { alignVCenterStrokedSvg } from './svgs.js';

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

<Icon svg={alignVCenterStrokedSvg} type="align_v_center_stroked" {...rest} />
