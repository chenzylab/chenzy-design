<!--
  MarkdownRender — Markdown 渲染组件（对标 Semi Design MarkdownRender，但用 unified 管线替代 MDX）。

  Semi 用 @mdx-js/mdx evaluate 产出 React 组件；Svelte 无 JSX runtime 无法复用。
  本组件：core.compileToHast 把 raw 编译成 hast → HastNode 递归渲染成 Svelte 组件 / 原生标签。

  能力边界（对齐已定决策）：
  - 支持 components 覆盖元素 / 注册自定义标签对应 Svelte 组件。
  - 不支持 md 正文里任意 JSX 表达式求值（Semi format='mdx' 深度能力）。
  - 默认不渲染 raw HTML（对齐 Semi format='md' 剥离）；保留 HTML 由使用方传 rehype-raw 自负 XSS。
  - 代码块默认交给 CodeHighlight（存在则用，否则降级纯 <pre><code>），见 CodeBlock.svelte。

  异步：compileToHast 惰性 import 编译器，$effect 内编译，结果写 $state（编译期先渲染上一次/空）。
  红线：render 不读 $effect 写的状态之外的中间量；编译结果单独 $state 承载。
-->
<script lang="ts" module>
  import type { Component } from 'svelte';
  import CodeBlock from './CodeBlock.svelte';
  import Anchor from './Anchor.svelte';

  /**
   * 默认可覆盖元素集合（对齐 Semi）。使用方传入的 components 会浅合并覆盖这里。
   * - `a`：外链补 rel=noopener（Anchor 内处理）。
   * - `pre`：交给 CodeBlock（CodeHighlight 降级封装）。
   */
  export const defaultComponents: Record<string, Component<any>> = {
    a: Anchor,
    pre: CodeBlock,
  };
</script>

<script lang="ts">
  import { compileToHast, type HastRoot, type UnifiedPluginEntry } from '@chenzy-design/core';
  import HastNode from './HastNode.svelte';

  interface Props {
    /** Markdown 源码。 */
    raw?: string;
    /** 元素覆盖 / 自定义标签注册；浅合并覆盖 defaultComponents。 */
    components?: Record<string, Component<any> | string>;
    /** 格式。仅支持 'md'（unified 管线）；'mdx' 不支持（Svelte 无 JSX runtime）。 */
    format?: 'md';
    /** 是否启用 GFM（表格 / 任务列表 / 删除线）。 */
    remarkGfm?: boolean;
    /** 透传 remark 插件（mdast 阶段）。 */
    remarkPlugins?: UnifiedPluginEntry[];
    /** 透传 rehype 插件（hast 阶段）；传 rehype-raw 可保留 raw HTML（自负 XSS）。 */
    rehypePlugins?: UnifiedPluginEntry[];
    /** 根容器附加类名。 */
    class?: string;
    /** 根容器内联样式。 */
    style?: string;
  }

  let {
    raw = '',
    components,
    format = 'md',
    remarkGfm = true,
    remarkPlugins,
    rehypePlugins,
    class: className = '',
    style,
  }: Props = $props();

  // 合并注册表：默认 + 使用方覆盖。
  const registry = $derived({ ...defaultComponents, ...(components ?? {}) });

  // 编译结果单独 $state 承载（异步写），render 只读它。
  let hast = $state<HastRoot | undefined>(undefined);

  // raw / 选项变化 → 重新编译。竞态用 stale 标记丢弃过期结果。
  $effect(() => {
    const currentRaw = raw;
    const opts = {
      remarkGfm,
      remarkPlugins,
      rehypePlugins,
    };
    let stale = false;
    void compileToHast(currentRaw, opts)
      .then((result) => {
        if (!stale) hast = result;
      })
      .catch(() => {
        if (!stale) hast = undefined;
      });
    return () => {
      stale = true;
    };
  });

  const cls = $derived(['cd-markdown-render', className].filter(Boolean).join(' '));
</script>

<div class={cls} {style}>
  {#if hast}
    <HastNode node={hast} components={registry} />
  {/if}
</div>

<style>
  .cd-markdown-render {
    color: var(--cd-markdown-render-text-color);
    font-size: var(--cd-markdown-render-font-size);
    line-height: var(--cd-markdown-render-line-height);
    word-wrap: break-word;
  }

  /* 块级元素纵向间距（相邻块之间） */
  .cd-markdown-render :global(p),
  .cd-markdown-render :global(ul),
  .cd-markdown-render :global(ol),
  .cd-markdown-render :global(blockquote),
  .cd-markdown-render :global(pre),
  .cd-markdown-render :global(table) {
    margin-block: 0 var(--cd-markdown-render-block-gap);
  }
  .cd-markdown-render :global(> :last-child) {
    margin-block-end: 0;
  }

  /* 标题：复用 Typography header scale */
  .cd-markdown-render :global(h1),
  .cd-markdown-render :global(h2),
  .cd-markdown-render :global(h3),
  .cd-markdown-render :global(h4),
  .cd-markdown-render :global(h5),
  .cd-markdown-render :global(h6) {
    color: var(--cd-markdown-render-heading-color);
    font-weight: var(--cd-markdown-render-heading-weight);
    margin-block: var(--cd-markdown-render-heading-margin-top)
      var(--cd-markdown-render-heading-margin-bottom);
  }
  .cd-markdown-render :global(h1) {
    font-size: var(--cd-markdown-render-h1-size);
    line-height: var(--cd-markdown-render-h1-line-height);
  }
  .cd-markdown-render :global(h2) {
    font-size: var(--cd-markdown-render-h2-size);
    line-height: var(--cd-markdown-render-h2-line-height);
  }
  .cd-markdown-render :global(h3) {
    font-size: var(--cd-markdown-render-h3-size);
    line-height: var(--cd-markdown-render-h3-line-height);
  }
  .cd-markdown-render :global(h4) {
    font-size: var(--cd-markdown-render-h4-size);
    line-height: var(--cd-markdown-render-h4-line-height);
  }
  .cd-markdown-render :global(h5) {
    font-size: var(--cd-markdown-render-h5-size);
    line-height: var(--cd-markdown-render-h5-line-height);
  }
  .cd-markdown-render :global(h6) {
    font-size: var(--cd-markdown-render-h6-size);
    line-height: var(--cd-markdown-render-h6-line-height);
  }

  /* 行内 code */
  .cd-markdown-render :global(code) {
    color: var(--cd-markdown-render-code-color);
    background: var(--cd-markdown-render-code-bg);
    border-radius: var(--cd-markdown-render-code-radius);
    padding-inline: var(--cd-markdown-render-code-padding-x);
    font-size: var(--cd-markdown-render-code-font-size);
    font-family: var(--cd-font-family-code, monospace);
  }
  /* pre 内的 code 不叠加行内 code 的背景 / 内边距 */
  .cd-markdown-render :global(pre code) {
    background: transparent;
    padding: 0;
    font-size: inherit;
  }
  .cd-markdown-render :global(pre) {
    background: var(--cd-markdown-render-pre-bg);
    border-radius: var(--cd-markdown-render-pre-radius);
    padding: var(--cd-markdown-render-pre-padding);
    overflow-x: auto;
  }

  /* 引用 */
  .cd-markdown-render :global(blockquote) {
    color: var(--cd-markdown-render-quote-color);
    border-inline-start: var(--cd-markdown-render-quote-border-width) solid
      var(--cd-markdown-render-quote-border-color);
    padding-inline-start: var(--cd-markdown-render-quote-padding-x);
    margin-inline: 0;
  }

  /* 表格 */
  .cd-markdown-render :global(table) {
    border-collapse: collapse;
    width: 100%;
  }
  .cd-markdown-render :global(th),
  .cd-markdown-render :global(td) {
    border: 1px solid var(--cd-markdown-render-table-border-color);
    padding: var(--cd-markdown-render-table-cell-padding-y)
      var(--cd-markdown-render-table-cell-padding-x);
    text-align: start;
  }
  .cd-markdown-render :global(thead th) {
    background: var(--cd-markdown-render-table-head-bg);
  }

  /* 列表 */
  .cd-markdown-render :global(ul),
  .cd-markdown-render :global(ol) {
    padding-inline-start: var(--cd-markdown-render-list-padding-inline);
  }

  /* 分隔线 */
  .cd-markdown-render :global(hr) {
    border: none;
    border-top: 1px solid var(--cd-markdown-render-hr-color);
  }

  /* 图片 */
  .cd-markdown-render :global(img) {
    max-width: 100%;
    border-radius: var(--cd-markdown-render-img-radius);
  }

  /* 链接 */
  .cd-markdown-render :global(a) {
    color: var(--cd-markdown-render-link-color);
    text-decoration: none;
  }
  .cd-markdown-render :global(a:hover) {
    color: var(--cd-markdown-render-link-hover-color);
    text-decoration: underline;
  }
</style>
