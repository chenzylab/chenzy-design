<!-- IconMarginLeftStroked — 具名图标，对齐 Semi IconMarginLeftStroked（convertIcon(margin_left_stroked, 'margin_left_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { marginLeftStrokedSvg } from './svgs.js';

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

<Icon svg={marginLeftStrokedSvg} type="margin_left_stroked" {...rest} />
