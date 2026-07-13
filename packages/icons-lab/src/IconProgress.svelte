<!-- IconProgress — 具名图标，对齐 Semi IconProgress（convertIcon(progress, 'progress')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { progressSvg } from './svgs.js';

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

<Icon svg={progressSvg} type="progress" {...rest} />
