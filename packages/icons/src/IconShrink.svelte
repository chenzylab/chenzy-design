<!-- IconShrink — 具名图标，对齐 Semi IconShrink（convertIcon(shrink, 'shrink')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { shrinkSvg } from './svgs.js';

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

<Icon svg={shrinkSvg} type="shrink" {...rest} />
