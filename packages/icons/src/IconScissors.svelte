<!-- IconScissors — 具名图标，对齐 Semi IconScissors（convertIcon(scissors, 'scissors')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { scissorsSvg } from './svgs.js';

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

<Icon svg={scissorsSvg} type="scissors" {...rest} />
