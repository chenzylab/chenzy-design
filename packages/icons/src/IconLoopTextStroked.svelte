<!-- IconLoopTextStroked — 具名图标，对齐 Semi IconLoopTextStroked（convertIcon(loop_text_stroked, 'loop_text_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { loopTextStrokedSvg } from './svgs.js';

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

<Icon svg={loopTextStrokedSvg} type="loop_text_stroked" {...rest} />
