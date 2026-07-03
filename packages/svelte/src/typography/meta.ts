/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/components/basic/Typography.spec.md.
 * Aggregated metadata for the Typography family (Title/Text/Paragraph/Link).
 */
const commonProps = [
  { name: 'type', type: "'default'|'secondary'|'tertiary'|'warning'|'danger'|'success'", default: "'default'" },
  { name: 'size', type: "'small'|'default'|'large'", default: "'default'", desc: '字号档（Text/Paragraph）。Title 由 heading 决定，忽略 size。' },
  { name: 'strong', type: 'boolean', default: 'false', desc: 'font-weight semibold' },
  { name: 'weight', type: "number|'regular'|'medium'|'semibold'|'bold'", default: 'undefined', desc: '显式覆盖字重' },
  { name: 'disabled', type: 'boolean', default: 'false' },
  { name: 'mark', type: 'boolean', default: 'false', desc: '高亮背景' },
  { name: 'underline', type: 'boolean', default: 'false' },
  { name: 'delete', type: 'boolean', default: 'false', desc: '删除线' },
  { name: 'code', type: 'boolean', default: 'false', desc: '等宽代码样式' },
  {
    name: 'ellipsis',
    type: 'boolean | EllipsisConfig',
    default: 'false',
    desc: '省略：单行/多行(rows)截断、expandable 展开、suffix、pos、showTooltip。CSS clamp 为默认路径，expandable/suffix/showTooltip 触发 ResizeObserver 测量路径。',
  },
  {
    name: 'copyable',
    type: 'boolean | CopyableConfig',
    default: 'false',
    desc: '复制：尾部复制按钮 + 成功反馈 + live announce，剪贴板 execCommand 回退，可自定义 content/icon/successIcon。',
  },
  {
    name: 'editable',
    type: 'boolean | EditableConfig',
    default: 'false',
    desc: '可编辑：click/dblclick/icon 触发 inline textarea，maxLength、autosize、Enter 提交/Shift+Enter 换行/Esc 取消、焦点归还。受控 value + onChange。',
  },
  { name: 'value', type: 'string', default: 'undefined', desc: 'editable 受控文本值（红线 #1：仅 onChange 回传，不回写）' },
  { name: 'component', type: 'string', default: '各自默认', desc: '覆盖渲染标签' },
  { name: 'class', type: 'string', default: "''" },
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
    { name: 'onExpand', type: '(expanded: boolean) => void', default: 'undefined' },
  ],
} as const;
const copyableConfig = {
  name: 'CopyableConfig',
  fields: [
    { name: 'content', type: 'string', default: '节点文本' },
    { name: 'successText', type: 'string', default: 'i18n' },
    { name: 'icon / successIcon', type: 'Snippet', default: '内置图标' },
  ],
} as const;
const editableConfig = {
  name: 'EditableConfig',
  fields: [
    { name: 'editing', type: 'boolean', default: 'undefined', desc: '受控编辑态' },
    { name: 'trigger', type: "'click'|'dblclick'|'icon'", default: "'icon'" },
    { name: 'maxLength', type: 'number', default: 'undefined' },
    { name: 'autosize', type: 'boolean', default: 'true' },
  ],
} as const;

export const meta = {
  name: 'Typography',
  category: 'basic',
  description: '排版家族：Title / Text / Paragraph / Link，统一文本样式与语义色。',
  subComponents: [
    {
      name: 'Typography.Title',
      element: 'h1..h6',
      props: [{ name: 'heading', type: '1|2|3|4|5|6', default: '1' }, ...commonProps],
    },
    { name: 'Typography.Text', element: 'span', props: commonProps },
    { name: 'Typography.Paragraph', element: 'p', props: commonProps },
    {
      name: 'Typography.Link',
      element: 'a',
      props: [
        { name: 'href', type: 'string', default: 'undefined' },
        { name: 'target', type: 'string', default: 'undefined' },
        { name: 'rel', type: 'string', default: 'undefined', desc: "target=_blank 且未显式 rel 时自动 noopener noreferrer" },
        ...commonProps,
      ],
    },
  ],
  configObjects: [ellipsisConfig, copyableConfig, editableConfig],
  events: [
    { name: 'onCopy', payload: '(content: string)', desc: '复制成功后' },
    { name: 'onChange', payload: '(value: string)', desc: 'editable 提交（受控 value + onChange）' },
    { name: 'onEditStart', payload: '()', desc: '进入编辑' },
    { name: 'onEditCancel', payload: '()', desc: '取消编辑' },
    { name: 'onExpand', payload: '(expanded: boolean)', desc: 'ellipsis 展开/收起切换' },
    { name: 'onClick', payload: '(e: MouseEvent)', desc: 'Link 点击（disabled 阻止）' },
  ],
  slots: [
    { name: 'children', desc: '文本内容' },
    { name: 'copyIcon (config.icon/successIcon)', desc: '自定义复制图标' },
  ],
  a11y: {
    link: 'disabled 时移除 href + aria-disabled + tabindex=-1 + 阻止默认',
    copyable: '复制按钮 <button> 带 aria-label(i18n)，成功经 aria-live=polite 播报，图标形状切换不依赖颜色',
    editable: '编辑触发 <button> 带 aria-label，textarea 自动聚焦，Esc 取消焦点归还触发器',
    ellipsis: 'showTooltip 溢出显示完整内容；expandable 展开按钮 aria-expanded；CSS clamp 保留完整文本供 SR',
    note: 'reduced-motion 下移除 Link/图标过渡',
  },
  a11yRoles: ['heading', 'link', 'button'],
  i18nKeys: [
    'Typography.copy',
    'Typography.copied',
    'Typography.copyFailed',
    'Typography.edit',
    'Typography.editConfirm',
    'Typography.editCancel',
    'Typography.expand',
    'Typography.collapse',
    'Typography.ellipsisSuffix',
  ],
  // 全量对齐 Semi typography/variables.scss（77 个）+ chenzy-design 组件消费补充（13 个）。
  tokens: [
    // —— 文本语义色（Semi $color-typography_*-text）——
    '--cd-color-typography_default-text-default',
    '--cd-color-typography_secondary-text-default',
    '--cd-color-typography_tertiary-text-default',
    '--cd-color-typography_quaternary-text-default',
    '--cd-color-typography_warning-text-default',
    '--cd-color-typography_danger-text-default',
    '--cd-color-typography_success-text-default',
    '--cd-color-typography_disabled-text-default',
    '--cd-color-typography_mark-bg-default',
    '--cd-color-typography_code-bg-default',
    '--cd-color-typography_code-text-default',
    '--cd-color-typography_code-border-default',
    // —— 链接色 ——
    '--cd-color-typography_link-text-default',
    '--cd-color-typography_link-text-visited',
    '--cd-color-typography_link-text-hover',
    '--cd-color-typography_link-text-active',
    '--cd-color-typography_link-text-disabled',
    // —— 复制 ——
    '--cd-color-typography_copied-text-success',
    '--cd-color-typography_copied-icon-success',
    // —— 字重（基础组 + title 默认/light/regular/medium/semibold/bold × 1..6）——
    '--cd-font-typography_title-fontweight',
    '--cd-font-typography_link-fontweight',
    '--cd-font-typography_strong-fontweight',
    '--cd-font-typography_paragraph_extended-lineheight',
    '--cd-font-typography_normaltext-regular-fontweight',
    '--cd-font-typography_smalltext-regular-fontweight',
    '--cd-font-typography_normalparagraph-regular-fontweight',
    '--cd-font-typography_smallparagraph-regular-fontweight',
    '--cd-font-typography_title{1..6}-fontweight',
    '--cd-font-typography_title{1..6}-{light|regular|medium|semibold|bold}-fontweight',
    // —— 间距 / 描边宽度 / 圆角 ——
    '--cd-spacing-typography_iconprefix-marginright',
    '--cd-spacing-typography_expandtext-marginleft',
    '--cd-spacing-typography_copyicon-marginleft',
    '--cd-spacing-typography_copyicon-padding',
    '--cd-spacing-typography_title_h{1..6}-margin',
    '--cd-spacing-typography_title_paragraph-margin',
    '--cd-width-typography_code-border',
    '--cd-width-typography_link-border',
    '--cd-radius-typography_code',
    // —— chenzy-design 组件消费补充（Semi 无）——
    '--cd-typography-color',
    '--cd-typography-color-secondary',
    '--cd-typography-color-tertiary',
    '--cd-typography-color-quaternary',
    '--cd-typography-color-link',
    '--cd-typography-color-link-hover',
    '--cd-typography-mark-bg',
    '--cd-typography-code-bg',
    '--cd-typography-code-color',
    '--cd-typography-code-font-size',
    '--cd-typography-font-size-small',
    '--cd-typography-font-size-default',
    '--cd-typography-font-size-large',
  ],
  relatedComponents: ['Tooltip', 'Highlight', 'Numeral'],
  aiHints: [
    '需要文档大纲用 Title 并匹配 heading 级别；仅放大字号用 component 改标签保留视觉。',
    '长文本截断优先 CSS clamp（默认零测量）；需展开/tooltip/suffix 才走 ResizeObserver 测量路径。',
    'editable 是受控的：必须配 value + onChange，组件不回写。',
  ],
  examples: [
    { title: '标题', code: '<Typography.Title heading={2}>标题</Typography.Title>' },
    { title: '链接', code: '<Typography.Link href="/" target="_blank">前往</Typography.Link>' },
    { title: '多行省略 + 展开', code: '<Typography.Paragraph ellipsis={{ rows: 2, expandable: true }}>长文本…</Typography.Paragraph>' },
    { title: '可复制', code: '<Typography.Text copyable>npm i @chenzy-design/svelte</Typography.Text>' },
    { title: 'inline 编辑', code: '<Typography.Text editable {value} onChange={(v) => (value = v)}>{value}</Typography.Text>' },
  ],
} as const;
