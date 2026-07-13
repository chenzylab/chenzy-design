<!-- IconPlusCircleStroked — 具名图标，对齐 Semi IconPlusCircleStroked（convertIcon(plus_circle_stroked, 'plus_circle_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { plusCircleStrokedSvg } from './svgs.js';

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

<Icon svg={plusCircleStrokedSvg} type="plus_circle_stroked" {...rest} />
