<!-- IconCollapse — 具名图标，对齐 Semi IconCollapse（convertIcon(collapse, 'collapse')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { collapseSvg } from './svgs.js';

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

<Icon svg={collapseSvg} type="collapse" {...rest} />
