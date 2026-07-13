<!-- IconTransparentStroked — 具名图标，对齐 Semi IconTransparentStroked（convertIcon(transparent_stroked, 'transparent_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { transparentStrokedSvg } from './svgs.js';

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

<Icon svg={transparentStrokedSvg} type="transparent_stroked" {...rest} />
