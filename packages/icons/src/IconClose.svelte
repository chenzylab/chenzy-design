<!-- IconClose — 具名图标，对齐 Semi IconClose（convertIcon(close, 'close')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { closeSvg } from './svgs.js';

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

<Icon svg={closeSvg} type="close" {...rest} />
