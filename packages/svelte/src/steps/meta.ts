/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 */
export const meta = {
  name: 'Steps',
  category: 'navigation',
  description:
    '步骤条，引导用户按流程完成任务。支持横向/纵向、fill/nav/basic 类型、自定义图标、可点击与状态展示。',
  props: [
    { name: 'current', type: 'number', default: 'undefined', desc: '受控当前步' },
    { name: 'defaultCurrent', type: 'number', default: '0' },
    { name: 'steps', type: 'StepItem[]', default: '[]', desc: '步骤数据' },
    { name: 'direction', type: "'horizontal'|'vertical'", default: 'horizontal' },
    { name: 'type', type: "'fill'|'nav'|'basic'", default: 'fill', desc: 'basic 为线框/描边型' },
    {
      name: 'status',
      type: "'process'|'finish'|'error'|'warning'",
      default: 'process',
      desc: '当前步状态',
    },
    { name: 'size', type: "'small'|'default'|'large'", default: 'default' },
    { name: 'initial', type: 'number', default: '0', desc: '起始序号偏移' },
    { name: 'clickable', type: 'boolean', default: "type==='nav'" },
    { name: 'dot', type: 'boolean', default: 'false', desc: '点状步骤，图标渲染为小圆点' },
    {
      name: 'icon',
      type: 'Snippet<[{ step: StepItem; index: number; status: DerivedStatus }]>',
      default: 'undefined',
      desc: '自定义图标渲染器，提供时替代默认序号/✓/✕',
    },
    { name: 'onChange', type: '(current: number) => void', default: 'undefined' },
    { name: 'onClick', type: '(e: MouseEvent) => void', default: 'undefined', desc: '步骤 button 点击事件（仅 clickable 模式下渲染 button 时触发）' },
    { name: 'onKeyDown', type: '(e: KeyboardEvent) => void', default: 'undefined', desc: '步骤 button 键盘按下事件（仅 clickable 模式下渲染 button 时触发）' },
    { name: 'class', type: 'string', default: "''" },
  ],
  stepItemProps: [
    { name: 'title', type: 'string', default: 'undefined', desc: '步骤标题' },
    { name: 'description', type: 'string', default: 'undefined', desc: '步骤描述（次要信息）' },
    {
      name: 'status',
      type: "'wait'|'process'|'finish'|'error'|'warning'",
      default: 'undefined',
      desc: '显式覆盖该步状态；不传时由 current 推断',
    },
    { name: 'disabled', type: 'boolean', default: 'false', desc: '禁用该步：不可点击、不可聚焦、置灰' },
  ],
  a11y: {
    role: 'list',
    keyboard: ['Tab', 'Enter', 'Space'],
    notes: [
      'ol/li 结构',
      'clickable 时每步为原生 button，当前步 aria-current=step',
      '图标对勾/✕ 用 aria-hidden，状态靠文本与 aria-current 表达',
      '连接线 aria-hidden=true',
    ],
  },
  // Component token 全量对齐 Semi steps/variables.scss（94 个 color/width/height/spacing/radius/font）
  // + chenzy-design 实际消费的补充 token（basic/nav/fill + wait/process/finish/error + dot）。
  // 见 packages/tokens/src/components/steps.ts。
  tokens: [
    // —— 组件消费（Steps.svelte 直接读）——
    '--cd-steps-icon-size',
    '--cd-steps-icon-bg',
    '--cd-steps-icon-color',
    '--cd-steps-icon-color-active',
    '--cd-steps-icon-bg-process',
    '--cd-steps-icon-bg-finish',
    '--cd-steps-icon-bg-error',
    '--cd-steps-title-color',
    '--cd-steps-desc-color',
    '--cd-steps-line-color',
    '--cd-steps-line-color-finish',
    '--cd-steps-basic-color',
    '--cd-steps-basic-border',
    '--cd-steps-basic-color-process',
    '--cd-steps-basic-border-process',
    '--cd-steps-basic-color-finish',
    '--cd-steps-basic-border-finish',
    '--cd-steps-basic-color-error',
    '--cd-steps-basic-border-error',
    '--cd-steps-dot-size',
    '--cd-steps-dot-size-active',
    // —— Semi 全量对齐（DSM 可编辑，色/尺寸族）——
    '--cd-color-steps-*',
    '--cd-width-steps-*',
    '--cd-height-steps-*',
    '--cd-spacing-steps-*',
    '--cd-radius-steps-*',
    '--cd-font-steps-*',
    // —— 全局/别名（结构性消费）——
    '--cd-focus-ring',
    '--cd-border-radius-full',
    '--cd-border-radius-small',
    '--cd-spacing-tight',
    '--cd-spacing-base',
    '--cd-font-size-small',
  ],
} as const;
