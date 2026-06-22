/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 */
export const meta = {
  name: 'Collapse',
  category: 'show',
  description:
    '折叠面板，分组承载内容、按需展开。支持数据驱动 panels 与声明式 <Collapse.Panel> 两种用法（择一）、受控 activeKey、accordion 手风琴、展开动画、箭头位置、边框与面板级 disabled。',
  props: [
    {
      name: 'panels',
      type: 'CollapsePanel[]',
      default: '[]',
      desc: '面板头部数据（数据驱动模式；为空且传 children 时切换为声明式 <Collapse.Panel>）',
    },
    {
      name: 'activeKey',
      type: 'string|string[]',
      default: 'undefined',
      desc: '受控展开键，仅 onChange 不回写',
    },
    { name: 'defaultActiveKey', type: 'string|string[]', default: 'undefined' },
    { name: 'accordion', type: 'boolean', default: 'false', desc: '手风琴模式，仅展开一个' },
    { name: 'size', type: "'small'|'default'|'large'", default: 'default' },
    { name: 'expandIconPosition', type: "'left'|'right'", default: 'right' },
    { name: 'bordered', type: 'boolean', default: 'true' },
    { name: 'disabled', type: 'boolean', default: 'false' },
    { name: 'motion', type: 'boolean', default: 'true', desc: '展开动画开关' },
    { name: 'lazyRender', type: 'boolean', default: 'false', desc: '首次展开后才渲染内容' },
    { name: 'keepDOM', type: 'boolean', default: 'true', desc: '展开过的内容保留 DOM' },
    { name: 'onChange', type: '(keys: string[]) => void', default: 'undefined' },
    { name: 'onExpand', type: '(detail: { key: string }) => void', default: 'undefined', desc: '某面板被展开后触发' },
    { name: 'onCollapse', type: '(detail: { key: string }) => void', default: 'undefined', desc: '某面板被收起后触发' },
    {
      name: 'onHeaderClick',
      type: '(detail: { key: string; event: MouseEvent }) => void',
      default: 'undefined',
      desc: 'Header 被点击触发（disabled 拦截前发出，可用于埋点）',
    },
    {
      name: 'children',
      type: 'Snippet<[{ key: string }]> | Snippet',
      default: 'undefined',
      desc: '数据驱动：按 key 渲染面板内容；声明式（不传 panels）：内嵌 <Collapse.Panel> 列表',
    },
  ],
  subcomponents: [
    {
      name: 'Collapse.Panel',
      desc: '声明式单面板，经 Object.assign(Collapse, { Panel }) 导出，父子状态用 context 传递（同 Timeline.Item / Form.Field 复合模式）。等价于 panels 数据驱动的一项，可放富内容头部/内容。',
      props: [
        { name: 'itemKey', type: 'string', default: '(required)', desc: '面板唯一标识，等价 panel.key' },
        { name: 'header', type: 'string', default: 'undefined', desc: '头部文本' },
        { name: 'disabled', type: 'boolean', default: 'false', desc: '面板级 disabled，该面板不可展开/收起' },
        { name: 'head', type: 'Snippet', default: 'undefined', desc: '头部富内容插槽，优先于 header' },
        { name: 'children', type: 'Snippet', default: 'undefined', desc: '面板内容' },
      ],
    },
  ],
  a11y: {
    role: 'region',
    keyboard: ['Tab', 'Enter', 'Space'],
    notes: [
      '面板头为原生 button，aria-expanded 标记展开态',
      'button aria-controls 指向内容 region，region aria-labelledby 指回头部',
      '折叠时内容区 hidden 移出可达性树',
      '箭头 aria-hidden=true',
    ],
  },
  tokens: [
    '--cd-collapse-*',
    '--cd-focus-ring',
    '--cd-radius-1',
    '--cd-spacing-2',
    '--cd-motion-ease-standard',
    '--cd-color-text-3',
  ],
} as const;
