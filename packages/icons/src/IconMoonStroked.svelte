<!-- IconMoonStroked — 具名图标，对齐 Semi IconMoonStroked（convertIcon(moon_stroked, 'moon_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { moonStrokedSvg } from './svgs.js';

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

<Icon svg={moonStrokedSvg} type="moon_stroked" {...rest} />
