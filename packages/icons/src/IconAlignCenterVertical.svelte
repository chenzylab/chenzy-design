<!-- IconAlignCenterVertical — 具名图标，对齐 Semi IconAlignCenterVertical（convertIcon(align_center_vertical, 'align_center_vertical')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { alignCenterVerticalSvg } from './svgs.js';

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

<Icon svg={alignCenterVerticalSvg} type="align_center_vertical" {...rest} />
