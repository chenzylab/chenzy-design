<!-- IconCustomize — 具名图标，对齐 Semi IconCustomize（convertIcon(customize, 'customize')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { customizeSvg } from './svgs.js';

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

<Icon svg={customizeSvg} type="customize" {...rest} />
