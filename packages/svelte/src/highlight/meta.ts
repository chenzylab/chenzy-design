/**
 * Machine-readable component metadata for AI/docs consumption.
 * Highlight — see specs/components/show/Highlight.spec.md
 */
export const meta = {
  name: 'Highlight',
  category: 'show',
  description:
    '纯展示文本高亮：在 sourceString 中标记 searchWords，默认用 <mark> 包裹。纯文本输出（HTML 会被转义而非解析），支持大小写敏感、仅首个/全部匹配、正则转义开关与自定义包裹元素/样式。',
  exports: ['Highlight'],
  props: [
    { name: 'sourceString', type: 'string', default: "''", desc: '待处理原始文本（纯文本，HTML 被转义）' },
    { name: 'searchWords', type: 'string|string[]', default: '[]', desc: '需高亮关键词，空串忽略' },
    { name: 'caseSensitive', type: 'boolean', default: 'false', desc: '是否大小写敏感' },
    { name: 'highlightAll', type: 'boolean', default: 'true', desc: 'true 高亮全部匹配，false 仅首个' },
    {
      name: 'autoEscape',
      type: 'boolean',
      default: 'true',
      desc: '是否对关键词正则转义；关闭后 searchWords 视为正则源',
    },
    { name: 'component', type: 'string', default: "'mark'", desc: '高亮片段包裹标签名' },
    { name: 'highlightClassName', type: 'string', default: "''", desc: '追加到高亮片段的类名' },
    { name: 'highlightStyle', type: 'string', default: "''", desc: '追加到高亮片段的内联样式' },
    { name: 'className', type: 'string', default: "''", desc: '根 span 类名' },
    { name: 'style', type: 'string', default: "''", desc: '根 span 内联样式' },
    { name: 'unstyled', type: 'boolean', default: 'false', desc: '移除默认高亮视觉，仅保留语义与类名' },
  ],
  events: [],
  slots: [],
  a11y: {
    role: 'none',
    focusable: false,
    notes: [
      '高亮片段用原生 <mark> 元素承载浏览器/AT 内建“标记”语义',
      '不可聚焦、无 tabindex，避免搜索结果列表产生大量 Tab 停留点',
      '不对每个高亮加 aria-label，避免逐字播报噪音；命中计数由调用方外层 live region 负责',
      '语义+背景双通道区分，不仅靠颜色（WCAG 1.4.1）',
    ],
  },
  tokens: ['--cd-highlight-bg', '--cd-highlight-color', '--cd-radius-small'],
  examples: [
    { title: '基础', code: '<Highlight sourceString="hello world" searchWords="world" />' },
    {
      title: '多词',
      code: '<Highlight sourceString="foo bar baz" searchWords={["foo", "baz"]} />',
    },
  ],
} as const;
