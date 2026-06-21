/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 */
export const meta = {
  name: 'Descriptions',
  category: 'show',
  description:
    '描述列表，成组展示只读字段。支持 data 数据驱动与 <Descriptions.Item> 声明式两种用法、inline/row 布局、column 列数（含响应式断点对象）、bordered 边框、colon 冒号、水平/垂直方向与 align/justify 对齐。',
  props: [
    { name: 'data', type: 'DescriptionItem[]', default: '[]', desc: '描述项数据（不传时渲染 children 内的 Descriptions.Item）' },
    { name: 'layout', type: "'inline'|'row'", default: 'inline' },
    { name: 'direction', type: "'horizontal'|'vertical'", default: 'horizontal' },
    { name: 'column', type: 'number | Partial<Record<Breakpoint, number>>', default: '3', desc: '列数；可传断点对象 { xs?, sm?, md?, lg?, xl?, xxl? } 按视口宽响应（mobile-first 向下级联）' },
    { name: 'size', type: "'small'|'default'|'large'", default: 'default' },
    { name: 'bordered', type: 'boolean', default: 'false' },
    { name: 'colon', type: 'boolean', default: 'true' },
    { name: 'align', type: "'left'|'center'|'right'", default: 'left', desc: '内容（value）水平对齐' },
    { name: 'justify', type: "'start'|'center'|'end'|'between'", default: 'start', desc: '每个 item 内 label 与 value 的排布对齐' },
    { name: 'title', type: 'string', default: 'undefined' },
    { name: 'emptyText', type: 'string', default: "'-'", desc: '空值占位' },
    { name: 'class', type: 'string', default: "''" },
    { name: 'children', type: 'Snippet', default: 'undefined', desc: '声明式用法：内嵌 <Descriptions.Item>（不传 data 时生效）' },
  ],
  subComponents: [
    {
      name: 'Descriptions.Item',
      desc: '声明式描述项，label 标签 + children 内容，span 跨列经 context 读取父 column 钳制；与 data 模式渲染同一套结构，复用父级 grid/bordered/方向布局。',
      props: [
        { name: 'label', type: 'string', desc: '字段标签' },
        { name: 'span', type: 'number', default: '1', desc: '跨列数（钳制到父 column）' },
        { name: 'children', type: 'Snippet', desc: '描述内容（为空回退父 emptyText）' },
      ],
    },
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
