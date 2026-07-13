<!-- IconRoute — 具名图标，对齐 Semi IconRoute（convertIcon(route, 'route')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { routeSvg } from './svgs.js';

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

<Icon svg={routeSvg} type="route" {...rest} />
