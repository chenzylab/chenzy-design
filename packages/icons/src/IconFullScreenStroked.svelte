<!-- IconFullScreenStroked — 具名图标，对齐 Semi IconFullScreenStroked（convertIcon(full_screen_stroked, 'full_screen_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { fullScreenStrokedSvg } from './svgs.js';

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

<Icon svg={fullScreenStrokedSvg} type="full_screen_stroked" {...rest} />
