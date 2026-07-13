<!-- IconTimeline — 具名图标，对齐 Semi IconTimeline（convertIcon(timeline, 'timeline')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { timelineSvg } from './svgs.js';

  interface Props {
    size?: IconSize;
    spin?: boolean;
    rotate?: number;
    class?: string;
    style?: string;
    [key: string]: unknown;
  }
  let { ...rest }: Props = $props();
</script>

<Icon svg={timelineSvg} type="timeline" {...rest} />
