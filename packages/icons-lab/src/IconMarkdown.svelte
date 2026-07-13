<!-- IconMarkdown — 具名图标，对齐 Semi IconMarkdown（convertIcon(markdown, 'markdown')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { markdownSvg } from './svgs.js';

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

<Icon svg={markdownSvg} type="markdown" {...rest} />
