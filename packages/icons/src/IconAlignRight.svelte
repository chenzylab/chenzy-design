<!-- IconAlignRight — 具名图标，对齐 Semi IconAlignRight（convertIcon(align_right, 'align_right')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { alignRightSvg } from './svgs.js';

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

<Icon svg={alignRightSvg} type="align_right" {...rest} />
