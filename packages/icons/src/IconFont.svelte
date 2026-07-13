<!-- IconFont — 具名图标，对齐 Semi IconFont（convertIcon(font, 'font')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { fontSvg } from './svgs.js';

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

<Icon svg={fontSvg} type="font" {...rest} />
