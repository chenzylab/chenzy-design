<!--
  CodeHighlight — see specs/components/show/CodeHighlight.spec.md
  语法高亮展示：底层用 prismjs（对齐 Semi Design semi-foundation/codeHighlight）。
  class-name 解析（language-<lang> / line-numbers）为纯函数（@chenzy-design/core
  resolveCodeClassName）；渲染在 $effect 里对 <code> 元素设 class + textContent，
  再 Prism.highlightElement(el, false) 就地高亮 —— 只写纯文本节点，绝不 {@html}
  未处理内容，规避 XSS。语言包/行号插件按需 import（tree-shake 由使用方决定）。
  defaultTheme 开关控制是否套用内置（token 驱动）配色；长代码块可滚动，
  加 tabindex/role=region + i18n aria-label 供键盘 + AT 访问。
-->
<script lang="ts">
  import { resolveCodeClassName } from '@chenzy-design/core';
  import Prism from 'prismjs';
  import 'prismjs/plugins/line-numbers/prism-line-numbers.js';
  import { useLocale } from '../locale-provider/index.js';

  // Semi 对齐：手动高亮，禁止 Prism 自动扫描 DOM。
  Prism.manual = true;

  interface Props {
    /** 待高亮的源码（纯文本；作为 textContent 写入，不解析 HTML）。 */
    code?: string;
    /** Prism 语言 id，如 'js' | 'ts' | 'css' | 'markup'。 */
    language?: string;
    /** 是否显示行号（Prism line-numbers 插件）。 */
    lineNumber?: boolean;
    /** 是否套用内置默认主题（token 驱动配色）。关闭后仅结构，配色交给使用方。 */
    defaultTheme?: boolean;
    /** 根元素附加类名。 */
    class?: string;
    /** 根元素内联样式。 */
    style?: string;
  }

  let {
    code = '',
    language = 'markup',
    lineNumber = true,
    defaultTheme = true,
    class: className = '',
    style = '',
  }: Props = $props();

  const loc = useLocale();

  let codeEl: HTMLElement | undefined = $state();

  const rootClass = $derived(
    ['cd-code-highlight', defaultTheme && 'cd-code-highlight--theme', className]
      .filter(Boolean)
      .join(' '),
  );

  // 就地高亮：设置 language/line-numbers class → 写纯文本 → Prism 处理。
  // 依赖 code/language/lineNumber，任一变化即重跑（Prism 会重写 innerHTML，
  // 但输入始终是我们写入的 textContent，无 XSS 面）。
  $effect(() => {
    const el = codeEl;
    if (!el) return;
    // 显式读取以建立依赖，供 lint/可读性明确。
    const nextCode = code;
    const nextLang = language;
    const nextLineNumber = lineNumber;

    el.className = resolveCodeClassName('', nextLang, nextLineNumber);
    el.textContent = nextCode;
    Prism.highlightElement(el, false);
  });
</script>

<!-- tabindex=0 让长代码块可键盘滚动聚焦；role=region + aria-label 命名该滚动区（WCAG 2.1.1，对齐 Card/Carousel 既有做法）。 -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<pre
  class={rootClass}
  class:line-numbers={lineNumber}
  style={style || undefined}
  tabindex="0"
  role="region"
  aria-label={loc().t('CodeHighlight.codeBlock')}><code bind:this={codeEl}></code></pre>

<style>
  .cd-code-highlight {
    margin: 0;
    overflow: auto;
    padding: var(--cd-code-highlight-padding);
    border-radius: var(--cd-code-highlight-radius);
    background: var(--cd-code-highlight-bg);
    color: var(--cd-code-highlight-color);
    font-family: var(--cd-code-highlight-font-family);
    font-size: var(--cd-code-highlight-font-size);
    line-height: var(--cd-code-highlight-line-height);
    tab-size: 2;
  }

  .cd-code-highlight :global(code) {
    font-family: inherit;
    font-size: inherit;
    background: none;
    white-space: pre;
  }

  /* —— 默认主题：Prism token 分类 → chenzy token（无写死色值） —— */
  .cd-code-highlight--theme :global(.token.comment),
  .cd-code-highlight--theme :global(.token.prolog),
  .cd-code-highlight--theme :global(.token.doctype),
  .cd-code-highlight--theme :global(.token.cdata) {
    color: var(--cd-code-highlight-token-comment);
    font-style: italic;
  }

  .cd-code-highlight--theme :global(.token.punctuation) {
    color: var(--cd-code-highlight-token-punctuation);
  }

  .cd-code-highlight--theme :global(.token.property),
  .cd-code-highlight--theme :global(.token.tag),
  .cd-code-highlight--theme :global(.token.boolean),
  .cd-code-highlight--theme :global(.token.number),
  .cd-code-highlight--theme :global(.token.constant),
  .cd-code-highlight--theme :global(.token.symbol),
  .cd-code-highlight--theme :global(.token.deleted) {
    color: var(--cd-code-highlight-token-number);
  }

  .cd-code-highlight--theme :global(.token.selector),
  .cd-code-highlight--theme :global(.token.attr-name),
  .cd-code-highlight--theme :global(.token.string),
  .cd-code-highlight--theme :global(.token.char),
  .cd-code-highlight--theme :global(.token.builtin),
  .cd-code-highlight--theme :global(.token.inserted) {
    color: var(--cd-code-highlight-token-string);
  }

  .cd-code-highlight--theme :global(.token.operator),
  .cd-code-highlight--theme :global(.token.entity),
  .cd-code-highlight--theme :global(.token.url),
  .cd-code-highlight--theme :global(.language-css .token.string),
  .cd-code-highlight--theme :global(.style .token.string) {
    color: var(--cd-code-highlight-token-operator);
  }

  .cd-code-highlight--theme :global(.token.atrule),
  .cd-code-highlight--theme :global(.token.attr-value),
  .cd-code-highlight--theme :global(.token.keyword) {
    color: var(--cd-code-highlight-token-keyword);
  }

  .cd-code-highlight--theme :global(.token.function),
  .cd-code-highlight--theme :global(.token.class-name) {
    color: var(--cd-code-highlight-token-function);
  }

  .cd-code-highlight--theme :global(.token.regex),
  .cd-code-highlight--theme :global(.token.important),
  .cd-code-highlight--theme :global(.token.variable) {
    color: var(--cd-code-highlight-token-variable);
  }

  .cd-code-highlight--theme :global(.token.important),
  .cd-code-highlight--theme :global(.token.bold) {
    font-weight: var(--cd-code-highlight-token-bold-weight);
  }

  .cd-code-highlight--theme :global(.token.italic) {
    font-style: italic;
  }

  /* —— 行号插件（对齐 prismjs line-numbers，尺寸/色走 token） —— */
  .cd-code-highlight.line-numbers {
    position: relative;
    padding-inline-start: var(--cd-code-highlight-linenumber-width);
    counter-reset: linenumber;
  }

  .cd-code-highlight.line-numbers :global(> code) {
    position: relative;
    white-space: inherit;
  }

  .cd-code-highlight.line-numbers :global(.line-numbers-rows) {
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: calc(-1 * var(--cd-code-highlight-linenumber-width));
    width: var(--cd-code-highlight-linenumber-width);
    letter-spacing: -1px;
    border-inline-end: 1px solid var(--cd-code-highlight-linenumber-border);
    user-select: none;
    pointer-events: none;
  }

  .cd-code-highlight.line-numbers :global(.line-numbers-rows > span) {
    display: block;
    counter-increment: linenumber;
  }

  .cd-code-highlight.line-numbers :global(.line-numbers-rows > span::before) {
    content: counter(linenumber);
    display: block;
    padding-inline-end: var(--cd-code-highlight-linenumber-gap);
    text-align: end;
    color: var(--cd-code-highlight-linenumber-color);
  }
</style>
