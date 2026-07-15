/**
 * Machine-readable component metadata for AI/docs consumption.
 * Aggregated metadata for the Grid family (Row + Col).
 * 24-column float grid with responsive breakpoint props (xs/sm/md/lg/xl/xxl).
 */
export const meta = {
  name: 'Grid',
  category: 'basic',
  description:
    '24 栅格布局：Row 容器 + Col 列，严格对齐 Semi。默认 Row=cd-row（display:block + clearfix），Col 用 float:left + width% 布局；Row type="flex" 时切 flex 布局并激活 justify/align（cd-row-flex-{justify}/-{align}）。gutter 经 context 下发到 Col：Row 施加四向负 margin、Col 施加四向 padding 抵消，支持 [x,y] 与响应式对象（screens 状态机 + responsiveArray 从大到小降级）。Col 响应式为纯 CSS 类驱动（cd-col-{bp}-{span} 等，靠 @media 断点层叠）。',
  exports: ['Row', 'Col'],
  // flat props (Row + Col merged); each item tagged with its owner.
  props: [
    {
      owner: 'Row',
      name: 'type',
      type: "'flex'",
      default: 'undefined',
      desc: "设为 'flex' 时用 flex 布局（cd-row-flex）并激活 justify/align；缺省为 cd-row（block + float 清除）",
    },
    {
      owner: 'Row',
      name: 'gutter',
      type: 'number|[number,number]|Partial<Record<Breakpoint,number>>',
      default: '0',
      desc: 'number→水平间距；[x,y]→水平+垂直；按断点对象 { xs,sm,md,... } 时经 screens 状态机 + responsiveArray 从大到小降级取第一个命中且有值的断点（对齐 Semi getGutter）。Row 施加四向负 margin，Col 四向 padding 抵消',
    },
    {
      owner: 'Row',
      name: 'align',
      type: "'top'|'middle'|'bottom'",
      default: 'undefined',
      desc: 'type="flex" 下生效：映射 align-items（cd-row-flex-top/middle/bottom）',
    },
    {
      owner: 'Row',
      name: 'justify',
      type: "'start'|'end'|'center'|'space-between'|'space-around'",
      default: "'start'",
      desc: 'type="flex" 下生效：映射 justify-content（cd-row-flex-start/center/end/space-between/space-around）',
    },
    { owner: 'Row', name: 'class', type: 'string', default: "''" },
    { owner: 'Row', name: 'style', type: 'string', default: "''", desc: '内联样式，追加在 gutter margin 之后（可覆盖）' },
    { owner: 'Col', name: 'span', type: 'number', default: 'undefined', desc: '0-24，生成 cd-col-{span} 类（float:left + width%）；0 → cd-col-0 隐藏，未设为自动列' },
    { owner: 'Col', name: 'offset', type: 'number', default: '0', desc: 'cd-col-offset-{n} → margin-left 偏移列数' },
    { owner: 'Col', name: 'order', type: 'number', default: '0', desc: 'cd-col-order-{n} → order（type="flex" 下生效）' },
    { owner: 'Col', name: 'push', type: 'number', default: '0', desc: 'cd-col-push-{n} → left 相对偏移' },
    { owner: 'Col', name: 'pull', type: 'number', default: '0', desc: 'cd-col-pull-{n} → right 相对偏移' },
    {
      owner: 'Col',
      name: 'xs|sm|md|lg|xl|xxl',
      type: 'number | { span?, offset?, order?, push?, pull? }',
      default: 'undefined',
      desc: '响应式断点覆盖：值为 number(span) 或子集对象，生成 cd-col-{bp}-{span} 等 CSS 类，靠 @media (min-width) 断点层叠（纯 CSS 驱动，不读 JS 断点）',
    },
    { owner: 'Col', name: 'class', type: 'string', default: "''" },
    { owner: 'Col', name: 'style', type: 'string', default: "''", desc: '内联样式，追加在 gutter padding 之后（可覆盖）' },
  ],
  events: [],
  slots: [{ name: 'children', desc: 'Row 内放 Col；Col 内放任意内容' }],
  a11y: { hasRole: false, focusable: false, note: '纯布局容器，不引入语义角色' },
  // Grid 走 float + 内联样式，无运行时组件级 CSS 变量。
  tokens: [],
  responsive: true,
  examples: [
    {
      title: '基础两栏',
      code: '<Row gutter={16}><Col span={12}>左</Col><Col span={12}>右</Col></Row>',
    },
    {
      title: 'Flex 水平排列',
      code: '<Row type="flex" justify="center"><Col span={4}>col</Col><Col span={4}>col</Col></Row>',
    },
    {
      title: '响应式断点',
      code: '<Row gutter={{ xs: 8, md: 24 }}><Col xs={24} md={12}>左</Col><Col xs={24} md={12}>右</Col></Row>',
    },
  ],
} as const;
