/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 */
export const meta = {
  name: 'Empty',
  category: 'show',
  description:
    '空状态，用于无数据/无搜索结果/加载失败等场景，含内置预设插画、标题、描述与动作区。',
  props: [
    {
      name: 'image',
      type: "'noData'|'noResult'|'error'|'construction'|'success'|'noAccess'|(string&{})",
      default: "'noData'",
      desc: '内置预设插画名，或外部图片 URL（非预设字符串按 URL 渲染 img）',
    },
    { name: 'title', type: 'string', default: 'undefined', desc: '标题，默认按 image 取内置文案' },
    { name: 'description', type: 'string', default: 'undefined' },
    { name: 'size', type: "'small'|'default'|'large'", default: 'default' },
    {
      name: 'layout',
      type: "'vertical'|'horizontal'",
      default: "'vertical'",
      desc: '排布方向；horizontal 在窄容器自动降级为 vertical',
    },
    {
      name: 'responsive',
      type: 'boolean',
      default: 'true',
      desc: '启用容器宽度自适应收缩（CSS 容器查询，纯样式）',
    },
    { name: 'class', type: 'string', default: "''" },
    { name: 'children', type: 'Snippet', default: 'undefined', desc: '动作区（如按钮）' },
    { name: 'imageSlot', type: 'Snippet', default: 'undefined', desc: '自定义插画' },
  ],
  a11y: {
    role: 'none',
    notes: ['插画 aria-hidden=true', '标题与描述为可读文本'],
  },
  tokens: [
    // Semi empty/variables.scss 全量对齐（6）
    '--cd-spacing-empty-content-vertical-margintop',
    '--cd-spacing-empty-content-horizontal-marginleft',
    '--cd-spacing-empty-title-margintop',
    '--cd-spacing-empty-footer-margintop',
    '--cd-font-empty-title-fontweight',
    '--cd-color-empty-description-text-default',
    // 组件消费
    '--cd-empty-image-color',
    '--cd-empty-title-color',
    '--cd-empty-title-weight',
    '--cd-empty-desc-color',
    '--cd-empty-gap',
  ],
} as const;
