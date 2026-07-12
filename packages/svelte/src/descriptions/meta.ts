/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 */
export const meta = {
  name: 'Descriptions',
  category: 'show',
  description:
    '描述列表，用于键值对的成组呈现。镜像 Semi Design：table 语义结构，data 数据驱动与 <Descriptions.Item> 声明式两种用法；align（center/justify/left/plain）四种对齐；layout（vertical/horizontal）+ column 每行列数；row 双行显示（small/medium/large）；keyStyle 自定义 key 样式；value 支持字符串或富内容 Snippet。',
  props: [
    { name: 'align', type: "'center'|'justify'|'left'|'plain'", default: "'center'", desc: '对齐方式（row=true 时失效）' },
    { name: 'row', type: 'boolean', default: 'false', desc: '是否双行显示' },
    { name: 'size', type: "'small'|'medium'|'large'", default: "'medium'", desc: '双行显示时的大小' },
    { name: 'data', type: 'DescriptionData[]', default: '[]', desc: '列表数据（不传时渲染 children 内的 Descriptions.Item）' },
    { name: 'layout', type: "'vertical'|'horizontal'", default: "'vertical'", desc: '布局模式' },
    { name: 'column', type: 'number', default: '3', desc: 'horizontal 布局下每行的总列数' },
    { name: 'class', type: 'string', default: "''" },
    { name: 'style', type: 'string', default: 'undefined' },
    { name: 'children', type: 'Snippet', default: 'undefined', desc: '声明式用法：内嵌 <Descriptions.Item>（不传 data 时生效）' },
  ],
  subComponents: [
    {
      name: 'Descriptions.Item',
      desc: '声明式描述项，itemKey 键值 + children 内容；渲染成 tr（vertical）或裸单元格（horizontal）。',
      props: [
        { name: 'itemKey', type: 'string', desc: '键值（label）' },
        { name: 'hidden', type: 'boolean', default: 'false', desc: '是否隐藏不展示' },
        { name: 'span', type: 'number', default: '1', desc: '跨列数' },
        { name: 'keyStyle', type: 'string', desc: 'key 的自定义样式' },
        { name: 'class', type: 'string', desc: '外层 tr 的类名' },
        { name: 'style', type: 'string', desc: '外层 tr 的内联样式' },
        { name: 'children', type: 'Snippet', desc: '描述内容' },
      ],
    },
  ],
  a11y: {
    role: 'description list',
    notes: [
      'table 语义结构（th 为 key、td 为 value）',
      'plain/横向布局下 key 与 value 同排，key 后内联冒号',
      'hidden 项不渲染',
    ],
  },
  tokens: [
    // Semi descriptions/variables.scss 全量对齐（19），组件直接消费原始层
    '--cd-font-descriptions-lineheight',
    '--cd-font-descriptions-value-fontweight',
    '--cd-spacing-descriptions-th-paddingright',
    '--cd-spacing-descriptions-item-paddingbottom',
    '--cd-spacing-descriptions-item-small-paddingright',
    '--cd-spacing-descriptions-item-medium-paddingright',
    '--cd-spacing-descriptions-item-large-paddingright',
    '--cd-spacing-descriptions-key-medium-paddingbottom',
    '--cd-spacing-descriptions-key-large-paddingbottom',
    '--cd-color-descriptions-key-text-default',
    '--cd-color-descriptions-value-text-default',
    '--cd-spacing-descriptions-value-plain-paddingleft',
    '--cd-spacing-descriptions-item-double-padding',
    '--cd-font-descriptions-key-small-fontsize',
    '--cd-font-descriptions-value-small-fontsize',
    '--cd-font-descriptions-key-medium-fontsize',
    '--cd-font-descriptions-value-medium-fontsize',
    '--cd-font-descriptions-key-large-fontsize',
    '--cd-font-descriptions-value-large-fontsize',
  ],
} as const;
