<!-- IconCodeHighlight — 具名图标，对齐 Semi IconCodeHighlight（convertIcon(code-highlight, 'code-highlight')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { codeHighlightSvg } from './svgs.js';

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

<Icon svg={codeHighlightSvg} type="code-highlight" {...rest} />
