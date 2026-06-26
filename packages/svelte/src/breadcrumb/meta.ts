/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 */
export const meta = {
  name: 'Breadcrumb',
  category: 'navigation',
  description:
    '面包屑导航，展示当前页面在层级结构中的位置。支持数据驱动 routes 与声明式 Item 两种用法。',
  props: [
    {
      name: 'routes',
      type: 'BreadcrumbRoute[]',
      default: '[]',
      desc: '数据驱动的路由项，最后一项为当前页（aria-current=page）',
    },
    { name: 'separator', type: 'string', default: "'/'", desc: '分隔符文本' },
    { name: 'maxItemCount', type: 'number', default: '0', desc: '超出时中间折叠（0=不折叠）' },
    {
      name: 'showTooltip',
      type: 'boolean',
      default: 'false',
      desc: '项文本超出 --cd-breadcrumb-item-max-width 被截断时，hover 用 Tooltip 展示完整 label',
    },
    {
      name: 'moreType',
      type: "'tooltip'|'popover'",
      default: 'undefined',
      desc: '折叠 … 的浮层类型：tooltip 悬浮列出被折叠项文本；popover 点击展开可点击跳转的折叠项列表。不设时点击 … 直接展开全部（向后兼容）',
    },
    { name: 'size', type: "'small'|'default'|'large'", default: 'default' },
    {
      name: 'compact',
      type: 'boolean',
      default: 'true',
      desc: '紧凑模式；false 时根元素附加 cd-breadcrumb--loose 类（更大字号/间距）',
    },
    {
      name: 'autoCollapse',
      type: 'boolean',
      default: 'true',
      desc: '超出 maxItemCount 时是否自动折叠；false 时始终展示全部项',
    },
    {
      name: 'activeIndex',
      type: 'number',
      default: 'undefined',
      desc: '受控选中项索引（配合 onClick 使用，令对应项高亮）',
    },
    {
      name: 'renderItem',
      type: '(route: BreadcrumbRoute, index: number, isLast: boolean) => Snippet',
      default: 'undefined',
      desc: '自定义路由项渲染（routes 模式）；传入时替换默认的链接/文本/当前页渲染逻辑',
    },
    {
      name: 'renderMore',
      type: '(restItems: CollapsedRoute[]) => Snippet',
      default: 'undefined',
      desc: '自定义折叠 … 区域渲染；传入时接管折叠展示（替代 moreType 内置浮层），参数为被折叠路由列表',
    },
    { name: 'class', type: 'string', default: "''" },
    {
      name: 'children',
      type: 'Snippet',
      default: 'undefined',
      desc: '声明式 <Breadcrumb.Item> 列表；项间分隔符按 separator 纯 CSS 自动插入，最后一项后无分隔符',
    },
    {
      name: 'onClick',
      type: '(route: BreadcrumbRoute, index: number) => void',
      default: 'undefined',
    },
  ],
  subComponents: [
    {
      name: 'BreadcrumbItem',
      usage: '<Breadcrumb.Item> 或 <BreadcrumbItem>，置于 <Breadcrumb> 的 children 内',
      desc: '声明式面包屑项；项间分隔符由父级纯 CSS 自动插入，最后一项自动渲染为当前页（不可点 + aria-current=page）',
      props: [
        { name: 'href', type: 'string', default: 'undefined', desc: '链接地址；最后一项忽略 href' },
        {
          name: 'separator',
          type: 'string',
          default: 'undefined',
          desc: '覆盖父级 separator，仅对本项末尾分隔符生效（通过内联 CSS 变量实现）',
        },
        {
          name: 'noLink',
          type: 'boolean',
          default: 'false',
          desc: '禁止链接/按钮行为，渲染为普通 span（不可点击）；忽略 href 和 onClick；末项始终无链接',
        },
        {
          name: 'icon',
          type: 'Snippet',
          default: 'undefined',
          desc: '项前置图标 snippet，渲染在 children 之前',
        },
        { name: 'class', type: 'string', default: "''" },
        { name: 'children', type: 'Snippet', default: 'undefined' },
        {
          name: 'onClick',
          type: '(e: MouseEvent) => void',
          default: 'undefined',
          desc: '点击/键盘激活回调；最后一项及 noLink=true 时不触发',
        },
      ],
    },
  ],
  a11y: {
    role: 'navigation',
    keyboard: ['Enter', 'Space'],
    notes: [
      'nav[aria-label] 包裹 ol 有序列表',
      '最后一项 aria-current=page，不可点击',
      '无 href 的中间项用 role=link + tabindex=0 + 键盘可激活',
      '分隔符 aria-hidden=true',
    ],
  },
  tokens: [
    '--cd-breadcrumb-*',
    '--cd-breadcrumb-item-max-width',
    '--cd-focus-ring',
    '--cd-font-size-*',
    '--cd-radius-1',
  ],
} as const;
