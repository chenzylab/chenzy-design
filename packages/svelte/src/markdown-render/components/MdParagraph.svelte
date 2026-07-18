<!--
  MdParagraph — MarkdownRender 默认 p 覆盖（严格对齐 Semi markdownRender components/p.tsx）。
  Semi：<Typography.Paragraph className="semi-markdownRender-component-p" />。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { Paragraph } from '../../typography/index.js';

  interface Props {
    children?: Snippet;
    [key: string]: unknown;
  }

  let { children }: Props = $props();
</script>

<Paragraph class="cd-markdown-render-component-p">
  {#if children}{@render children()}{/if}
</Paragraph>
