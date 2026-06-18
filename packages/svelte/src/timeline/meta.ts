/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 */
export const meta = {
  name: 'Timeline',
  category: 'show',
  description:
    '时间轴，按时间顺序垂直展示一组事件。支持 left/alternate 模式、dataSource 数据驱动、pending 幽灵节点、reverse 倒序与实/虚线样式。',
  props: [
    { name: 'dataSource', type: 'TimelineItemData[]', default: '[]', desc: '节点数据' },
    { name: 'mode', type: "'left'|'alternate'", default: 'left' },
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
  a11y: {
    role: 'list',
    notes: ['ul/li 结构', '圆点与连接线 aria-hidden=true', '内容与时间为可读文本'],
  },
  tokens: ['--cd-timeline-*', '--cd-radius-full', '--cd-spacing-1', '--cd-font-size-1'],
} as const;
