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
      type: "'noData'|'noResult'|'error'",
      default: "'noData'",
      desc: '内置预设插画',
    },
    { name: 'title', type: 'string', default: 'undefined', desc: '标题，默认按 image 取内置文案' },
    { name: 'description', type: 'string', default: 'undefined' },
    { name: 'size', type: "'small'|'default'|'large'", default: 'default' },
    { name: 'class', type: 'string', default: "''" },
    { name: 'children', type: 'Snippet', default: 'undefined', desc: '动作区（如按钮）' },
    { name: 'imageSlot', type: 'Snippet', default: 'undefined', desc: '自定义插画' },
  ],
  a11y: {
    role: 'none',
    notes: ['插画 aria-hidden=true', '标题与描述为可读文本'],
  },
  tokens: ['--cd-empty-*'],
} as const;
