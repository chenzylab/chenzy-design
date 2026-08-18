/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 */
export const meta = {
  name: 'Breadcrumb',
  category: 'navigation',
  description:
    '面包屑导航，展示当前页面在层级结构中的位置。字段/API/DOM/class 严格对齐 Semi semi-ui/breadcrumb（index.tsx + item.tsx + bread-context.tsx 三文件拆分同构）。routes 元素为 Route 对象（{name, path, href, icon}）或纯字符串。支持数据驱动 routes 与声明式 Item 两种用法。icon/separator/renderItem/renderMore 均为组件引用直传（非 Snippet：Svelte 5 运行时无法可靠区分 Snippet 与裸 Component，见 Item.svelte 头注释）。',
  props: [
    {
      name: 'routes',
      type: '(BreadcrumbRoute | string)[]',
      default: '[]',
      desc: '数据驱动的路由项，元素为 Route 对象或纯字符串（字符串即 name）；最后一项为当前页（aria-current=page）',
    },
    {
      name: 'separator',
      type: 'string | Component<BreadcrumbIconProps>',
      default: "'/'",
      desc: '分隔符，字符串或组件引用直传（对齐 Semi separator: ReactNode，如 separator={IconArrowRight}）',
    },
    { name: 'maxItemCount', type: 'number', default: '4', desc: '超出时中间折叠（对齐 Semi；<=0 不折叠）' },
    {
      name: 'showTooltip',
      type: "boolean | { width?: number|string; ellipsisPos?: 'end'|'middle'; opts?: object }",
      default: "{ width: 150, ellipsisPos: 'end' }",
      desc: '项文本超出 width（默认 150）被截断时，hover 用 Tooltip 展示完整名；对象配置 width/ellipsisPos（对齐 Semi defaultProps.showTooltip 真实默认值，非 false，默认即开启）',
    },
    {
      name: 'moreType',
      type: "'default'|'popover'",
      default: "'default'",
      desc: '折叠 … 的浮层类型（对齐 Semi）：default 点击三点图标就地展开全部；popover 悬浮弹出可点击的折叠项菜单',
    },
    {
      name: 'aria-label',
      type: 'string',
      default: 'undefined',
      desc: '无障碍标签，默认取 i18n Breadcrumb.aria-label；传入覆盖（对齐 Semi aria-label）',
    },
    { name: 'style', type: 'string', default: 'undefined', desc: '根节点内联样式（对齐 Semi style）' },
    {
      name: 'compact',
      type: 'boolean',
      default: 'true',
      desc: '紧凑模式；false 时根元素改为 cd-breadcrumb-wrapper-loose 类（更大字号）',
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
      type: 'Component<{ route: BreadcrumbRoute }>',
      default: 'undefined',
      desc: '自定义路由项渲染（routes 模式）；传入时替换默认的链接/文本/当前页渲染逻辑（对齐 Semi renderItem(route)，Svelte 中经组件 props.route 取数据）',
    },
    {
      name: 'renderMore',
      type: 'Component<{ restItems: Array<{ route: BreadcrumbRoute; index: number }> }>',
      default: 'undefined',
      desc: '自定义折叠 … 区域渲染；传入时接管折叠展示（替代 moreType 内置浮层），经 props.restItems 取被折叠路由列表。已知限制：仅 routes 数据驱动模式有完整数据；声明式 <Breadcrumb.Item> 子组件模式下 restItems 恒为空数组（Svelte 无 React.Children.toArray 等价能力，父组件无法取得子组件内部路由数据），moreType="popover" 同样受此限制',
    },
    { name: 'class', type: 'string', default: "''" },
    {
      name: 'children',
      type: 'Snippet',
      default: 'undefined',
      desc: '声明式 <Breadcrumb.Item> 子组件列表（Svelte 原生组件嵌套插槽，等价 Semi JSX children，非自定义回调）',
    },
    {
      name: 'onClick',
      type: '(route: BreadcrumbRoute, event: MouseEvent) => void',
      default: 'undefined',
      desc: '单击事件（对齐 Semi onClick(route, event)）',
    },
  ],
  subComponents: [
    {
      name: 'BreadcrumbItem',
      usage: '<Breadcrumb.Item> 或 <BreadcrumbItem>，置于 <Breadcrumb> 的 children 内',
      desc: '声明式面包屑项，严格对齐 semi-ui/breadcrumb/item.tsx；最后一项自动渲染为当前页（不可点 + aria-current=page，挂在 item-wrap 而非 item 本体）',
      props: [
        { name: 'href', type: 'string', default: 'undefined', desc: '链接地址；active（最后一项）或无 href 时渲染为 span，否则为 a' },
        {
          name: 'separator',
          type: 'string',
          default: 'undefined',
          desc: '覆盖父级 separator，仅对本项末尾分隔符生效（完整替换，对齐 Semi this.props.separator || <span>{context.separator}</span>）',
        },
        {
          name: 'noLink',
          type: 'boolean',
          default: 'false',
          desc: '禁止链接行为，忽略 href（不影响 item-active class 判定，二者独立）',
        },
        {
          name: 'icon',
          type: 'Component<BreadcrumbIconProps>',
          default: 'undefined',
          desc: '项前置图标，组件引用直传（如 icon={IconHome}），内部按 compact 注入 size=small|default（对齐 Semi renderIcon）',
        },
        { name: 'class', type: 'string', default: "''" },
        { name: 'children', type: 'Snippet', default: 'undefined', desc: '项文本内容，内部经 Typography.Text 渲染 ellipsis 截断（对齐 Semi renderBreadItem）' },
        {
          name: 'onClick',
          type: '(e: MouseEvent) => void',
          default: 'undefined',
          desc: '点击/键盘激活回调',
        },
      ],
    },
  ],
  a11y: {
    role: 'navigation',
    keyboard: ['Enter'],
    notes: [
      'nav[aria-label] 下直接放扁平 item-wrap span（对齐 Semi，无 ol/li 列表包裹）',
      '最后一项 aria-current=page 挂在 item-wrap（对齐 Semi render() pageLabel），项本体渲染为不可点 span',
      '无 href 的中间项为纯 <span onClick>，无 tabIndex/role（如实对齐 Semi 行为，非本库补充）',
      '折叠触发器 role=button + tabindex=0 + aria-label="Expand breadcrumb items"',
    ],
  },
  tokens: [
    // 全量对齐 Semi breadcrumb/variables.scss（16 个）+ animation.scss（4 个）
    '--cd-spacing-breadcrumb-item-wrap-marginy',
    '--cd-spacing-breadcrumb-item-wrap-marginright',
    '--cd-spacing-breadcrumb-item-marginright',
    '--cd-spacing-breadcrumb-item-text-marginleft',
    '--cd-spacing-breadcrumb-restitem-marginright',
    '--cd-color-breadcrumb-default-text-default',
    '--cd-color-breadcrumb-default-text-hover',
    '--cd-color-breadcrumb-default-text-active',
    '--cd-color-breadcrumb-active-text-default',
    '--cd-color-breadcrumb-active-text-active',
    '--cd-color-breadcrumb-sepearator-default-icon-default',
    '--cd-color-breadcrumb-restitem-text-default',
    '--cd-font-breadcrumb-default-fontweight',
    '--cd-font-breadcrumb-active-fontweight',
    '--cd-font-breadcrumb-compact-fontsize',
    '--cd-font-breadcrumb-loose-fontsize',
    '--cd-transition-duration-breadcrumb-link-text',
    '--cd-transition-function-breadcrumb-link-text',
    '--cd-transition-delay-breadcrumb-link-text',
    '--cd-transform-scale-breadcrumb-link-text',
  ],
} as const;
