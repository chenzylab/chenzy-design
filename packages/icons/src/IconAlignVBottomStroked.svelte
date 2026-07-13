<!-- IconAlignVBottomStroked — 具名图标，对齐 Semi IconAlignVBottomStroked（convertIcon(align_v_bottom_stroked, 'align_v_bottom_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { alignVBottomStrokedSvg } from './svgs.js';

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

<Icon svg={alignVBottomStrokedSvg} type="align_v_bottom_stroked" {...rest} />
