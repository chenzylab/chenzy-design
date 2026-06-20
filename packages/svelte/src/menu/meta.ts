/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 */
export const meta = {
  name: 'Menu',
  category: 'navigation',
  description:
    '导航菜单，数据驱动。支持 vertical/inline 模式、SubMenu 展开/收起、单选高亮，受控/非受控。',
  props: [
    { name: 'items', type: 'MenuItemDef[]', default: '[]', desc: '菜单数据（含 children 即 SubMenu；item.icon 为项前图标 Snippet）' },
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
      name: 'onSelect',
      type: '(key: string|number) => void',
      default: 'undefined',
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
      '选中叶子项 aria-current=true',
      '禁用项 aria-disabled=true 且原生 disabled',
      'TODO: horizontal/menubar roving tabindex、nav+links 语义区分',
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
