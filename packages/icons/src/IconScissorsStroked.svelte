<!-- IconScissorsStroked — 具名图标，对齐 Semi IconScissorsStroked（convertIcon(scissors_stroked, 'scissors_stroked')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { scissorsStrokedSvg } from './svgs.js';

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

<Icon svg={scissorsStrokedSvg} type="scissors_stroked" {...rest} />
