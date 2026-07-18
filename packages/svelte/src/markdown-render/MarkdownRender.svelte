<!--
  MarkdownRender — Markdown 渲染组件（严格对齐 Semi Design markdownRender，用 unified 管线替代 MDX）。

  Semi 用 @mdx-js/mdx evaluate 产出 React 组件；Svelte 无 jsx-runtime 无法复用（运行时模型硬不兼容）。
  本组件：core.compileToHast 把 raw 编译成 hast → HastNode 递归渲染成 Svelte 组件 / 原生标签。

  对齐 Semi（可观察结果）：
  - DOM 类名体系 cd-markdownRender → 本库 cd-markdown-render；元素映射到组件 + -component-* 类名。
  - 默认组件映射（对齐 Semi SemiMarkdownComponents 11 键）：h1-h6→Typography.Title、p→Typography.Paragraph、
    a→Typography.Text link、img→div>Image+alt、table→Table、code(行内)→span.simple-code、pre(围栏)→CodeHighlight。
  - token 镜像 Semi variables.scss（20 个：simpleCode/image/header1-5 margin/list color/p strong）；
    标题字号/行高/颜色由 Typography 承担（Semi 也如此），故不自造这些 token。
  - 默认不渲染 raw HTML（对齐 Semi format='md' 剥离）；保留 HTML 由使用方传 rehype-raw 自负 XSS。
  - 不支持 md 正文里任意 JSX 表达式求值（Semi format='mdx' 深度能力，Svelte 无 jsx-runtime）。

  异步：compileToHast 惰性 import 编译器，$effect 内编译，结果写 $state（编译期先渲染上一次/空）。
-->
<script lang="ts" module>
  import type { Component } from 'svelte';
  import { defaultComponents } from './components/index.js';

  export { defaultComponents };
</script>

<script lang="ts">
  import { compileToHast, type HastRoot, type UnifiedPluginEntry } from '@chenzy-design/core';
  import HastNode from './HastNode.svelte';

  interface Props {
    /** Markdown 源码。 */
    raw?: string;
    /** 元素覆盖 / 自定义标签注册；浅合并覆盖 defaultComponents。 */
    components?: Record<string, Component<any> | string>;
    /** 格式。仅支持 'md'（unified 管线）；'mdx' 不支持（Svelte 无 jsx-runtime）。 */
    format?: 'md';
    /** 是否启用 GFM（表格 / 任务列表 / 删除线）。对齐 Semi 默认 true。 */
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
  /* —— 严格对齐 Semi markdownRender.scss —— 排版由 Typography 组件承担，此处仅补 Semi 定义的样式 —— */

  /* 行内 code（无语言）：simple-code（对齐 semi-markdownRender-simple-code） */
  .cd-markdown-render :global(.cd-markdown-render-simple-code) {
    background: var(--cd-markdown-render-simple-code-bg);
    color: var(--cd-markdown-render-simple-code-text);
  }

  /* 列表颜色（对齐 semi-markdownRender ul,li） */
  .cd-markdown-render :global(ul),
  .cd-markdown-render :global(li) {
    color: var(--cd-markdown-render-list-color);
  }

  /* 图片容器（对齐 semi-markdownRender-component-image） */
  .cd-markdown-render :global(.cd-markdown-render-component-image) {
    margin: var(--cd-markdown-render-image-margin-top) var(--cd-markdown-render-image-margin-right)
      var(--cd-markdown-render-image-margin-bottom) var(--cd-markdown-render-image-margin-left);
    max-width: var(--cd-markdown-render-image-max-width);
    max-height: var(--cd-markdown-render-image-max-height);
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .cd-markdown-render :global(.cd-markdown-render-component-image-alt) {
    margin-top: var(--cd-markdown-render-image-alt-margin-top);
    text-align: center;
    color: var(--cd-markdown-render-image-alt-color);
  }

  /* 标题 margin（对齐 semi-markdownRender-component-header.semi-typography-h1..h5；字号/颜色由 Typography.Title 承担） */
  .cd-markdown-render :global(.cd-markdown-render-component-header.cd-typography-h1) {
    margin-top: var(--cd-markdown-render-header1-margin-top);
    margin-bottom: var(--cd-markdown-render-header1-margin-bottom);
  }
  .cd-markdown-render :global(.cd-markdown-render-component-header.cd-typography-h2) {
    margin-top: var(--cd-markdown-render-header2-margin-top);
    margin-bottom: var(--cd-markdown-render-header2-margin-bottom);
  }
  .cd-markdown-render :global(.cd-markdown-render-component-header.cd-typography-h3) {
    margin-top: var(--cd-markdown-render-header3-margin-top);
    margin-bottom: var(--cd-markdown-render-header3-margin-bottom);
  }
  .cd-markdown-render :global(.cd-markdown-render-component-header.cd-typography-h4) {
    margin-top: var(--cd-markdown-render-header4-margin-top);
    margin-bottom: var(--cd-markdown-render-header4-margin-bottom);
  }
  .cd-markdown-render :global(.cd-markdown-render-component-header.cd-typography-h5) {
    margin-top: var(--cd-markdown-render-header5-margin-top);
    margin-bottom: var(--cd-markdown-render-header5-margin-bottom);
  }

  /* 段落内加粗（对齐 semi-markdownRender-component-p strong） */
  .cd-markdown-render :global(.cd-markdown-render-component-p strong) {
    font-weight: var(--cd-font-weight-bold);
  }
</style>
