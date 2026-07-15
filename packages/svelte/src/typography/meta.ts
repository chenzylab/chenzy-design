/**
 * Machine-readable component metadata for AI/docs consumption.
 * 严格对齐 Semi Typography（无独立 Link、无 editable/italic）。
 * Aggregated metadata for the Typography family (Title/Text/Paragraph/Numeral)。
 */

/** 各子组件共有 props（对齐 Semi base.tsx / text.tsx）。 */
const commonProps = [
  { name: 'type', type: "'primary'|'secondary'|'tertiary'|'quaternary'|'warning'|'danger'|'success'", default: "'primary'", desc: '语义色（对齐 Semi）' },
  { name: 'disabled', type: 'boolean', default: 'false' },
  { name: 'mark', type: 'boolean', default: 'false', desc: '<mark> 高亮背景' },
  { name: 'underline', type: 'boolean', default: 'false', desc: '<u> 下划线' },
  { name: 'delete', type: 'boolean', default: 'false', desc: '<del> 删除线' },
  { name: 'code', type: 'boolean', default: 'false', desc: '<code> 等宽代码样式' },
  { name: 'strong', type: 'boolean', default: 'false', desc: '<strong> 加粗' },
  { name: 'link', type: 'boolean | AnchorAttrs', default: 'false', desc: '链接：true 或透传给 <a> 的属性对象（对齐 Semi link）' },
  {
    name: 'ellipsis',
    type: 'boolean | EllipsisConfig',
    default: 'false',
    desc: '省略：单行/多行(rows)截断、expandable 展开、suffix、pos、showTooltip。CSS clamp 为默认路径，expandable/suffix/showTooltip/pos≠end 触发 ResizeObserver 测量路径。',
  },
  {
    name: 'copyable',
    type: 'boolean | CopyableConfig',
    default: 'false',
    desc: '复制：尾部复制按钮 + 成功反馈 + live announce，可自定义 content/copyTip/successTip/icon/render，onCopy(e,content,res) 回调。',
  },
  { name: 'component', type: 'string', default: '各自默认', desc: '覆盖渲染标签' },
  { name: 'class', type: 'string', default: "''" },
  { name: 'style', type: 'string', default: 'undefined', desc: '自定义内联样式（对齐 Semi style）' },
] as const;

const ellipsisConfig = {
  name: 'EllipsisConfig',
  fields: [
    { name: 'rows', type: 'number', default: '1' },
    { name: 'expandable', type: 'boolean', default: 'false' },
    { name: 'collapsible', type: 'boolean', default: 'false' },
    { name: 'expandText / collapseText', type: 'string', default: 'i18n' },
    { name: 'suffix', type: 'string', default: 'undefined' },
    { name: 'pos', type: "'end'|'middle'|'start'", default: "'end'" },
    {
      name: 'showTooltip',
      type: "boolean | { type?: 'tooltip'|'popover'; opts?: { content?; title?; theme?; placement?; position?; maxWidth? }; renderTooltip?: Snippet<[fullText, trigger]> }",
      default: 'false',
    },
    { name: 'onExpand', type: '(expanded: boolean, e: MouseEvent) => void', default: 'undefined' },
  ],
} as const;
const copyableConfig = {
  name: 'CopyableConfig',
  fields: [
    { name: 'content', type: 'string', default: '节点文本', desc: '复制到剪贴板的内容' },
    { name: 'copyTip', type: 'string', default: 'i18n copy', desc: '复制图标 tooltip 文案' },
    { name: 'successTip', type: 'string', default: 'i18n copied', desc: '复制成功提示' },
    { name: 'icon', type: 'Snippet', default: '内置图标', desc: '自定义复制图标' },
    { name: 'onCopy', type: '(e: MouseEvent, content: string, res: boolean) => void', default: 'undefined' },
    { name: 'render', type: 'Snippet<[copied, doCopy, config]>', default: 'undefined', desc: '完全接管复制控件渲染' },
  ],
} as const;

export const meta = {
  name: 'Typography',
  category: 'basic',
  description: '排版家族：Title / Text / Paragraph / Numeral，统一文本样式与语义色（严格对齐 Semi）。',
  subComponents: [
    {
      name: 'Typography.Title',
      element: 'h1..h6',
      props: [
        { name: 'heading', type: '1|2|3|4|5|6', default: '1' },
        { name: 'weight', type: "'light'|'regular'|'medium'|'semibold'|'bold'|'default'|number", default: 'undefined', desc: '字重：字符串枚举走类，数字走内联 style（对齐 Semi）' },
        { name: 'id', type: 'string', default: 'undefined', desc: '透传根元素 id（供 aria-labelledby 关联）' },
        ...commonProps,
      ],
    },
    {
      name: 'Typography.Text',
      element: 'span',
      props: [
        { name: 'size', type: "'normal'|'small'|'inherit'", default: "'normal'", desc: '字号档；inherit 继承外层 Typography size（对齐 Semi）' },
        { name: 'weight', type: 'number', default: 'undefined', desc: '字重（数字，走内联 style）' },
        { name: 'icon', type: 'Snippet', default: 'undefined', desc: '前置图标（对齐 Semi）' },
        ...commonProps,
      ],
    },
    {
      name: 'Typography.Paragraph',
      element: 'p',
      props: [
        { name: 'size', type: "'normal'|'small'", default: "'normal'" },
        { name: 'spacing', type: "'normal'|'extended'", default: "'normal'", desc: '行距（对齐 Semi）' },
        ...commonProps,
      ],
    },
    {
      name: 'Typography.Numeral',
      element: 'span',
      desc: '数值格式化文本（对齐 Semi）：遍历 children 文本节点按规则格式化其中数字。复用 Text 全部样式 props。',
      props: [
        { name: 'rule', type: "'text'|'numbers'|'bytes-decimal'|'bytes-binary'|'percentages'|'exponential'", default: "'text'", desc: '解析规则' },
        { name: 'precision', type: 'number', default: '0', desc: '保留小数位数' },
        { name: 'truncate', type: "'ceil'|'floor'|'round'", default: "'round'", desc: '小数截断取整方式' },
        { name: 'parser', type: '(raw: string) => string', default: 'undefined', desc: '自定义解析函数（优先于 rule）' },
        { name: 'size', type: "'normal'|'small'|'inherit'", default: "'normal'" },
        { name: 'icon', type: 'Snippet', default: 'undefined' },
        ...commonProps,
      ],
    },
  ],
  configObjects: [ellipsisConfig, copyableConfig],
  events: [
    { name: 'onCopy', payload: '(e: MouseEvent, content: string, res: boolean)', desc: '复制回调（对齐 Semi）' },
    { name: 'onExpand', payload: '(expanded: boolean, e: MouseEvent)', desc: 'ellipsis 展开/收起切换' },
  ],
  slots: [
    { name: 'children', desc: '文本内容' },
    { name: 'icon', desc: '前置图标（Text/Numeral）' },
    { name: 'copyable.icon / copyable.render', desc: '自定义复制控件' },
  ],
  a11y: {
    link: 'link 时渲染 <a>；disabled 时改渲染 <span>（对齐 Semi wrapperDecorations）',
    copyable: '复制按钮 <button> 带 aria-label(i18n)，成功经 aria-live=polite 播报，图标形状切换不依赖颜色',
    ellipsis: 'showTooltip 溢出显示完整内容；expandable 展开按钮 role=button + aria-label；CSS clamp 保留完整文本供 SR',
  },
  a11yRoles: ['heading', 'link', 'button'],
  i18nKeys: ['Typography.copy', 'Typography.copied', 'Typography.expand', 'Typography.collapse'],
  // 全量对齐 Semi typography/variables.scss（77 项）；无自造中间变量。
  tokens: [
    // 文本语义色
    '--cd-color-typography-default-text-default',
    '--cd-color-typography-secondary-text-default',
    '--cd-color-typography-tertiary-text-default',
    '--cd-color-typography-quaternary-text-default',
    '--cd-color-typography-warning-text-default',
    '--cd-color-typography-danger-text-default',
    '--cd-color-typography-success-text-default',
    '--cd-color-typography-disabled-text-default',
    '--cd-color-typography-mark-bg-default',
    '--cd-color-typography-code-bg-default',
    '--cd-color-typography-code-text-default',
    // 链接色
    '--cd-color-typography-link-text-default',
    '--cd-color-typography-link-text-visited',
    '--cd-color-typography-link-text-hover',
    '--cd-color-typography-link-text-active',
    '--cd-color-typography-link-text-disabled',
    // 复制
    '--cd-color-typography-copied-text-success',
    '--cd-color-typography-copied-icon-success',
    '--cd-color-typography-code-border-default',
    // 字重（基础组 + normal/small text/paragraph + title{1..6} 默认/light/regular/medium/semibold/bold）
    '--cd-font-typography-title-fontweight',
    '--cd-font-typography-link-fontweight',
    '--cd-font-typography-strong-fontweight',
    '--cd-font-typography-paragraph-extended-lineheight',
    '--cd-font-typography-normaltext-regular-fontweight',
    '--cd-font-typography-smalltext-regular-fontweight',
    '--cd-font-typography-normalparagraph-regular-fontweight',
    '--cd-font-typography-smallparagraph-regular-fontweight',
    '--cd-font-typography-title{1..6}-fontweight',
    '--cd-font-typography-title{1..6}-{light|regular|medium|semibold|bold}-fontweight',
    // 间距 / 描边宽度 / 圆角
    '--cd-spacing-typography-iconprefix-marginright',
    '--cd-spacing-typography-expandtext-marginleft',
    '--cd-spacing-typography-copyicon-marginleft',
    '--cd-spacing-typography-copyicon-padding',
    '--cd-spacing-typography-title-h{1..6}-margin',
    '--cd-spacing-typography-title-paragraph-margin',
    '--cd-width-typography-code-border',
    '--cd-width-typography-link-border',
    '--cd-radius-typography-code',
  ],
  relatedComponents: ['Tooltip', 'Popover', 'Numeral'],
  aiHints: [
    '需要文档大纲用 Title 并匹配 heading 级别；仅放大字号用 component 改标签保留视觉。',
    '长文本截断优先 CSS clamp（默认零测量）；需展开/tooltip/suffix/中间截断才走 ResizeObserver 测量路径。',
    '链接用 link prop（无独立 Link 组件）；size=inherit 继承外层 Typography 的 size。',
  ],
  examples: [
    { title: '标题', code: '<Typography.Title heading={2}>标题</Typography.Title>' },
    { title: '链接', code: '<Typography.Text link={{ href: "/", target: "_blank" }}>前往</Typography.Text>' },
    { title: '多行省略 + 展开', code: '<Typography.Paragraph ellipsis={{ rows: 2, expandable: true }}>长文本…</Typography.Paragraph>' },
    { title: '可复制', code: '<Typography.Text copyable>npm i @chenzy-design/svelte</Typography.Text>' },
    { title: '数值格式化', code: '<Typography.Numeral rule="percentages" precision={2}>0.915</Typography.Numeral>' },
  ],
} as const;
