<!-- IconButton — 具名图标，对齐 Semi IconButton（convertIcon(button, 'button')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { buttonSvg } from './svgs.js';

  interface Props {
    size?: IconSize;
    spin?: boolean;
    rotate?: number;
    class?: string;
    style?: string;
    [key: string]: unknown;
  }
  let { ...rest }: Props = $props();
</script>

<Icon svg={buttonSvg} type="button" {...rest} />
