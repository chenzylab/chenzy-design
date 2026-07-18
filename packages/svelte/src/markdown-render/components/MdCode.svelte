<!--
  MdCode — MarkdownRender 行内 code 覆盖（对齐 Semi code.tsx 无语言分支）。
  行内 code（无 language className）→ <span class="cd-markdown-render-simple-code">。
  围栏代码块（pre>code）由 MdPre 拦截 pre 键处理（渲染 CodeHighlight），不走这里，
  避免 pre>div(CodeHighlight) 的无效 HTML 嵌套（Semi 靠 MDX 扁平化 pre 达到同样效果）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    children?: Snippet;
    [key: string]: unknown;
  }

  let { children }: Props = $props();
</script>

<span class="cd-markdown-render-simple-code">
  {#if children}{@render children()}{/if}
</span>
