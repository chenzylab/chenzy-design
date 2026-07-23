/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 */
export const meta = {
  name: 'Empty',
  category: 'show',
  description:
    '空状态占位。镜像 Semi Design：image / darkModeImage 接受插画节点(imageSlot)、SVG 精灵对象 { id, viewBox, url } 或图片 URL 字符串；darkModeImage 存在时监听 data-theme 在暗色下切换插画；title 用 Typography.Title（有图 heading=4，无图 heading=6+字重 400）；description 为 div；layout 支持 vertical / horizontal。插画由独立 illustrations 资产提供（对齐 @douyinfe/semi-illustrations）。',
  props: [
    { name: 'image', type: '{ id?; viewBox?; url? } | string', default: 'undefined', desc: '占位图：SVG 精灵对象或图片 URL；自定义节点用 imageSlot' },
    { name: 'darkModeImage', type: '{ id?; viewBox?; url? } | string', default: 'undefined', desc: '暗色模式占位图，响应 data-theme 变化' },
    { name: 'title', type: 'string', default: 'undefined', desc: '标题' },
    { name: 'description', type: 'string | Snippet', default: 'undefined', desc: '内容描述；string 直渲，Snippet 渲染富内容' },
    { name: 'imageStyle', type: 'string', default: 'undefined', desc: '占位图容器（.cd-empty-image）内联样式' },
    { name: 'layout', type: "'vertical'|'horizontal'", default: "'vertical'", desc: '布局方式' },
    { name: 'class', type: 'string', default: "''" },
    { name: 'style', type: 'string', default: 'undefined' },
    { name: 'children', type: 'Snippet', default: 'undefined', desc: '动作区（footer）' },
    { name: 'imageSlot', type: 'Snippet', default: 'undefined', desc: '自定义插画节点（等价 Semi image 传 ReactNode）' },
    { name: 'darkModeImageSlot', type: 'Snippet', default: 'undefined', desc: '暗色自定义插画节点' },
  ],
  a11y: {
    role: 'none',
    notes: ['插画 SVG aria-hidden=true', '外部图片 <img> 带 alt（取 description，缺省 "empty"）', '标题与描述为可读文本'],
  },
  tokens: [
    // Semi empty/variables.scss 全量对齐（6），组件直接消费原始层
    '--cd-spacing-empty-content-vertical-margintop',
    '--cd-spacing-empty-content-horizontal-marginleft',
    '--cd-spacing-empty-title-margintop',
    '--cd-spacing-empty-footer-margintop',
    '--cd-font-empty-title-fontweight',
    '--cd-color-empty-description-text-default',
  ],
} as const;
