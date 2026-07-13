<!-- IconLineHeight — 具名图标，对齐 Semi IconLineHeight（convertIcon(line_height, 'line_height')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { lineHeightSvg } from './svgs.js';

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

<Icon svg={lineHeightSvg} type="line_height" {...rest} />
