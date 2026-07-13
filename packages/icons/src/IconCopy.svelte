<!-- IconCopy — 具名图标，对齐 Semi IconCopy（convertIcon(copy, 'copy')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { copySvg } from './svgs.js';

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

<Icon svg={copySvg} type="copy" {...rest} />
