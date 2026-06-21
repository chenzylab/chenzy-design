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
  tokens: ['--cd-steps-*', '--cd-focus-ring', '--cd-radius-full', '--cd-spacing-*', '--cd-font-size-1'],
} as const;
