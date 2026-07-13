<!-- IconPlusStroked — 具名图标，对齐 Semi IconPlusStroked（convertIcon(plus_stroked, 'plus_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { plusStrokedSvg } from './svgs.js';

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

<Icon svg={plusStrokedSvg} type="plus_stroked" {...rest} />
