/**
 * Machine-readable component metadata for AI/docs consumption.
 * Aggregated metadata for the Grid family (Row + Col).
 * 24-column flex grid with responsive breakpoint props (xs/sm/md/lg/xl/xxl).
 */
export const meta = {
  name: 'Grid',
  category: 'basic',
  description: '24 栅格布局：Row 容器 + Col 列，flex 实现，gutter 经 context 下发到 Col；支持 xs/sm/md/lg/xl/xxl 响应式断点（mobile-first 降级解析）。',
  exports: ['Row', 'Col'],
  // flat props (Row + Col merged); each item tagged with its owner.
  props: [
    {
      owner: 'Row',
      name: 'gutter',
      type: 'number|[number,number]|Partial<Record<Breakpoint,number|[number,number]>>',
      default: '0',
      desc: 'number→水平间距；[x,y]→水平+垂直；按断点对象 { xs,sm,md,... } 时按当前视口 mobile-first 降级解析',
    },
    {
      owner: 'Row',
      name: 'align',
      type: "'top'|'middle'|'bottom'|'baseline'|'stretch'",
      default: "'top'",
      desc: '映射 align-items',
    },
    {
      owner: 'Row',
      name: 'justify',
      type: "'start'|'end'|'center'|'space-between'|'space-around'|'space-evenly'",
      default: "'start'",
      desc: '映射 justify-content',
    },
    { owner: 'Row', name: 'wrap', type: 'boolean', default: 'true', desc: 'false→flex-wrap:nowrap' },
    { owner: 'Row', name: 'class', type: 'string', default: "''" },
    { owner: 'Col', name: 'span', type: 'number', default: 'undefined', desc: '0-24，0 隐藏，未设为自动列' },
    { owner: 'Col', name: 'offset', type: 'number', default: '0', desc: 'margin-inline-start 偏移列数' },
    { owner: 'Col', name: 'order', type: 'number', default: '0', desc: 'flex order' },
    { owner: 'Col', name: 'push', type: 'number', default: '0', desc: 'inset-inline-start 相对偏移' },
    { owner: 'Col', name: 'pull', type: 'number', default: '0', desc: 'inset-inline-end 相对偏移' },
    {
      owner: 'Col',
      name: 'flex',
      type: 'string|number',
      default: 'undefined',
      desc: '设置后优先于 span，直接控制 flex',
    },
    {
      owner: 'Col',
      name: 'xs|sm|md|lg|xl|xxl',
      type: 'number | { span?, offset?, order?, push?, pull?, flex? }',
      default: 'undefined',
      desc: '响应式断点覆盖：值为 number(span) 或子集对象，按当前视口 mobile-first 降级解析后覆盖基础 props',
    },
    { owner: 'Col', name: 'class', type: 'string', default: "''" },
  ],
  events: [],
  slots: [{ name: 'children', desc: 'Row 内放 Col；Col 内放任意内容' }],
  a11y: { hasRole: false, focusable: false, note: '纯布局容器，不引入语义角色' },
  tokens: ['--cd-grid-columns', '--cd-grid-gutter-x', '--cd-grid-gutter-y'],
  responsive: true,
  examples: [
    {
      title: '基础两栏',
      code: '<Row gutter={16}><Col span={12}>左</Col><Col span={12}>右</Col></Row>',
    },
    {
      title: '响应式断点',
      code: '<Row gutter={{ xs: 8, md: 24 }}><Col xs={24} md={12}>左</Col><Col xs={24} md={12}>右</Col></Row>',
    },
  ],
} as const;
