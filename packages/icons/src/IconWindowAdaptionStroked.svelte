<!-- IconWindowAdaptionStroked — 具名图标，对齐 Semi IconWindowAdaptionStroked（convertIcon(window_adaption_stroked, 'window_adaption_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { windowAdaptionStrokedSvg } from './svgs.js';

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

<Icon svg={windowAdaptionStrokedSvg} type="window_adaption_stroked" {...rest} />
