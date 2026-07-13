<!-- IconArticle — 具名图标，对齐 Semi IconArticle（convertIcon(article, 'article')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { articleSvg } from './svgs.js';

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

<Icon svg={articleSvg} type="article" {...rest} />
