<!-- IconWebcomponents — 具名图标，对齐 Semi IconWebcomponents（convertIcon(webcomponents, 'webcomponents')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { webcomponentsSvg } from './svgs.js';

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

<Icon svg={webcomponentsSvg} type="webcomponents" {...rest} />
