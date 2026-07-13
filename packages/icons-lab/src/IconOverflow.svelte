<!-- IconOverflow — 具名图标，对齐 Semi IconOverflow（convertIcon(overflow, 'overflow')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { overflowSvg } from './svgs.js';

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

<Icon svg={overflowSvg} type="overflow" {...rest} />
