/**
 * Component tokens for MarkdownRender — 严格镜像 Semi semi-foundation/markdownRender/variables.scss（20 条）。
 *
 * Semi 的 markdownRender 排版（标题字号/行高/颜色、段落、链接）全部由 Typography 组件承担，
 * variables.scss 只定义：图片容器 margin/maxSize/alt、header1-5 的 marginTop/Bottom、
 * 行内 simpleCode 的 bg/text、列表 color、图片 alt color。故本库只保留这 20 个，移除此前
 * 自造的 h1-h6 size/line-height、link、code(bg/radius/padding)、pre、quote、table、hr、img-radius、
 * block-gap、text-color/font-size/line-height 等 Semi 没有的中间层（无向后兼容）。
 *
 * 命名/值/DOM 对齐 Semi：`$spacing-markdownRender_component_image-marginTop:16px` →
 * `--cd-markdown-render-image-margin-top:16px`；`var(--semi-color-*)` → `var(--cd-color-*)`。
 * Semi 无 header6 margin token（scss 只到 h5）；无 calc/rgba 公式，全静态字面量或 var 引用。
 *
 * 消费方：packages/svelte/src/markdown-render/MarkdownRender.svelte。
 */
import type { TokenGroup } from './token-def.js';

export const markdownRenderTokens = {
  // —— 图片容器（对齐 $spacing/$width-markdownRender_component_image-*） ——
  'markdown-render-image-margin-left': { value: '16px', category: 'spacing', label: '图片左外边距', usage: 'markdownRender 图片容器左外边距' },
  'markdown-render-image-margin-right': { value: '16px', category: 'spacing', label: '图片右外边距', usage: 'markdownRender 图片容器右外边距' },
  'markdown-render-image-margin-top': { value: '16px', category: 'spacing', label: '图片上外边距', usage: 'markdownRender 图片容器上外边距' },
  'markdown-render-image-margin-bottom': { value: '16px', category: 'spacing', label: '图片下外边距', usage: 'markdownRender 图片容器下外边距' },
  'markdown-render-image-max-width': { value: '50%', category: 'width', label: '图片最大宽度', usage: 'markdownRender 图片容器最大宽度' },
  'markdown-render-image-max-height': { value: '500px', category: 'height', label: '图片最大高度', usage: 'markdownRender 图片容器最大高度' },
  'markdown-render-image-alt-margin-top': { value: '8px', category: 'spacing', label: '图片 alt 上间距', usage: '图片 alt 说明文字上外边距' },
  'markdown-render-image-alt-color': { value: 'var(--cd-color-tertiary)', category: 'color', label: '图片 alt 颜色', usage: '图片 alt 说明文字颜色' },

  // —— 标题 margin（对齐 $spacing-markdownRender_component_header1-5-margin*；Semi 无 header6） ——
  'markdown-render-header1-margin-top': { value: '16px', category: 'spacing', label: 'h1 上外边距', usage: 'h1 标题上外边距' },
  'markdown-render-header1-margin-bottom': { value: '16px', category: 'spacing', label: 'h1 下外边距', usage: 'h1 标题下外边距' },
  'markdown-render-header2-margin-top': { value: '16px', category: 'spacing', label: 'h2 上外边距', usage: 'h2 标题上外边距' },
  'markdown-render-header2-margin-bottom': { value: '16px', category: 'spacing', label: 'h2 下外边距', usage: 'h2 标题下外边距' },
  'markdown-render-header3-margin-top': { value: '16px', category: 'spacing', label: 'h3 上外边距', usage: 'h3 标题上外边距' },
  'markdown-render-header3-margin-bottom': { value: '16px', category: 'spacing', label: 'h3 下外边距', usage: 'h3 标题下外边距' },
  'markdown-render-header4-margin-top': { value: '16px', category: 'spacing', label: 'h4 上外边距', usage: 'h4 标题上外边距' },
  'markdown-render-header4-margin-bottom': { value: '16px', category: 'spacing', label: 'h4 下外边距', usage: 'h4 标题下外边距' },
  'markdown-render-header5-margin-top': { value: '16px', category: 'spacing', label: 'h5 上外边距', usage: 'h5 标题上外边距' },
  'markdown-render-header5-margin-bottom': { value: '16px', category: 'spacing', label: 'h5 下外边距', usage: 'h5 标题下外边距' },

  // —— 行内 simpleCode（对齐 $color-markdownRender_simpleCode-*） ——
  'markdown-render-simple-code-bg': { value: 'var(--cd-color-fill-0)', category: 'color', label: '行内 code 背景', usage: '无语言行内 code 背景色' },
  'markdown-render-simple-code-text': { value: 'var(--cd-color-text-1)', category: 'color', label: '行内 code 文本', usage: '无语言行内 code 文本色' },

  // —— 列表颜色（对齐 $color-markdownRender_component_list） ——
  'markdown-render-list-color': { value: 'var(--cd-color-text-0)', category: 'color', label: '列表颜色', usage: 'ul / li 文本颜色' },
} satisfies TokenGroup;
