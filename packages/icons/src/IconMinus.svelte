<!-- IconMinus — 具名图标，对齐 Semi IconMinus（convertIcon(minus, 'minus')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { minusSvg } from './svgs.js';

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

<Icon svg={minusSvg} type="minus" {...rest} />
