<!-- IconCrossStroked — 具名图标，对齐 Semi IconCrossStroked（convertIcon(cross_stroked, 'cross_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { crossStrokedSvg } from './svgs.js';

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

<Icon svg={crossStrokedSvg} type="cross_stroked" {...rest} />
