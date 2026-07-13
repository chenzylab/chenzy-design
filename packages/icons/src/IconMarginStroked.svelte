<!-- IconMarginStroked — 具名图标，对齐 Semi IconMarginStroked（convertIcon(margin_stroked, 'margin_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { marginStrokedSvg } from './svgs.js';

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

<Icon svg={marginStrokedSvg} type="margin_stroked" {...rest} />
