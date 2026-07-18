<!--
  MdPre — MarkdownRender 围栏代码块覆盖（对齐 Semi code.tsx 有语言分支）。
  拦截 pre 键：从 pre > code 提取纯文本与 language-<lang> 类名。
  - 有语言 → <CodeHighlight code language lineNumber />（对齐链 chat→markdown→codeHighlight，
    lineNumber=true / defaultTheme 取 CodeHighlight 默认 true，与 Semi 一致）。
  - 无语言 → 纯 <pre><code>（保留结构，无高亮）。
  注：Semi 靠 MDX 把 fenced code 扁平成 code 元素后注册 code 键；本库标准 remark-rehype
  产出 pre>code，故拦截 pre 键达到同样「CodeHighlight 作为块级、无嵌套」的结果。
-->
<script lang="ts">
  import type { Element, ElementContent } from 'hast';
  import { CodeHighlight } from '../../code-highlight/index.js';

  interface Props {
    node?: Element;
    [key: string]: unknown;
  }

  let { node }: Props = $props();

  const codeEl = $derived(
    node?.children?.find(
      (c: ElementContent): c is Element => c.type === 'element' && c.tagName === 'code',
    ),
  );

  function extractText(el: ElementContent): string {
    if (el.type === 'text') return el.value;
    if (el.type === 'element' && el.children) {
      return el.children.map((c: ElementContent) => extractText(c)).join('');
    }
    return '';
  }
  const code = $derived(codeEl ? extractText(codeEl) : '');

  const language = $derived.by(() => {
    const cn = codeEl?.properties?.className;
    const classes = Array.isArray(cn) ? cn.map(String) : cn ? [String(cn)] : [];
    const langClass = classes.find((c) => c.startsWith('language-'));
    return langClass ? langClass.slice('language-'.length) : undefined;
  });
</script>

{#if language}
  <CodeHighlight {code} {language} lineNumber />
{:else}
  <pre><code>{code}</code></pre>
{/if}
