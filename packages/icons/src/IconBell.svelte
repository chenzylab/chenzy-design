<!-- IconBell — 具名图标，对齐 Semi IconBell（convertIcon(bell, 'bell')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { bellSvg } from './svgs.js';

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

<Icon svg={bellSvg} type="bell" {...rest} />
