<!-- IconRealSize — 具名图标，对齐 Semi IconRealSize（convertIcon(real_size, 'real_size')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { realSizeSvg } from './svgs.js';

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

<Icon svg={realSizeSvg} type="real_size" {...rest} />
