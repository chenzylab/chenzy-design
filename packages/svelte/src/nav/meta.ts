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
    { name: 'inlineIndent', type: 'number', default: '24', desc: '子级缩进像素（透传 Menu）' },
    { name: 'limitIndent', type: 'boolean', default: 'true', desc: '仅一级缩进；false 时逐级缩进' },
    { name: 'toggleIconPosition', type: "'left'|'right'", default: "'right'", desc: '子导航展开箭头位置' },
    { name: 'expandIcon', type: 'Snippet', default: 'undefined', desc: '自定义展开箭头图标' },
    { name: 'subNavMotion', type: 'boolean', default: 'true', desc: '子导航展开动画开关' },
    { name: 'subNavOpenDelay', type: 'number', default: 'undefined', desc: '浮层子导航展开延迟 ms' },
    { name: 'subNavCloseDelay', type: 'number', default: 'undefined', desc: '浮层子导航关闭延迟 ms' },
    { name: 'getPopupContainer', type: '() => HTMLElement', default: 'undefined', desc: '浮层挂载容器' },
    { name: 'renderWrapper', type: 'Snippet', default: 'undefined', desc: '自定义导航项外层包裹' },
    { name: 'class', type: 'string', default: 'undefined', desc: '根元素自定义类名' },
    { name: 'style', type: 'string', default: 'undefined', desc: '根元素自定义内联样式' },
    { name: 'bodyStyle', type: 'string', default: 'undefined', desc: '导航项列表容器样式（对齐 Semi bodyStyle）' },
    { name: 'ariaLabel', type: 'string', default: 'undefined', desc: '可访问性标签' },
  ],
  events: [
    { name: 'onSelect', payload: 'NavKey', desc: '选中导航项时触发' },
    { name: 'onClick', payload: 'NavKey', desc: '点击任意导航项时触发' },
    { name: 'onOpenChange', payload: 'NavKey[]', desc: '展开/收起子导航时触发' },
    { name: 'onCollapseChange', payload: 'boolean', desc: '折叠态变化时触发' },
  ],
  slots: [
    { name: 'headerSlot', desc: '自定义头部（覆盖 header 配置对象）' },
    { name: 'footerSlot', desc: '自定义底部（覆盖 footer 配置对象）' },
    { name: 'children', desc: '声明式子项（<Nav.Item>/<Nav.Sub>），与 items 二选一' },
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
    {
      name: 'Nav.Item',
      element: '—',
      props: [
        { name: 'itemKey', type: 'NavKey', default: '—', desc: '导航项唯一标识（必填）' },
        { name: 'text', type: 'string', default: '—', desc: '导航项文案' },
        { name: 'icon', type: 'Snippet', default: 'undefined', desc: '项前置图标' },
        { name: 'disabled', type: 'boolean', default: 'undefined', desc: '是否禁用' },
        { name: 'link', type: 'string', default: 'undefined', desc: '链接地址（渲染原生 <a>）' },
        { name: 'target', type: 'string', default: 'undefined', desc: '链接 target' },
        { name: 'rel', type: 'string', default: 'undefined', desc: '链接 rel' },
        { name: 'onClick', type: '(e: MouseEvent) => void', default: 'undefined', desc: '项级点击回调' },
        { name: 'onMouseEnter', type: '(e: MouseEvent) => void', default: 'undefined', desc: '鼠标移入' },
        { name: 'onMouseLeave', type: '(e: MouseEvent) => void', default: 'undefined', desc: '鼠标移出' },
      ],
    },
    {
      name: 'Nav.Sub',
      element: '—',
      props: [
        { name: 'itemKey', type: 'NavKey', default: '—', desc: '子导航唯一标识（必填）' },
        { name: 'text', type: 'string', default: '—', desc: '子导航标题文案' },
        { name: 'icon', type: 'Snippet', default: 'undefined', desc: '标题前置图标' },
        { name: 'disabled', type: 'boolean', default: 'undefined', desc: '是否禁用' },
        { name: 'children', type: 'Snippet', default: 'undefined', desc: '内嵌 Nav.Item / Nav.Sub' },
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
