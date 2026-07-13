<!-- IconShrinkScreenStroked — 具名图标，对齐 Semi IconShrinkScreenStroked（convertIcon(shrink_screen_stroked, 'shrink_screen_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { shrinkScreenStrokedSvg } from './svgs.js';

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

<Icon svg={shrinkScreenStrokedSvg} type="shrink_screen_stroked" {...rest} />
