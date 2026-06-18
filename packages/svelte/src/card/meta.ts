/**
 * Machine-readable component metadata for AI/docs consumption.
 * Card — see specs/components/show/Card.spec.md
 */
export const meta = {
  name: 'Card',
  category: 'show',
  description:
    '卡片容器：cover(出血) → header(title + extra) → body(children，loading 时骨架占位) → actions(底部等分操作)；bordered/shadow/hoverable 控制视觉，title 为 string 时 aria-labelledby 关联。',
  exports: ['Card'],
  props: [
    { name: 'title', type: 'string|Snippet', default: 'undefined', desc: '标题；string 时关联 aria-labelledby' },
    { name: 'extra', type: 'Snippet', default: 'undefined', desc: 'header 右侧内容' },
    { name: 'cover', type: 'Snippet', default: 'undefined', desc: '顶部出血封面' },
    { name: 'actions', type: 'Snippet', default: 'undefined', desc: '底部等分操作区' },
    { name: 'size', type: "'small'|'default'|'large'", default: "'default'" },
    { name: 'bordered', type: 'boolean', default: 'true' },
    {
      name: 'shadow',
      type: "'never'|'hover'|'always'",
      default: "'never'",
      desc: 'hover 时悬停抬升',
    },
    { name: 'hoverable', type: 'boolean', default: 'false', desc: '悬停阴影，同 shadow=hover 视觉' },
    { name: 'loading', type: 'boolean', default: 'false', desc: 'body 显示骨架占位' },
    { name: 'loadingRows', type: 'number', default: '3', desc: '骨架行数' },
    { name: 'children', type: 'Snippet', default: 'undefined', desc: '卡片正文' },
  ],
  events: [],
  slots: [
    { name: 'title', desc: '标题(string 或 Snippet)' },
    { name: 'extra', desc: 'header 右侧' },
    { name: 'cover', desc: '封面' },
    { name: 'actions', desc: '底部操作' },
    { name: 'children', desc: '正文' },
  ],
  a11y: {
    hasRole: true,
    focusable: false,
    note: '有 title 时根 role=region；string title 经 useId 关联 aria-labelledby；骨架 aria-hidden。',
  },
  tokens: [
    '--cd-card-bg',
    '--cd-card-border',
    '--cd-card-radius',
    '--cd-card-padding',
    '--cd-card-padding-small',
    '--cd-card-header-border',
    '--cd-card-title-color',
    '--cd-card-shadow',
    '--cd-card-shadow-hover',
  ],
  responsive: false,
  examples: [
    { title: '基础', code: '<Card title="标题">内容</Card>' },
    { title: '悬浮', code: '<Card hoverable title="卡片">内容</Card>' },
    { title: '加载', code: '<Card loading loadingRows={3} />' },
  ],
} as const;
