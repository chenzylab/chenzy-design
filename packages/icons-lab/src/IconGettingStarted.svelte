<!-- IconGettingStarted — 具名图标，对齐 Semi IconGettingStarted（convertIcon(getting-started, 'getting-started')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { gettingStartedSvg } from './svgs.js';

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

<Icon svg={gettingStartedSvg} type="getting-started" {...rest} />
