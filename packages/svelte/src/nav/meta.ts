/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 */
export const meta = {
  name: 'Nav',
  category: 'navigation',
  description:
    '站点导航菜单（对齐 Semi Navigation）。支持垂直/水平模式、子导航、logo 头部、折叠按钮。字段对齐 Semi（itemKey/text/icon/items），内部委托 Menu 渲染导航体。',
  props: [
    {
      name: 'items',
      type: 'NavItemDef[]',
      default: '[]',
      desc: '导航项列表，字段对齐 Semi：itemKey/text/icon/items（含 items 即子导航）',
    },
    { name: 'mode', type: "'vertical'|'horizontal'", default: "'vertical'", desc: '导航方向：侧边/顶部' },
    { name: 'selectedKeys', type: 'NavKey[]', default: 'undefined', desc: '受控选中项 key 数组' },
    { name: 'defaultSelectedKeys', type: 'NavKey[]', default: 'undefined', desc: '默认选中项 key 数组' },
    { name: 'openKeys', type: 'NavKey[]', default: 'undefined', desc: '受控展开子导航 key（vertical 且未折叠有效）' },
    { name: 'defaultOpenKeys', type: 'NavKey[]', default: 'undefined', desc: '默认展开子导航 key' },
    { name: 'isCollapsed', type: 'boolean', default: 'undefined', desc: '受控折叠态（仅 vertical 有效）' },
    { name: 'defaultIsCollapsed', type: 'boolean', default: 'false', desc: '默认折叠态（仅 vertical 有效）' },
    { name: 'header', type: '{ logo?: Snippet; text?: string }', default: 'undefined', desc: '头部配置（logo + 文案）' },
    { name: 'footer', type: '{ collapseButton?: boolean }', default: 'undefined', desc: '底部配置（收起按钮，仅 vertical）' },
    { name: 'disabled', type: 'boolean', default: 'false', desc: '整体禁用' },
    { name: 'class', type: 'string', default: 'undefined', desc: '根元素自定义类名' },
    { name: 'style', type: 'string', default: 'undefined', desc: '根元素自定义内联样式' },
    { name: 'bodyStyle', type: 'string', default: 'undefined', desc: '导航项列表容器样式（对齐 Semi bodyStyle）' },
    { name: 'ariaLabel', type: 'string', default: 'undefined', desc: '可访问性标签' },
  ],
  events: [
    { name: 'onSelect', payload: 'NavKey', desc: '选中导航项时触发' },
    { name: 'onOpenChange', payload: 'NavKey[]', desc: '展开/收起子导航时触发' },
    { name: 'onCollapseChange', payload: 'boolean', desc: '折叠态变化时触发' },
  ],
  slots: [
    { name: 'headerSlot', desc: '自定义头部（覆盖 header 配置对象）' },
    { name: 'footerSlot', desc: '自定义底部（覆盖 footer 配置对象）' },
  ],
  subComponents: [
    {
      name: 'Nav.Header',
      element: 'div',
      props: [
        { name: 'logo', type: 'Snippet', default: 'undefined', desc: 'Logo 节点' },
        { name: 'text', type: 'string', default: 'undefined', desc: 'Logo 文案' },
        { name: 'class', type: 'string', default: 'undefined', desc: '自定义类名' },
        { name: 'style', type: 'string', default: 'undefined', desc: '自定义内联样式' },
      ],
    },
    {
      name: 'Nav.Footer',
      element: 'div',
      props: [
        { name: 'collapseButton', type: 'boolean', default: 'false', desc: '收起按钮（仅 vertical 生效）' },
        { name: 'class', type: 'string', default: 'undefined', desc: '自定义类名' },
        { name: 'style', type: 'string', default: 'undefined', desc: '自定义内联样式' },
      ],
    },
  ],
  a11y: {
    role: 'navigation',
    keyboard: ['Tab', 'Shift+Tab', 'Enter'],
    notes: [
      '委托 Menu purpose=navigation：渲染 <nav> landmark + 含 link 的叶子为原生 <a>',
      '选中项 aria-current=page；折叠按钮原生 button + aria-expanded + aria-label',
    ],
  },
  tokens: ['--cd-nav-*'],
  aiHints: [
    '侧边导航用 mode=vertical + footer={{collapseButton:true}}；顶部导航用 mode=horizontal。',
    'items 字段对齐 Semi：itemKey/text/icon/items（非 Menu 的 key/label）。',
    '配合 Layout：<Layout.Sider><Nav mode=vertical/></Layout.Sider> 或 <Layout.Header><Nav mode=horizontal/></Layout.Header>。',
  ],
  examples: [
    {
      title: '侧边导航',
      code: '<Nav mode="vertical" items={items} header={{logo, text:"后台"}} footer={{collapseButton:true}} />',
    },
  ],
} as const;
