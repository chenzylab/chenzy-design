<!--
  code — MarkdownRender 默认 code 覆盖（严格对齐 Semi markdownRender/components/code.tsx）。
  Semi 用同一个组件处理行内 code 与围栏代码块（remark-rehype 产出 <pre><code class="language-x">...）：
  - 有 language-* 类名 → <CodeHighlight code language lineNumber />（作为块级内容，嵌套在原生 <pre> 内）。
  - 无 → <span class="semi-markdownRender-simple-code">{children}</span>（行内 code 与无语言围栏代码块共用此分支）。
  language 解析见 code-lang.ts（严格复刻 Semi nth(className.split('-'), -1) 行为）。
  注：本组件不覆盖 pre 键——Semi 的 SemiMarkdownComponents 没有 pre 键，MDX 里 pre 保持原生标签，
  围栏代码块的最终 DOM 是 <pre><CodeHighlight 内容/></pre>（外层原生 pre 保留，而非被替换）。
  本组件被 chat/ChatCode.svelte、ai-chat-dialogue/DialogueCode.svelte 复用（对齐 Semi chat/code.tsx、
  aiChatDialogue/code.tsx 都调用 markdownRender 的 code(props) 渲染核心内容，外层按 language 有无包 topSlot）。
-->
<script lang="ts">
  import type { Element, ElementContent } from 'hast';
  import { CodeHighlight } from '../../code-highlight/index.js';
  import { getCodeLanguage } from './code-lang.js';

  interface Props {
    node?: Element;
    [key: string]: unknown;
  }

  let { node }: Props = $props();

  function extractText(el: ElementContent): string {
    if (el.type === 'text') return el.value;
    if (el.type === 'element' && el.children) {
      return el.children.map((c: ElementContent) => extractText(c)).join('');
    }
    return '';
  }
  const code = $derived(node ? node.children.map((c) => extractText(c)).join('') : '');
  const language = $derived(getCodeLanguage(node));
</script>

{#if language}
  <CodeHighlight {code} {language} lineNumber />
{:else}
  <span class="cd-markdown-render-simple-code">{code}</span>
{/if}
