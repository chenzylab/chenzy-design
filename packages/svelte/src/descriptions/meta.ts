/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 */
export const meta = {
  name: 'Descriptions',
  category: 'show',
  description:
    '描述列表，成组展示只读字段。支持 data 数据驱动、inline/row 布局、column 列数、bordered 边框、colon 冒号与水平/垂直方向。',
  props: [
    { name: 'data', type: 'DescriptionItem[]', default: '[]', desc: '描述项数据' },
    { name: 'layout', type: "'inline'|'row'", default: 'inline' },
    { name: 'direction', type: "'horizontal'|'vertical'", default: 'horizontal' },
    { name: 'column', type: 'number', default: '3', desc: '列数' },
    { name: 'size', type: "'small'|'default'|'large'", default: 'default' },
    { name: 'bordered', type: 'boolean', default: 'false' },
    { name: 'colon', type: 'boolean', default: 'true' },
    { name: 'title', type: 'string', default: 'undefined' },
    { name: 'emptyText', type: 'string', default: "'-'", desc: '空值占位' },
    { name: 'class', type: 'string', default: "''" },
  ],
  a11y: {
    role: 'description list',
    notes: [
      'dl/dt/dd 语义结构',
      '冒号用 aria-hidden 装饰',
      '空值显示 emptyText 占位',
    ],
  },
  tokens: ['--cd-descriptions-*', '--cd-spacing-*'],
} as const;
