<!-- IconCopyStroked — 具名图标，对齐 Semi IconCopyStroked（convertIcon(copy_stroked, 'copy_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { copyStrokedSvg } from './svgs.js';

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

<Icon svg={copyStrokedSvg} type="copy_stroked" {...rest} />
