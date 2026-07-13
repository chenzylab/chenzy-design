<!-- IconLayout — 具名图标，对齐 Semi IconLayout（convertIcon(layout, 'layout')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { layoutSvg } from './svgs.js';

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

<Icon svg={layoutSvg} type="layout" {...rest} />
