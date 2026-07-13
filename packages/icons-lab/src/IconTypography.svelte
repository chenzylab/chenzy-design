<!-- IconTypography — 具名图标，对齐 Semi IconTypography（convertIcon(typography, 'typography')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { typographySvg } from './svgs.js';

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

<Icon svg={typographySvg} type="typography" {...rest} />
