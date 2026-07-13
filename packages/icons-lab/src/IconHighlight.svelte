<!-- IconHighlight — 具名图标，对齐 Semi IconHighlight（convertIcon(highlight, 'highlight')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { highlightSvg } from './svgs.js';

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

<Icon svg={highlightSvg} type="highlight" {...rest} />
