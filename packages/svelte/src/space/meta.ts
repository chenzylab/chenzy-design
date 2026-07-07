/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/components/basic/Space.spec.md.
 */
export const meta = {
  name: 'Space',
  category: 'basic',
  stage: 'M1',
  semiEquivalent: 'Space',
  description: '间距布局容器，在一组相邻子元素之间施加统一、可控的间隔。',
  tags: ['layout', 'spacing', 'flex', 'container', 'inline', 'stack'],
  whenToUse: '一组相邻元素需要统一间距时（按钮组、标签组、内联表单控件、卡片操作区）。',
  whenNotToUse: '二维网格布局（用 Grid）、需要比例分配（用 flex/Grid）、超长列表（用虚拟列表）。',
  props: [
    { name: 'vertical', type: 'boolean', default: 'false', desc: '是否竖向排列（对齐 Semi）' },
    {
      name: 'spacing',
      type: "'tight'|'medium'|'loose'|number|[SpacingItem, SpacingItem]",
      default: "'tight'",
      desc: '档位映射 token，number→px，数组 [水平, 垂直] 分别控制 column-gap/row-gap；对齐 Semi：tight=8/medium=16/loose=24',
    },
    {
      name: 'align',
      type: "'start'|'end'|'center'|'baseline'",
      default: "'center'",
      desc: '交叉轴对齐，映射 align-items',
    },
    { name: 'wrap', type: 'boolean', default: 'false', desc: '横向排布是否自动换行（vertical 时强制不换行）' },
    { name: 'block', type: 'boolean', default: 'false', desc: 'true→display:flex 占满父宽（Semi 无，超集）' },
    { name: 'tag', type: 'keyof HTMLElementTagNameMap', default: "'div'", desc: '根元素标签（Semi 无，超集）' },
    { name: 'class', type: 'string', default: "''" },
    { name: 'style', type: 'string', default: "''" },
  ],
  events: [],
  slots: [{ name: 'children', desc: '需要被施加间距的一组子元素' }],
  a11y: {
    role: 'none',
    note: '纯布局容器，不引入语义；不重排 DOM，视觉顺序 = DOM 顺序 = Tab 顺序',
  },
  tokens: ['--cd-space-tight', '--cd-space-medium', '--cd-space-loose'],
  examples: [
    { title: '横向按钮组', code: '<Space><Button>A</Button><Button>B</Button></Space>' },
    { title: 'wrap 标签云', code: '<Space wrap spacing={[8, 16]}>...</Space>' },
    { title: '竖向表单', code: '<Space vertical>...</Space>' },
  ],
} as const;
