/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 */
export const meta = {
  name: 'Menu',
  category: 'navigation',
  description:
    '导航菜单，数据驱动。支持 vertical/inline/horizontal 模式、SubMenu 展开/收起、单选/多选高亮，受控/非受控。items 支持 type=divider 分隔符与 type=group 分组标题。purpose 区分命令式菜单（menu/menuitem 语义）与站点导航（nav landmark + 原生 <a> 链接语义）。',
  props: [
    {
      name: 'items',
      type: 'MenuItemDef[]',
      default: '[]',
      desc: '菜单数据。普通项可省略 type（含 children 即可展开的 SubMenu，item.icon 为项前图标 Snippet）；{ type:"divider" } 渲染水平分隔线；{ type:"group", label, children } 渲染始终展开的分组标题 + 组内项。navigation 用途下叶子可带 href/target/rel，渲染为原生 <a>',
    },
    {
      name: 'mode',
      type: "'vertical'|'inline'|'horizontal'",
      default: 'vertical',
      desc: 'vertical=SubMenu hover 浮层；inline=内联展开；horizontal=顶部菜单栏 + ←→ roving',
    },
    {
      name: 'selectedKeys',
      type: '(string|number)[]',
      default: 'undefined',
      desc: '受控选中项（单选取首项）',
    },
    { name: 'defaultSelectedKeys', type: '(string|number)[]', default: '[]' },
    {
      name: 'openKeys',
      type: '(string|number)[]',
      default: 'undefined',
      desc: '受控展开的 SubMenu',
    },
    { name: 'defaultOpenKeys', type: '(string|number)[]', default: '[]' },
    { name: 'size', type: "'small'|'default'|'large'", default: 'default' },
    { name: 'inlineIndent', type: 'number', default: '24', desc: '子级缩进像素' },
    {
      name: 'inlineCollapsed',
      type: 'boolean',
      default: 'false',
      desc: 'inline 模式折叠为图标轨：仅显图标、容器变窄，有子菜单的项 hover 向右弹浮层（无图标项取 label 首字符；保留 aria-label/title 可访问名）',
    },
    {
      name: 'multiple',
      type: 'boolean',
      default: 'false',
      desc: '多选模式：点击叶子项 toggle 选中态，selectedKeys 可含多项同时高亮并显勾选标记。受控下父组件依据 onSelect(key) 自行 toggle selectedKeys；非受控由组件内部维护多选 Set',
    },
    {
      name: 'purpose',
      type: "'menu'|'navigation'",
      default: 'menu',
      desc: "语义用途。'menu'（默认，向后兼容）=命令式菜单：role=menu/menuitem + roving tabindex，叶子 button+onClick。'navigation'=站点导航：<nav> landmark 包裹原生 list，含 href 的叶子渲染原生 <a href>（aria-current=page），沿用浏览器链接 + Tab 键序，不用 menuitem role。role 由 deriveMenuSemantics 纯函数据 purpose+mode+multiple 派生",
    },
    {
      name: 'onSelect',
      type: '(key: string|number) => void',
      default: 'undefined',
      desc: '点击叶子项回调，回传被点击的 key（多选语义不变，由父组件据此 toggle）',
    },
    {
      name: 'onOpenChange',
      type: '(keys: (string|number)[]) => void',
      default: 'undefined',
    },
    { name: 'ariaLabel', type: 'string', default: 'undefined' },
  ],
  a11y: {
    role: 'menu',
    keyboard: ['Tab', 'Enter', 'Space'],
    notes: [
      'ul[role=menu] > li[role=none] > button[role=menuitem] 结构',
      'SubMenu 标题 aria-haspopup=true + aria-expanded 反映展开态',
      '选中叶子项 aria-current=true（单选）；multiple 下叶子项 role=menuitemcheckbox + aria-checked',
      '禁用项 aria-disabled=true 且原生 disabled',
      'divider 渲染 li[role=separator]，不可聚焦不可选；键盘导航天然跳过（非 menuitem）',
      'group 渲染组标题（不可点击）+ ul[role=group][aria-label=分组名]，组内项正常 menuitem 可选；组标题不可聚焦故键盘跳过',
      "purpose='navigation'：<nav aria-label> landmark 包裹原生 ul>li>a（去除 menu/menuitem/separator/group 等 role），含 href 叶子为 <a href>，当前项 aria-current=page；用浏览器原生链接 + Tab 键序导航，不接管 ←→ roving",
      "purpose='menu'（默认）：role=menu/menubar + menuitem，叶子 button + onClick，行为完全向后兼容；role 集合由 deriveMenuSemantics(purpose, mode, multiple) 纯函数派生（红线 #2）",
    ],
  },
  tokens: [
    '--cd-menu-bg',
    '--cd-menu-item-height',
    '--cd-menu-item-padding',
    '--cd-menu-item-color',
    '--cd-menu-item-color-selected',
    '--cd-menu-item-color-disabled',
    '--cd-menu-item-bg-hover',
    '--cd-menu-item-bg-selected',
    '--cd-menu-item-indicator',
    '--cd-menu-submenu-arrow-color',
    '--cd-focus-ring',
    '--cd-motion-*',
  ],
} as const;
