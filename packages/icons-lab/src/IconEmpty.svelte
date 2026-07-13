<!-- IconEmpty — 具名图标，对齐 Semi IconEmpty（convertIcon(empty, 'empty')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { emptySvg } from './svgs.js';

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

<Icon svg={emptySvg} type="empty" {...rest} />
