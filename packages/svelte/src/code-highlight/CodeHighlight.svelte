<!--
  CodeHighlight — 严格对齐 Semi Design（semi-ui/codeHighlight + semi-foundation/codeHighlight）。
  语法高亮展示：底层用 prismjs。class-name 解析（language-<lang> / line-numbers）为纯函数
  （@chenzy-design/core resolveCodeClassName）；渲染在 $effect 里对 <code> 元素设 class +
  textContent，再 Prism.highlightElement(el, false) 就地高亮 —— 只写纯文本节点，绝不 {@html}
  未处理内容，规避 XSS。语言包/行号插件按需 import。

  DOM 对齐 Semi：<div class="cd-code-highlight [cd-code-highlight-defaultTheme]"><pre><code>。
  样式对齐 Semi codeHighlight.scss：prism 主题为固定 Lea Verou dabblet 配色（写死色值 +
  色板阶梯 rgba(var(--semi-X-6),1) → var(--cd-color-X-6)），容器色引 alias。移除自造 token 中间层。
  defaultTheme 开关控制是否套用内置配色；长代码块可滚动，加 tabindex/role=region + i18n
  aria-label 供键盘 + AT 访问。
-->
<script lang="ts">
  import { resolveCodeClassName } from '@chenzy-design/core';
  import Prism from 'prismjs';
  import { useLocale } from '../locale-provider/index.js';

  // Semi 对齐：手动高亮，禁止 Prism 自动扫描 DOM。
  Prism.manual = true;

  // 语言组件与行号插件是老式全局脚本（依赖全局 Prism），只能在客户端加载，
  // 否则 SSR/prerender 阶段 `Prism is not defined` 崩，且生产 build 不引会静默不高亮。
  // 模块级一次性懒加载（顺序有依赖：markup → markup-templating → 各语言 → svelte）。
  let prismReady: Promise<void> | null = null;
  function ensurePrismLangs(): Promise<void> {
    if (prismReady) return prismReady;
    prismReady = (async () => {
      await import('prismjs/components/prism-markup.js');
      await import('prismjs/components/prism-clike.js');
      await import('prismjs/components/prism-javascript.js');
      await import('prismjs/components/prism-css.js');
      await import('prismjs/components/prism-typescript.js');
      await import('prismjs/components/prism-markup-templating.js');
      await import('prismjs/components/prism-bash.js');
      await import('prismjs/components/prism-json.js');
      await import('prism-svelte');
      await import('prismjs/plugins/line-numbers/prism-line-numbers.js');
    })();
    return prismReady;
  }

  interface Props {
    /** 待高亮的源码（纯文本；作为 textContent 写入，不解析 HTML）。 */
    code?: string;
    /** Prism 语言 id，如 'js' | 'ts' | 'css' | 'markup'。 */
    language?: string;
    /** 是否显示行号（Prism line-numbers 插件）。对齐 Semi 默认 true。 */
    lineNumber?: boolean;
    /** 是否套用内置默认主题（Semi dabblet 配色）。对齐 Semi 默认 true。 */
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

  // 对齐 Semi：根 class = cd-code-highlight + cd-light-scrollbar + [cd-code-highlight-defaultTheme] + 外部 class。
  // cd-light-scrollbar 镜像 Semi 的 semi-light-scrollbar（浅色滚动条，全局工具类）。
  const rootClass = $derived(
    [
      'cd-code-highlight',
      'cd-light-scrollbar',
      defaultTheme && 'cd-code-highlight-defaultTheme',
      className,
    ]
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

    let cancelled = false;
    el.className = resolveCodeClassName('', nextLang, nextLineNumber);
    el.textContent = nextCode;
    // 先确保语言组件+插件已加载（客户端），再高亮；避免语法定义缺失时静默纯文本。
    ensurePrismLangs().then(() => {
      if (cancelled || !el.isConnected) return;
      Prism.highlightElement(el, false);
    });
    return () => {
      cancelled = true;
    };
  });
</script>

<!-- DOM 对齐 Semi：div.cd-code-highlight > pre > code。tabindex=0 让长代码块可键盘滚动聚焦；
     role=region + aria-label 命名该滚动区（WCAG 2.1.1）。 -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
  class={rootClass}
  style={style || undefined}
  tabindex="0"
  role="region"
  aria-label={loc().t('CodeHighlight.codeBlock')}
><pre class:line-numbers={lineNumber}><code bind:this={codeEl}></code></pre></div>

<style>
  /* —— 容器 —— 对齐 Semi codeHighlight.scss。根 div 承担滚动 + 键盘聚焦（role=region）。 */
  .cd-code-highlight {
    overflow: auto;
  }

  .cd-code-highlight :global(pre) {
    margin: 0;
  }

  .cd-code-highlight-defaultTheme :global(pre[class*='language-']),
  .cd-code-highlight-defaultTheme :global(code[class*='language-']) {
    color: var(--cd-color-text-0);
    font-size: 13px;
    text-shadow: none;
    font-family:
      ui-monospace, 'SFMono-Regular', 'SF Mono', Menlo, Monaco, Consolas, 'Liberation Mono',
      'DejaVu Sans Mono', 'Courier New', monospace;
    direction: ltr;
    text-align: left;
    white-space: pre;
    word-spacing: normal;
    word-break: normal;
    line-height: 1.5;
    tab-size: 4;
    hyphens: none;
  }

  .cd-code-highlight-defaultTheme :global(pre[class*='language-']::selection),
  .cd-code-highlight-defaultTheme :global(code[class*='language-']::selection) {
    text-shadow: none;
    background: #b3d4fc;
  }

  .cd-code-highlight-defaultTheme :global(pre[class*='language-']) {
    padding: 1em;
    margin: 0.5em 0;
    overflow: auto;
    background: var(--cd-color-tertiary-light-default);
  }

  .cd-code-highlight-defaultTheme :global(:not(pre) > code[class*='language-']) {
    display: block;
    border-radius: 0.3em;
    color: #895fe2;
    background: #f9f7f9;
  }

  .cd-code-highlight-defaultTheme :global(pre .namespace) {
    opacity: 0.7;
  }

  .cd-code-highlight-defaultTheme :global(pre .token.comment),
  .cd-code-highlight-defaultTheme :global(pre .token.prolog),
  .cd-code-highlight-defaultTheme :global(pre .token.doctype),
  .cd-code-highlight-defaultTheme :global(pre .token.cdata) {
    color: #6b7075;
  }

  .cd-code-highlight-defaultTheme :global(pre .token.punctuation) {
    color: var(--cd-color-grey-8);
  }

  .cd-code-highlight-defaultTheme :global(pre .token.property),
  .cd-code-highlight-defaultTheme :global(pre .token.tag),
  .cd-code-highlight-defaultTheme :global(pre .token.boolean),
  .cd-code-highlight-defaultTheme :global(pre .token.number),
  .cd-code-highlight-defaultTheme :global(pre .token.constant),
  .cd-code-highlight-defaultTheme :global(pre .token.symbol),
  .cd-code-highlight-defaultTheme :global(pre .token.deleted) {
    color: var(--cd-color-purple-6);
  }

  .cd-code-highlight-defaultTheme :global(pre .token.selector),
  .cd-code-highlight-defaultTheme :global(pre .token.attr-name),
  .cd-code-highlight-defaultTheme :global(pre .token.string),
  .cd-code-highlight-defaultTheme :global(pre .token.char),
  .cd-code-highlight-defaultTheme :global(pre .token.builtin),
  .cd-code-highlight-defaultTheme :global(pre .token.inserted) {
    color: var(--cd-color-green-6);
  }

  .cd-code-highlight-defaultTheme :global(pre .token.operator),
  .cd-code-highlight-defaultTheme :global(pre .token.entity),
  .cd-code-highlight-defaultTheme :global(pre .token.url),
  .cd-code-highlight-defaultTheme :global(pre .language-css .token.string),
  .cd-code-highlight-defaultTheme :global(pre .style .token.string) {
    color: var(--cd-color-grey-8);
  }

  .cd-code-highlight-defaultTheme :global(pre .token.atrule),
  .cd-code-highlight-defaultTheme :global(pre .token.attr-value),
  .cd-code-highlight-defaultTheme :global(pre .token.keyword) {
    color: var(--cd-color-purple-6);
  }

  .cd-code-highlight-defaultTheme :global(pre .token.function) {
    color: var(--cd-color-violet-6);
  }

  .cd-code-highlight-defaultTheme :global(pre .token.regex),
  .cd-code-highlight-defaultTheme :global(pre .token.important),
  .cd-code-highlight-defaultTheme :global(pre .token.variable) {
    color: #d0955f;
  }

  .cd-code-highlight-defaultTheme :global(pre .token.important),
  .cd-code-highlight-defaultTheme :global(pre .token.bold) {
    font-weight: bold;
  }

  .cd-code-highlight-defaultTheme :global(pre .token.italic) {
    font-style: italic;
  }

  .cd-code-highlight-defaultTheme :global(pre .token.entity) {
    cursor: help;
  }

  .cd-code-highlight-defaultTheme :global(pre[data-line]) {
    position: relative;
  }

  .cd-code-highlight-defaultTheme :global(pre[class*='language-'] > code[class*='language-']) {
    position: relative;
    z-index: 1;
  }

  .cd-code-highlight-defaultTheme :global(.line-highlight) {
    position: absolute;
    left: 0;
    right: 0;
    padding: inherit 0;
    margin-top: 1em;
    background: #ebf4ff;
    box-shadow: inset 5px 0 0 #0064d2;
    z-index: 0;
    pointer-events: none;
    line-height: inherit;
    white-space: pre;
  }

  /* —— 行号插件（对齐 Semi codeHighlight.scss line number 段，尺寸/色写死照 Semi） —— */
  .cd-code-highlight :global(pre[class*='language-'].line-numbers) {
    position: relative;
    padding-left: 3.8em;
    counter-reset: linenumber;
  }

  .cd-code-highlight :global(pre[class*='language-'].line-numbers > code) {
    position: relative;
    white-space: inherit;
  }

  .cd-code-highlight :global(.line-numbers .line-numbers-rows) {
    position: absolute;
    pointer-events: none;
    top: 0;
    font-size: 100%;
    left: -3.8em;
    width: 3em;
    letter-spacing: -1px;
    border-right: 1px solid #999;
    user-select: none;
  }

  .cd-code-highlight :global(.line-numbers-rows > span) {
    display: block;
    counter-increment: linenumber;
  }

  .cd-code-highlight :global(.line-numbers-rows > span::before) {
    content: counter(linenumber);
    color: #999;
    display: block;
    padding-right: 0.8em;
    text-align: right;
  }
</style>
