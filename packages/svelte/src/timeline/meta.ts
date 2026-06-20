/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 */
export const meta = {
  name: 'Timeline',
  category: 'show',
  description:
    '时间轴，按时间顺序垂直/水平展示一组事件。两种用法择一：传 dataSource 数据驱动，或不传 dataSource 而在 children 内写 <Timeline.Item> 声明式（可放任意富内容）。支持 left/alternate/center 模式、vertical/horizontal 方向、pending 幽灵节点、reverse 倒序与实/虚线样式；交替布局由纯 CSS :nth-child 决定，两种用法共用同一套结构与样式。',
  props: [
    {
      name: 'dataSource',
      type: 'TimelineItemData[]',
      default: '[]',
      desc: '节点数据（数据驱动用法；优先于声明式 children）',
    },
    {
      name: 'children',
      type: 'Snippet',
      default: 'undefined',
      desc: '声明式用法：内嵌 <Timeline.Item> 列表，仅在未传 dataSource 时生效',
    },
    {
      name: 'mode',
      type: "'left'|'alternate'|'center'",
      default: 'left',
      desc: 'center 轴线居中、两侧内容朝轴对称对齐',
    },
    {
      name: 'direction',
      type: "'vertical'|'horizontal'",
      default: 'vertical',
      desc: '时间轴方向',
    },
    { name: 'reverse', type: 'boolean', default: 'false', desc: '倒序展示' },
    {
      name: 'pending',
      type: 'boolean|string',
      default: 'false',
      desc: '末尾追加幽灵节点，string 作为其内容',
    },
    { name: 'size', type: "'small'|'default'|'large'", default: 'default' },
    { name: 'lineStyle', type: "'solid'|'dashed'", default: 'solid' },
    { name: 'class', type: 'string', default: "''" },
  ],
  subComponents: [
    {
      name: 'Timeline.Item',
      desc: '声明式单项，渲染 dot/line/内容（children），与 dataSource 项视觉一致',
      props: [
        { name: 'dotColor', type: 'string', default: 'undefined', desc: '圆点颜色' },
        {
          name: 'lineStyle',
          type: "'solid'|'dashed'",
          default: '继承父 Timeline',
          desc: '单项连接线样式',
        },
        { name: 'time', type: 'string', default: 'undefined', desc: '时间文本' },
        { name: 'children', type: 'Snippet', default: 'undefined', desc: '项内容' },
      ],
    },
  ],
  a11y: {
    role: 'list',
    notes: ['ul/li 结构', '圆点与连接线 aria-hidden=true', '内容与时间为可读文本'],
  },
  tokens: ['--cd-timeline-*', '--cd-radius-full', '--cd-spacing-1', '--cd-font-size-1'],
} as const;
