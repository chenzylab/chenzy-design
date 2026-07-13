<!-- IconStopwatchStroked — 具名图标，对齐 Semi IconStopwatchStroked（convertIcon(stopwatch_stroked, 'stopwatch_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { stopwatchStrokedSvg } from './svgs.js';

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

<Icon svg={stopwatchStrokedSvg} type="stopwatch_stroked" {...rest} />
