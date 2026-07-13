<!-- IconMiniPlayer — 具名图标，对齐 Semi IconMiniPlayer（convertIcon(mini_player, 'mini_player')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { miniPlayerSvg } from './svgs.js';

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

<Icon svg={miniPlayerSvg} type="mini_player" {...rest} />
