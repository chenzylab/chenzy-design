<!--
  CodeBlock — MarkdownRender 默认 `pre` 覆盖：代码块渲染。

  优先交给 CodeHighlight（另一 agent 并行实现，packages/svelte/src/code-highlight/，导出 CodeHighlight）。
  降级：CodeHighlight 尚未合并 / 加载失败时，退化为纯 <pre><code class="language-x">。

  加载策略：模块级动态 import 惰性探测 CodeHighlight，避免尚未存在时构建/类型报错，
  也避免把高亮器打进主 chunk。探测结果写 $state 触发渲染切换。

  数据来源：接收 hast `pre` 元素 node，从其唯一 `code` 子节点提取纯文本代码与 language-* 类名。
-->
<script lang="ts">
  import type { Element, ElementContent } from 'hast';
  import { loadCodeHighlight } from './code-highlight-loader.js';

  interface Props {
    /** hast `pre` 元素（由 HastNode 透传）。 */
    node?: Element;
    [key: string]: unknown;
  }

  let { node }: Props = $props();

  // 从 <pre> 的 <code> 子节点提取纯文本与语言。
  function extractCodeText(el: ElementContent): string {
    if (el.type === 'text') return el.value;
    if (el.type === 'element' && el.children) {
      return el.children.map((c: ElementContent) => extractCodeText(c)).join('');
    }
    return '';
  }

  const codeEl = $derived(
    node?.children?.find(
      (c: ElementContent): c is Element => c.type === 'element' && c.tagName === 'code',
    ),
  );

  const code = $derived(codeEl ? extractCodeText(codeEl) : '');

  const language = $derived.by(() => {
    const cn = codeEl?.properties?.className;
    const classes = Array.isArray(cn) ? cn.map(String) : cn ? [String(cn)] : [];
    const langClass = classes.find((c) => c.startsWith('language-'));
    return langClass ? langClass.slice('language-'.length) : undefined;
  });

  // 惰性探测 CodeHighlight（存在则用，否则降级）。undefined = 未决 / 加载中。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let HighlightComp = $state<any>(undefined);
  let resolved = $state(false);

  $effect(() => {
    let stale = false;
    void loadCodeHighlight().then((comp) => {
      if (stale) return;
      HighlightComp = comp;
      resolved = true;
    });
    return () => {
      stale = true;
    };
  });
</script>

{#if resolved && HighlightComp}
  {@const Comp = HighlightComp}
  <Comp {code} {language} />
{:else}
  <!-- 降级：纯 <pre><code>（保留 language-* 类名供外部样式/后续增强） -->
  <pre><code class={language ? `language-${language}` : undefined}>{code}</code></pre>
{/if}
