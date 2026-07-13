<!-- IconTvCheckedStroked — 具名图标，对齐 Semi IconTvCheckedStroked（convertIcon(tv_checked_stroked, 'tv_checked_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { tvCheckedStrokedSvg } from './svgs.js';

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

<Icon svg={tvCheckedStrokedSvg} type="tv_checked_stroked" {...rest} />
