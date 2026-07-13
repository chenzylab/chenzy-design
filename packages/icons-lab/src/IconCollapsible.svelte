<!-- IconCollapsible — 具名图标，对齐 Semi IconCollapsible（convertIcon(collapsible, 'collapsible')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { collapsibleSvg } from './svgs.js';

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

<Icon svg={collapsibleSvg} type="collapsible" {...rest} />
