<!-- IconStrikeThrough — 具名图标，对齐 Semi IconStrikeThrough（convertIcon(strike_through, 'strike_through')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { strikeThroughSvg } from './svgs.js';

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

<Icon svg={strikeThroughSvg} type="strike_through" {...rest} />
