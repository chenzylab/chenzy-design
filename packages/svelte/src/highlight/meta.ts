/**
 * Machine-readable component metadata for AI/docs consumption.
 * Highlight — see specs/components/show/Highlight.spec.md
 * 镜像 Semi Highlight：纯展示文本高亮，命中片段默认 <mark class="cd-highlight-tag"> 包裹。
 */
export const meta = {
  name: 'Highlight',
  category: 'show',
  description:
    '纯展示文本高亮：在 sourceString 中标记 searchWords，命中片段默认用 <mark> 包裹。纯文本输出（HTML 会被转义而非解析），支持大小写敏感、正则转义开关、自定义包裹元素/类名/样式，以及对象数组差异化样式（不同关键词单独 className/style）。',
  exports: ['Highlight'],
  props: [
    { name: 'sourceString', type: 'string', default: "''", desc: '待处理原始文本（纯文本，HTML 被转义）' },
    {
      name: 'searchWords',
      type: 'string | string[] | HighlightWord | HighlightWord[]',
      default: '[]',
      desc: '需高亮关键词；字符串/字符串数组，或对象数组 { text, className, style } 差异化样式（Semi v2.71+）；空文本忽略',
    },
    { name: 'caseSensitive', type: 'boolean', default: 'false', desc: '是否大小写敏感' },
    {
      name: 'autoEscape',
      type: 'boolean',
      default: 'true',
      desc: '是否对关键词正则转义；关闭后 searchWords 视为正则源',
    },
    { name: 'component', type: 'string', default: "'mark'", desc: '高亮片段包裹标签名' },
    { name: 'highlightClassName', type: 'string', default: "''", desc: '追加到每个高亮片段的类名' },
    { name: 'highlightStyle', type: 'string', default: "''", desc: '追加到每个高亮片段的内联样式' },
  ],
  events: [],
  slots: [],
  a11y: {
    role: 'none',
    focusable: false,
    notes: [
      '高亮片段用原生 <mark> 元素承载浏览器/AT 内建“标记”语义',
      '不可聚焦、无 tabindex，避免搜索结果列表产生大量 Tab 停留点',
      '默认不对每个高亮加 aria-label，避免逐字播报噪音；命中计数由调用方外层 live region 负责',
      '语义+背景双通道区分，不仅靠颜色（WCAG 1.4.1）',
    ],
  },
  tokens: ['--cd-highlight-color', '--cd-highlight-bg', '--cd-highlight-font-weight'],
  examples: [
    { title: '基础', code: '<Highlight sourceString="hello world" searchWords="world" />' },
    {
      title: '多词',
      code: '<Highlight sourceString="foo bar baz" searchWords={["foo", "baz"]} />',
    },
    {
      title: '差异化样式',
      code: '<Highlight sourceString="Semi 设计系统" searchWords={[{ text: "Semi", style: { backgroundColor: "teal" } }, { text: "设计系统", style: { backgroundColor: "violet" } }]} />',
    },
  ],
} as const;
