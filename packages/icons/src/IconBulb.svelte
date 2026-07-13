<!-- IconBulb — 具名图标，对齐 Semi IconBulb（convertIcon(bulb, 'bulb')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { bulbSvg } from './svgs.js';

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

<Icon svg={bulbSvg} type="bulb" {...rest} />
