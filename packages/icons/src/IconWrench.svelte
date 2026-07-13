<!-- IconWrench — 具名图标，对齐 Semi IconWrench（convertIcon(wrench, 'wrench')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { wrenchSvg } from './svgs.js';

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

<Icon svg={wrenchSvg} type="wrench" {...rest} />
