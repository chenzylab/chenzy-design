<!-- IconDivider — 具名图标，对齐 Semi IconDivider（convertIcon(divider, 'divider')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { dividerSvg } from './svgs.js';

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

<Icon svg={dividerSvg} type="divider" {...rest} />
