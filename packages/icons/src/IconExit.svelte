<!-- IconExit — 具名图标，对齐 Semi IconExit（convertIcon(exit, 'exit')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { exitSvg } from './svgs.js';

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

<Icon svg={exitSvg} type="exit" {...rest} />
