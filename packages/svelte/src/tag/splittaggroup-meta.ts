/**
 * Machine-readable component metadata for AI/docs consumption.
 * SplitTagGroup — see specs/components/show/SplitTagGroup.spec.md
 */
export const meta = {
  name: 'SplitTagGroup',
  category: 'show',
  relatedTo: 'Tag',
  semiEquivalent: 'SplitTagGroup',
  description:
    '连接式标签组：多个 Tag 连成一体（首子前缘圆角、末子后缘圆角、中间合并边），视觉上是一个分段控件。纯 CSS 装饰，无折叠。复用 Tag。',
  exports: ['SplitTagGroup'],
  props: [
    { name: 'ariaLabel', type: 'string', default: 'undefined', desc: '组的可访问名（aria-label）' },
    { name: 'class', type: 'string', default: 'undefined', desc: '透传根类名' },
    { name: 'style', type: 'string', default: 'undefined', desc: '透传根内联样式' },
    { name: 'children', type: 'Snippet', default: 'undefined', desc: '子 Tag（首尾自动加圆角、相邻合并边）' },
  ],
  slots: [{ name: 'children', desc: '子 Tag' }],
  a11y: {
    hasRole: true,
    focusable: false,
    note: '组容器 role=group + aria-label（ariaLabel prop）；子 Tag 保留自身 a11y，连接外观纯视觉不影响语义。',
  },
  tokens: ['--cd-splittaggroup-divider-width', '--cd-splittaggroup-divider-color'],
  responsive: false,
  examples: [
    {
      title: '分段标签',
      code: '<SplitTagGroup ariaLabel="状态"><Tag>待处理</Tag><Tag>进行中</Tag><Tag>已完成</Tag></SplitTagGroup>',
    },
  ],
} as const;
