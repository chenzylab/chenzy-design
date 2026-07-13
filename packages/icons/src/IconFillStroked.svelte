<!-- IconFillStroked — 具名图标，对齐 Semi IconFillStroked（convertIcon(fill_stroked, 'fill_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { fillStrokedSvg } from './svgs.js';

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

<Icon svg={fillStrokedSvg} type="fill_stroked" {...rest} />
