<!-- IconAlignCenter — 具名图标，对齐 Semi IconAlignCenter（convertIcon(align_center, 'align_center')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { alignCenterSvg } from './svgs.js';

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

<Icon svg={alignCenterSvg} type="align_center" {...rest} />
