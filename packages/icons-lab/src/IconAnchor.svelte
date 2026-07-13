<!-- IconAnchor — 具名图标，对齐 Semi IconAnchor（convertIcon(anchor, 'anchor')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { anchorSvg } from './svgs.js';

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

<Icon svg={anchorSvg} type="anchor" {...rest} />
