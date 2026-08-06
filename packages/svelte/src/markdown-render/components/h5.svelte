<!--
  h5 — MarkdownRender 默认 h5 覆盖（严格对齐 Semi markdownRender/components/h5.tsx）。
  Semi：<Typography.Title heading={5} className="semi-markdownRender-component-header" {...props}/>。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { Title } from '../../typography/index.js';

  interface Props {
    children?: Snippet;
    [key: string]: unknown;
  }

  let { children, ...rest }: Props = $props();
</script>

<Title heading={5} class="cd-markdown-render-component-header" {...rest}>
  {#if children}{@render children()}{/if}
</Title>
