<!-- IconShareStroked — 具名图标，对齐 Semi IconShareStroked（convertIcon(share_stroked, 'share_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { shareStrokedSvg } from './svgs.js';

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

<Icon svg={shareStrokedSvg} type="share_stroked" {...rest} />
