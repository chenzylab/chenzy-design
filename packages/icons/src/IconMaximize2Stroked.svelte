<!-- IconMaximize2Stroked — 具名图标，对齐 Semi IconMaximize2Stroked（convertIcon(maximize_2_stroked, 'maximize_2_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { maximize2StrokedSvg } from './svgs.js';

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

<Icon svg={maximize2StrokedSvg} type="maximize_2_stroked" {...rest} />
