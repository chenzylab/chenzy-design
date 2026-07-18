<!--
  MdHeading — MarkdownRender 默认 h1-h6 覆盖（严格对齐 Semi markdownRender components/h1-h6.tsx）。
  Semi：<Typography.Title heading={n} className="semi-markdownRender-component-header" />。
  本组件按 hast 节点 tagName（h1..h6）推断 heading 级别，注册到 h1-h6 全部键。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { Element } from 'hast';
  import { Title } from '../../typography/index.js';

  interface Props {
    node?: Element;
    children?: Snippet;
    [key: string]: unknown;
  }

  let { node, children }: Props = $props();

  // 从 tagName（h1..h6）取级别，缺省 1。
  const heading = $derived.by(() => {
    const t = node?.tagName ?? 'h1';
    const n = Number(t.slice(1));
    return (n >= 1 && n <= 6 ? n : 1) as 1 | 2 | 3 | 4 | 5 | 6;
  });
</script>

<Title {heading} class="cd-markdown-render-component-header">
  {#if children}{@render children()}{/if}
</Title>
