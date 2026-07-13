<!-- IconTemplate — 具名图标，对齐 Semi IconTemplate（convertIcon(template, 'template')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { templateSvg } from './svgs.js';

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

<Icon svg={templateSvg} type="template" {...rest} />
