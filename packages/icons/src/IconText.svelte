<!-- IconText — 具名图标，对齐 Semi IconText（convertIcon(text, 'text')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { textSvg } from './svgs.js';

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

<Icon svg={textSvg} type="text" {...rest} />
