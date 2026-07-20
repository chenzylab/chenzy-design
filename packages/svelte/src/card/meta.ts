/**
 * Machine-readable component metadata for AI/docs consumption.
 * Card — 对齐 Semi Design Card。
 */
export const meta = {
  name: 'Card',
  category: 'show',
  semiEquivalent: 'Card',
  description:
    '卡片容器：header(headerExtraContent + title，或 header 覆盖) → cover(出血) → body(children，loading 时 Skeleton 占位 + actions 底部操作) → footer。bordered/shadows 控制视觉；string title 用 Typography.Title heading=6 渲染并经 aria-labelledby 关联。',
  exports: ['Card'],
  subComponents: [
    {
      name: 'Card.Meta',
      usage: '<Card.Meta avatar title description /> 承载结构化元信息',
      desc: '卡片元信息子组件（对齐 Semi Card.Meta）：avatar（左）+ wrapper(title + description)。title/description 支持 string 或 Snippet。',
      props: [
        { name: 'avatar', type: 'Snippet', default: 'undefined', desc: '左侧头像（右侧留 marginRight）' },
        { name: 'title', type: 'string|Snippet', default: 'undefined', desc: '标题' },
        { name: 'description', type: 'string|Snippet', default: 'undefined', desc: '描述' },
        { name: 'class', type: 'string', default: 'undefined', desc: '根节点自定义类名' },
        { name: 'style', type: 'string', default: 'undefined', desc: '根节点自定义内联样式' },
      ],
    },
    {
      name: 'Card.Group',
      usage: '<Card.Group spacing={16}> 或 <Card.Group type="grid"> 成组排布',
      desc: '卡片组子组件（对齐 Semi CardGroup），等价于 CardGroup 独立导出。基于 Space 成组排布多个 Card；type=grid 时卡片去圆角以 -1px 拼接。',
      props: [
        { name: 'spacing', type: 'number|number[]', default: '16', desc: '卡片间距（网格型下忽略）' },
        { name: 'type', type: "'grid'", default: 'undefined', desc: '网格型，覆盖 spacing' },
        { name: 'ariaLabel', type: 'string', default: 'undefined', desc: '组语义标签' },
        { name: 'class', type: 'string', default: 'undefined', desc: '根节点自定义类名' },
        { name: 'style', type: 'string', default: 'undefined', desc: '根节点自定义内联样式' },
      ],
    },
  ],
  props: [
    { name: 'title', type: 'string|Snippet', default: 'undefined', desc: '标题；string 时用 Typography.Title heading=6 渲染并关联 aria-labelledby' },
    { name: 'headerExtraContent', type: 'Snippet', default: 'undefined', desc: 'header 右侧的额外内容' },
    { name: 'header', type: 'Snippet', default: 'undefined', desc: '自定义头部，覆盖 title 与 headerExtraContent' },
    { name: 'headerLine', type: 'boolean', default: 'true', desc: 'header 与 body 间分隔线' },
    { name: 'headerStyle', type: 'string', default: 'undefined', desc: 'header 区内联样式透传' },
    { name: 'cover', type: 'Snippet', default: 'undefined', desc: '顶部出血封面' },
    { name: 'bodyStyle', type: 'string', default: 'undefined', desc: 'body 区内联样式透传' },
    { name: 'actions', type: 'Snippet', default: 'undefined', desc: 'body 底部操作组，以 12px 水平间距（Space）排布' },
    { name: 'footer', type: 'Snippet', default: 'undefined', desc: '自定义页脚' },
    { name: 'footerLine', type: 'boolean', default: 'false', desc: 'footer 区上方分隔线' },
    { name: 'footerStyle', type: 'string', default: 'undefined', desc: 'footer 区内联样式透传' },
    { name: 'bordered', type: 'boolean', default: 'true', desc: '是否有外边框' },
    {
      name: 'shadows',
      type: "'hover'|'always'",
      default: 'undefined',
      desc: '阴影显示时机：hover 悬停显示、always 常显；不设则无阴影',
    },
    { name: 'loading', type: 'boolean', default: 'false', desc: 'body 显示 Skeleton 占位（Title + Paragraph rows=3）' },
    { name: 'class', type: 'string', default: 'undefined', desc: '根节点自定义类名' },
    { name: 'style', type: 'string', default: 'undefined', desc: '根节点自定义内联样式' },
    { name: 'ariaLabel', type: 'string', default: 'undefined', desc: '根节点 aria-label，表述该 Card 的作用' },
    { name: 'children', type: 'Snippet', default: 'undefined', desc: '卡片正文' },
  ],
  slots: [
    { name: 'title', desc: '标题(string 或 Snippet)' },
    { name: 'headerExtraContent', desc: 'header 右侧额外内容' },
    { name: 'header', desc: '自定义头部（覆盖 title/headerExtraContent）' },
    { name: 'cover', desc: '封面' },
    { name: 'actions', desc: 'body 底部操作' },
    { name: 'footer', desc: '页脚' },
    { name: 'children', desc: '正文' },
  ],
  a11y: {
    hasRole: true,
    focusable: false,
    note: '有 title 时根 role=region；string title 经 useId 关联 aria-labelledby（无 ariaLabel 时）；loading 时根 aria-busy；Skeleton 占位自带 role=status/aria-busy。',
  },
  tokens: [
    '--cd-card-bg',
    '--cd-card-border-color',
    '--cd-card-border-width',
    '--cd-card-radius',
    '--cd-card-padding',
    '--cd-card-margin',
    '--cd-card-title-color',
    '--cd-card-title-weight',
    '--cd-card-title-size',
    '--cd-card-title-lineheight',
    '--cd-card-extra-color',
    '--cd-card-extra-weight',
    '--cd-card-extra-size',
    '--cd-card-desc-color',
    '--cd-card-body-color',
    '--cd-card-default-weight',
    '--cd-card-default-size',
    '--cd-card-default-lineheight',
    '--cd-card-avatar-marginright',
    '--cd-card-shadow',
    '--cd-card-transition-duration',
    '--cd-card-z-hover',
  ],
  responsive: false,
  examples: [
    { title: '基础', code: '<Card title="标题">内容</Card>' },
    { title: '阴影', code: '<Card shadows="hover" title="卡片">内容</Card>' },
    { title: '加载', code: '<Card loading>内容</Card>' },
  ],
} as const;

/**
 * CardGroup — 对齐 Semi CardGroup。
 * 基于 Space（flex wrap）成组排布多个 Card；type='grid' 时卡片去圆角以 -1px 负边距拼接。
 */
// 严格对齐 Semi：CardGroup 在 Semi 无独立文档页（属 Card 页），故不带 category、不单列侧边栏
// （信息以 Card.subComponents 为准；无 category 即不进 build-components-json 的独立组件表）。
export const cardGroupMeta = {
  name: 'CardGroup',
  relatedTo: 'Card',
  semiEquivalent: 'CardGroup',
  description:
    '卡片组容器：基于 Space 成组排布多个 Card。普通型下 spacing 控制等间距（默认 16）；type=grid 网格型下卡片去圆角、以 -1px 负边距拼接边框，spacing 被忽略。',
  exports: ['CardGroup'],
  props: [
    {
      name: 'spacing',
      type: 'number | number[]',
      default: '16',
      desc: '卡片间距；number 统一，[x,y] 分别指定水平/垂直（网格型下忽略）',
    },
    { name: 'type', type: "'grid'", default: 'undefined', desc: '网格型，将覆盖 spacing' },
    { name: 'class', type: 'string', default: 'undefined', desc: '根节点自定义类名' },
    { name: 'style', type: 'string', default: 'undefined', desc: '根节点自定义内联样式' },
    { name: 'children', type: 'Snippet', default: 'undefined', desc: '子 Card' },
  ],
  slots: [{ name: 'children', desc: '子 Card' }],
  a11y: {
    hasRole: false,
    focusable: false,
    note: '对齐 Semi：CardGroup 是纯 Space 包裹，根节点不加 role/aria-label；卡片本身 a11y 由 Card 提供。',
  },
  tokens: ['--cd-cardgroup-spacing', '--cd-cardgroup-card-margin'],
  responsive: true,
  examples: [
    { title: '卡片组', code: '<CardGroup spacing={16}><Card title="A" /><Card title="B" /></CardGroup>' },
    { title: '网格型', code: '<CardGroup type="grid"><Card title="A" /><Card title="B" /></CardGroup>' },
  ],
} as const;
