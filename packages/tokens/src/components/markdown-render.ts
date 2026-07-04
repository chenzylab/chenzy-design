/**
 * Component tokens for MarkdownRender (Show / rich-media).
 * 排版复用既有 Typography 语义（font-size / line-height / font-weight scale），
 * 颜色走 text/link/border/fill alias，间距走 spacing alias。**禁写死颜色/尺寸**。
 * 值为 var() 引用 global/alias token，或字面量（仅无对应 alias 的排版基元）。
 *
 * 消费方：packages/svelte/src/markdown-render/MarkdownRender.svelte。
 */
import type { TokenGroup } from './token-def.js';

export const markdownRenderTokens = {
  // —— 正文 ——
  'markdown-render-text-color': { value: 'var(--cd-color-text-0)', category: 'color', label: '正文颜色', usage: '正文文本颜色' },
  'markdown-render-font-size': { value: 'var(--cd-font-size-regular)', category: 'font', label: '正文字号', usage: '正文字号' },
  'markdown-render-line-height': { value: '1.6', category: 'other', label: '正文行高', usage: '正文行高（无 px 绑定，用倍数保证换行舒适）' },
  'markdown-render-block-gap': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '块间距', usage: '段落 / 列表 / 表格等块级元素纵向间距' },

  // —— 标题（复用 Typography header scale） ——
  'markdown-render-heading-color': { value: 'var(--cd-color-text-0)', category: 'color', label: '标题颜色', usage: '各级标题颜色' },
  'markdown-render-heading-weight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: '标题字重', usage: '各级标题字重' },
  'markdown-render-heading-margin-top': { value: 'var(--cd-spacing-loose)', category: 'spacing', label: '标题上间距', usage: '标题与上文的间距' },
  'markdown-render-heading-margin-bottom': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '标题下间距', usage: '标题与下文的间距' },
  'markdown-render-h1-size': { value: 'var(--cd-font-size-header-1)', category: 'font', label: 'h1 字号', usage: 'h1 字号（复用 header-1）' },
  'markdown-render-h1-line-height': { value: 'var(--cd-line-height-header-1)', category: 'font', label: 'h1 行高', usage: 'h1 行高（复用 header-1）' },
  'markdown-render-h2-size': { value: 'var(--cd-font-size-header-2)', category: 'font', label: 'h2 字号', usage: 'h2 字号（复用 header-2）' },
  'markdown-render-h2-line-height': { value: 'var(--cd-line-height-header-2)', category: 'font', label: 'h2 行高', usage: 'h2 行高（复用 header-2）' },
  'markdown-render-h3-size': { value: 'var(--cd-font-size-header-3)', category: 'font', label: 'h3 字号', usage: 'h3 字号（复用 header-3）' },
  'markdown-render-h3-line-height': { value: 'var(--cd-line-height-header-3)', category: 'font', label: 'h3 行高', usage: 'h3 行高（复用 header-3）' },
  'markdown-render-h4-size': { value: 'var(--cd-font-size-header-4)', category: 'font', label: 'h4 字号', usage: 'h4 字号（复用 header-4）' },
  'markdown-render-h4-line-height': { value: 'var(--cd-line-height-header-4)', category: 'font', label: 'h4 行高', usage: 'h4 行高（复用 header-4）' },
  'markdown-render-h5-size': { value: 'var(--cd-font-size-header-5)', category: 'font', label: 'h5 字号', usage: 'h5 字号（复用 header-5）' },
  'markdown-render-h5-line-height': { value: 'var(--cd-line-height-header-5)', category: 'font', label: 'h5 行高', usage: 'h5 行高（复用 header-5）' },
  'markdown-render-h6-size': { value: 'var(--cd-font-size-header-6)', category: 'font', label: 'h6 字号', usage: 'h6 字号（复用 header-6）' },
  'markdown-render-h6-line-height': { value: 'var(--cd-line-height-header-6)', category: 'font', label: 'h6 行高', usage: 'h6 行高（复用 header-6）' },

  // —— 链接 ——
  'markdown-render-link-color': { value: 'var(--cd-color-link)', category: 'color', label: '链接颜色', usage: '链接文本颜色' },
  'markdown-render-link-hover-color': { value: 'var(--cd-color-link-hover)', category: 'color', label: '链接悬浮色', usage: '链接悬浮态颜色' },

  // —— 行内 code ——
  'markdown-render-code-color': { value: 'var(--cd-color-text-0)', category: 'color', label: '行内 code 颜色', usage: '行内 code 文本颜色' },
  'markdown-render-code-bg': { value: 'var(--cd-color-fill-1)', category: 'color', label: '行内 code 背景', usage: '行内 code 背景色' },
  'markdown-render-code-radius': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '行内 code 圆角', usage: '行内 code 圆角' },
  'markdown-render-code-padding-x': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '行内 code 水平内边距', usage: '行内 code 水平内边距' },
  'markdown-render-code-font-size': { value: 'var(--cd-font-size-small)', category: 'font', label: '行内 code 字号', usage: '行内 code 字号' },

  // —— 代码块（CodeHighlight 降级态 <pre>） ——
  'markdown-render-pre-bg': { value: 'var(--cd-color-fill-0)', category: 'color', label: '代码块背景', usage: '代码块（pre 降级态）背景' },
  'markdown-render-pre-radius': { value: 'var(--cd-border-radius-medium)', category: 'radius', label: '代码块圆角', usage: '代码块圆角' },
  'markdown-render-pre-padding': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '代码块内边距', usage: '代码块内边距' },

  // —— 引用 blockquote ——
  'markdown-render-quote-color': { value: 'var(--cd-color-text-2)', category: 'color', label: '引用文本色', usage: 'blockquote 文本颜色' },
  'markdown-render-quote-border-color': { value: 'var(--cd-color-border)', category: 'color', label: '引用左边框色', usage: 'blockquote 左侧强调边框颜色' },
  'markdown-render-quote-border-width': { value: '3px', category: 'width', label: '引用左边框宽度', usage: 'blockquote 左侧强调边框宽度' },
  'markdown-render-quote-padding-x': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '引用水平内边距', usage: 'blockquote 左内边距' },

  // —— 表格 ——
  'markdown-render-table-border-color': { value: 'var(--cd-color-border)', category: 'color', label: '表格边框色', usage: '表格单元格 / 边框颜色' },
  'markdown-render-table-cell-padding-x': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '单元格水平内边距', usage: '表格单元格水平内边距' },
  'markdown-render-table-cell-padding-y': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '单元格垂直内边距', usage: '表格单元格垂直内边距' },
  'markdown-render-table-head-bg': { value: 'var(--cd-color-fill-0)', category: 'color', label: '表头背景', usage: '表格表头背景色' },

  // —— 列表 ——
  'markdown-render-list-padding-inline': { value: 'var(--cd-spacing-loose)', category: 'spacing', label: '列表缩进', usage: 'ul / ol 起始缩进' },

  // —— 分隔线 hr ——
  'markdown-render-hr-color': { value: 'var(--cd-color-border)', category: 'color', label: '分隔线颜色', usage: 'hr 分隔线颜色' },

  // —— 图片 ——
  'markdown-render-img-radius': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '图片圆角', usage: 'img 圆角' },
} satisfies TokenGroup;
