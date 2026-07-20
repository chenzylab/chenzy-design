<!-- IconIcon — 具名图标，对齐 Semi 官网侧边栏（彩色专属插画）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { iconSvg } from './svgs.js';

  interface Props {
    size?: IconSize;
    spin?: boolean;
    rotate?: number;
    class?: string;
    style?: string;
    [key: string]: unknown;
  }
  let { ...rest }: Props = $props();
</script>

<Icon svg={iconSvg} type="icon" {...rest} />
