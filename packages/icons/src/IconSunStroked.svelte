<!-- IconSunStroked — 具名图标，对齐 Semi IconSunStroked（convertIcon(sun_stroked, 'sun_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { sunStrokedSvg } from './svgs.js';

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

<Icon svg={sunStrokedSvg} type="sun_stroked" {...rest} />
